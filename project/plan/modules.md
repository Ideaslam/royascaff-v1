# Modules

## Short Summary

This module map defines the application structure for **Roya AI Dynamo**, an AI-powered SaaS dashboard generation platform. Users upload CSV files, AI analyzes the data structure, and an interactive dashboard is automatically generated without manual configuration.

Source inputs:

- `project/description.md`
- `project/plan/features.md`
- `roya-ai-dynamo-api/src` (NestJS backend)
- `roya-ai-dynamo-frontend` (Customer Portal)
- `roya-ai-dynamo-frontend-admin` (Admin Panel)

Its purpose is to define the module list that will later be used to build:

- `project/actions/backend/endpoints.md`
- each app's `project/actions/<app-key>/pages.md`
- backend feature folders (`roya-ai-dynamo-api/src/modules/`)
- frontend feature folders (`roya-ai-dynamo-frontend/src/app/` and `roya-ai-dynamo-frontend-admin/src/app/`)

This file is not an endpoint list and not a page list. It is the module source-of-truth used before those files are created. Module names mirror `project/plan/features.md` 1:1.

---

## How To Use This File

When AI builds `project/actions/backend/endpoints.md`:

- group endpoints under the matching module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds each app's `project/actions/<app-key>/pages.md`:

- group pages under the matching frontend module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds backend code:

- create one NestJS feature module per business module where scope includes backend
- follow the conventions in `engine/rules/backend-rule.md`

When AI builds frontend code:

- create one Angular feature area per frontend-visible module, in the correct app (Customer Portal or Admin Panel)
- keep shell/layout modules separate from business modules
- follow the conventions in `engine/rules/frontend-rule.md`

---

## Product Module Strategy

Roya AI Dynamo ships as **two separate Angular 21 frontend apps over one shared NestJS backend**:

- **Customer Portal** (`roya-ai-dynamo-frontend`) — the end-user app for projects, CSV data, dashboards, sharing, exports, notifications, and self-service subscriptions.
- **Admin Panel** (`roya-ai-dynamo-frontend-admin`) — the operator app for platform overview, client management, plans & subscriptions, payments, audit logs, AI logs, and system settings.

Both apps consume the same backend at `roya-ai-dynamo-api/src` (global prefix `/api/v1`). **All admin features live in the Admin Panel app**, not in the Customer Portal. Modules are split into three layers:

- **Business modules** own the core customer product workflows (Customer Portal + backend): authentication, users, projects, data (CSV), AI processing, dashboards, sharing, export, notifications, and customer subscriptions.
- **Admin modules** own platform management (Admin Panel + backend): overview, client management, subscriptions & plans, payments, audit logs, AI logs, and system settings. Several admin modules reuse business-module backends.
- **Shared/Infrastructure modules** own cross-cutting concerns: the two app shells, background jobs, caching, file storage, AI provider, email, and the (stub) payment gateway.

Backend reality: `roya-ai-dynamo-api/src/modules/{admin, ai-processing, audit, auth, background-jobs, dashboards, data, export, notifications, payments, projects, settings, sharing, subscriptions, users}` and integrations at `roya-ai-dynamo-api/src/integrations/{ai, mail, payment, storage}`. OAuth is configuration-only (`roya-ai-dynamo-api/src/config`) with login logic in the `auth` module; the `src/integrations/oauth/` folder exists but is empty.

---

## Business Modules

### 1. Auth

#### Purpose

Handle user registration, login, logout, password reset, and JWT token lifecycle (issue/refresh/revoke). Own the current-user endpoint used by both frontends to bootstrap their app shells.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users (Customer Portal + Admin Panel)`

#### Related Features

- Auth → User Registration, User Login, OAuth Login (Google / Microsoft), Token Refresh, Password Reset, Logout, Current User Profile

#### Backend Module

- Folder: `src/modules/auth/`
- Owns:
  - user registration and login (rate-limited)
  - JWT access/refresh token issuance and rotation
  - password reset flow (forgot-password / reset-password)
  - logout (refresh token invalidation)
  - current user endpoint (`/auth/me`) and auth guards used by all protected endpoints
  - OAuth login service logic (`AuthService.oauthLogin`)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/auth/` (Customer Portal) and `roya-ai-dynamo-frontend-admin/src/app/pages/auth/` (Admin Panel)
- Owns:
  - login page (both apps)
  - register page (Customer Portal only)
  - forgot-password and reset-password pages (both apps)
  - auth layout (`layouts/auth-layout/`), separate from the app shell

#### Data Model / Entities

- `users` (authentication fields only; profile management is in the Users module)

#### Depends On

- `Users`

#### Notes

- Auth pages use the auth layout, not the app shell
- The Admin Panel login additionally requires the `admin` role (enforced by an admin route guard)
- OAuth is **partial**: provider config (in `src/config`) and `AuthService.oauthLogin` exist, but `POST /api/v1/auth/oauth/callback` is a stub and not wired end-to-end. The `src/integrations/oauth/` folder is empty.

---

### 2. Users

#### Purpose

Own the user entity and self-service account management (profile and password). The same backend powers admin-facing client operations, which are documented under **Admin — Client Management**.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (self-service profile)`

#### Related Features

- Users → View and Edit Own Profile, Change Own Password

#### Backend Module

- Folder: `src/modules/users/`
- Owns:
  - user profile read/update (name, email, avatar, language preference)
  - change-own-password (verify current, persist new hash)
  - admin-facing user CRUD, suspend/reactivate, and delete (reused by Admin — Client Management)
  - never returns `passwordHash` / `refreshTokenHash`

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/settings/profile/` (Customer Portal self-service)
- Owns:
  - account profile page (self-service profile editing + password change)

#### Data Model / Entities

- `users`

#### Depends On

- `Auth`

#### Notes

- Self-service profile is under `/app/settings/profile`
- Admin-facing client operations reuse this backend but live in the Admin Panel (**Admin — Client Management**)

---

### 3. Projects

#### Purpose

Provide the organizational container for dashboards. Users create projects to group related dashboards together.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins (Customer Portal)`

#### Related Features

- Projects → Create Project, List Projects, View Project, Edit Project, Delete Project

#### Backend Module

- Folder: `src/modules/projects/`
- Owns:
  - project CRUD (create, read, update, delete)
  - project listing with search, pagination, and active-status filter
  - owner-or-admin access validation
  - cascade deletion of dashboards (and their widgets, share links, cache entries, data source links) when a project is deleted

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/projects/`
- Owns:
  - projects list page (`/app/projects`)
  - project detail / dashboard list page (`/app/projects/:id`)

#### Data Model / Entities

- `projects`

#### Depends On

- `Auth`
- `Users`

#### Notes

- Project names do not need to be unique
- Only the project owner or an admin can edit or delete a project
- Cascade deletion is irreversible

---

### 4. Data (CSV Management)

#### Purpose

Handle the full CSV lifecycle: upload, storage, row persistence into per-file dynamic collections, column metadata management, AI column analysis triggering, and file reuse across dashboards.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins (Customer Portal)`

#### Related Features

- Data (CSV Management) → Upload CSV File, List My CSV Files, View CSV File Details, AI Column Analysis (Background), Review and Edit Column Descriptions, Retry Column Analysis, Delete CSV File

#### Backend Module

- Folder: `src/modules/data/`
- Owns:
  - direct multipart CSV upload (streamed to Cloudflare R2) and legacy presigned upload flow
  - file metadata persistence (`csvfiles` collection)
  - CSV row parsing into per-file dynamic collections (`csvdata_{fileId}`)
  - column metadata creation and update (`columnmetadata`)
  - file listing/search/filter per user and file deletion (drops data rows, reports affected dashboards)
  - queuing AI column analysis (and retry) on the `csv-analysis` queue

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/data/`
- Owns:
  - CSV upload wizard page (`/app/data/upload`)
  - my data files list page (`/app/data`)
  - column description review/editing (within the data flow)

#### Data Model / Entities

- `csvfiles`
- `csvdata_{fileId}` (per-file dynamic collections)
- `columnmetadata`

#### Depends On

- `Auth`
- `AI Processing` (triggers column analysis job)
- `Storage` (uploads raw file to Cloudflare R2)
- `Background Jobs` (async processing)

#### Notes

- Each CSV file gets its own MongoDB collection for its data rows to support dynamic schema
- AI never reads data rows; it only receives column names, inferred types, and sample statistics
- Deleting a CSV file is destructive and reports dependent dashboards in the result

---

### 5. AI Processing

#### Purpose

Orchestrate AI-powered background jobs (CSV column analysis and dashboard structure generation) via BullMQ workers. Acts as the domain layer between business logic and the AI provider integration. **Backend-only — no frontend pages.**

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system (triggered by the Data and Dashboards modules)`

#### Related Features

- AI Processing → CSV Column Analysis Job, AI Dashboard Generation Job

#### Backend Module

- Folder: `src/modules/ai-processing/`
- Owns:
  - `csv-analysis` queue worker: load rows, infer columns, compute sample statistics, generate per-column descriptions, write to `columnmetadata`
  - `dashboard-generation` queue worker: select widgets from the catalog, define aggregation queries, write `chartwidgets`, set dashboard status `ready`
  - prompt construction and AI response parsing/validation
  - job status updates via the `backgroundjobs` record

#### Data Model / Entities

- `backgroundjobs`
- `columnmetadata` (writes AI-generated descriptions)
- `dashboards` / `chartwidgets` (writes generated widget structure)

#### Depends On

- `Background Jobs`
- `AI Provider` integration (`src/integrations/ai/`)
- `Data`
- `Dashboards`

#### Notes

- AI receives only column names, inferred types, and sample statistics — never raw data rows
- AI selects widgets and defines query specs; the backend executes the actual MongoDB aggregations
- Status is surfaced through the Data (column analysis) and Dashboards (generation) pages — there is no dedicated AI frontend area
- **Gap:** the `pdf-export` and `cache-recalculation` queues have jobs enqueued but **no worker consumes them yet**

---

### 6. Dashboards

#### Purpose

Own the full dashboard lifecycle: creation with a purpose description, AI generation status, the dynamic viewer, widget CRUD/customization, the cache-first chart data API with filters, refresh, duplicate, delete, and generation retry.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors (create/edit), viewers (read via share link)`

#### Related Features

- Dashboards → Create Dashboard, Dashboard Generation Status, List Dashboards, View Dashboard (Dynamic Viewer), Chart Data API (Cache-First, Filterable), Manual Data Refresh, Dashboard Customization (Widget CRUD), Edit Dashboard Details, Duplicate Dashboard, Delete Dashboard, Retry Dashboard Generation

#### Backend Module

- Folder: `src/modules/dashboards/`
- Owns:
  - dashboard CRUD (create, read, update, delete, duplicate)
  - dashboard status management (`generating`, `ready`, `error`) and generation retry
  - widget configuration persistence (`chartwidgets`) and data source linking (`dashboarddatasources`)
  - triggering AI dashboard generation on the `dashboard-generation` queue
  - cache-first chart data endpoint (Redis → aggregation), optional JSON filters, JWT or share-token access
  - manual data refresh: invalidate cache and enqueue a `cache-recalculation` job

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/dashboards/`
- Owns:
  - dashboard generation/status page (`/app/dashboards/:id/generating`)
  - dynamic dashboard viewer page (`/app/dashboards/:id`)
  - shared public viewer page (`/shared/:token`)
  - widget customization within the viewer/editor

#### Data Model / Entities

- `dashboards`
- `chartwidgets`
- `dashboarddatasources`
- `chartdatacache`

#### Depends On

- `Projects`
- `Data`
- `AI Processing` (triggers generation job)
- `Caching` (Redis + DB cache for chart data)
- `Background Jobs`

#### Notes

- The viewer calls chart data endpoints in parallel to load multiple charts simultaneously
- Dashboard duplication is ready immediately (no regeneration)
- Cascade deletion removes widgets, data source links, cache entries, and share links
- **Partial:** Manual Data Refresh enqueues a `cache-recalculation` job, but no worker consumes it yet

---

### 7. Sharing

#### Purpose

Generate and manage secure, token-based share links for dashboards with view or edit permission, optional expiry, and revocation. Resolve public dashboards by share token.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors (create/manage links), public viewers (access via token)`

#### Related Features

- Sharing → Create Share Link, Manage Share Links, View Shared Dashboard (Public)

#### Backend Module

- Folder: `src/modules/sharing/`
- Owns:
  - share link generation (unique URL-safe token, returned once)
  - permission (view/edit), optional expiry, and viewer-refresh flag
  - share link listing and revocation per dashboard
  - public share link resolution (look up dashboard by token, enforce permission)
  - cascade invalidation when the parent dashboard is deleted

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/dashboards/` (share management within dashboard pages; public viewer at `shared-viewer/`)
- Owns:
  - share link management panel (within dashboard pages)
  - shared dashboard public view page (`/shared/:token`)

#### Data Model / Entities

- `sharelinks`

#### Depends On

- `Dashboards`
- `Auth` (optional — share links work without authentication for viewers)

#### Notes

- Deleting a dashboard immediately invalidates all its share links
- Expired/revoked links return a clear error, not a `404`

---

### 8. Export

#### Purpose

Generate and deliver dashboard exports. Excel and CSV are synchronous file streams; PDF is queued (async).

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors and viewers with export permission`

#### Related Features

- Export → Export Dashboard as PDF, Export Data as Excel, Export Data as CSV

#### Backend Module

- Folder: `src/modules/export/`
- Owns:
  - PDF export job queuing (returns `202` with a job id) on the `pdf-export` queue
  - synchronous Excel (`.xlsx`) workbook stream of widget/dashboard data
  - synchronous CSV stream of a widget's data
  - raw file streams bypass the success envelope

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/dashboards/` (export triggers within the dashboard viewer)
- Owns:
  - export action triggers and download handling within the viewer

#### Data Model / Entities

- `backgroundjobs` (for async PDF generation)

#### Depends On

- `Dashboards`
- `Storage`
- `Background Jobs`

#### Notes

- **Partial:** the PDF job is enqueued on `pdf-export`, but no worker is implemented yet — the PDF is never produced
- Excel/CSV are synchronous direct downloads

---

### 9. Notifications

#### Purpose

Provide the in-app notification center: list notifications, show the unread count for the shell bell, and mark notifications read.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `all authenticated users (Customer Portal)`

#### Related Features

- Notifications → In-App Notification Center

#### Backend Module

- Folder: `src/modules/notifications/`
- Owns:
  - notification record creation (`NotificationsService.notify`)
  - paginated notification listing (filterable by read state)
  - unread count for the shell bell badge
  - mark-one-read and mark-all-read

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/notifications/`
- Owns:
  - notifications list page (`/app/notifications`)
  - notification bell + unread badge in the Customer Portal app shell header

#### Data Model / Entities

- `notifications`

#### Depends On

- `Auth`
- `Email` integration (`src/integrations/mail/`)
- `Background Jobs` (notifications intended to be triggered by job completion)

#### Notes

- **Partial wiring:** `NotificationsService.notify` exists but is not yet called by the AI/export workers, so notifications are not auto-generated by background events yet
- Transactional emails (welcome, password reset) are sent directly by the Auth flow via the MailJet integration, not through this module

---

### 10. Subscriptions

#### Purpose

Customer-facing subscription area: view available plans and view the current user's own subscription and usage, plus self-service subscribe/cancel. (Admin-side plan and subscription management lives in **Admin — Subscriptions & Plans**.)

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (Customer Portal)`

#### Related Features

- Subscriptions → View Available Plans, View My Subscription and Usage, Subscribe to a Plan, Cancel My Subscription

#### Backend Module

- Folder: `src/modules/subscriptions/`
- Owns:
  - list active plans (`GET /subscriptions/plans`)
  - current user's subscription + usage (`GET /subscriptions/me`)
  - self-service subscribe (`POST /subscriptions/subscribe`) and cancel (`POST /subscriptions/cancel`)
  - (admin-side plan/subscription management endpoints are shared here; see Admin — Subscriptions & Plans)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/subscriptions/`
- Owns:
  - subscriptions page (`/app/subscriptions`): view plans + own subscription/usage, subscribe and cancel

#### Data Model / Entities

- `subscriptionplans`
- `usersubscriptions`

#### Depends On

- `Users`
- `Auth`

#### Notes

- Self-service Subscribe/Cancel are **implemented** (change-001, 2026-06-22): `POST /subscriptions/subscribe` and `POST /subscriptions/cancel` are live
- Subscribe does not process a real payment — it assigns the subscription directly and returns a redirect URL; payment-gateway checkout is deferred to a future change
- Cancel sets status `cancelled` and `endDate` to the current date

---

### 11. Workspace

#### Purpose

Own the multi-tenancy layer: every company/organization is a Workspace. Handle workspace creation (triggered automatically on registration), slug management, membership and roles, invitation flow, multi-workspace switching, workspace branding, and workspace deletion.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (Customer Portal) + admin (Admin Panel)`

#### Related Features

- Workspace → Create Workspace, Workspace Slug Management, Workspace Members + Roles, Workspace Invitation Flow, Multi-Workspace Switching, Workspace Branding (Logo + Color Template), Workspace Deletion

#### Backend Module

- Folder: `src/modules/workspace/`
- Owns:
  - workspace CRUD (create, get, update slug/name, delete)
  - slug auto-generation (`{word}-{word}-{4digits}`) + availability check
  - `WorkspaceMembership` — member list, add, remove, role change
  - `WorkspaceInvitation` — invite by email, accept via token, resend
  - `WorkspaceBranding` — logo upload (via R2), color template selection
  - `OnboardingProgress` — create on registration, update per step, read for redirect logic
  - multi-workspace switching (`POST /workspaces/switch` → re-issue JWT)
  - workspace deletion (drop all workspace-prefixed collections + memberships + branding)

#### Frontend Module

- Customer Portal: `pages/workspace/` (settings), shared workspace switcher component in AppShell
- Owns (customer-portal):
  - workspace settings page (`/app/settings/workspace`)
  - members & invitations page (`/app/settings/members`)
  - branding page (`/app/settings/branding`)
  - workspace switcher in the top navigation bar

#### Data Model / Entities

- `workspaces`
- `workspace_memberships`
- `workspace_invitations`
- `workspace_brandings`
- `onboarding_progress`

#### Depends On

- `Auth`
- `Storage` (logo upload)
- `Email` (invitation emails)
- `Color Templates` (branding color template reference)

#### Notes

- Workspace creation is triggered by `AuthService.register()` — not by a separate create endpoint in the normal user flow.
- JWT carries `{ currentWorkspaceId, workspaceSlug, workspaceRole }`.
- All data service/repo methods for workspace-prefixed collections receive `workspaceSlug` from the JWT via `@CurrentUser()`.
- Workspace deletion is owner-only with typed-name confirmation.

---

### 12. Onboarding

#### Purpose

Guide new workspace owners through a 4-step wizard immediately after registration. Step 1 (workspace creation) is mandatory. Steps 2–4 (branding, invite, experiment) are skippable. Progress is tracked in the DB so the wizard resumes on browser reopen.

#### Scope

- Backend: `yes` (progress tracking API)
- Frontend: `yes` (Customer Portal only)
- Audience: `newly registered users (Customer Portal)`

#### Related Features

- Onboarding → 4-Step Wizard, Onboarding Progress Tracking, Sample CSV Experiment

#### Backend Module

- Handled within `src/modules/workspace/` (OnboardingProgress schema + controller)
- Owns:
  - `GET /onboarding/progress` — returns the current onboarding progress record
  - `PATCH /onboarding/progress` — update step completion flags
  - sample CSV seed data (`src/integrations/sample-data/sample-csv.seeder.ts`)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/pages/onboarding/`
- Owns:
  - onboarding wizard page (`/onboarding`) — 4 steps, two-column Cisco-style layout
  - step 1: create workspace (mandatory)
  - step 2: branding (skippable)
  - step 3: invite team (skippable)
  - step 4: try it out (tips + sample CSV link, skippable)

#### Data Model / Entities

- `onboarding_progress`

#### Depends On

- `Workspace`
- `Auth`
- `Data` (sample CSV feature in step 4)

#### Notes

- `onboardingGuard` redirects to `/onboarding` if step 1 not complete.
- The wizard is one-time only; re-entry is blocked.
- After step 1, all portal routes are accessible; steps 2–4 are optional.

---

## Admin Modules

All admin modules are served by the **Admin Panel** app (`roya-ai-dynamo-frontend-admin`), behind `authGuard + adminGuard`. Several reuse business-module backends.

### 13. Admin — Overview

#### Purpose

Give admins a platform health snapshot: key counts (clients, projects, dashboards, subscriptions) and a 30-day AI cost summary chart.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Overview → Platform Statistics, AI Cost Summary (30-Day)

#### Backend Module

- Folder: `src/modules/admin/`
- Owns:
  - platform statistics aggregation (`GET /admin/overview/stats`)
  - 30-day AI cost summary (backed by the AI Logs cost-summary aggregation)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/overview/`
- Owns:
  - overview page (`/app/overview`): KPI cards + AI cost trend chart

#### Data Model / Entities

- reads across `users`, `projects`, `dashboards`, `usersubscriptions`, `ailogs`

#### Depends On

- `Auth`
- `Admin — AI Logs` (cost summary)

#### Notes

- Admin-only; the dedicated `admin` backend module exposes the overview stats endpoint

---

### 14. Admin — Client Management

#### Purpose

Admin-facing client (user) administration. Backend operations reuse the **Users** module backend; the UI lives in the Admin Panel.

#### Scope

- Backend: `yes` (reuses the `Users` backend)
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Client Management → List / Search Clients, View Client Details, Create Client, Edit Client (Role / Status), Suspend Client, Reactivate Client, Delete Client

#### Backend Module

- Folder: `src/modules/users/` (admin-facing CRUD, suspend/reactivate, delete)
- Owns:
  - paginated/searchable/filterable user listing
  - user create/edit (role/status), admin-initiated password reset
  - suspend (set inactive), reactivate (set active), delete (cascade owned data)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/clients/`
- Owns:
  - clients list page and create/edit/detail (`/app/clients`)

#### Data Model / Entities

- `users`

#### Depends On

- `Users`
- `Auth`

#### Notes

- Backend reuses the `Users` module; the separation is for the Admin Panel UI
- Never returns `passwordHash` / `refreshTokenHash`; delete aligns with GDPR right-to-erasure

---

### 15. Admin — Subscriptions & Plans

#### Purpose

Admin management of subscription plans and user subscriptions: define plans (CRUD) and assign/create/update/change/cancel user subscriptions.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Subscriptions & Plans → Manage Subscription Plans, Manage User Subscriptions

#### Backend Module

- Folder: `src/modules/subscriptions/`
- Owns:
  - plan CRUD (name, description, monthly price, max dashboards, monthly upload/update limits, active flag)
  - subscription listing (paginated, status filter) and single view
  - create/update subscription, assign plan, change plan, cancel a user's subscription (`:userId/cancel`)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/`
- Owns:
  - subscriptions & plans management page (`/app/subscriptions`)

#### Data Model / Entities

- `subscriptionplans`
- `usersubscriptions`

#### Depends On

- `Users`
- `Subscriptions` (shares the backend module)

#### Notes

- Customer self-service subscribe/cancel live in the **Subscriptions** module (now implemented)

---

### 16. Admin — Payments

#### Purpose

A manual payment ledger for admins to record and maintain payment entries. This is a bookkeeping ledger, **not** a payment-gateway checkout flow.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Payments → Payment Ledger Management

#### Backend Module

- Folder: `src/modules/payments/`
- Owns:
  - payment record CRUD (create, read, edit, delete)
  - list/filter payments (by user, status, date range; paginated)
  - fields: user (and optional subscription/plan) reference, amount/currency, status, method, reference, paid-at, notes

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/payments/`
- Owns:
  - payments ledger page (`/app/payments`)

#### Data Model / Entities

- `payments`

#### Depends On

- `Users`
- `Auth`

#### Notes

- Manual ledger only — no gateway checkout or webhook processing is implemented (the `Payment Gateway` integration is an unused stub)

---

### 17. Admin — Audit Logs

#### Purpose

Give admins read-only access to the immutable, system-wide audit trail of user and system actions.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Audit Logs → View Audit Logs

#### Backend Module

- Folder: `src/modules/audit/` (`@Global`)
- Owns:
  - paginated audit log listing with filters (user, action, entity type, entity id, date range)
  - full log entry detail (old/new values, IP, user agent)
  - a shared audit service that other modules call to write records

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/audit/`
- Owns:
  - audit logs list + detail page (`/app/audit`)

#### Data Model / Entities

- `auditlogs`

#### Depends On

- `Auth`
- `Users`

#### Notes

- The `audit` module is `@Global`; records are written by backend modules via the shared audit service
- Audit logs are immutable — read-only; no create/update/delete endpoints

---

### 18. Admin — AI Logs

#### Purpose

Give admins visibility into AI usage: per-request logs, per-request cost, cost summary over time, and individual log detail.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — AI Logs → View AI Usage Logs, AI Cost Summary Over Time

#### Backend Module

- Folder: `src/integrations/ai/` (`ai-logs.controller.ts`)
- Owns:
  - paginated AI log listing with filters (provider, model, status, date range)
  - single AI log detail (`404` if missing)
  - cost summary over a `from`/`to` range (feeds the Admin — Overview chart)
  - per-request cost computed from model pricing

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/ai-logs/`
- Owns:
  - AI usage + cost page (`/app/ai-logs`)

#### Data Model / Entities

- `ailogs`
- `aimodels` (model pricing)

#### Depends On

- `Auth`
- `AI Provider` integration (logs are written by AI calls)

#### Notes

- The AI logs read API lives in the `ai` integration alongside the AI provider client
- Feeds the Admin — Overview 30-day cost summary

---

### 19. Admin — System Settings

#### Purpose

Manage the global system settings singleton: registration toggle, max file size, default max dashboards, and supported languages.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — System Settings → Global System Settings

#### Backend Module

- Folder: `src/modules/settings/`
- Owns:
  - get the system settings singleton
  - update settings: `registrationEnabled`, `maxFileSizeMb`, `defaultMaxDashboards`, `supportedLanguages`

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/settings/`
- Owns:
  - system settings page (`/app/settings`)

#### Data Model / Entities

- `systemsettings` (global singleton)

#### Depends On

- `Auth`

#### Notes

- Admin-only (role guard); the settings backend is shared and the management UI is exposed in the admin-guarded settings area
- Never expose raw API keys in any frontend response

---

### 20. Admin — Workspace Management

#### Purpose

Give super-admins visibility into all workspaces: list, inspect, suspend, and delete. Cross-workspace view — no automatic workspace scoping.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Workspace Management → List All Workspaces, View Workspace Details, Suspend Workspace, Delete Workspace

#### Backend Module

- Folder: `src/modules/workspace/` (admin endpoints on the same module, admin-guarded)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/workspaces/`
- Owns:
  - workspaces list page (`/app/workspaces`)

#### Data Model / Entities

- `workspaces`, `workspace_memberships`

#### Depends On

- `Workspace`
- `Auth`

---

### 21. Admin — Color Templates

#### Purpose

Allow super-admins to define and manage the predefined color palette templates that workspaces can apply to their chart renders and exports.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

#### Related Features

- Admin — Color Templates → Create Color Template, List Color Templates, Update Color Template, Delete Color Template, Toggle Active Status

#### Backend Module

- Folder: `src/modules/color-templates/`
- Owns:
  - color template CRUD (name, primary, secondary, accent, chartColors[5], isActive)
  - list active templates (used by workspace branding selection)
  - admin CRUD (all templates incl. inactive)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/pages/admin/color-templates/`
- Owns:
  - color templates management page (`/app/color-templates`)

#### Data Model / Entities

- `color_templates`

#### Depends On

- `Auth`

#### Notes

- Color templates are defined by the super-admin.
- Applied to chart widget renders + exports (chart color cycle).
- System alert/warning/danger colors are never overridden.

---


## Shared / Infrastructure Modules

### 1. Customer Portal Shell (Frontend Only)

#### Purpose

Provide the authenticated Customer Portal layout: top header with notification bell and language switcher, side navigation, and the main router outlet for all customer pages.

#### Scope

- Backend: `no`
- Frontend: `yes`
- Audience: `all authenticated users (Customer Portal)`

#### Related Features

- Dynamic Dashboard Viewer (hosted within the shell)
- In-App Notification Center (bell in header)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend/src/app/layouts/app-shell/`
- Owns:
  - app shell layout component
  - header (logo, notification bell + unread badge, user menu, language switcher)
  - sidebar navigation
  - route outlet for all `/app/*` customer pages

#### Depends On

- `Auth`
- `Notifications`

#### Notes

- Routes under `/app/*` are protected by `authGuard`
- Language switcher triggers RTL/LTR direction change (English LTR / Arabic RTL)

---

### 2. Admin Panel Shell (Frontend Only)

#### Purpose

Provide the authenticated Admin Panel layout: header, side navigation, and the router outlet for all admin pages, gated to admin users.

#### Scope

- Backend: `no`
- Frontend: `yes`
- Audience: `admin users (Admin Panel)`

#### Related Features

- Admin — Overview, Client Management, Subscriptions & Plans, Payments, Audit Logs, AI Logs, System Settings (all hosted within the shell)

#### Frontend Module

- Folder: `roya-ai-dynamo-frontend-admin/src/app/layouts/app-shell/`
- Owns:
  - admin app shell layout component
  - header and sidebar navigation for admin sections
  - route outlet for all `/app/*` admin pages

#### Depends On

- `Auth`

#### Notes

- Routes under `/app/*` are protected by `authGuard + adminGuard`; non-admins cannot enter
- Auth pages use the admin auth layout, not the app shell

---

### 3. Background Jobs

#### Purpose

Provide the shared infrastructure for queuing, executing, monitoring, and retrying asynchronous background jobs across modules.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- AI Processing → CSV Column Analysis Job, AI Dashboard Generation Job (async)
- Export → Export Dashboard as PDF (queued)
- Dashboards → Manual Data Refresh (queued)

#### Backend Module

- Folder: `src/modules/background-jobs/`
- Owns:
  - BullMQ queue setup and worker registration
  - job persistence in `backgroundjobs` (queued, processing, completed, failed)
  - retry logic and timeout enforcement (5-minute max per AI job)
  - queues: `csv-analysis`, `dashboard-generation`, `pdf-export` (no worker yet), `cache-recalculation` (no worker yet)

#### Data Model / Entities

- `backgroundjobs`

#### Depends On

- `Caching` / Redis (BullMQ broker)

#### Notes

- `csv-analysis` and `dashboard-generation` have active workers (in AI Processing)
- `pdf-export` and `cache-recalculation` are declared and enqueued but **have no worker yet**
- Completed jobs are intended to trigger notifications (wiring pending)

---

### 4. Caching

#### Purpose

Provide shared Redis + MongoDB caching for pre-calculated chart data. All chart data lookups go through this layer before hitting the aggregation pipeline.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- Dashboards → Chart Data API (Cache-First), Manual Data Refresh (cache invalidation)

#### Backend Module

- Owns:
  - Redis cache read/write for chart results
  - MongoDB persistent cache fallback (`chartdatacache`)
  - cache key generation (widget id + query hash) and TTL management
  - cache invalidation on manual data refresh

#### Data Model / Entities

- `chartdatacache`

#### Depends On

- Redis

#### Notes

- Cache lookup order: Redis → MongoDB cache → recalculate
- Redis also backs the BullMQ queues used by Background Jobs

---

### 5. Storage

#### Purpose

Abstract file storage operations (upload, download, delete) behind a provider-agnostic interface, with Cloudflare R2 as the current implementation.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- Data (CSV Management) → Upload CSV File
- Export → PDF storage

#### Backend Module

- Folder: `src/integrations/storage/`
- Owns:
  - S3-compatible upload (Cloudflare R2)
  - signed URL generation for downloads
  - file deletion
  - provider interface allowing swap (AWS S3, Azure Blob, etc.)

#### Depends On

- None (pure infrastructure)

#### Notes

- All file operations go through this service — no direct SDK calls from business modules
- Provider selected via the `STORAGE_PROVIDER` environment variable

---

### 6. AI Provider

#### Purpose

Abstract all AI provider API calls behind a provider-agnostic interface. Used by the AI Processing module; also persists AI usage logs consumed by Admin — AI Logs.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/ai/`
- Owns:
  - Anthropic (Claude) API client (`anthropic.provider.ts`)
  - prompt sending and response parsing
  - provider interface (allows swapping providers)
  - AI usage logging (`ailogs`) and model pricing (`aimodels`), exposed via `ai-logs.controller.ts`

#### Data Model / Entities

- `ailogs`
- `aimodels`

#### Depends On

- None (pure infrastructure)

#### Notes

- Provider selected via the `AI_PROVIDER` environment variable; the current provider is Anthropic
- API key is server-side only; never exposed to frontend or logs
- The AI Logs read API (Admin — AI Logs) lives here alongside the provider client

---

### 7. Email

#### Purpose

Deliver transactional emails via Mailjet. Used by the Auth flow (password reset) and intended for the Notifications module.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/mail/`
- Owns:
  - Mailjet API client
  - email templates (welcome, password reset, share/dashboard notifications)
  - provider interface for future swap

#### Depends On

- None (pure infrastructure)

#### Notes

- Provider selected via the `MAIL_PROVIDER` environment variable; the current provider is Mailjet
- Currently called directly by the Auth flow; Notifications auto-email wiring is pending

---

### 8. Payment Gateway

#### Purpose

Intended provider-agnostic interface for processing SaaS subscription payments. **Currently a stub — not used.**

#### Scope

- Backend: `yes` (stub)
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/payment/`
- Owns:
  - payment provider client interface (provider selected via `PAYMENT_PROVIDER`)
  - subscription/checkout and webhook handling (not implemented)

#### Depends On

- None (pure infrastructure)

#### Notes

- **Unused stub.** No gateway checkout or webhook processing is wired
- Customer subscribe assigns subscriptions directly without a real payment; admin payments are a manual ledger (see Admin — Payments)

---

## Module Priority For Implementation Planning

### Phase 1: Core Workflow (MVP)

These modules form the end-to-end customer journey:

- `Auth`
- `Users`
- `Projects`
- `Data` (CSV Management)
- `AI Processing`
- `Dashboards`
- `Background Jobs` (shared — required by AI Processing)
- `Caching` (shared — required by Dashboards)
- `Storage` (shared — required by Data)
- `AI Provider` (shared — required by AI Processing)
- `Customer Portal Shell` (frontend — hosts all customer pages)

### Phase 2: Engagement, Collaboration, and Delivery

- `Sharing`
- `Export`
- `Notifications`
- `Subscriptions` (customer self-service)
- `Email` (shared — required by Notifications / password reset)

### Phase 3: Platform Administration (Admin Panel)

- `Admin Panel Shell` (frontend — hosts all admin pages)
- `Admin — Overview`
- `Admin — Client Management`
- `Admin — Subscriptions & Plans`
- `Admin — Payments`
- `Admin — Audit Logs`
- `Admin — AI Logs`
- `Admin — System Settings`
- `Payment Gateway` (shared — stub, deferred)

---

## Module Dependency Summary

- `Auth` depends on `Users`
- `Users` depends on `Auth`
- `Projects` depends on `Auth`, `Users`
- `Data` depends on `Auth`, `AI Processing`, `Storage`, `Background Jobs`
- `AI Processing` depends on `Background Jobs`, `AI Provider`, `Data`, `Dashboards`
- `Dashboards` depends on `Projects`, `Data`, `AI Processing`, `Caching`, `Background Jobs`
- `Sharing` depends on `Dashboards`, `Auth`
- `Export` depends on `Dashboards`, `Storage`, `Background Jobs`
- `Notifications` depends on `Auth`, `Email`, `Background Jobs`
- `Subscriptions` depends on `Users`, `Auth`
- `Admin — Overview` depends on `Auth`, `Admin — AI Logs`
- `Admin — Client Management` depends on `Users`, `Auth`
- `Admin — Subscriptions & Plans` depends on `Users`, `Subscriptions`
- `Admin — Payments` depends on `Users`, `Auth`
- `Admin — Audit Logs` depends on `Auth`, `Users`
- `Admin — AI Logs` depends on `Auth`, `AI Provider`
- `Admin — System Settings` depends on `Auth`
- `Customer Portal Shell` depends on `Auth`, `Notifications`
- `Admin Panel Shell` depends on `Auth`
- `Background Jobs` depends on `Caching` / Redis
- `Caching` depends on Redis

---

## Important Planning Notes

- The product ships as **two frontend apps over one backend**: the Customer Portal (`roya-ai-dynamo-frontend`) and the Admin Panel (`roya-ai-dynamo-frontend-admin`). All API routes are served under `/api/v1`. Admin features live in the Admin Panel app only.
- One module may contain many endpoints and many pages — for example, `Dashboards` owns the generation, viewer, customization pages, and all chart data endpoints.
- `AI Processing` is backend-only. Its status is surfaced through `Data` (column analysis) and `Dashboards` (generation status) pages, not a separate AI frontend area.
- `Customer Portal Shell` and `Admin Panel Shell` are frontend-only layout modules with no backend domain; the admin shell adds `adminGuard` on top of `authGuard`.
- Several admin modules reuse business-module backends: `Admin — Client Management` reuses `Users`; `Admin — Subscriptions & Plans` reuses `Subscriptions`; `Admin — AI Logs` lives in the `ai` integration. The separation is for the Admin Panel UI.
- `Background Jobs`, `Caching`, `Storage`, `AI Provider`, `Email`, and `Payment Gateway` are infrastructure modules — they are called by business module services rather than exposing public business endpoints directly (the `ai` integration is an exception: it also hosts the admin AI logs read API).
- OAuth is configuration-only in `src/config` with login logic in the `auth` module; `src/integrations/oauth/` exists but is empty. End-to-end OAuth is **partial** (callback is a stub).
- Known partial / planned items:
  - `Auth` → OAuth Login: config + service exist, but `oauth/callback` is a stub (**partial**).
  - `Export` → PDF: job is queued but **no `pdf-export` worker** is implemented.
  - `Dashboards` → Manual Data Refresh: enqueues a `cache-recalculation` job but **no worker** consumes it.
  - `Notifications`: `NotificationsService.notify` exists but is **not wired** to AI/export workers yet.
  - `Payment Gateway`: an **unused stub**; no gateway checkout or webhook processing.
  - `Subscriptions` → Subscribe / Cancel: **implemented** in change-001 (2026-06-22); both endpoints are live (no real payment processing yet).
- `Admin — Payments` is a **manual ledger**, not a payment-gateway checkout.
- Do not create a separate module per page or per API route — group by business capability.


