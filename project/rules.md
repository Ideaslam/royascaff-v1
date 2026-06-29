# Custom Feature Rules

Project-specific implementation rules for **Roya AI Dynamo**. Generic coding conventions live in `engine/rules/backend-rule.md` and `engine/rules/frontend-rule.md`. Global defaults live in `engine/conventions.md`.

---

## Module: Auth

**Module note:** JWT is sole auth mechanism. OAuth is an additional login path. All auth secrets in env vars only. Two-layer roles: system (`UserRole`) vs workspace (`WorkspaceRole`) — see `project/plan/roles-and-authorization.md`. Never use system role for workspace authorization.

### RULE-AUTH-001: User Registration Security
Module: Auth · Feature: User Registration
bcrypt 12 rounds. Validate email uniqueness at service layer. Send welcome email via `src/integrations/mail/` on success. Default role = `editor`. Return JWT access + refresh tokens immediately. Provider: MailJet (`MAILJET_API_KEY`, `MAILJET_SECRET`). Never store plaintext passwords, never expose passwordHash in any response, never send email before user record is persisted.

### RULE-AUTH-002: OAuth Login Integration
Module: Auth · Feature: OAuth Login
OAuth 2.0 auth-code flow, server-side. Provider-agnostic interface in `src/integrations/oauth/` (Google, Microsoft swappable). Link to existing user by email match; create with role `editor` if no match. Issue JWT via same token service as email/password. Providers: Google OAuth 2.0, Microsoft OAuth 2.0. Secrets: OAuth client ID + secret in env vars only — never in frontend bundle. Never bypass role assignment, never trust provider data beyond (email, name, provider ID).

### RULE-AUTH-003: Token Refresh Security
Module: Auth · Feature: Token Refresh
Rotate refresh token on every use (single-use). Store refresh token hash server-side for revocation. Enforce expiry strictly. Frontend HTTP interceptor auto-refreshes on 401. Never return same refresh token twice, never allow expiry bypass, never store in localStorage or non-httpOnly cookies.

---

## Module: Data (CSV Management)

**Module note:** Owns file upload, row storage, column metadata. AI triggered here but executed by AI Processing. Raw data rows never passed to AI calls.

### RULE-DATA-001: CSV Upload Storage & Processing
Module: Data · Feature: Upload CSV File
Validate CSV type + ≤50 MB. Chunked upload. Track progress via status endpoint. Store raw file to Cloudflare R2 via `src/integrations/storage/` (key: `csv-files/{userId}/{fileId}/{originalFilename}`). Create dedicated MongoDB collection per CSV for data rows. Insert rows in batches (1,000). Create `columnmetadata` per column (name, inferred type, 10 sample values, null count, unique count). Set `csvfiles.status = analyzing`, queue `csv_analysis` background job, return job ID. Provider: Cloudflare R2 (S3-compatible). Never store rows inside `csvfiles` doc, never pass rows to AI, always stream/chunk (no full-file in-memory), never block HTTP thread during insertion.

### RULE-DATA-002: AI Column Analysis Background Job
Module: Data · Feature: AI Column Analysis
Async BullMQ job (`csv-analysis` queue). Load only `columnmetadata` — never data rows. Prompt from metadata only. Call Claude via `src/integrations/ai/` using `IAIProvider` (model via `AI_MODEL` env var, key `AI_API_KEY` server-only). Parse response to `{columnName, aiDescription, confirmedType}`. Update `columnmetadata` with `aiDescription`, `status: ai_suggested`. Update `csvfiles.status = ready` on completion. Update `backgroundjobs`. Notify in-app on success; in-app + email on failure. Allow manual retry. Timeout 5min, 3 retries. Never call AI SDK directly outside integration layer, never log API key or full prompt at INFO+.

### RULE-DATA-003: Column Description Confirmation Gate
Module: Data · Feature: Review Column Descriptions
Block dashboard generation until ALL columns have `columnmetadata.status = user_confirmed`. On save: set `userDescription` + `status: user_confirmed`. On accept-as-is: copy `aiDescription` → `userDescription`, set confirmed. Set `csvfiles.status = confirmed` when all columns confirmed. Never overwrite confirmed `userDescription` on re-view.

---

## Module: AI Processing

**Module note:** Only module allowed to call `src/integrations/ai/`. All AI calls are async BullMQ jobs. AI never reads data rows.

### RULE-AI-001: CSV Column Analysis Job Handler
Module: AI Processing · Feature: CSV Column Analysis Job
Consume from `csv-analysis` BullMQ queue. Payload: `{fileId, userId}`. Load column metadata from DB (not re-read CSV). Use `IAIProvider`, not Claude SDK directly. Write results to `columnmetadata`, update `backgroundjobs`. Handle AI errors gracefully: log, mark failed, schedule retry. Never query data rows, never call AI more than once per job (batch all columns), never silently fail — always update `backgroundjobs.status`.

### RULE-AI-002: Dashboard Generation Job
Module: AI Processing · Feature: Dashboard Generation Job
Consume from `dashboard-generation` BullMQ queue. Payload: `{dashboardId, userId}`. Load: dashboard purpose, confirmed `columnmetadata` for linked CSVs. Prompt includes: purpose, columns+descriptions+types, aggregation types (sum/count/avg/min/max/group-by), chart types (bar/line/pie/donut/kpi_card/table/scatter). AI response JSON schema: `{widgets: [{type, title, dataSourceFileId, xAxis, yAxis, groupBy, aggregation, filters, sortBy, sortOrder, position:{x,y,w,h}, displayConfig:{colors,showLegend}}], layoutColumns:12}`. Validate response against schema. Valid → create `chartwidgets` + `dashboard.status=ready`. Invalid → retry (max 3) with corrective prompt. Update `backgroundjobs`. Notify `dashboard_ready` on success, `generation_error` on final failure. Provider: Claude AI via `IAIProvider`, `AI_MODEL` env var. Timeout 5min, 3 retries. Extract JSON block if AI returns prose. Never pass data rows, never allow partial widget creation (all-or-none), never skip schema validation, never mark ready if creation failed.

---

## Module: Dashboards

**Module note:** Chart data endpoint is performance-critical — always cache. Dashboard status transitions: `generating → ready | error`.

### RULE-DASH-001: Chart Data API Caching
Module: Dashboards · Feature: Chart Data API
Check Redis cache (`chart:{widgetId}:{queryHash}`), then `chartdatacache` MongoDB, then execute aggregation from `chartwidgets.queryDefinition`. Store in both Redis (TTL 1h) and `chartdatacache`. Return per chart type: bar/line/scatter `{labels,datasets}`, pie/donut `{labels,values}`, kpi_card `{value,label,change}`, table `{columns,rows}`. Enforce ownership or valid share link. Return 200 with empty data (not 404/500) on zero results. Targets: cached <200ms, uncached <2s. All widget calls parallel. Never execute large aggregations on main thread synchronously, never return raw MongoDB docs, never allow cross-user access without share token.

### RULE-DASH-002: Manual Data Refresh
Module: Dashboards · Feature: Manual Data Refresh
Check subscription tier refresh limits first. Invalidate all Redis keys `chart:{widgetId}:*` + all `chartdatacache` entries for dashboard. Re-execute aggregations (can be async). Return job ID for polling. Update `dashboard.lastRefreshedAt`. Rate limit per tier — return 429 with remaining wait on exceed. Never bypass subscription limits, never return stale data after refresh triggered, never silently fail on cache invalidation.

### RULE-DASH-003: Dashboard Customization Cache Invalidation
Module: Dashboards · Feature: Dashboard Customization
Invalidate `chartdatacache` + Redis for any widget whose `queryDefinition` or `aggregation` changes. Validate user is owner or has edit share permission. Persist layout + chart config atomically. Never re-trigger AI generation on customization, never allow view-only viewers to save, never save invalid `queryDefinition`.

---

## Module: Sharing

**Module note:** Share links are the only non-owner access to dashboards. Tokens must be cryptographically random + URL-safe.

### RULE-SHARE-001: Share Link Token Security
Module: Sharing · Feature: Create Share Link
Generate tokens: crypto-random ≥32 bytes, URL-safe base64. Store token hash (not raw). Return full shareable URL. Enforce `viewerCanRefresh` flag at API level. Never generate predictable/sequential tokens, never store raw tokens, never allow link creation for non-owned dashboards.

### RULE-SHARE-002: Shared Dashboard Access Validation
Module: Sharing · Feature: View Shared Dashboard
Validate share token on EVERY API request (not just page load). Check expiry every request. Enforce permission level (view/edit) every request. User-friendly error page on expired/revoked (not raw 401). Allow chart data endpoints via share token (no JWT needed). Enforce `viewerCanRefresh`: if false, return 403 on refresh. Never cache permission client-side, never allow view-only to call edit/delete, never expose internal IDs (userId, owner email).

---

## Module: Export

**Module note:** PDF always async. Excel/CSV synchronous for reasonable sizes. All exports to Cloudflare R2, served via signed URL.

### RULE-EXPORT-001: PDF Export Async Job
Module: Export · Feature: Export Dashboard as PDF
Queue `pdf_export` BullMQ job. Server-side render charts to PDF (headless browser or chart-to-image). Brand colors: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary). Upload to R2 (`exports/{userId}/{dashboardId}/{timestamp}.pdf`). Generate signed URL (TTL 24h). Notify `export_ready` in-app + email with link. Update `backgroundjobs`. Provider: Cloudflare R2. Secrets: `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`. Timeout 60s. Never block HTTP thread, never return raw bytes (always signed URL), apply lifecycle policy (~7 days).

### RULE-EXPORT-002: Excel Export Performance
Module: Export · Feature: Export Data as Excel
Fetch aggregated widget data (not raw rows). One sheet per widget with headers. Apply current filter state. Stream for >100K rows. Return `.xlsx` with proper `Content-Disposition`. Never load unlimited rows in memory, never return raw MongoDB docs.

---

## Module: Notifications

### RULE-NOTIF-001: Email via MailJet Integration
Module: Notifications · Feature: Email Notifications
All emails via `src/integrations/mail/` — never call MailJet SDK directly. Email types: `welcome`, `dashboard_ready`, `generation_error`, `export_ready` (with signed link), `password_reset`, `dashboard_shared`. HTML templates in `src/integrations/mail/templates/` with Roya brand colors. Fire-and-forget: email failure must not fail primary operation (log + continue). Provider: MailJet (`MAILJET_API_KEY`, `MAILJET_SECRET`). Never call SDK outside integration layer, never include password hashes/tokens/internal IDs in emails, never send synchronously on request path — queue via notification service.

---

## Module: Subscriptions

### RULE-SUB-001: Payment Integration (PayUp)
Module: Subscriptions · Feature: Billing and Payment
Adapter pattern via `PaymentProvider` interface in `src/integrations/payment/`. Default: PayUp (configurable via `PAYMENT_PROVIDER`). PayUp flow: exchange API keys for SDK token (`POST /v1/auth` — secret as Bearer, public via `x-public-key`), create checkout session (`POST /v1/checkout/session` — inline product, returnUrl, cancelUrl, metadata), verify on return (`GET /v1/checkout/session/{token}`). API base: prod for `production` env, sandbox otherwise (overridable via `PAYUP_API_BASE_URL`). Store `Payment` log on initiation (pending, gateway payup, plan+user+amount). Public confirm/cancel return endpoints (`GET /payments/payup/confirm`, `GET /payments/payup/cancel`) — confirm verifies session, sets `paid`, enqueues durable BullMQ `subscription-activation` event; cancel sets `failed`. Activate subscription ONLY after confirmed payment via `SubscriptionActivationProcessor`. Free plans (`priceMonthlyUsd=0`): skip PayUp, enqueue same activation event without payment log. Keep webhook seam available. Expose only safe status info to frontend. Orchestration: `PaymentCheckoutService` in `src/modules/payments/`. Secrets: `PAYUP_PUBLIC_KEY`, `PAYUP_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`. Confirm/cancel endpoints are public (no JWT), correlated by `paymentId` ref param. Idempotent: already-paid → no re-activate. Never store card/CVV data, never call PayUp HTTP outside `PayUpProvider`, never expose secret keys in responses/logs/frontend, never activate before payment confirmed (paid plans).

### RULE-SUB-002: Account & Subscription Status Enforcement
Module: Subscriptions · Feature: Account Suspension, Resource Lock, Usage Limits
**Account suspended** (`users.isActive=false`): reject login "Account is suspended", all APIs return `403 ACCOUNT_SUSPENDED`, revoke refresh tokens on suspend. **Auto-suspend:** two consecutive unpaid payments → auto-suspend, requires admin reactivation. **Subscription resource lock** (status `expired`/`inactive`/`cancelled`): user may login + read; block dashboard create, file upload, data refresh with `403 SUBSCRIPTION_LOCKED`. **Admin activate/deactivate:** dedicated endpoints; `inactive` is admin-only distinct from `expired`. **Usage limits:** enforce via `SubscriptionLimitService` + registry when `status=active`; return 403 with clear message. **Period rollover:** repeatable BullMQ job resets monthly counters + marks natural expiry. Never conflate account suspension with subscription lock, never skip OAuth `isActive` check, never send free plans to PayUp.

---

## Global Feature Rules

### RULE-GLOBAL-001: AI Provider Isolation
Only `src/modules/ai-processing/` may call `src/integrations/ai/`. No other module, controller, or service may import or call the AI provider.

### RULE-GLOBAL-002: AI Never Reads Data Rows
No AI prompt may include raw CSV data rows. AI receives only column names, types, descriptions, and sample statistics.

### RULE-GLOBAL-003: Integration Layer Enforcement
All third-party SDKs (Claude AI, MailJet, Cloudflare R2, payment gateway, OAuth) must be called exclusively through `src/integrations/`. Services depend on interfaces, not concrete SDK classes.

### RULE-GLOBAL-004: Background Job for Slow Work
CSV row insertion, AI column analysis, AI dashboard generation, PDF export, and cache recalculation must run as BullMQ background jobs. None may block an HTTP request.

### RULE-GLOBAL-005: Background Job Status Tracking
Every background job must create a `backgroundjobs` doc before starting, update during processing, finalize (completed/failed) on termination. Failure always sets `status: failed` + `errorMessage`.

### RULE-GLOBAL-006: Cache Invalidation on Data Change
Any operation modifying dashboard data (refresh, CSV deletion) must invalidate all Redis + MongoDB cache entries for that dashboard's widgets before returning success.

### RULE-GLOBAL-007: Subscription Limit Enforcement
Dashboard creation, CSV upload, data refresh must check limits via `SubscriptionLimitService.assertAllowed` after auth, before writes. Return 403 with clear message. New limits via `SubscriptionLimitRegistry` handler — no duplicated logic. Resource lock checked before limit checks.

### RULE-GLOBAL-008: GDPR Data Deletion
User deletion cascades to: projects, dashboards, widgets, cache, share links, CSV metadata, CSV row collections, audit logs (redact user ID, keep event), notifications, background jobs. Complete within 30 days. Each module exposes `deleteUserData(userId)`.

### RULE-GLOBAL-009: Secret Handling
No secrets in code constants, API responses, logs at INFO+, or frontend bundles. All secrets from env vars validated at startup.

### RULE-GLOBAL-010: Audit Logging
All create/update/delete/share/export/login events → immutable `auditlogs` via `AuditService`. Controllers never write directly. Audit logs never deletable via API.

### RULE-GLOBAL-011: Rate Limiting
Auth endpoints (login, register, password reset): 10/min per IP. Data refresh: per subscription tier. All other: 100/min per authenticated user.

### RULE-GLOBAL-012: Frontend Never Calls Third-Party Directly
Angular frontend only calls backend (`environment.apiUrl`). Never calls R2, Claude, MailJet, payment gateways, or presigned URLs directly. All uploads/AI/integrations proxied through backend. Forbidden patterns: `this.http.put(presignedUrl, ...)`, hardcoded `https://` URLs not matching `environment.apiUrl`. Correct: `${this.api}/...` where `this.api = environment.apiUrl`.
