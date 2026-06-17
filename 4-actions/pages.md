# Pages

## Short Summary

This file defines every Angular frontend page for **Roya AI Dynamo**. Pages are grouped by module matching `3-plan/modules.md`. All component names, services, DTOs, and backend endpoint links are derived from `4-actions/endpoints.md`, `3-plan/features.md`, and `1-description.md`.

All app routes are prefixed with `/app`. Auth routes are under `/auth`. Public share routes are under `/shared`.

UI library: **PrimeNG**. Colors: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary). i18n: EN (LTR) + AR (RTL).

---

## Module: Auth

---

### Page 1

- Name: `Login Page`
- Route: `/auth/login`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Email/password login form and OAuth login options.`

#### Description

Displays the login form. Supports email/password and OAuth (Google, Microsoft). On success, stores tokens and redirects to `/app/dashboard`. On failure, shows inline error message.

#### Purpose

- Authenticate existing users
- Provide OAuth social login entry point
- Redirect already-authenticated users away

#### Main Component

- Component Name: `LoginPage`
- Folder: `client/src/app/pages/auth/login`
- Files:
  - `login.page.ts`
  - `login.page.html`
  - `login.page.scss`

#### Child Components

- `OAuthButtonsComponent - renders Google and Microsoft OAuth buttons`

#### Services

- `AuthService - calls login, stores tokens, manages redirect`

#### Models / DTOs

- `LoginRequest - email, password`
- `AuthResponse - accessToken, refreshToken, user profile`

#### Backend Endpoints Used

- `POST /auth/login - authenticate with email and password`
- `POST /auth/oauth/callback - authenticate with OAuth code`

#### UI Sections

- Roya AI Dynamo logo and app name
- Login form: email, password fields
- OAuth buttons section
- "Forgot password?" link
- "Don't have an account? Register" link

#### User Actions

- Submit login form
- Click OAuth provider button
- Navigate to forgot password
- Navigate to register

#### States

- Loading: `disable form, show submit spinner`
- Error: `show inline error toast or message below fields`
- Success: `redirect to /app/projects`

#### Rules / Notes

- If user is already authenticated, redirect to `/app/projects`
- Never store raw password in state
- RTL: flip layout for Arabic locale

---

### Page 2

- Name: `Register Page`
- Route: `/auth/register`
- Type: `auth`
- Layout: `auth layout`
- Summary: `New account registration form.`

#### Description

Accepts name, email, and password. Calls register endpoint, stores tokens on success, sends welcome email (handled by backend), and redirects to `/app/projects`.

#### Main Component

- Component Name: `RegisterPage`
- Folder: `client/src/app/pages/auth/register`
- Files:
  - `register.page.ts`
  - `register.page.html`
  - `register.page.scss`

#### Child Components

- `OAuthButtonsComponent - OAuth register alternative`

#### Services

- `AuthService - calls register, stores tokens`

#### Models / DTOs

- `RegisterRequest - name, email, password`
- `AuthResponse`

#### Backend Endpoints Used

- `POST /auth/register - create new account`

#### UI Sections

- Name, email, password fields
- Password strength indicator
- OAuth register section
- "Already have an account? Login" link

#### User Actions

- Submit registration form
- Register via OAuth

#### States

- Loading: `spinner on submit`
- Error: `show field-level validation errors and backend error`
- Success: `redirect to /app/projects`

#### Rules / Notes

- Password minimum 8 characters
- Show inline error if email already exists

---

### Page 3

- Name: `Forgot Password Page`
- Route: `/auth/forgot-password`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Enter email to receive a password reset link.`

#### Main Component

- Component Name: `ForgotPasswordPage`
- Folder: `client/src/app/pages/auth/forgot-password`
- Files:
  - `forgot-password.page.ts`
  - `forgot-password.page.html`
  - `forgot-password.page.scss`

#### Services

- `AuthService - calls forgot-password endpoint`

#### Backend Endpoints Used

- `POST /auth/forgot-password - request reset email`

#### UI Sections

- Email field
- Submit button
- Success confirmation message (always shown after submit)

#### States

- Loading: `disable form on submit`
- Success: `show "Check your email" message regardless of email existence`

#### Rules / Notes

- Always show success message (backend prevents email enumeration)

---

### Page 4

- Name: `Reset Password Page`
- Route: `/auth/reset-password`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Apply a new password using the reset token from email.`

#### Main Component

- Component Name: `ResetPasswordPage`
- Folder: `client/src/app/pages/auth/reset-password`
- Files:
  - `reset-password.page.ts`
  - `reset-password.page.html`
  - `reset-password.page.scss`

#### Services

- `AuthService - calls reset-password endpoint`

#### Models / DTOs

- `ResetPasswordRequest - token (from URL), newPassword`

#### Backend Endpoints Used

- `POST /auth/reset-password - apply new password`

#### UI Sections

- New password field
- Confirm password field
- Submit button
- Error message if token expired/invalid

#### States

- Error: `show "Link expired or invalid" message`
- Success: `redirect to /auth/login with success toast`

---

## Module: Projects

---

### Page 5

- Name: `Projects List Page`
- Route: `/app/projects`
- Type: `list`
- Layout: `app shell`
- Summary: `Shows all user projects with a card grid and a create button.`

#### Description

The main landing page after login. Displays projects as cards. Each card shows project name, description, dashboard count, and last updated date. Has a "New Project" button that opens a create dialog.

#### Purpose

- Browse all owned projects
- Create a new project
- Navigate into a project to see its dashboards

#### Main Component

- Component Name: `ProjectsListPage`
- Folder: `client/src/app/pages/projects/projects-list`
- Files:
  - `projects-list.page.ts`
  - `projects-list.page.html`
  - `projects-list.page.scss`

#### Child Components

- `ProjectCardComponent - individual project card with name, description, dashboard count`
- `CreateProjectDialogComponent - inline PrimeNG dialog for creating a project`
- `EmptyStateComponent - shown when no projects exist`

#### Services

- `ProjectsService - loads project list, creates project, deletes project`

#### Models / DTOs

- `ProjectListItemDto - id, name, description, dashboardCount, createdAt`
- `CreateProjectRequest - name, description`

#### Backend Endpoints Used

- `GET /projects - load paginated project list`
- `POST /projects - create new project`
- `DELETE /projects/:id - delete a project`

#### UI Sections

- Page header with title "My Projects" and "New Project" button
- Search bar
- Projects grid (card layout)
- Empty state illustration and CTA
- PrimeNG ConfirmDialog for delete confirmation

#### User Actions

- Search projects by name
- Click "New Project" to open create dialog
- Click a project card to navigate to `/app/projects/:id`
- Delete a project (with confirmation dialog)

#### States

- Loading: `skeleton cards while loading`
- Empty: `illustration + "Create your first project" CTA`
- Error: `error banner with retry button`

#### Rules / Notes

- Editor only sees their own projects; admin sees all
- Delete is irreversible — show confirmation dialog
- RTL: card layout mirrors correctly in Arabic

---

### Page 6

- Name: `Project Detail Page`
- Route: `/app/projects/:id`
- Type: `details`
- Layout: `app shell`
- Summary: `Shows project info and its dashboards list. Entry point to create dashboards.`

#### Description

Displays the project header (name, description, edit button) and a list of all dashboards inside this project as cards with status badges. Has a "New Dashboard" button.

#### Main Component

- Component Name: `ProjectDetailPage`
- Folder: `client/src/app/pages/projects/project-detail`
- Files:
  - `project-detail.page.ts`
  - `project-detail.page.html`
  - `project-detail.page.scss`

#### Child Components

- `DashboardCardComponent - card showing dashboard name, status badge, creation date`
- `CreateDashboardDialogComponent - multi-step wizard dialog for creating a dashboard`
- `EmptyStateComponent - shown when no dashboards exist`

#### Services

- `ProjectsService - loads project details and dashboard list`
- `DashboardsService - creates dashboard`

#### Models / DTOs

- `ProjectDetailsDto - id, name, description, dashboards[]`
- `DashboardListItemDto - id, name, status, createdAt`

#### Backend Endpoints Used

- `GET /projects/:id - load project and its dashboards`
- `POST /dashboards - create new dashboard`

#### UI Sections

- Breadcrumb: Projects > {Project Name}
- Project header with edit inline button
- "New Dashboard" button
- Dashboards grid with status badges (generating, ready, error)
- Empty state

#### User Actions

- Edit project name/description inline
- Click "New Dashboard" to open create wizard
- Click a dashboard card to navigate to `/app/dashboards/:id`
- Navigate back to projects list

#### States

- Loading: `skeleton loader`
- Empty: `"No dashboards yet" with CTA`

#### Rules / Notes

- Dashboard cards with `generating` status show an animated progress indicator
- Dashboard creation opens a multi-step dialog (step 1: name + purpose, step 2: attach CSV files)

---

## Module: Dashboards

---

### Page 7

- Name: `Dashboard Viewer Page`
- Route: `/app/dashboards/:id`
- Type: `dashboard`
- Layout: `app shell`
- Summary: `Live dashboard page that renders all chart widgets in parallel.`

#### Description

The core page of the product. Loads the dashboard definition once, then fires parallel requests for each widget's chart data. Widgets are rendered in a responsive grid layout using PrimeNG card containers. Includes a toolbar for refresh, export, and share actions.

#### Purpose

- View all AI-generated chart widgets for a dashboard
- Refresh all data from source
- Export dashboard as PDF or Excel
- Share dashboard via link

#### Main Component

- Component Name: `DashboardViewerPage`
- Folder: `client/src/app/pages/dashboards/dashboard-viewer`
- Files:
  - `dashboard-viewer.page.ts`
  - `dashboard-viewer.page.html`
  - `dashboard-viewer.page.scss`

#### Child Components

- `DashboardToolbarComponent - title, refresh, share, export actions`
- `ChartWidgetComponent - renders any chart type based on widgetType enum`
- `BarChartComponent - renders bar and column charts`
- `LineChartComponent - renders line and area charts`
- `PieChartComponent - renders pie and donut charts`
- `KpiCardComponent - renders single KPI metric card`
- `TableWidgetComponent - renders tabular aggregated data`
- `ScatterChartComponent - renders scatter plots`
- `ChartLoadingSkeletonComponent - per-widget loading skeleton`
- `ShareDialogComponent - create and manage share links`
- `ExportMenuComponent - PDF and Excel export options`
- `DashboardGeneratingStateComponent - shown while dashboard is still generating`

#### Services

- `DashboardsService - loads dashboard definition, triggers refresh`
- `ChartDataService - fetches chart data per widget`
- `ShareService - creates and manages share links`
- `ExportService - triggers PDF and Excel export`
- `NotificationsService - receives "dashboard ready" signal`

#### Models / DTOs

- `DashboardDetailsDto - full dashboard with widgets`
- `ChartWidgetDto - widget config with type, position, queryDefinition`
- `ChartDataResponse - per-widget chart data`
- `ShareLinkCreatedResponse`

#### Backend Endpoints Used

- `GET /dashboards/:id - load dashboard definition and widgets`
- `GET /dashboards/:id/widgets/:widgetId/data - load chart data (called in parallel for all widgets)`
- `POST /dashboards/:id/refresh - trigger data refresh`
- `POST /dashboards/:id/share - create share link`
- `GET /dashboards/:id/share - list share links`
- `DELETE /dashboards/:id/share/:shareLinkId - revoke share link`
- `POST /dashboards/:id/widgets - add new widget manually (editor/admin only)`
- `DELETE /dashboards/:id/widgets/:widgetId - remove a widget (editor/admin only)`
- `POST /dashboards/:id/export/pdf - request PDF export`
- `GET /dashboards/:id/export/excel - download Excel`

#### UI Sections

- Breadcrumb: Projects > {Project} > {Dashboard Name}
- Dashboard toolbar: title, "Refresh Data" button, "Share" button, "Export" dropdown
- Responsive widget grid (2-column desktop, 1-column mobile)
- Per-widget title bar with widget type icon
- Chart renders using PrimeNG Chart component (Chart.js)
- Table widget with PrimeNG Table

#### User Actions

- View all charts
- Click "Refresh Data" to recalculate all widgets
- Click "Share" to open share dialog
- Click "Export" → PDF or Excel
- Navigate to widget edit mode (editor/admin only)

#### States

- Generating: `full-page "AI is building your dashboard" animation`
- Loading (initial): `skeleton per widget`
- Loading (refresh): `per-widget spinner overlay`
- Empty widget: `"No data available" card with widget title`
- Error widget: `"Failed to load data" with retry icon`
- Error (dashboard not found): `404 page`

#### Rules / Notes

- Widget data requests are fired in **parallel** using `forkJoin` or `combineLatest`
- Poll `GET /dashboards/:id/status` at 3s intervals when status is `generating`; stop on `ready` or `error`
- Target render time: < 2 seconds after data arrives
- RTL: grid and toolbar mirror for Arabic
- Viewer permission: hide edit/share toolbar actions; show only export and refresh (if permitted)
- Share token: if URL includes `?shareToken=...`, pass token to all data requests

---

### Page 8

- Name: `Dashboard Generation Status Page`
- Route: `/app/dashboards/:id/generating`
- Type: `details`
- Layout: `app shell`
- Summary: `Shown while AI is generating a dashboard. Auto-redirects when ready.`

#### Description

A transitional page displayed after dashboard creation while the AI generation background job runs. Shows an animated progress indicator, current job status message, and auto-redirects to the dashboard viewer when `status === 'ready'`.

#### Main Component

- Component Name: `DashboardGeneratingPage`
- Folder: `client/src/app/pages/dashboards/dashboard-generating`
- Files:
  - `dashboard-generating.page.ts`
  - `dashboard-generating.page.html`
  - `dashboard-generating.page.scss`

#### Services

- `DashboardsService - polls generation status`

#### Models / DTOs

- `DashboardStatusDto - status, jobStatus, progress, errorMessage`

#### Backend Endpoints Used

- `GET /dashboards/:id/status - poll generation progress`
- `POST /dashboards/:id/generate/retry - retry if status is error`

#### UI Sections

- Animated illustration of AI working
- Progress bar (0–100% from `progress` field)
- Status message text (e.g., "Analyzing data types…", "Building chart structure…")
- Error state with retry button

#### States

- Polling: `animated progress bar, periodic status text updates`
- Success: `auto-redirect to /app/dashboards/:id`
- Error: `show error message and "Retry Generation" button`

#### Rules / Notes

- Poll every 3 seconds
- Stop polling on `ready` or `error`

---

### Page 9

- Name: `Widget Edit Page`
- Route: `/app/dashboards/:id/widgets/:widgetId/edit`
- Type: `edit`
- Layout: `app shell`
- Summary: `Editor for customizing a chart widget's type, title, and display config.`

#### Description

Allows editor/admin to change the chart type, title, and display configuration of an AI-generated widget. Shows a live preview panel. Saves changes back to the widget via the update widget endpoint.

#### Main Component

- Component Name: `WidgetEditPage`
- Folder: `client/src/app/pages/dashboards/widget-edit`
- Files:
  - `widget-edit.page.ts`
  - `widget-edit.page.html`
  - `widget-edit.page.scss`

#### Child Components

- `ChartWidgetComponent - live preview of the widget`
- `WidgetTypePickerComponent - select chart type from available types`
- `DisplayConfigFormComponent - configure colors, labels, axis settings`

#### Services

- `DashboardsService - loads dashboard and widget`
- `ChartDataService - loads current widget data for preview`

#### Models / DTOs

- `ChartWidgetDto`
- `UpdateWidgetRequest - widgetType, title, displayConfig`

#### Backend Endpoints Used

- `GET /dashboards/:id - load dashboard and widgets`
- `GET /dashboards/:id/widgets/:widgetId/data - load chart data for preview`
- `PUT /dashboards/:id/widgets/:widgetId - save widget changes`

#### UI Sections

- Left panel: widget type picker, title input, display config form
- Right panel: live chart preview
- Save and Cancel buttons in toolbar

#### States

- Loading: `skeleton`
- Saving: `spinner on save button`
- Success: `redirect back to /app/dashboards/:id`

#### Rules / Notes

- Only `editor` and `admin` can access this page
- On chart type change, live preview updates immediately
- If `queryDefinition` changes, preview calls data endpoint again

---

## Module: Data (CSV Management)

---

### Page 10

- Name: `Data Library Page`
- Route: `/app/data`
- Type: `list`
- Layout: `app shell`
- Summary: `Lists all uploaded CSV files. Entry point for upload and column editing.`

#### Description

Shows all CSV files uploaded by the current user in a PrimeNG table with status badges (uploading, analyzing, confirmed, error). Provides upload button, search, and filter by status. Rows link to the column editor page.

#### Purpose

- View all uploaded CSV files and their status
- Upload new CSV files
- Navigate to column description editor

#### Main Component

- Component Name: `DataLibraryPage`
- Folder: `client/src/app/pages/data/data-library`
- Files:
  - `data-library.page.ts`
  - `data-library.page.html`
  - `data-library.page.scss`

#### Child Components

- `CsvUploadDialogComponent - chunked upload flow with progress bar`
- `CsvFileTableComponent - table with columns: filename, size, rows, columns, status, uploaded date`
- `StatusBadgeComponent - colored badge per status`

#### Services

- `CsvDataService - loads CSV file list, deletes files`
- `CsvUploadService - manages chunked upload flow (initiate → chunk → complete)`

#### Models / DTOs

- `CsvFileListItemDto - id, originalFilename, fileSizeBytes, rowCount, columnCount, status, uploadedAt`
- `UploadInitiateResponse`

#### Backend Endpoints Used

- `GET /data/files - load CSV file list`
- `POST /data/upload/initiate - start upload`
- `POST /data/upload/:fileId/complete - confirm upload and trigger analysis`
- `DELETE /data/files/:fileId - delete a CSV file`

#### UI Sections

- Page header "My Data" with "Upload CSV" button
- Search and status filter bar
- Files table
- Empty state

#### User Actions

- Click "Upload CSV" → opens upload dialog
- Click a file row → navigate to `/app/data/:fileId`
- Delete a file (with confirmation)
- Retry failed analysis

#### States

- Loading: `table skeleton`
- Empty: `"Upload your first CSV" CTA`
- Upload dialog: `drag-and-drop zone + progress bar`

#### Rules / Notes

- Max file size 50 MB; reject larger files client-side before upload
- Files with `analyzing` status show a spinner in the status badge
- Deleting a file shows a warning listing affected dashboards

---

### Page 11

- Name: `Column Editor Page`
- Route: `/app/data/:fileId`
- Type: `edit`
- Layout: `app shell`
- Summary: `Shows AI-generated column descriptions for the user to review and confirm.`

#### Description

Displays the CSV file metadata and a table of all columns with their AI-inferred type and AI-generated description. The user can edit the description for each column inline, then confirm all columns to mark the file as ready for dashboard generation.

#### Purpose

- Review and correct AI-generated column descriptions
- Confirm all columns to unlock dashboard creation
- Understand what data is in the uploaded file

#### Main Component

- Component Name: `ColumnEditorPage`
- Folder: `client/src/app/pages/data/column-editor`
- Files:
  - `column-editor.page.ts`
  - `column-editor.page.html`
  - `column-editor.page.scss`

#### Child Components

- `ColumnEditorTableComponent - table with inline text edit per row`
- `ColumnTypeBadgeComponent - shows inferred data type badge`
- `FileMetaSummaryComponent - filename, size, row count header`
- `AnalysisProgressComponent - shown if file is still being analyzed`

#### Services

- `CsvDataService - loads file details and columns, saves column descriptions`

#### Models / DTOs

- `CsvFileDetailsDto - file info + columns[]`
- `ColumnMetadataDto - id, columnName, inferredType, aiDescription, userDescription, status`
- `UpdateColumnsRequest - array of { columnId, userDescription }`

#### Backend Endpoints Used

- `GET /data/files/:fileId - load file details and columns`
- `PATCH /data/files/:fileId/columns - save confirmed column descriptions`
- `POST /data/files/:fileId/analyze/retry - retry analysis if in error state`

#### UI Sections

- File summary header (name, size, row count)
- Analysis progress bar (if file is still in `analyzing` state)
- Columns table: column name | inferred type | AI description | user description (editable) | status
- "Confirm All" button at the bottom
- Success toast and redirect prompt when all columns confirmed

#### User Actions

- Edit individual column descriptions inline
- Click "Confirm All" to save all descriptions and mark file as confirmed
- Retry analysis if failed

#### States

- Analyzing: `show progress indicator; disable confirm button`
- Ready to review: `enable all fields`
- Saving: `spinner on confirm button`
- Confirmed: `show success banner, unlock "Use in Dashboard" CTA`

#### Rules / Notes

- File must have all columns confirmed before it can be used in a new dashboard
- If still in `analyzing` state, poll `GET /data/files/:fileId` every 3 seconds until status changes
- RTL: column table text alignment mirrors for Arabic

---

## Module: Sharing

---

### Page 12

- Name: `Shared Dashboard Page`
- Route: `/shared/:token`
- Type: `dashboard`
- Layout: `public layout`
- Summary: `Public read-only dashboard view accessed via a share link.`

#### Description

A public page, no authentication required. Resolves the share token from the URL, loads the dashboard definition and chart data, and renders the full dashboard in view-only mode. Optionally shows a "Refresh" button if `viewerCanRefresh` is true.

#### Purpose

- Allow external viewers to see a dashboard without logging in
- Respect permission level (view vs edit)
- Conditionally allow refresh

#### Main Component

- Component Name: `SharedDashboardPage`
- Folder: `client/src/app/pages/shared/shared-dashboard`
- Files:
  - `shared-dashboard.page.ts`
  - `shared-dashboard.page.html`
  - `shared-dashboard.page.scss`

#### Child Components

- `ChartWidgetComponent - renders each chart widget`
- `SharedDashboardHeaderComponent - dashboard name + "Powered by Roya" branding`
- `ExportMenuComponent - PDF and Excel export (if permitted)`

#### Services

- `ShareService - resolves token, loads shared dashboard`
- `ChartDataService - loads chart data with shareToken query param`

#### Models / DTOs

- `SharedDashboardDto - dashboardId, name, widgets, permission, viewerCanRefresh`
- `ChartDataResponse`

#### Backend Endpoints Used

- `GET /shared/:token - resolve token and get dashboard`
- `GET /dashboards/:id/widgets/:widgetId/data?shareToken=... - load chart data`
- `POST /dashboards/:id/refresh?shareToken=... - refresh data (if permitted)`
- `GET /dashboards/:id/export/excel?shareToken=... - download Excel`
- `POST /dashboards/:id/export/pdf?shareToken=... - export PDF`

#### UI Sections

- Minimal header with dashboard name and Roya branding
- Chart widget grid (same layout as viewer page)
- Optional "Refresh Data" button
- Optional "Export" button
- Expired/revoked link error page

#### States

- Loading: `per-widget skeletons`
- Expired: `"This link has expired" full-page message`
- Revoked: `"This link is no longer available" full-page message`
- Error: `generic error with no technical details`

#### Rules / Notes

- No login required — no JWT sent
- Pass `shareToken` as query param to all data endpoints
- Edit toolbar actions (share, delete) are hidden for viewers
- If `permission === 'view'`, only view and export are enabled
- `Powered by Roya AI Dynamo` branding shown in footer

---

## Module: Notifications

---

### Page 13

- Name: `Notifications Panel`
- Route: `(slide-over panel, accessible from app shell header)`
- Type: `list`
- Layout: `app shell (slide panel)`
- Summary: `In-app notification list showing dashboard-ready and export-ready alerts.`

#### Description

A slide-over panel (PrimeNG Sidebar or Drawer) opened from the bell icon in the app shell header. Displays a paginated list of notifications. Supports mark-as-read and mark-all-as-read actions.

#### Main Component

- Component Name: `NotificationsPanelComponent`
- Folder: `client/src/app/components/notifications/notifications-panel`
- Files:
  - `notifications-panel.component.ts`
  - `notifications-panel.component.html`
  - `notifications-panel.component.scss`

#### Child Components

- `NotificationItemComponent - single notification row with type icon, message, read/unread state`

#### Services

- `NotificationsService - loads notifications, marks read`

#### Models / DTOs

- `NotificationDto - id, type, title, message, isRead, relatedEntityType, relatedEntityId, createdAt`

#### Backend Endpoints Used

- `GET /notifications - load notification list`
- `PATCH /notifications/read - mark one or all as read`

#### UI Sections

- Panel header: "Notifications" title + "Mark all as read" button
- Unread count badge on bell icon in header
- Notification list with per-item read/unread state
- Empty state: "You're all caught up"

#### User Actions

- Open/close panel from bell icon
- Click notification → navigate to related entity (e.g., dashboard)
- Mark individual notification as read
- Mark all as read

#### States

- Loading: `skeleton list`
- Empty: `"No notifications" message`

#### Rules / Notes

- Unread count badge on header bell icon updated after marking read
- `dashboard_ready` notification links to `/app/dashboards/:id`
- `export_ready` notification links to the signed download URL

---

## Module: Admin

---

### Page 14

- Name: `Admin Users List Page`
- Route: `/app/admin/users`
- Type: `list`
- Layout: `app shell`
- Summary: `Admin page listing all system users with filter, create, edit, and delete.`

#### Description

Full user management table for admin. Supports search by name/email, filter by role and active status, inline status toggle, navigate to edit, and delete with confirmation.

#### Main Component

- Component Name: `AdminUsersListPage`
- Folder: `client/src/app/pages/admin/users-list`
- Files:
  - `users-list.page.ts`
  - `users-list.page.html`
  - `users-list.page.scss`

#### Child Components

- `UsersFilterBarComponent - search, role filter, status filter`
- `UsersTableComponent - paginated PrimeNG table`
- `CreateUserDialogComponent - inline dialog for admin-created users`

#### Services

- `AdminUsersService - CRUD operations for users`

#### Models / DTOs

- `UserListItemDto - id, name, email, role, isActive, lastLoginAt, createdAt`
- `CreateUserRequest`
- `UpdateUserRequest`

#### Backend Endpoints Used

- `GET /users - load paginated users list`
- `POST /users - create new user`
- `DELETE /users/:id - delete user`

#### UI Sections

- Page header "Users Management" + "New User" button
- Filters bar
- Users table: name, email, role badge, active toggle, actions
- Pagination
- Delete confirmation dialog

#### User Actions

- Search and filter users
- Create new user via dialog
- Navigate to edit user page
- Toggle active status
- Delete user (with confirm)

#### States

- Loading: `table skeleton`
- Empty: `"No users found" message`

#### Rules / Notes

- Admin only — redirect non-admin users to `/app/projects`
- Toggle active status updates `isActive` field inline

---

### Page 15

- Name: `Admin User Edit Page`
- Route: `/app/admin/users/:id`
- Type: `edit`
- Layout: `app shell`
- Summary: `Admin edit form for a specific user's profile, role, and status.`

#### Main Component

- Component Name: `AdminUserEditPage`
- Folder: `client/src/app/pages/admin/user-edit`
- Files:
  - `user-edit.page.ts`
  - `user-edit.page.html`
  - `user-edit.page.scss`

#### Services

- `AdminUsersService - loads and updates user`

#### Models / DTOs

- `UserDetailsDto`
- `UpdateUserRequest - name, email, role, isActive`

#### Backend Endpoints Used

- `GET /users/:id - load user details`
- `PUT /users/:id - save changes`

#### UI Sections

- Breadcrumb: Admin > Users > {User Name}
- Form: name, email, role select, active toggle
- Save and Cancel buttons

#### States

- Loading: `form skeleton`
- Saving: `spinner on save`
- Success: `redirect to /app/admin/users with toast`

#### Rules / Notes

- Admin only
- Admin cannot edit their own role to prevent privilege escalation lock-out

---

### Page 16

- Name: `Admin Subscriptions Page`
- Route: `/app/admin/subscriptions`
- Type: `list`
- Layout: `app shell`
- Summary: `Admin page to view and assign subscription plans to users.`

#### Main Component

- Component Name: `AdminSubscriptionsPage`
- Folder: `client/src/app/pages/admin/subscriptions`
- Files:
  - `subscriptions.page.ts`
  - `subscriptions.page.html`
  - `subscriptions.page.scss`

#### Child Components

- `AssignSubscriptionDialogComponent - select user + plan + expiry date`
- `SubscriptionsTableComponent - paginated table of subscriptions`

#### Services

- `AdminSubscriptionsService - loads and assigns subscriptions`

#### Models / DTOs

- `SubscriptionListItemDto`
- `AssignSubscriptionRequest - userId, planId, expiresAt`

#### Backend Endpoints Used

- `GET /subscriptions - load paginated subscriptions list`
- `POST /subscriptions - assign subscription`

#### UI Sections

- Page header "Subscriptions" + "Assign Plan" button
- Status filter (active, expired, cancelled)
- Subscriptions table: user, plan, status, usage, expires date, action
- Assign dialog

#### User Actions

- Filter by plan/status
- Assign or change a user's subscription plan

#### Rules / Notes

- Admin only

---

### Page 17

- Name: `Admin Audit Logs Page`
- Route: `/app/admin/audit-logs`
- Type: `list`
- Layout: `app shell`
- Summary: `Read-only paginated audit log viewer with filters.`

#### Main Component

- Component Name: `AdminAuditLogsPage`
- Folder: `client/src/app/pages/admin/audit-logs`
- Files:
  - `audit-logs.page.ts`
  - `audit-logs.page.html`
  - `audit-logs.page.scss`

#### Services

- `AdminAuditLogsService - loads audit logs`

#### Models / DTOs

- `AuditLogDto - id, userId, action, entityType, entityId, ipAddress, timestamp, details`

#### Backend Endpoints Used

- `GET /audit-logs - load paginated audit logs`

#### UI Sections

- Page header "Audit Logs"
- Filters: user search, action dropdown, entity type, date range
- Logs table: timestamp, user, action, entity type, entity ID, IP address
- Pagination

#### User Actions

- Filter by user, action, entity, and date range
- Expand a row to see `details` JSON

#### States

- Loading: `table skeleton`

#### Rules / Notes

- Read-only — no edit, delete, or create actions
- Admin only

---

### Page 18

- Name: `Admin Settings Page`
- Route: `/app/admin/settings`
- Type: `settings`
- Layout: `app shell`
- Summary: `System-wide key-value settings editor for admin.`

#### Main Component

- Component Name: `AdminSettingsPage`
- Folder: `client/src/app/pages/admin/settings`
- Files:
  - `settings.page.ts`
  - `settings.page.html`
  - `settings.page.scss`

#### Services

- `AdminSettingsService - loads and updates settings`

#### Models / DTOs

- `SettingDto - key, value, description, updatedBy, updatedAt`

#### Backend Endpoints Used

- `GET /settings - load all settings`
- `PATCH /settings/:key - update a setting`

#### UI Sections

- Settings list: each row has key, description, editable value field, save button
- Last-updated info per row

#### User Actions

- Edit a setting value
- Save individual setting

#### Rules / Notes

- Admin only
- Never display or edit keys that contain sensitive tokens/secrets (filtered by backend)

---

## Module: User Settings

---

### Page 19

- Name: `Profile Settings Page`
- Route: `/app/settings/profile`
- Type: `settings`
- Layout: `app shell`
- Summary: `Authenticated user edits their own profile: name, language, avatar.`

#### Main Component

- Component Name: `ProfileSettingsPage`
- Folder: `client/src/app/pages/settings/profile`
- Files:
  - `profile.page.ts`
  - `profile.page.html`
  - `profile.page.scss`

#### Services

- `AuthService - reads current user`
- `UsersService - updates profile`

#### Models / DTOs

- `UserProfileDto`
- `UpdateProfileRequest - name, languagePreference, avatarUrl`

#### Backend Endpoints Used

- `GET /auth/me - load current profile`
- `PATCH /users/me - save profile changes`

#### UI Sections

- Avatar upload (or URL input)
- Name field
- Language picker: English / Arabic toggle
- Save button

#### User Actions

- Edit display name
- Switch language (triggers i18n + RTL toggle)
- Upload or set avatar

#### States

- Loading: `form skeleton`
- Saving: `spinner`
- Success: `toast "Profile updated"`

#### Rules / Notes

- Language change triggers immediate UI direction toggle (LTR ↔ RTL)
- Avatar max size validated client-side

---

### Page 20

- Name: `Change Password Page`
- Route: `/app/settings/password`
- Type: `settings`
- Layout: `app shell`
- Summary: `Form to change the current user's password.`

#### Main Component

- Component Name: `ChangePasswordPage`
- Folder: `client/src/app/pages/settings/password`
- Files:
  - `change-password.page.ts`
  - `change-password.page.html`
  - `change-password.page.scss`

#### Services

- `UsersService - calls change password endpoint`

#### Models / DTOs

- `ChangePasswordRequest - currentPassword, newPassword`

#### Backend Endpoints Used

- `PATCH /users/me/password - change password`

#### UI Sections

- Current password field
- New password field with strength indicator
- Confirm new password field
- Save button

#### States

- Saving: `spinner`
- Error: `"Current password is incorrect"`
- Success: `toast + clear form`

---

## Module: Subscription (User-Facing)

---

### Page 21

- Name: `My Subscription Page`
- Route: `/app/settings/subscription`
- Type: `details`
- Layout: `app shell`
- Summary: `Shows the current user's active plan, usage, and limits.`

#### Main Component

- Component Name: `MySubscriptionPage`
- Folder: `client/src/app/pages/settings/subscription`
- Files:
  - `subscription.page.ts`
  - `subscription.page.html`
  - `subscription.page.scss`

#### Services

- `SubscriptionsService - loads current subscription`

#### Models / DTOs

- `SubscriptionDto - planId, planName, limits, usage, status, expiresAt`

#### Backend Endpoints Used

- `GET /subscriptions/me - load current subscription and usage`

#### UI Sections

- Plan name and status badge
- Usage meters: dashboards used / max, data uploads used / max, refreshes used / max
- Expiry date
- "Upgrade Plan" button (links to payment gateway)

#### States

- Loading: `skeleton`

#### Rules / Notes

- If `status === 'expired'`, show banner "Your plan has expired. Upgrade to continue."

---

## Page Route Map Summary

| # | Page Name | Route | Auth |
|---|---|---|---|
| 1 | Login Page | `/auth/login` | public |
| 2 | Register Page | `/auth/register` | public |
| 3 | Forgot Password Page | `/auth/forgot-password` | public |
| 4 | Reset Password Page | `/auth/reset-password` | public |
| 5 | Projects List Page | `/app/projects` | editor, admin |
| 6 | Project Detail Page | `/app/projects/:id` | editor, admin |
| 7 | Dashboard Viewer Page | `/app/dashboards/:id` | editor, admin, viewer (via token) |
| 8 | Dashboard Generating Page | `/app/dashboards/:id/generating` | editor, admin |
| 9 | Widget Edit Page | `/app/dashboards/:id/widgets/:widgetId/edit` | editor, admin |
| 10 | Data Library Page | `/app/data` | editor, admin |
| 11 | Column Editor Page | `/app/data/:fileId` | editor, admin |
| 12 | Shared Dashboard Page | `/shared/:token` | public (token-gated) |
| 13 | Notifications Panel | (slide panel in shell) | authenticated |
| 14 | Admin Users List Page | `/app/admin/users` | admin |
| 15 | Admin User Edit Page | `/app/admin/users/:id` | admin |
| 16 | Admin Subscriptions Page | `/app/admin/subscriptions` | admin |
| 17 | Admin Audit Logs Page | `/app/admin/audit-logs` | admin |
| 18 | Admin Settings Page | `/app/admin/settings` | admin |
| 19 | Profile Settings Page | `/app/settings/profile` | authenticated |
| 20 | Change Password Page | `/app/settings/password` | authenticated |
| 21 | My Subscription Page | `/app/settings/subscription` | authenticated |
