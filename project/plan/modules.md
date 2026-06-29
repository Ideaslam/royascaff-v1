## Business Modules

## 1. Auth
- Scope: BE (`src/modules/auth/`) + FE (`pages/auth/` in CP & AP)
- Audience: public and authenticated users (CP + AP)

### Features
1. **User Registration** [both] — name/email/password form, email uniqueness check, bcrypt hash, default non-admin role, issue JWT tokens; rate-limited (10/min); subject to `registrationEnabled` setting; register page in CP only.
2. **User Login** [both] — email/password auth, issue access + refresh tokens, return user profile for bootstrap; rate-limited (10/min); AP login requires `admin` role (admin route guard).
3. **OAuth Login (Google / Microsoft)** [both] — provider config via env, `AuthService.oauthLogin` maps identity to user; **partial**: `oauth/callback` is a stub, not wired end-to-end; `src/integrations/oauth/` is empty.
4. **Token Refresh** [backend-only] — validate refresh token, issue new access token, rotate refresh; called via HTTP interceptor, no dedicated page.
5. **Password Reset** [both] — forgot-password (always returns 200 to prevent enumeration) sends reset link via MailJet; validate token (expiry, one-time); apply new password; pages in both apps.
6. **Logout** [both] — invalidate server-side refresh token hash, clear frontend auth state.
7. **Current User Profile** [both] — `/auth/me` returns id/email/role; used by both app shells on load and after token refresh.

## 2. Users
- Scope: BE (`src/modules/users/`) + FE (`pages/settings/profile/` in CP)
- Audience: authenticated users (self-service profile)

### Features
1. **View and Edit Own Profile** [both] — view/update name, email, language preference, avatar; profile page in both apps; users cannot change own role; never returns `passwordHash`/`refreshTokenHash`.
2. **Change Own Password** [both] — verify current password before updating; persist new hash. Admin-facing user CRUD is under Admin — Client Management (reuses this backend).

## 3. Projects
- Scope: BE (`src/modules/projects/`) + FE (`pages/projects/` in CP)
- Audience: authenticated editors and admins (CP); workspace-scoped via JWT `workspaceSlug`, stored in `ws_{slug}_projects`

### Features
1. **Create Project** [both] — name (max 200 chars) + optional description; names not unique; owner set to current user.
2. **List Projects** [both] — paginated, searchable by name, filter by active status; admin sees all workspace projects, others see owned only.
3. **View Project** [both] — project details + dashboard list with status badges; quick actions (create dashboard, delete project); owner-or-admin access enforced.
4. **Edit Project** [both] — update name and description; owner-or-admin only.
5. **Delete Project** [both] — cascade deletes all dashboards (widgets, share links, cache entries, data source links); irreversible.

## 4. Data (CSV Management)
- Scope: BE (`src/modules/data/`) + FE (`pages/data/` in CP)
- Audience: authenticated editors and admins (CP)

### Features
1. **Upload CSV File** [both] — direct multipart upload (streamed to R2) or presigned upload (legacy); CSV only, max 50 MB; parses rows into per-file collection `csvdata_{fileId}`; creates `columnmetadata` per column; auto-queues AI analysis; AI never receives raw rows.
2. **List My CSV Files** [both] — paginated, search by filename, filter by status (analyzing/ready/error); shows name, size, upload date, row count, status.
3. **View CSV File Details** [both] — file metadata + columnmetadata with inferred type, samples, and AI descriptions.
4. **AI Column Analysis (Background)** [backend-only] — owned by AI Processing worker; infers columns, computes sample stats, sends column names/types/stats to AI provider, writes descriptions to `columnmetadata`; never passes raw rows to AI.
5. **Review and Edit Column Descriptions** [both] — display AI-generated descriptions, edit `userDescription` per column, save to `columnmetadata`; confirmed descriptions form semantic context for dashboard generation.
6. **Retry Column Analysis** [both] — re-queue analysis job (returns 202), reset job status.
7. **Delete CSV File** [both] — drops `columnmetadata` + `csvdata_{fileId}` collection + `csvfiles` record; reports affected dashboards in result; destructive and irreversible.

## 5. AI Processing
- Scope: BE only (`src/modules/ai-processing/`) — no frontend pages
- Audience: system (triggered by Data and Dashboards modules)

### Features
1. **CSV Column Analysis Job** [backend-only] — consumes `csv-analysis` queue; loads rows, infers columns, computes sample stats, calls AI for per-column descriptions, writes to `columnmetadata`, updates `backgroundjobs` record; never passes raw rows to AI.
2. **AI Dashboard Generation Job** [backend-only] — consumes `dashboard-generation` queue; loads dashboard purpose + confirmed `columnmetadata`, selects widgets from `WidgetDefinition` catalog, defines aggregation queries, writes `chartwidgets`, sets dashboard status `ready`, updates `backgroundjobs`. **Gap**: `pdf-export` and `cache-recalculation` queues are declared/enqueued but have no worker yet.

## 6. Dashboards
- Scope: BE (`src/modules/dashboards/`) + FE (`pages/dashboards/` in CP)
- Audience: authenticated editors (create/edit), viewers (read via share link)

### Features
1. **Create Dashboard** [both] — name + purpose description (min 10 chars, used as AI context), select one or more confirmed CSV sources, save with status `generating`, queue AI generation job (returns 202).
2. **Dashboard Generation Status** [both] — poll status endpoint (status/job/progress/error); progress indicator; redirect to viewer on completion, retry on failure.
3. **List Dashboards** [both] — paginated, filterable by project and status (generating/ready/error), search by name, quick actions (open/duplicate/delete).
4. **View Dashboard (Dynamic Viewer)** [both] — loads layout/widgets/data sources, parallel chart data calls per widget, per-widget loading/error states, responsive language-aware (EN/AR) layout; shared public viewer at `/shared/:token`.
5. **Chart Data API (Cache-First, Filterable)** [backend-only] — Redis cache → MongoDB aggregation on miss; optional JSON-encoded filters; JWT or share-token access; skip throttling (parallel widget loads); returns empty result structure not 404 on no rows.
6. **Manual Data Refresh** [both] — invalidate cache entries, enqueue recalculation job (returns 202); **partial**: `cache-recalculation` queue has no worker yet, recalculation does not complete async.
7. **Dashboard Customization (Widget CRUD)** [both] — add/edit/delete widgets (type, title, position, query definition, display config); invalidates cache on edit/delete.
8. **Edit Dashboard Details** [both] — update name and purpose description.
9. **Duplicate Dashboard** [both] — clones dashboard + widgets + data source links; ready immediately (no regeneration).
10. **Delete Dashboard** [both] — cascade deletes widgets, cache entries, share links; active share links immediately invalidated.
11. **Retry Dashboard Generation** [both] — re-queue generation job (returns 202), reset dashboard/job status.

## 7. Sharing
- Scope: BE (`src/modules/sharing/`) + FE (share panel in `pages/dashboards/` + `shared-viewer/` in CP)
- Audience: editors (create/manage links), public viewers (access via token)

### Features
1. **Create Share Link** [both] — generate unique URL-safe token (returned once), set permission (view/edit), optional expiry date, viewer-refresh flag.
2. **Manage Share Links** [both] — list active/revoked links per dashboard with permission/dates/access count; revoke link (immediate invalidation); cascade invalidation when parent dashboard deleted.
3. **View Shared Dashboard (Public)** [both] — resolve dashboard by token, validate active + not expired, enforce permission + viewer-refresh flag, return dashboard with cached chart data; no auth required; expired/revoked returns clear error not 404.

## 8. Export
- Scope: BE (`src/modules/export/`) + FE (export triggers in `pages/dashboards/` in CP)
- Audience: editors and viewers with export permission

### Features
1. **Export Dashboard as PDF** [both] — queues `pdf-export` job (returns 202 with job id); **partial**: no worker implemented yet, PDF is never produced.
2. **Export Data as Excel** [both] — synchronous `.xlsx` workbook stream of widget/dashboard data; raw file stream bypasses success envelope.
3. **Export Data as CSV** [both] — synchronous CSV stream of a widget's data; raw file stream bypasses success envelope.

## 9. Notifications
- Scope: BE (`src/modules/notifications/`) + FE (`pages/notifications/` in CP)
- Audience: all authenticated users (CP)

### Features
1. **In-App Notification Center** [both] — paginated list (filterable by read state), unread count for shell bell badge, mark-one-read, mark-all-read; **partial wiring**: `NotificationsService.notify` exists but not called by AI/export workers yet; transactional emails (welcome, password reset) sent directly by Auth via MailJet, not through this module.

## 10. Subscriptions
- Scope: BE (`src/modules/subscriptions/`) + FE (`pages/subscriptions/` in CP)
- Audience: authenticated users (CP)

### Features
1. **View Available Plans** [both] — list active plans with price and limits (max dashboards, monthly upload/update limits).
2. **View My Subscription and Usage** [both] — current subscription (plan, status, dates) + current usage vs plan limits.
3. **Subscribe to a Plan** [frontend] — self-service subscribe via PayUp hosted-checkout (change-003); returns `redirectUrl`; subscription activates only after payment confirmed via `subscription-activation` event; active subscribers use upgrade/downgrade instead (change-005); inactive users blocked from self-service billing.
4. **Upgrade / Downgrade Plan** [both] — *(change-005)* upgrade to higher-priced plan → pending invoice + PayUp; downgrade to lower paid → invoice + PayUp; downgrade to free → immediate activation (no invoice); pending invoice list + pay/resume checkout.
5. **Admin Paid Flag on Assign/Create/Change** [admin-panel + backend] — *(change-005)* admin marks subscription changes as already paid (immediate activation) or unpaid (customer pays via PayUp).
6. **Cancel My Subscription** [frontend] — self-service cancel; sets status `cancelled` + `endDate` = now; implemented change-001.
7. **Subscription Usage Limits** [backend] — *(change-004)* `SubscriptionLimitRegistry` with handlers per limit key (`maxDashboards`, `maxDataUploadsPerMonth`, `maxDataUpdatesPerMonth`); `check`/`assertAllowed` before writes; atomic counter increment via `SubscriptionRepository.incrementUsage`; monthly counter reset on period rollover; returns 403 when exceeded; applies only when `status = active`.
8. **Subscription Resource Lock** [backend] — *(change-004)* expired/inactive/cancelled subscriptions block mutating actions (create dashboards, upload files, update/refresh data); reads, view subscription, subscribe/upgrade allowed.
9. **Free Plan Subscribe** [both] — *(change-004)* free plan (`priceMonthlyUsd = 0`) skips PayUp checkout, activates via same durable `subscription-activation` BullMQ event as paid plans; no payment log for free plans.

## 11. Workspace
- Scope: BE (`src/modules/workspace/`) + FE (`pages/workspace/` in CP + workspace switcher in AppShell)
- Audience: authenticated users (CP) + admin (AP)

### Features
1. **Create Workspace** [both] — triggered by `AuthService.register()` (not a separate user-facing endpoint); auto-generates slug `{word}-{word}-{4digits}`.
2. **Workspace Slug Management** [both] — slug availability check, update slug/name; JWT carries `{ currentWorkspaceId, workspaceSlug, workspaceRole }`.
3. **Workspace Members + Roles** [both] — member list, add, remove, role change via `WorkspaceMembership`; members page at `/app/settings/members`.
4. **Workspace Invitation Flow** [both] — invite by email, accept via token, resend; uses Email integration for invitation emails.
5. **Multi-Workspace Switching** [both] — `POST /workspaces/switch` re-issues JWT with new workspace context; workspace switcher component in top navigation bar.
6. **Workspace Branding (Logo + Color Template)** [both] — logo upload via R2, color template selection from active templates; branding page at `/app/settings/branding`.
7. **Workspace Deletion** [both] — owner-only with typed-name confirmation; drops all workspace-prefixed collections + memberships + branding.

## 12. Onboarding
- Scope: BE (`src/modules/workspace/` — OnboardingProgress schema + controller) + FE (`pages/onboarding/` in CP)
- Audience: newly registered users (CP)

### Features
1. **4-Step Wizard** [both] — step 1: create workspace (mandatory); step 2: branding (skippable); step 3: invite team (skippable); step 4: try it out with sample CSV (skippable); two-column Cisco-style layout; one-time only, re-entry blocked.
2. **Onboarding Progress Tracking** [both] — `GET/PATCH /onboarding/progress`; `onboardingGuard` redirects to `/onboarding` if step 1 not complete; after step 1 all portal routes accessible.
3. **Sample CSV Experiment** [both] — sample CSV seed data (`src/integrations/sample-data/sample-csv.seeder.ts`); tips + sample CSV link in step 4.

---

## Admin Modules

All admin modules are in the **Admin Panel** (`roya-ai-dynamo-frontend-admin`), behind `authGuard + adminGuard`. Several reuse business-module backends.

## 13. Admin — Overview
- Scope: BE (`src/modules/admin/`) + FE (`pages/admin/overview/` in AP)
- Audience: admin (AP)

### Features
1. **Platform Statistics** [both] — aggregate KPI counts (clients, projects, dashboards, subscriptions) as overview cards; reads across `users`, `projects`, `dashboards`, `usersubscriptions`, `ailogs`.
2. **AI Cost Summary (30-Day)** [both] — summarize AI cost over recent 30-day window, render trend chart; backed by AI Logs cost-summary aggregation.

## 14. Admin — Client Management
- Scope: BE (`src/modules/users/` — reused) + FE (`pages/admin/clients/` in AP)
- Audience: admin (AP)

### Features
1. **List / Search Clients** [both] — paginated user list with role/status/last-login/created; search by name/email; filter by role and active status; never returns `passwordHash`/`refreshTokenHash`.
2. **View Client Details** [both] — load user by id with full profile and status.
3. **Create Client** [both] — create user with name, email, password, and role.
4. **Edit Client (Role / Status)** [both] — edit name/email/role, toggle active status, admin-initiated password reset.
5. **Suspend Client** [both] — set user inactive (blocks login, preserves data).
6. **Reactivate Client** [both] — set previously suspended user active again.
7. **Delete Client** [both] — cascade delete owned data; destructive; aligns with GDPR right-to-erasure.

## 15. Admin — Subscriptions & Plans
- Scope: BE (`src/modules/subscriptions/` — shared) + FE (`pages/admin/subscriptions/` in AP)
- Audience: admin (AP)

### Features
1. **Manage Subscription Plans** [both] — plan CRUD (name, description, monthly price USD, max dashboards, monthly upload/update limits, active flag); admin list includes inactive plans.
2. **Manage User Subscriptions** [both] — list/view/create/update subscriptions (paginated, status filter); assign plan, change plan, cancel user subscription (`:userId/cancel`).
3. **Activate / Deactivate User Subscription** [both] — *(change-004)* activate sets `status = active` + valid period dates; deactivate sets `status = inactive` + resource lock applies; distinct from cancel.
4. **Account Suspension** [backend] — *(change-004)* admin suspend/reactivate (extended: revoke refresh tokens, clearer errors); auto-suspend after 2 consecutive unpaid payments without intervening `paid` payment; suspended users: login rejected with `ACCOUNT_SUSPENDED`.

## 16. Admin — Payments
- Scope: BE (`src/modules/payments/`) + FE (`pages/admin/payments/` in AP)
- Audience: admin (AP)

### Features
1. **Payment Ledger Management** [both] — list/filter/view/create/edit/delete payment entries; fields: user ref, subscription/plan ref (optional), amount/currency, status, method, reference, gateway (`manual`/`payup`), provider session ref *(change-003)*, paid-at, notes.
2. **PayUp Gateway Checkout** [both] — *(change-003)* customer self-subscribe opens PayUp hosted-checkout session; pending payment log on init; public confirm/cancel return endpoints finalize log; confirmed payment emits durable `subscription-activation` BullMQ event; API base URL auto-selected by env (sandbox/prod); PayUp HTTP isolated in `src/integrations/payment/` (`PayUpProvider`), keys are env-only.

## 17. Admin — Audit Logs
- Scope: BE (`src/modules/audit/` — `@Global`) + FE (`pages/admin/audit/` in AP)
- Audience: admin (AP)

### Features
1. **View Audit Logs** [both] — paginated list with filters (user, action, entity type, entity id, date range); full detail (old/new values, IP, user agent); immutable read-only (no create/update/delete endpoints); records written by backend modules via shared `@Global` audit service.

## 18. Admin — AI Logs
- Scope: BE (`src/integrations/ai/` — `ai-logs.controller.ts`) + FE (`pages/admin/ai-logs/` in AP)
- Audience: admin (AP)

### Features
1. **View AI Usage Logs** [both] — paginated list with filters (provider, model, status, date range); single log detail (404 if missing); per-request cost computed from `aimodels` pricing.
2. **AI Cost Summary Over Time** [both] — aggregate cost over `from`/`to` range; feeds Admin — Overview 30-day cost chart.

## 19. Admin — System Settings
- Scope: BE (`src/modules/settings/`) + FE (`pages/settings/` in AP)
- Audience: admin (AP)

### Features
1. **Global System Settings** [both] — get/update singleton: `registrationEnabled`, `maxFileSizeMb`, `defaultMaxDashboards`, `supportedLanguages`; admin-only (role guard); never expose raw API keys in any frontend response.

## 20. Admin — Workspace Management
- Scope: BE (`src/modules/workspace/` — admin endpoints, admin-guarded) + FE (`pages/admin/workspaces/` in AP)
- Audience: admin (AP)

### Features
1. **List All Workspaces** [both] — cross-workspace view (no automatic workspace scoping); paginated workspace list.
2. **View Workspace Details** [both] — inspect workspace details and memberships.
3. **Suspend Workspace** [both] — admin suspends a workspace.
4. **Delete Workspace** [both] — admin deletes workspace and all workspace-scoped data.

## 21. Admin — Color Templates
- Scope: BE (`src/modules/color-templates/`) + FE (`pages/admin/color-templates/` in AP)
- Audience: admin (AP)

### Features
1. **Create Color Template** [both] — define template: name, primary, secondary, accent, chartColors[5], isActive.
2. **List Color Templates** [both] — admin sees all (including inactive); active templates used by workspace branding selection.
3. **Update Color Template** [both] — edit template properties.
4. **Delete Color Template** [both] — remove template.
5. **Toggle Active Status** [both] — activate/deactivate template; applied to chart widget renders + exports (chart color cycle); system alert/warning/danger colors never overridden.

---

## Shared / Infrastructure Modules

Infrastructure modules are called by business module services; they do not expose public business endpoints (exception: AI integration hosts the admin AI logs read API).

## S1. Customer Portal Shell
- Scope: FE only (`roya-ai-dynamo-frontend/src/app/layouts/app-shell/`)
- Audience: all authenticated users (CP)

### Features
1. **App Shell Layout** [frontend] — header (logo, notification bell + unread badge, user menu, language switcher), sidebar navigation, route outlet for `/app/*`; `authGuard` protected; language switcher triggers RTL/LTR direction change (EN LTR / AR RTL).

## S2. Admin Panel Shell
- Scope: FE only (`roya-ai-dynamo-frontend-admin/src/app/layouts/app-shell/`)
- Audience: admin users (AP)

### Features
1. **Admin Shell Layout** [frontend] — header, sidebar navigation for admin sections, route outlet for `/app/*`; `authGuard + adminGuard` protected; non-admins cannot enter; auth pages use admin auth layout, not the shell.

## S3. Background Jobs
- Scope: BE only (`src/modules/background-jobs/`)
- Audience: system

### Features
1. **BullMQ Queue Infrastructure** [backend] — queue setup, worker registration, job persistence in `backgroundjobs` (queued/processing/completed/failed), retry logic, 5-min timeout per AI job; active queues: `csv-analysis`, `dashboard-generation` (workers in AI Processing); declared but no worker: `pdf-export`, `cache-recalculation`; completed jobs intended to trigger notifications (wiring pending).

## S4. Caching
- Scope: BE only (cross-cutting, no dedicated folder)
- Audience: system

### Features
1. **Chart Data Cache Layer** [backend] — Redis + MongoDB (`chartdatacache`) cache for pre-calculated chart data; cache key = widget id + query hash; TTL management; lookup order: Redis → MongoDB → recalculate; cache invalidation on manual data refresh; Redis also backs BullMQ queues.

## S5. Storage
- Scope: BE only (`src/integrations/storage/`)
- Audience: system

### Features
1. **File Storage Provider** [backend] — S3-compatible upload (Cloudflare R2), signed URL downloads, file deletion; provider-agnostic interface (`STORAGE_PROVIDER` env var); all file operations go through this service — no direct SDK calls from business modules.

## S6. AI Provider
- Scope: BE only (`src/integrations/ai/`)
- Audience: system

### Features
1. **AI Provider Client** [backend] — Anthropic (Claude) API client, prompt sending + response parsing; provider-agnostic interface (`AI_PROVIDER` env var); AI usage logging (`ailogs`, `aimodels`); AI Logs read API lives here alongside provider client; API key server-side only, never exposed to frontend or logs.

## S7. Email
- Scope: BE only (`src/integrations/mail/`)
- Audience: system

### Features
1. **Transactional Email Service** [backend] — Mailjet client, email templates (welcome, password reset, share/dashboard notifications); provider-agnostic interface (`MAIL_PROVIDER` env var); currently called directly by Auth flow; notifications auto-email wiring pending.

## S8. Payment Gateway
- Scope: BE only (`src/integrations/payment/`)
- Audience: system

### Features
1. **Payment Provider Interface** [backend] — provider-agnostic interface (`PAYMENT_PROVIDER` env var); PayUp provider implemented for subscription checkout *(change-003)*: auth → create session, confirm/cancel return endpoints, durable `subscription-activation` event; API base URL auto-selected by environment (sandbox/prod), overridable by env var.
