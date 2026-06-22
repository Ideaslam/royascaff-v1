# Custom Feature Rules

## Short Summary

This file documents project-specific implementation rules for **Roya AI Dynamo** that go beyond the generic coding conventions in `backend-rule.md` and `frontend-rule.md`. Every rule here is tied to a specific module and feature and covers AI provider usage, async job behavior, file storage, caching, integrations, security, and GDPR compliance.

Source inputs:

- `project/plan/features.md`
- `project/plan/modules.md`
- `project/description.md`

Generic coding conventions remain in `engine/rules/backend-rule.md` and `engine/rules/frontend-rule.md`.

---

## How To Use This File

When AI builds `project/actions/backend/endpoints.md`:
- apply these rules to the matching module and feature
- reflect async, caching, storage, and security constraints in endpoint notes

When AI builds each app's `project/actions/<app-key>/pages.md`:
- apply frontend-related rules to the matching pages
- do not expose secrets, raw job IDs without ownership checks, or internal error details

When AI builds backend or frontend code:
- treat every rule here as mandatory unless the user explicitly overrides it
- route all third-party calls through integration/provider layers, never directly from controllers or frontend

---

## Rules By Module

---

## Module: Auth

### Module Notes

- JWT tokens are the sole auth mechanism for API access
- OAuth is an additional login path, not a replacement for JWT
- All auth-related secrets (JWT secret, OAuth client secrets) must live in environment variables only

---

### Feature: User Registration

#### Rule Type

- `Security`
- `Integration`

#### Summary

Registration must hash passwords, enforce email uniqueness, and send a welcome email through the mail integration.

#### Required Behavior

- Must hash passwords with bcrypt (minimum 12 rounds) before storing
- Must validate email uniqueness at the service layer before inserting
- Must send a welcome email via `src/integrations/mail/` on successful registration
- Must assign the default role `editor` unless explicitly overridden by admin
- Must return a JWT access token and refresh token on success so the user is immediately authenticated

#### Provider / Integration

- Provider: `MailJet`
- Integration layer: `src/integrations/mail/`
- Secrets: `MAILJET_API_KEY`, `MAILJET_SECRET` — environment variables only

#### Must Not

- Store plain-text passwords
- Expose password hash in any API response
- Send welcome email before the user record is successfully persisted

---

### Feature: OAuth Login

#### Rule Type

- `Integration`
- `Security`

#### Summary

OAuth login must use an adapter pattern so providers can be swapped. The frontend must never hold OAuth client secrets.

#### Required Behavior

- Must implement OAuth 2.0 authorization code flow server-side
- Must use a provider-agnostic interface in `src/integrations/oauth/` so Google, Microsoft, or other providers can be added without touching business logic
- Must link OAuth identity to existing user account if email matches
- Must create a new user account with role `editor` if no existing account matches
- Must issue a JWT token after OAuth success using the same token service as email/password login

#### Provider / Integration

- Provider: `Google OAuth 2.0`, `Microsoft OAuth 2.0`
- Integration layer: `src/integrations/oauth/`
- Secrets: OAuth client ID and secret — environment variables only, never exposed to frontend

#### Must Not

- Place OAuth client secret in frontend bundle or environment
- Allow OAuth to bypass role assignment rules
- Trust OAuth provider user data without extracting only the required fields (email, name, provider ID)

---

### Feature: Token Refresh

#### Rule Type

- `Security`

#### Summary

Refresh tokens must be rotated on every use and stored server-side or as httpOnly cookies.

#### Required Behavior

- Must rotate refresh token on every use (one-time use per token)
- Must store refresh token hash server-side (in Redis or database) for revocation support
- Must enforce refresh token expiry strictly
- Frontend must handle 401 responses by attempting token refresh automatically via HTTP interceptor before retrying

#### Must Not

- Return the same refresh token twice
- Allow refresh tokens to bypass expiry checks
- Store refresh tokens in localStorage or non-httpOnly cookies

---

## Module: Data (CSV Management)

### Module Notes

- The Data module owns file upload, row storage, and column metadata
- AI is triggered by this module but executed by the AI Processing module
- Raw data rows must never be passed to any AI call

---

### Feature: Upload CSV File

#### Rule Type

- `Storage`
- `Async Job`
- `Performance`

#### Summary

CSV upload must be chunked, store raw file to R2, parse rows into a dedicated MongoDB collection, and trigger AI analysis as a background job.

#### Required Behavior

- Must validate file is CSV type and size is ≤ 50 MB before accepting upload
- Must support chunked upload to handle large files without timeout
- Must track upload progress and expose it via a status endpoint for the frontend
- Must store the raw CSV file to Cloudflare R2 (S3-compatible) via `src/integrations/storage/`
- Must create a dedicated MongoDB collection per CSV file for its data rows (collection name derived from file ID)
- Must insert rows in batches (recommended batch size: 1,000 rows) to avoid memory pressure
- Must create one `columnmetadata` document per column with: column name, inferred data type, sample values (first 10 distinct values), null count, unique value count
- Must set `csvfiles.status` to `analyzing` and queue the AI column analysis job after rows are stored
- Must trigger a `BackgroundJob` record (type: `csv_analysis`) and pass the job ID back to the frontend for status polling

#### Provider / Integration

- Provider: `Cloudflare R2` (S3-compatible)
- Integration layer: `src/integrations/storage/`
- Storage key pattern: `csv-files/{userId}/{fileId}/{originalFilename}`

#### Constraints

- File size limit: 50 MB
- No row count limit, but batching is mandatory
- Upload timeout: chunked uploads must not timeout for files up to 50 MB on a standard connection

#### Must Not

- Store raw CSV rows inside the `csvfiles` collection document (too large)
- Pass any data rows to the AI provider at any point
- Process the entire file in memory at once — use streaming/chunked parsing
- Block the HTTP request thread during row insertion — use background processing

---

### Feature: AI Column Analysis (Background)

#### Rule Type

- `AI`
- `Async Job`

#### Summary

Column analysis is a background job. AI receives only column structure metadata — never data rows. Results are written back to `columnmetadata`.

#### Required Behavior

- Must run as an async background job via BullMQ queue (`csv-analysis` queue)
- Must load only `columnmetadata` records for the file — column name, inferred type, sample values, null count, unique value count
- Must construct the AI prompt from this metadata only — never query data rows
- Must call Claude AI via `src/integrations/ai/` using the configured model
- Must parse the AI response into a structured list: `{ columnName, aiDescription, confirmedType }`
- Must update each `columnmetadata` document with: `aiDescription`, `status: "ai_suggested"`
- Must update `csvfiles.status` to `ready` on job completion
- Must update `backgroundjobs` record: status, completedAt, resultSummary
- Must trigger an in-app notification (`csv_analysis_complete`) on success
- Must trigger an in-app notification and email on failure
- Must allow the user to manually retry a failed job

#### Provider / Integration

- Provider: `Claude AI` (current default)
- Integration layer: `src/integrations/ai/`
- Interface: `IAIProvider` — must not call Claude SDK directly from the job handler
- Model: configured via `AI_MODEL` environment variable
- Secrets: `AI_API_KEY` — server-side only, never logged or returned in API responses

#### Constraints

- Job timeout: 5 minutes maximum per job
- Retry limit: 3 automatic retries before marking as `failed`
- Prompt must include: column names, types, sample values — nothing else

#### Must Not

- Pass any CSV data rows to the AI provider
- Call the AI provider directly from a controller or service outside `src/integrations/ai/`
- Log the AI API key or full prompt payload at INFO level (use DEBUG only)
- Block the HTTP request thread while waiting for AI response

---

### Feature: Review and Edit Column Descriptions

#### Rule Type

- `Business Logic`

#### Summary

User confirmation of column descriptions is a required gate before dashboard generation can begin.

#### Required Behavior

- Must prevent dashboard generation from starting if any column in a linked CSV file has `columnmetadata.status` not equal to `user_confirmed`
- When user saves edits: must update `columnmetadata.userDescription` and set `status: "user_confirmed"`
- If user accepts AI suggestion without editing: must set `status: "user_confirmed"` and copy `aiDescription` to `userDescription`
- Must update `csvfiles.status` to `confirmed` when all columns are confirmed

#### Must Not

- Allow dashboard generation to be triggered before column confirmation is complete
- Overwrite `userDescription` if user has already confirmed and later views the file again

---

## Module: AI Processing

### Module Notes

- This module is the only module allowed to call `src/integrations/ai/`
- All AI calls are async background jobs — never synchronous HTTP requests
- AI never reads data rows; it only receives structural metadata

---

### Feature: CSV Column Analysis Job

#### Rule Type

- `AI`
- `Async Job`

#### Summary

See rules under `Module: Data (CSV Management) → Feature: AI Column Analysis (Background)`. This feature documents the job handler side.

#### Required Behavior

- Must consume from the `csv-analysis` BullMQ queue
- Must read job payload: `{ fileId, userId }`
- Must load column metadata from the database — not re-read the CSV file
- Must use `IAIProvider` interface, not Claude SDK directly
- Must write results back to `columnmetadata` and update `backgroundjobs`
- Must handle AI provider errors gracefully: log, mark job failed, schedule retry

#### Must Not

- Query data rows from the CSV collection
- Call AI provider more than once per column analysis job (batch all columns in one prompt)
- Silently fail — all errors must update `backgroundjobs.status` to `failed` with `errorMessage`

---

### Feature: Dashboard Generation Job

#### Rule Type

- `AI`
- `Async Job`

#### Summary

Dashboard generation is an async job that creates widget definitions from column metadata and purpose. AI returns a structured JSON spec — it does not execute queries or touch data.

#### Required Behavior

- Must consume from the `dashboard-generation` BullMQ queue
- Must read job payload: `{ dashboardId, userId }`
- Must load: dashboard purpose description, all confirmed `columnmetadata` for all linked CSV files
- Must construct a prompt that includes:
  - dashboard purpose description
  - list of columns with confirmed descriptions and data types
  - available aggregation types (sum, count, avg, min, max, group by)
  - list of supported chart types (bar, line, pie, donut, KPI card, table, scatter)
  - instruction to return a strict JSON schema (defined below)
- AI response must be parsed into the following JSON schema per widget:

```json
{
  "widgets": [
    {
      "type": "bar|line|pie|donut|kpi_card|table|scatter",
      "title": "string",
      "dataSourceFileId": "string",
      "xAxis": "columnName or null",
      "yAxis": "columnName or null",
      "groupBy": "columnName or null",
      "aggregation": "sum|count|avg|min|max",
      "filters": [],
      "sortBy": "columnName or null",
      "sortOrder": "asc|desc",
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 },
      "displayConfig": { "colors": [], "showLegend": true }
    }
  ],
  "layoutColumns": 12
}
```

- Must validate the AI response against this schema before persisting
- On valid response: create `chartwidgets` documents and set `dashboard.status` to `ready`
- On invalid response: retry the job (up to 3 times) with a corrective prompt
- Must update `backgroundjobs` record on completion or failure
- Must trigger `dashboard_ready` in-app notification and email on success
- Must trigger `generation_error` notification on final failure

#### Provider / Integration

- Provider: `Claude AI` (current default)
- Integration layer: `src/integrations/ai/`
- Interface: `IAIProvider`
- Model: `AI_MODEL` environment variable

#### Constraints

- Job timeout: 5 minutes maximum
- Retry limit: 3 before marking as `failed`
- AI response must be strict JSON — if the AI returns prose or markdown, the parser must extract the JSON block
- Prompt must not exceed the model's context window; truncate sample values if needed

#### Must Not

- Pass data rows to AI
- Allow partial widget creation — either all widgets are created or none (use a transaction or atomic write)
- Skip schema validation of the AI response before persisting
- Allow the dashboard to show as `ready` if widget creation failed

---

## Module: Dashboards

### Module Notes

- The chart data endpoint is the performance-critical path; every response must go through the caching layer
- Dashboard status transitions must be enforced: `generating` → `ready` or `error`

---

### Feature: Chart Data API

#### Rule Type

- `Performance`
- `Caching`

#### Summary

Every chart data request must check cache before executing aggregation. Cache hit target is 80%+. Responses must be fast enough for parallel loading of all dashboard widgets simultaneously.

#### Required Behavior

- Must check Redis cache first using key: `chart:{widgetId}:{queryHash}`
- On Redis miss: check `chartdatacache` MongoDB collection
- On both misses: execute the MongoDB aggregation pipeline defined in `chartwidgets.queryDefinition`
- Must store result in both Redis (TTL: 1 hour) and `chartdatacache` (persistent)
- Must return data in a structure the frontend can consume directly per chart type:
  - bar/line/scatter: `{ labels: [], datasets: [{ label, data: [] }] }`
  - pie/donut: `{ labels: [], values: [] }`
  - kpi_card: `{ value, label, change }`
  - table: `{ columns: [], rows: [] }`
- Must enforce that the requesting user owns the dashboard or has a valid share link
- Must return `200` with empty data gracefully if the aggregation returns zero results (not `404` or `500`)

#### Constraints

- Cached response target: < 200ms
- Uncached aggregation target: < 2 seconds
- All widget data calls from the frontend viewer must be parallel (not sequential)

#### Must Not

- Execute aggregation on the main HTTP thread synchronously for large datasets — use streaming or pagination if needed
- Return raw MongoDB documents — always format to the expected chart structure
- Allow a widget from one user's dashboard to be accessed by another user without a valid share token

---

### Feature: Manual Data Refresh

#### Rule Type

- `Caching`
- `Business Logic`

#### Summary

Refresh invalidates all chart caches for a dashboard and re-executes aggregations. This is rate-limited per subscription tier.

#### Required Behavior

- Must check subscription tier refresh limits before processing
- Must invalidate all Redis cache keys for the dashboard: `chart:{widgetId}:*`
- Must delete all `chartdatacache` entries for the dashboard
- Must re-execute aggregation for all widgets (can be async to avoid blocking the user)
- Must return a job ID the frontend can poll for refresh completion status
- Must update `dashboard.lastRefreshedAt` on completion

#### Constraints

- Refresh rate limit: enforced per user per subscription tier
- If limit exceeded: return `429` with remaining wait time in response

#### Must Not

- Allow refresh to bypass subscription limits
- Return stale cached data after a refresh is triggered
- Silently fail on cache invalidation errors

---

### Feature: Dashboard Customization

#### Rule Type

- `Business Logic`
- `Caching`

#### Summary

Saving widget customizations must invalidate the affected widget's cache.

#### Required Behavior

- Must invalidate `chartdatacache` and Redis cache for any widget whose `queryDefinition` or `aggregation` changes
- Must validate that the user is the dashboard owner or has edit permission via share link
- Must persist all layout changes (position, size) and chart config changes atomically
- Must not re-trigger AI generation on customization save — only persist the user's changes

#### Must Not

- Allow viewers (view-only share link) to save customizations
- Trigger AI dashboard generation when saving customization
- Allow saving a widget with an invalid `queryDefinition` (must validate before persisting)

---

## Module: Sharing

### Module Notes

- Share links are the only way for non-owners to access dashboards
- Share link tokens must be cryptographically random and URL-safe

---

### Feature: Create Share Link

#### Rule Type

- `Security`
- `Business Logic`

#### Summary

Share link tokens must be unpredictable, stored hashed, and permissions must be enforced on every access.

#### Required Behavior

- Must generate tokens using a cryptographically secure random function (minimum 32 bytes, URL-safe base64 encoded)
- Must store the token hash in the database (not the raw token) if revocation checking is needed
- Must return the full shareable URL (not just the token) to the frontend on creation
- Must enforce the `viewerCanRefresh` flag in the share link at the API level — not just in the frontend

#### Must Not

- Generate predictable or sequential tokens
- Store the raw token in the database without hashing
- Allow a user to create a share link for a dashboard they don't own

---

### Feature: View Shared Dashboard

#### Rule Type

- `Security`
- `Business Logic`

#### Summary

Shared dashboard access must validate the token on every request, not just on first load.

#### Required Behavior

- Must validate the share token on every API request, not only on page load
- Must check token expiry on every request
- Must enforce permission level (view-only vs edit) on every API request from the share link session
- Must return a clear, user-friendly error page (not `401` raw JSON) when a token is expired or revoked
- Must allow chart data endpoints to be called using the share token as authorization (no user JWT required)
- Must enforce `viewerCanRefresh` flag: if false, return `403` on any refresh attempt from a share link session

#### Must Not

- Cache permission level on the frontend — always validate server-side
- Allow a viewer with a view-only link to call edit, delete, or customization endpoints
- Expose any internal IDs (user ID, owner email) in the shared dashboard response

---

## Module: Export

### Module Notes

- PDF export is always async; Excel and CSV can be synchronous for reasonable sizes
- All exported files go to Cloudflare R2 and are served via signed URL

---

### Feature: Export Dashboard as PDF

#### Rule Type

- `Async Job`
- `Storage`

#### Summary

PDF generation runs as a background job, uploads to R2, and notifies the user with a download link.

#### Required Behavior

- Must queue PDF generation as a background job (type: `pdf_export`) in BullMQ
- Must render dashboard charts to PDF using server-side rendering (headless browser or chart-to-image library)
- Must apply Roya AI Dynamo brand colors: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary)
- Must include all visible charts and data from the dashboard at time of export
- Must upload the generated PDF to Cloudflare R2 via `src/integrations/storage/`
- PDF storage key pattern: `exports/{userId}/{dashboardId}/{timestamp}.pdf`
- Must generate a signed URL (TTL: 24 hours) for download
- Must trigger `export_ready` in-app notification and email with the signed download link
- Must update `backgroundjobs` record on completion or failure

#### Provider / Integration

- Provider: `Cloudflare R2` (S3-compatible)
- Integration layer: `src/integrations/storage/`
- Secrets: `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET` — environment variables only

#### Constraints

- PDF generation timeout: 60 seconds maximum
- Signed URL TTL: 24 hours

#### Must Not

- Block the HTTP thread while generating the PDF
- Return the raw file bytes in the API response — always return a signed URL
- Store the PDF indefinitely — apply a lifecycle policy (suggested: 7 days)

---

### Feature: Export Data as Excel

#### Rule Type

- `Performance`

#### Summary

Excel export is synchronous for datasets under a reasonable row limit; must stream for large datasets.

#### Required Behavior

- Must fetch aggregated widget data (not raw rows) for Excel export
- Must structure output as one sheet per widget with column headers
- Must apply current dashboard filter state to export
- For datasets exceeding 100,000 rows: must stream response instead of building full file in memory
- Must return `.xlsx` as a direct file download with proper `Content-Disposition` header

#### Must Not

- Load unlimited rows into memory at once
- Return raw MongoDB documents as export data — always use the aggregated format

---

## Module: Notifications

---

### Feature: Email Notifications

#### Rule Type

- `Integration`

#### Summary

All transactional emails go through MailJet via `src/integrations/mail/`. Email must never be called directly from controllers.

#### Required Behavior

- Must send all emails via `src/integrations/mail/` — never call MailJet SDK directly from a service or controller
- Must implement the following email types with branded templates (Roya AI Dynamo colors):
  - `welcome` — triggered on successful registration
  - `dashboard_ready` — triggered when `dashboard_generation` job completes
  - `generation_error` — triggered when `dashboard_generation` job fails permanently
  - `export_ready` — triggered when `pdf_export` job completes (includes signed download link)
  - `password_reset` — triggered by password reset request
  - `dashboard_shared` — triggered when a user shares a dashboard
- Must use HTML email templates stored in `src/integrations/mail/templates/`
- Must handle MailJet API errors gracefully — email failure must not fail the primary operation (fire and forget with error logging)

#### Provider / Integration

- Provider: `MailJet`
- Integration layer: `src/integrations/mail/`
- Secrets: `MAILJET_API_KEY`, `MAILJET_SECRET` — environment variables only

#### Constraints

- Email send failure must be logged but must not propagate as an error to the caller
- Never put user PII in email subject lines unnecessarily

#### Must Not

- Call MailJet SDK directly from any service outside `src/integrations/mail/`
- Include password hashes, tokens, or internal IDs in email bodies
- Send emails synchronously on the request path — always queue via the notification service

---

## Module: Admin — Subscriptions

---

### Feature: Billing and Payment

#### Rule Type

- `Integration`
- `Security`

#### Summary

Payment processing uses an adapter pattern. Webhook signatures must be validated. No payment credentials may touch the frontend.

#### Required Behavior

- Must implement payment via an `IPaymentProvider` interface in `src/integrations/payment/`
- Current default provider is configurable via `PAYMENT_PROVIDER` environment variable
- Must handle the following webhook events: `payment.succeeded`, `payment.failed`, `subscription.renewed`, `subscription.cancelled`
- Must validate webhook signature before processing any event
- Must update user subscription status atomically on webhook receipt
- Must expose only safe subscription status information to the frontend (plan name, limits, expiry — no payment tokens)

#### Provider / Integration

- Provider: Configurable (Stripe or equivalent)
- Integration layer: `src/integrations/payment/`
- Secrets: `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` — environment variables only

#### Constraints

- Webhook endpoint must be public (no auth) but must validate provider signature
- Idempotency: duplicate webhook events must not double-process

#### Must Not

- Store payment card data, CVV, or raw payment tokens in the database
- Call payment provider SDK directly from a controller or business service
- Expose `PAYMENT_SECRET_KEY` in any API response or frontend bundle
- Process webhook events without signature validation

---

## Global Feature Rules

These rules apply across multiple modules and must be respected everywhere:

1. **AI Provider Isolation** — Only `src/modules/ai-processing/` may call `src/integrations/ai/`. No other module, controller, or service may import or call the AI provider directly.

2. **AI Never Reads Data Rows** — No AI prompt, at any point in the system, may include raw CSV data rows. AI receives only column names, inferred types, confirmed descriptions, and sample statistics.

3. **Integration Layer Enforcement** — All third-party SDKs (Claude AI, MailJet, Cloudflare R2, payment gateway, OAuth) must be called exclusively through their respective integration modules in `src/integrations/`. Business services must depend on interfaces, not concrete SDK classes.

4. **Background Job Mandatory for Slow Work** — CSV upload row insertion, AI column analysis, AI dashboard generation, PDF export, and cache recalculation must all run as BullMQ background jobs. None of these operations may block an HTTP request.

5. **Background Job Status Tracking** — Every background job must create a `backgroundjobs` document before starting, update it during processing, and finalize it (completed or failed) on termination. Job failure must always set `status: failed` and `errorMessage`.

6. **Cache Invalidation on Data Change** — Any operation that modifies a dashboard's underlying data (manual refresh, CSV deletion) must invalidate all Redis and MongoDB cache entries for that dashboard's widgets before returning a success response.

7. **Subscription Limit Enforcement** — Dashboard creation, CSV upload, and data refresh must check subscription limits at the service layer before executing. Limit checks must happen after authentication and before any data is written. Return `403` with a clear message when limits are exceeded.

8. **GDPR Data Deletion** — User deletion must cascade to all owned data: projects, dashboards, widgets, cache entries, share links, CSV metadata, CSV data row collections, audit logs (redact user ID, keep event), notifications, background jobs. Deletion must complete within 30 days. Each business module must expose a `deleteUserData(userId)` method callable by the Users module.

9. **Secret Handling** — No API key, JWT secret, OAuth secret, payment secret, or storage credential may appear in: code constants, API responses, log output at INFO or higher, or frontend bundles. All secrets come from environment variables validated at startup.

10. **Audit Logging** — All create, update, delete, share, export, and login events must write an immutable record to `auditlogs` via a shared `AuditService`. Controllers must not write audit logs directly — call the service. Audit logs must never be deletable via any API endpoint.

11. **Rate Limiting** — Auth endpoints (login, register, password reset) must be rate-limited at 10 requests per minute per IP. Data refresh endpoints must be rate-limited per subscription tier. All other API endpoints must be rate-limited at 100 requests per minute per authenticated user.

12. **Frontend Never Calls Third-Party Services Directly** — The Angular frontend must only make HTTP calls to the NestJS backend (`environment.apiUrl`). It must never call Cloudflare R2, Claude AI, MailJet, payment gateways, or any other external URL directly — including presigned S3/R2 PUT/GET URLs. All file uploads, AI calls, and integrations must be proxied through backend endpoints. Verification must scan every Angular service for HTTP calls to URLs that are not `environment.apiUrl` and flag them as violations.

    **Forbidden patterns in Angular services:**
    - `this.http.put(presignedUrl, ...)` — direct R2 upload
    - `this.http.post('https://api.anthropic.com/...', ...)` — direct Claude call
    - Any hardcoded `https://` URL that is not `environment.apiUrl`

    **Correct pattern:**
    - All HTTP calls use `${this.api}/...` where `this.api = environment.apiUrl`
    - Backend provides a `POST /data/upload/file` multipart endpoint for file uploads
