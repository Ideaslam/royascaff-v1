# Pages

## Short Summary

This file defines every routed Angular page for **Roya AI Dynamo**, derived from the actual code in the
two frontend repos. Pages are grouped by **app** first, then by module (matching `project/plan/modules.md`).
Backend endpoint links match `project/actions/endpoints.md`.

There are **two separate Angular 21 (standalone) apps** sharing one NestJS backend:

- **Customer Portal** — `roya-ai-dynamo-frontend` — end-user product (projects, data, dashboards, sharing).
- **Admin Panel** — `roya-ai-dynamo-frontend-admin` — platform operations (clients, subscriptions, payments, audit, AI logs).

Conventions:

- All routes are **lazy** (`loadComponent`). Component paths below are relative to each app's `src/app/`.
- Backend paths are shown with the global prefix `/api/v1` (frontend builds them from `environment.apiUrl`).
- UI library: **PrimeNG** + PrimeIcons. Brand: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary). i18n: EN (LTR) + AR (RTL).

---

# App: Customer Portal (`roya-ai-dynamo-frontend`)

Layouts: `AuthLayout` (auth pages) and `AppShell` (collapsible sidebar + topbar). Guards: `authGuard`
(requires login), `guestGuard` (unauthenticated only), `adminGuard` (role `admin`). Auth interceptor attaches
the bearer token and refreshes on 401.

---

## Module: Auth

---

### Page 1

- Name: `Login Page`
- Route: `/auth/login`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Email/password login plus OAuth redirect buttons.`

#### Description

Login form for existing users. Email/password submits to the API; OAuth buttons redirect the browser to the
backend OAuth entry points. On success, stores tokens and navigates into the app.

#### Main Component

- Component Name: `LoginPage`
- Folder: `src/app/pages/auth/login`
- Files: `login.page.ts`, `login.page.html`

#### Services

- `AuthService - login, token storage, redirect`

#### Models / DTOs

- `LoginRequest - email, password`
- `AuthResponse - accessToken, refreshToken, user`

#### Backend Endpoints Used

- `POST /api/v1/auth/login - authenticate with email/password`
- Browser redirect (not HttpClient): `/api/v1/auth/oauth/google`, `/api/v1/auth/oauth/microsoft`

#### UI Sections

- Brand header
- Login form (email, password)
- OAuth buttons (Google, Microsoft)
- Links: "Forgot password?", "Register"

#### User Actions

- Submit login
- Start OAuth login
- Navigate to forgot-password / register

#### States

- Loading: `disable form, submit spinner`
- Error: `inline error`
- Success: `redirect to /app/projects`

#### Rules / Notes

- Authenticated users are redirected away by `guestGuard`.
- OAuth end-to-end is partial (backend `oauth/callback` is a stub).

---

### Page 2

- Name: `Register Page`
- Route: `/auth/register`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `New-account registration form.`

#### Description

Collects name, email, and password and creates a new account, then signs the user in.

#### Main Component

- Component Name: `RegisterPage`
- Folder: `src/app/pages/auth/register`
- Files: `register.page.ts`, `register.page.html`

#### Services

- `AuthService - register`

#### Models / DTOs

- `RegisterRequest - name, email, password`
- `AuthResponse`

#### Backend Endpoints Used

- `POST /api/v1/auth/register - create account and return tokens`

#### UI Sections

- Brand header
- Register form (name, email, password)
- Link: "Already have an account? Login"

#### User Actions

- Submit registration
- Navigate to login

#### States

- Loading / Error / Success (redirect into app)

#### Rules / Notes

- Registration may be disabled globally via System Settings (`registrationEnabled`).

---

### Page 3

- Name: `Forgot Password Page`
- Route: `/auth/forgot-password`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Request a password-reset email.`

#### Main Component

- Component Name: `ForgotPasswordPage`
- Folder: `src/app/pages/auth/forgot-password`
- Files: `forgot-password.page.ts`, `forgot-password.page.html`

#### Services

- `AuthService - forgotPassword`

#### Backend Endpoints Used

- `POST /api/v1/auth/forgot-password - send reset email`

#### UI Sections / Actions

- Email field, submit; confirmation message; link back to login.

#### States

- Loading / Success ("check your email") / Error

---

### Page 4

- Name: `Reset Password Page`
- Route: `/auth/reset-password` (`?token=`)
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Set a new password using a reset token.`

#### Main Component

- Component Name: `ResetPasswordPage`
- Folder: `src/app/pages/auth/reset-password`
- Files: `reset-password.page.ts`, `reset-password.page.html`

#### Services

- `AuthService - resetPassword`

#### Backend Endpoints Used

- `POST /api/v1/auth/reset-password - set new password from token`

#### UI Sections / Actions

- New password + confirm fields; submit; redirect to login on success.

#### Rules / Notes

- Reads `token` from the query string; invalid/expired token shows an error.

---

## Module: Sharing (public)

---

### Page 5

- Name: `Shared Dashboard Viewer`
- Route: `/shared/:token`
- Type: `public view`
- Layout: `none` (root outlet)
- Guard: `none`
- Summary: `Read-only public dashboard view via a share token.`

#### Description

Resolves a share token and renders the dashboard with its widget data read-only. No app shell or auth.

#### Main Component

- Component Name: `SharedViewerPage`
- Folder: `src/app/pages/dashboards/shared-viewer`
- Files: `shared-viewer.page.ts`, `shared-viewer.page.html`

#### Services

- Direct `HttpClient` call in the page (no dedicated service)

#### Backend Endpoints Used

- `GET /api/v1/shared/:token - resolve shared dashboard + cached chart data`

#### UI Sections / States

- Dashboard title, widget grid (read-only); loading skeleton; invalid/expired/revoked token error.

#### Rules / Notes

- Public, token-gated; honors link permission and expiry; increments access count server-side.

---

## Module: Projects

---

### Page 6

- Name: `Projects List Page`
- Route: `/app/projects`
- Type: `list`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Searchable list of the user's projects with create and delete.`

#### Main Component

- Component Name: `ProjectsListPage`
- Folder: `src/app/pages/projects/projects-list`
- Files: `projects-list.page.ts`, `projects-list.page.html`

#### Services

- `ProjectsService - list, create, delete`

#### Models / DTOs

- `Project - id, name, description, isActive, createdAt`
- `CreateProjectRequest - name, description`

#### Backend Endpoints Used

- `GET /api/v1/projects - paginated list (page, limit, search)`
- `POST /api/v1/projects - create project`
- `DELETE /api/v1/projects/:id - delete project`

#### UI Sections

- Header + "New Project" button
- Search box
- Project cards/table with open + delete
- Pagination, empty state

#### User Actions

- Search, create (dialog), open detail, delete (confirm)

#### States

- Loading skeleton / empty ("No projects yet") / error

---

### Page 7

- Name: `Project Detail Page`
- Route: `/app/projects/:id`
- Type: `detail`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Project detail with its dashboards and a create-dashboard wizard.`

#### Description

Shows the project, lists its dashboards, and provides a wizard to create a new AI dashboard by attaching
confirmed CSV files and describing the desired purpose.

#### Main Component

- Component Name: `ProjectDetailPage`
- Folder: `src/app/pages/projects/project-detail`
- Files: `project-detail.page.ts`, `project-detail.page.html`

#### Services

- `ProjectsService - get project`
- `DashboardsService - list by project, create`
- `DataService - list confirmed files for the wizard`

#### Models / DTOs

- `Project`, `Dashboard`, `CsvFile`
- `CreateDashboardRequest - projectId, name, purposeDescription, fileIds[]`

#### Backend Endpoints Used

- `GET /api/v1/projects/:id - load project`
- `GET /api/v1/dashboards?projectId=... - list dashboards in project`
- `GET /api/v1/data/files - confirmed files for the picker`
- `POST /api/v1/dashboards - create dashboard (then navigate to generating page)`

#### UI Sections

- Project header (name, description, edit)
- Dashboards grid/list
- "New Dashboard" wizard: name, purpose description, file picker

#### User Actions

- Open a dashboard, create a dashboard, edit project

#### States

- Loading / empty (no dashboards) / error

#### Rules / Notes

- Only `analyzed`/`confirmed` CSV files are selectable for generation.

---

## Module: Dashboards

---

### Page 8

- Name: `Dashboard Generating Page`
- Route: `/app/dashboards/:id/generating`
- Type: `status / polling`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Polls AI generation status until the dashboard is ready or errors.`

#### Main Component

- Component Name: `DashboardGeneratingPage`
- Folder: `src/app/pages/dashboards/dashboard-generating`
- Files: `dashboard-generating.page.ts`, `dashboard-generating.page.html`

#### Services

- `DashboardsService - getStatus`

#### Backend Endpoints Used

- `GET /api/v1/dashboards/:id/status - polled every ~3s (status, jobStatus, progress, errorMessage)`

#### UI Sections / States

- Progress indicator + status text; on `ready` redirect to viewer; on `error` show retry.

#### Rules / Notes

- Generation runs as an async BullMQ job; this page reflects job progress.

---

### Page 9

- Name: `Dashboard Viewer Page`
- Route: `/app/dashboards/:id` (`?shareToken=`)
- Type: `detail / interactive`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Interactive dashboard: view widgets, edit layout, refresh, share, export.`

#### Description

Renders the widget grid with per-widget data, supports an inline edit mode (move/resize/retitle widgets),
manual refresh, share-link management, and PDF/Excel export. Widget editing is **inline** here — there is no
separate widget-edit route.

#### Main Component

- Component Name: `DashboardViewerPage`
- Folder: `src/app/pages/dashboards/dashboard-viewer`
- Files: `dashboard-viewer.page.ts`, `dashboard-viewer.page.html`

#### Child Components

- Chart widgets (chart.js), grid (`angular-gridster2`), share dialog, export menu

#### Services

- `DashboardsService - get, widget data, update widget, refresh, share CRUD`
- `ExportService - PDF request, Excel download URL`
- `FilterService - client-side widget filter state`

#### Models / DTOs

- `Dashboard`, `ChartWidget`, `ShareLink`, `ChartDataResponse`

#### Backend Endpoints Used

- `GET /api/v1/dashboards/:id - dashboard + widgets + datasources`
- `GET /api/v1/dashboards/:dashboardId/widgets/:widgetId/data - per-widget data (shareToken?, filters?)`
- `PUT /api/v1/dashboards/:dashboardId/widgets/:widgetId - save layout/title in edit mode`
- `POST /api/v1/dashboards/:id/refresh - recompute chart data`
- `GET /api/v1/dashboards/:dashboardId/share - list share links`
- `POST /api/v1/dashboards/:dashboardId/share - create share link`
- `DELETE /api/v1/dashboards/:dashboardId/share/:shareLinkId - revoke share link`
- `POST /api/v1/dashboards/:dashboardId/export/pdf - request PDF export`
- Browser GET: `/api/v1/dashboards/:dashboardId/export/excel?token=... - download Excel`

#### UI Sections

- Toolbar (edit toggle, refresh, share, export)
- Widget grid
- Share dialog (permission, expiry, link list)

#### User Actions

- View/filter widgets, toggle edit + rearrange, refresh, create/revoke share links, export PDF/Excel

#### States

- Loading per widget / error / empty widget

#### Rules / Notes

- PDF export is queued; the worker is **not implemented yet**, so the file is not produced.
- Chart data is served from a Redis cache when fresh.

---

## Module: Data (CSV Management)

---

### Page 10

- Name: `Data Files List Page`
- Route: `/app/data`
- Type: `list`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Lists uploaded CSV files with status and delete.`

#### Main Component

- Component Name: `FilesListPage`
- Folder: `src/app/pages/data/files-list`
- Files: `files-list.page.ts`, `files-list.page.html`

#### Services

- `DataService - list files, delete file`

#### Models / DTOs

- `CsvFile - id, originalFilename, rowCount, columnCount, status, uploadedAt`

#### Backend Endpoints Used

- `GET /api/v1/data/files - paginated list (page, limit, search, status)`
- `DELETE /api/v1/data/files/:id - delete file (drops its dynamic data collection)`

#### UI Sections / Actions

- Files table (name, rows, columns, status badge, actions), "Upload" button, delete confirm.

#### States

- Loading / empty / error; status reflects analyzing/analyzed/confirmed/error.

---

### Page 11

- Name: `Upload Wizard Page`
- Route: `/app/data/upload`
- Type: `wizard`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Upload a CSV, watch AI column analysis, then review/confirm column descriptions.`

#### Description

Multi-step flow: upload the file (multipart), poll analysis status while the AI infers column types and
descriptions, then review and edit column descriptions before confirming. Column review lives in this wizard —
there is no separate column-editor route.

#### Main Component

- Component Name: `UploadWizardPage`
- Folder: `src/app/pages/data/upload-wizard`
- Files: `upload-wizard.page.ts`, `upload-wizard.page.html`

#### Services

- `DataService - upload, get file (poll), update columns`

#### Models / DTOs

- `CsvFile`, `ColumnMetadata`, `UpdateColumnsRequest - columns[{columnId, userDescription}]`

#### Backend Endpoints Used

- `POST /api/v1/data/upload/file - multipart upload (returns fileId, jobId)`
- `GET /api/v1/data/files/:id - polled during analysis (file + columns)`
- `PATCH /api/v1/data/files/:fileId/columns - save reviewed column descriptions`

#### UI Sections

- Step 1 dropzone; Step 2 analysis progress; Step 3 column review table

#### User Actions

- Upload file, wait for analysis, edit column descriptions, confirm

#### States

- Uploading / analyzing (poll) / review / error

#### Rules / Notes

- Max file size enforced by System Settings (`maxFileSizeMb`, default 50MB).

---

## Module: Notifications

---

### Page 12

- Name: `Notifications Page`
- Route: `/app/notifications`
- Type: `list`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Full-page list of in-app notifications with mark-as-read.`

#### Main Component

- Component Name: `NotificationsPage`
- Folder: `src/app/pages/notifications`
- Files: `notifications.page.ts`, `notifications.page.html`

#### Services

- `NotificationsService - list, mark read, mark all read, unread count`

#### Models / DTOs

- `Notification - id, type, title, message, isRead, actionUrl, createdAt`

#### Backend Endpoints Used

- `GET /api/v1/notifications - paginated (page, limit, isRead)`
- `PATCH /api/v1/notifications/:id/read - mark one read`
- `PATCH /api/v1/notifications/read-all - mark all read`

#### UI Sections / Actions

- Notification list, per-item read, "Mark all as read".

#### States

- Loading / empty / error

#### Rules / Notes

- The `AppShell` topbar shows an unread badge via `GET /api/v1/notifications/unread-count`.
- This is a full page, not a slide-over panel.

---

## Module: Subscriptions

---

### Page 13

- Name: `Subscriptions Page`
- Route: `/app/subscriptions`
- Type: `billing`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `View current plan/usage, browse plans, subscribe or cancel.`

#### Main Component

- Component Name: `SubscriptionsPage`
- Folder: `src/app/pages/subscriptions`
- Files: `subscriptions.page.ts`, `subscriptions.page.html`

#### Services

- `SubscriptionsService - list plans, my subscription, subscribe, cancel`

#### Models / DTOs

- `SubscriptionPlan - name, priceMonthlyUsd, limits`
- `UserSubscription - planId, status, usage counters, period`

#### Backend Endpoints Used

- `GET /api/v1/subscriptions/plans - available plans`
- `GET /api/v1/subscriptions/me - current subscription + usage`
- `POST /api/v1/subscriptions/subscribe - self-subscribe to a plan (SelfSubscribeDto{planId})`
- `POST /api/v1/subscriptions/cancel - cancel own subscription`

#### UI Sections / Actions

- Current plan + usage card, plan cards with Subscribe, Cancel action.

#### States

- Loading / error; current plan highlighted.

#### Rules / Notes

- Self-service subscribe/cancel are implemented (change-001). No external gateway checkout — assignment is direct.

---

## Module: User Settings

---

### Page 14

- Name: `Profile Settings Page`
- Route: `/app/settings/profile`
- Type: `settings`
- Layout: `AppShell`
- Guard: `authGuard`
- Summary: `Edit profile (name, language) and change password.`

#### Main Component

- Component Name: `ProfilePage`
- Folder: `src/app/pages/settings/profile`
- Files: `profile.page.ts`, `profile.page.html`

#### Services

- `UsersService / AuthService - update profile, change password`

#### Models / DTOs

- `UpdateProfileRequest - name, languagePreference, avatarUrl`
- `ChangePasswordRequest - currentPassword, newPassword`

#### Backend Endpoints Used

- `PUT /api/v1/users/me - update profile`
- `PUT /api/v1/users/me/password - change password`

#### UI Sections / Actions

- Profile form (name, language), password form. Profile + password are one page (no separate password route).

#### States

- Loading / saved / error

#### Rules / Notes

- Initial values come from the cached current user (no `GET /users/me` on load).

---

## Module: In-Portal Admin (admin-guarded)

These two admin pages live **inside** the Customer Portal and are gated by `adminGuard`. The full admin
experience is the separate Admin Panel app.

---

### Page 15

- Name: `Admin Users Page`
- Route: `/app/admin/users`
- Type: `admin list`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `In-portal user management (search, edit, delete).`

#### Main Component

- Component Name: `AdminUsersPage`
- Folder: `src/app/pages/settings/admin-users`
- Files: `admin-users.page.ts`, `admin-users.page.html`

#### Services

- `UsersService - list, update, delete`

#### Backend Endpoints Used

- `GET /api/v1/users - paginated list (page, limit, search)`
- `PUT /api/v1/users/:id - update user`
- `DELETE /api/v1/users/:id - delete user`

#### UI Sections / Actions

- Users table with search; edit role/name; delete (confirm).

#### Rules / Notes

- Admin only (`adminGuard` redirects non-admins to `/app/projects`).

---

### Page 16

- Name: `Admin Settings Page`
- Route: `/app/admin/settings`
- Type: `admin placeholder`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Placeholder for in-portal global configuration.`

#### Main Component

- Component Name: `AdminSettingsPage`
- Folder: `src/app/pages/settings/admin-settings`
- Files: `admin-settings.page.ts`, `admin-settings.page.html`

#### Backend Endpoints Used

- None yet (placeholder)

#### Rules / Notes

- Currently a stub; system settings management is fully implemented in the Admin Panel app.
- Known issue: the `AppShell` sidebar links to `/app/dashboards`, which has **no route** and falls through to `/app/projects`.

---

# App: Admin Panel (`roya-ai-dynamo-frontend-admin`)

Layouts: `AuthLayout` and `AppShell` (admin sidebar). Guards: `guestGuard` (login also rejects non-admin
client-side), `authGuard`, `adminGuard`. All `/app/*` pages require `authGuard` + `adminGuard`.

---

## Module: Auth

---

### Page 17

- Name: `Admin Login Page`
- Route: `/auth/login`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Admin sign-in; rejects non-admin accounts.`

#### Main Component

- Component Name: `LoginPage`
- Folder: `src/app/pages/auth/login`
- Files: `login.page.ts`, `login.page.html`

#### Services

- `AuthService - login (throws if user role !== admin)`

#### Backend Endpoints Used

- `POST /api/v1/auth/login - authenticate`

#### Rules / Notes

- Client rejects non-admin users before storing the session.

---

### Page 18

- Name: `Admin Forgot Password Page`
- Route: `/auth/forgot-password`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Request a password-reset email.`

#### Main Component

- Component Name: `ForgotPasswordPage`
- Folder: `src/app/pages/auth/forgot-password`

#### Backend Endpoints Used

- `POST /api/v1/auth/forgot-password`

---

### Page 19

- Name: `Admin Reset Password Page`
- Route: `/auth/reset-password` (`?token=`)
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Set a new password from a reset token.`

#### Main Component

- Component Name: `ResetPasswordPage`
- Folder: `src/app/pages/auth/reset-password`

#### Backend Endpoints Used

- `POST /api/v1/auth/reset-password`

#### Rules / Notes

- A `RegisterPage` component exists in this repo but is **not routed** (admin accounts are provisioned, not self-registered).

---

## Module: Admin — Overview

---

### Page 20

- Name: `Overview Page`
- Route: `/app/overview`
- Type: `dashboard`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Platform stats and AI cost chart.`

#### Main Component

- Component Name: `OverviewPage`
- Folder: `src/app/pages/admin/overview`
- Files: `overview.page.ts`, `overview.page.html`

#### Services

- `AdminService - overview stats`

#### Backend Endpoints Used

- `GET /api/v1/admin/overview/stats - clients, projects, dashboards, subscriptions, 30-day AI cost`

#### UI Sections / States

- Stat cards + AI cost chart; loading / error.

---

## Module: Admin — Client Management

---

### Page 21

- Name: `Clients Page`
- Route: `/app/clients`
- Type: `admin CRUD`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Full client (user) management: CRUD + suspend/reactivate.`

#### Main Component

- Component Name: `ClientsPage`
- Folder: `src/app/pages/admin/clients`
- Files: `clients.page.ts`, `clients.page.html`

#### Services

- `ClientsService - list, create, update, suspend, reactivate, delete`

#### Models / DTOs

- `User`, `CreateUserRequest`, `UpdateUserRequest`

#### Backend Endpoints Used

- `GET /api/v1/users - paginated list (filters)`
- `POST /api/v1/users - create user`
- `PUT /api/v1/users/:id - update user`
- `PATCH /api/v1/users/:id/suspend - suspend`
- `PATCH /api/v1/users/:id/reactivate - reactivate`
- `DELETE /api/v1/users/:id - delete`

#### UI Sections / Actions

- Users table with filters; create/edit dialog; suspend/reactivate toggle; delete confirm.

#### States

- Loading / empty / error

---

## Module: Admin — Subscriptions & Plans

---

### Page 22

- Name: `Subscriptions Page`
- Route: `/app/subscriptions`
- Type: `admin CRUD (tabs)`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Manage user subscriptions and subscription plans (two tabs).`

#### Main Component

- Component Name: `SubscriptionsPage`
- Folder: `src/app/pages/admin/subscriptions`
- Files: `subscriptions.page.ts`, `subscriptions.page.html`

#### Services

- `SubscriptionsAdminService - subscriptions + plans CRUD`
- `ClientsService/UsersService - user picker`

#### Models / DTOs

- `SubscriptionPlan`, `UserSubscription`, `CreatePlanRequest`, `CreateSubscriptionRequest`, `ChangeSubscriptionRequest`

#### Backend Endpoints Used

- `GET /api/v1/users - client picker`
- `GET /api/v1/subscriptions - list user subscriptions`
- `POST /api/v1/subscriptions - create`
- `PUT /api/v1/subscriptions/:id - update`
- `POST /api/v1/subscriptions/change - change a user's plan`
- `PATCH /api/v1/subscriptions/:userId/cancel - cancel a user's subscription`
- `GET /api/v1/subscriptions/plans/all - all plans (incl. inactive)`
- `POST /api/v1/subscriptions/plans - create plan`
- `PUT /api/v1/subscriptions/plans/:id - update plan`
- `DELETE /api/v1/subscriptions/plans/:id - delete plan`

#### UI Sections / Actions

- Tab 1: user subscriptions table (assign/change/cancel). Tab 2: plans table (CRUD).

#### States

- Loading / empty / error

---

## Module: Admin — Payments

---

### Page 23

- Name: `Payments Page`
- Route: `/app/payments`
- Type: `admin ledger`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Manual payment ledger: record, filter, edit, delete payments.`

#### Main Component

- Component Name: `PaymentsPage`
- Folder: `src/app/pages/admin/payments`
- Files: `payments.page.ts`, `payments.page.html`

#### Services

- `PaymentsService - list, create, update, delete`

#### Models / DTOs

- `Payment`, `CreatePaymentRequest`, `UpdatePaymentRequest`, `ListPaymentsQuery`

#### Backend Endpoints Used

- `GET /api/v1/payments - filterable list (userId, status, from, to)`
- `POST /api/v1/payments - record payment`
- `PATCH /api/v1/payments/:id - update payment`
- `DELETE /api/v1/payments/:id - delete payment`

#### UI Sections / Actions

- Filter bar, payments table, create/edit dialog, delete confirm.

#### Rules / Notes

- Manual ledger only — there is no payment-gateway checkout (the `PAYMENT_PROVIDER` is a stub).

---

## Module: Admin — Audit Logs

---

### Page 24

- Name: `Audit Log Page`
- Route: `/app/audit`
- Type: `admin list`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Searchable, read-only audit trail of platform actions.`

#### Main Component

- Component Name: `AuditPage`
- Folder: `src/app/pages/admin/audit`
- Files: `audit.page.ts`, `audit.page.html`

#### Services

- `AuditService - list`

#### Backend Endpoints Used

- `GET /api/v1/audit - filterable list (userId, action, entityType, entityId, from, to)`

#### UI Sections / States

- Filter bar + audit table (actor, action, entity, time); loading / empty / error.

#### Rules / Notes

- Read-only; audit entries are immutable.

---

## Module: Admin — AI Logs

---

### Page 25

- Name: `AI Logs Page`
- Route: `/app/ai-logs`
- Type: `admin list + detail`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `AI usage logs, cost summary, and per-request detail.`

#### Main Component

- Component Name: `AiLogsPage`
- Folder: `src/app/pages/admin/ai-logs`
- Files: `ai-logs.page.ts`, `ai-logs.page.html`

#### Services

- `AiLogsService - cost summary, list, detail`

#### Models / DTOs

- `AiLog - provider, model, tokens, costUsd, durationMs, status`

#### Backend Endpoints Used

- `GET /api/v1/ai-logs/cost-summary - aggregated cost over a period`
- `GET /api/v1/ai-logs - filterable list (provider, model, status, from, to)`
- `GET /api/v1/ai-logs/:id - single log detail`

#### UI Sections / Actions

- Cost summary cards/chart, logs table, detail drawer.

#### States

- Loading / empty / error

---

## Module: Admin — System Settings (profile)

---

### Page 26

- Name: `Admin Profile Page`
- Route: `/app/settings/profile`
- Type: `settings`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Edit admin profile (name, language) and change password.`

#### Main Component

- Component Name: `ProfilePage`
- Folder: `src/app/pages/settings/profile`
- Files: `profile.page.ts`, `profile.page.html`

#### Services

- `UsersService - update profile, change password`

#### Backend Endpoints Used

- `PUT /api/v1/users/me - update profile`
- `PUT /api/v1/users/me/password - change password`

#### Rules / Notes

- Initializes from the cached current user (no `GET /users/me` on load).
- Global system settings (`GET/PATCH /api/v1/settings`) are not yet wired to a dedicated admin settings page.

---

## Page Route Map Summary

### Customer Portal (`roya-ai-dynamo-frontend`)

| # | Page | Route | Layout | Guard |
|---|------|-------|--------|-------|
| 1 | Login | `/auth/login` | AuthLayout | guestGuard |
| 2 | Register | `/auth/register` | AuthLayout | guestGuard |
| 3 | Forgot Password | `/auth/forgot-password` | AuthLayout | guestGuard |
| 4 | Reset Password | `/auth/reset-password` | AuthLayout | guestGuard |
| 5 | Shared Dashboard Viewer | `/shared/:token` | none | none (token) |
| 6 | Projects List | `/app/projects` | AppShell | authGuard |
| 7 | Project Detail | `/app/projects/:id` | AppShell | authGuard |
| 8 | Dashboard Generating | `/app/dashboards/:id/generating` | AppShell | authGuard |
| 9 | Dashboard Viewer | `/app/dashboards/:id` | AppShell | authGuard |
| 10 | Data Files List | `/app/data` | AppShell | authGuard |
| 11 | Upload Wizard | `/app/data/upload` | AppShell | authGuard |
| 12 | Notifications | `/app/notifications` | AppShell | authGuard |
| 13 | Subscriptions | `/app/subscriptions` | AppShell | authGuard |
| 14 | Profile Settings | `/app/settings/profile` | AppShell | authGuard |
| 15 | Admin Users | `/app/admin/users` | AppShell | authGuard + adminGuard |
| 16 | Admin Settings | `/app/admin/settings` | AppShell | authGuard + adminGuard |

### Admin Panel (`roya-ai-dynamo-frontend-admin`)

| # | Page | Route | Layout | Guard |
|---|------|-------|--------|-------|
| 17 | Login | `/auth/login` | AuthLayout | guestGuard |
| 18 | Forgot Password | `/auth/forgot-password` | AuthLayout | guestGuard |
| 19 | Reset Password | `/auth/reset-password` | AuthLayout | guestGuard |
| 20 | Overview | `/app/overview` | AppShell | authGuard + adminGuard |
| 21 | Clients | `/app/clients` | AppShell | authGuard + adminGuard |
| 22 | Subscriptions & Plans | `/app/subscriptions` | AppShell | authGuard + adminGuard |
| 23 | Payments | `/app/payments` | AppShell | authGuard + adminGuard |
| 24 | Audit Log | `/app/audit` | AppShell | authGuard + adminGuard |
| 25 | AI Logs | `/app/ai-logs` | AppShell | authGuard + adminGuard |
| 26 | Profile | `/app/settings/profile` | AppShell | authGuard + adminGuard |

---

## Known Frontend Gaps (vs. routes/links)

- Customer `AppShell` sidebar links to `/app/dashboards`, which has **no route** (redirects to `/app/projects`).
- Customer in-portal `Admin Settings` page is a placeholder.
- Admin Panel `RegisterPage` component exists but is not routed.
- Dashboard PDF export is requested from the viewer, but the backend PDF worker is not implemented yet.
