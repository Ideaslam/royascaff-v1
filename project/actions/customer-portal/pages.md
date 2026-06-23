# Pages — Customer Portal

## Short Summary

> Routed pages for the **Customer Portal** app (`roya-ai-dynamo-frontend`) of Roya AI Dynamo.
> One app per file: this file covers **only** the Customer Portal. Admin pages live in
> `project/actions/admin-panel/pages.md`. Backend endpoint links match
> `project/actions/backend/endpoints.md`.

App: **Customer Portal** — `roya-ai-dynamo-frontend` — Angular 21 (standalone) end-user product
(projects, data, dashboards, sharing). Shares the single NestJS backend (`project/actions/backend/`).

Layouts: `AuthLayout` (auth pages) and `AppShell` (collapsible sidebar + topbar). Guards: `authGuard`
(requires login), `guestGuard` (unauthenticated only), `adminGuard` (role `admin`). Auth interceptor
attaches the bearer token and refreshes on 401.

Conventions:

- All routes are **lazy** (`loadComponent`). Component paths are relative to the app's `src/app/`.
- Backend paths show the global prefix `/api/v1` (frontend builds them from `environment.apiUrl`).
- UI library: **PrimeNG** + PrimeIcons. Brand: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary). i18n: EN (LTR) + AR (RTL).

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
- Summary: `View account/subscription status, current usage vs limits, browse plans, subscribe (paid or free) or cancel.`

#### Main Component

- Component Name: `SubscriptionsPage`
- Folder: `src/app/pages/subscriptions`
- Files: `subscriptions.page.ts`, `subscriptions.page.html`

#### Services

- `SubscriptionsService - list plans, my subscription (with limits/usage), subscribe, cancel`

#### Models / DTOs

- `SubscriptionPlan - name, priceMonthlyUsd, maxDashboards, maxDataUploadsPerMonth, maxDataUpdatesPerMonth`
- `MySubscriptionResponse - subscription, accountStatus, limits, usage`

#### Backend Endpoints Used

- `GET /api/v1/subscriptions/plans - available plans`
- `GET /api/v1/subscriptions/me - subscription + accountStatus + limits + usage`
- `POST /api/v1/subscriptions/subscribe - self-subscribe (paid → redirectUrl; free → activated)`
- `POST /api/v1/subscriptions/upgrade - upgrade active plan (change-005)`
- `POST /api/v1/subscriptions/downgrade - downgrade active plan (change-005)`
- `GET /api/v1/subscriptions/me/pending-payments - unpaid invoices (change-005)`
- `POST /api/v1/subscriptions/payments/:paymentId/pay - resume PayUp checkout (change-005)`
- `POST /api/v1/subscriptions/cancel - cancel own subscription`

#### UI Sections / Actions

- Account status banner (if suspended — shown only after failed login; on page: subscription status)
- Current plan + usage bars (dashboards, uploads/month, updates/month vs limits)
- Plan cards: Subscribe / Upgrade / Downgrade based on price vs current plan *(change-005)*
- Pending invoices section with Pay now *(change-005)*
- Admin-deactivated (`inactive`) users see lock message; plan actions hidden *(change-005)*
- Cancel action for active paid/cancelled states
- Upgrade prompt when subscription expired/inactive

#### States

- Loading / error; current plan highlighted; usage at-limit warning; free-plan activating spinner

#### Rules / Notes

- **Modified (change-004):** align models with API; handle free subscribe (no redirect); show usage vs limits from enriched `/me`.
- Global 403 handler on upload/create/refresh routes user here with upgrade message.
- PayUp return query params (`payment=success|failed|cancelled`) shown as toast.

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

## Page Route Map Summary

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

---

## Known Frontend Gaps (vs. routes/links)

- Customer `AppShell` sidebar links to `/app/dashboards`, which has **no route** (redirects to `/app/projects`).
- Customer in-portal `Admin Settings` page is a placeholder.
- Dashboard PDF export is requested from the viewer, but the backend PDF worker is not implemented yet.

---

## change-006: New Customer Portal Pages and Route Changes

---

### New Page: Onboarding Wizard

- **Route:** `/onboarding` (outside of `/app/*` — no AppShell)
- **File:** `pages/onboarding/onboarding.page.ts`
- **Guard:** `authGuard` only (not `onboardingGuard` — this IS the onboarding page)
- **Layout:** Full-page (own layout, no AppShell sidebar)

#### Layout (Cisco-style two-column wizard)
- Left column: step number + title, form content for the current step
- Right column: illustration (SVG or lottie) + contextual description text for the step
- Top: numbered step progress indicator (4 circles, connecting lines)
- Bottom: Back / Skip (when applicable) / Continue buttons
- Brand colors: `#5922ea` primary, `#ff6043` accent, white background

#### Steps

**Step 1: Create Workspace (mandatory)**
- Input: Workspace Name (required)
- Slug: auto-generated from name, displayed as read-only initially, editable with inline availability check (debounced 400ms)
- Continue → calls `PATCH /api/v1/onboarding/progress { workspaceCreated: true }` after workspace is created
- Cannot skip

**Step 2: Branding (optional)**
- Logo upload: drag-drop + click. Preview thumbnail.
- Color template picker: palette cards (primary + 5 chart color swatches). Radio-select.
- Skip → `PATCH /api/v1/onboarding/progress { brandingDone: true }`

**Step 3: Invite Team (optional)**
- Email input + role dropdown (workspace-admin / workspace-member)
- "Add another" to build a list. Submit all invites on Continue.
- Skip → `PATCH /api/v1/onboarding/progress { invitesDone: true }`

**Step 4: Try It Out (optional)**
- Tips layout (no form):
  - "Upload your first file" → link to `/app/data/upload`
  - "Use a sample CSV" → button that calls a seed endpoint then navigates to column definition
  - "Create a dashboard" → link to `/app/projects`
- Continue/Finish → `PATCH /api/v1/onboarding/progress { experimentDone: true }` → navigate to `/app/projects`

---

### New Page: Workspace Settings

- **Route:** `/app/settings/workspace`
- **File:** `pages/settings/workspace/workspace.page.ts`
- **Guard:** `authGuard`, `onboardingGuard`

#### Content
- Workspace name field (editable)
- Workspace slug (editable + inline availability check)
- Save button → `PATCH /api/v1/workspaces/:id`
- Danger Zone: "Delete Workspace" — opens confirmation dialog (user must type workspace name), then `DELETE /api/v1/workspaces/:id`

---

### New Page: Members & Invitations

- **Route:** `/app/settings/members`
- **File:** `pages/settings/members/members.page.ts`
- **Guard:** `authGuard`, `onboardingGuard`

#### Content
- Current members table: Name, Email, Role, Joined, Actions (change role, remove — owner-only columns)
- Pending invitations table: Email, Role, Sent Date, Status, Actions (resend, revoke)
- Invite form: email input + role select + "Invite" button → `POST /api/v1/workspaces/:id/invitations`

---

### New Page: Workspace Branding

- **Route:** `/app/settings/branding`
- **File:** `pages/settings/branding/branding.page.ts`
- **Guard:** `authGuard`, `onboardingGuard`

#### Content
- Logo section: current logo preview, upload button, delete logo button
- Color template section: palette card grid (active templates only). Selected state highlighted. Apply button.

---

### Modified: AppShell (`layouts/app-shell/app-shell.ts`)

1. **Workspace Switcher** (topbar): Dropdown showing workspace name + role. Lists all workspaces. "Create new workspace" option. Switch calls `POST /api/v1/workspaces/switch` then reloads.
2. **Sidebar nav additions:**
   - Workspace Settings → `/app/settings/workspace`
   - Members → `/app/settings/members`
   - Branding → `/app/settings/branding`

---

### Modified: Auth Guard (`core/guards/auth.guard.ts`)

Add `onboardingGuard`:
- Reads `currentUser()` from AuthService
- Calls `GET /api/v1/onboarding/progress`
- If `workspaceCreated === false` → redirects to `/onboarding`
- Otherwise → `true`
- All `/app/*` routes use `[authGuard, onboardingGuard]`

---

### Modified: Auth Models (`core/models/auth.models.ts`)

```typescript
interface UserProfile {
  // ... existing fields ...
  currentWorkspaceId: string | null;
  defaultWorkspaceId: string | null;
  workspaceSlug: string | null;
  workspaceRole: 'workspace-owner' | 'workspace-admin' | 'workspace-member' | null;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  redirectTo?: string;
}
```

---

### Modified: Auth Service (`core/services/auth.service.ts`)

`register()` pipe: after `storeSession()`, check `res.data.redirectTo` and navigate to it (replaces default `/app/projects` navigation).

Add `storeWorkspaceContext()` that stores/updates workspace fields in the stored `user` object.

---

### New Service: WorkspaceService (`core/services/workspace.service.ts`)

HTTP wrapper for all workspace API endpoints:
- `getMyWorkspaces()` → `GET /workspaces/me`
- `getWorkspace(id)` → `GET /workspaces/:id`
- `updateWorkspace(id, dto)` → `PATCH /workspaces/:id`
- `checkSlugAvailability(slug)` → `GET /workspaces/slug-availability?slug=x`
- `switchWorkspace(workspaceId)` → `POST /workspaces/switch`
- `deleteWorkspace(id, confirmName)` → `DELETE /workspaces/:id`
- `getBranding(id)` → `GET /workspaces/:id/branding`
- `uploadLogo(id, file)` → `POST /workspaces/:id/branding/logo`
- `deleteLogo(id)` → `DELETE /workspaces/:id/branding/logo`
- `selectColorTemplate(id, templateId)` → `PATCH /workspaces/:id/branding/color-template`
- `getOnboardingProgress()` → `GET /onboarding/progress`
- `updateOnboardingProgress(dto)` → `PATCH /onboarding/progress`
- `getColorTemplates(activeOnly?)` → `GET /color-templates?activeOnly=true`

---

### New Service: WorkspaceMembersService (`core/services/workspace-members.service.ts`)

HTTP wrapper for member + invitation endpoints.

