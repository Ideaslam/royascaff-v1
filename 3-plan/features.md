# Features

## Short Summary

This feature map documents all product features for **Roya AI Dynamo**, an AI-powered SaaS dashboard generation platform. Features are grouped by the modules defined in `3-plan/modules.md` and derived from the full product specification in `1-description.md`.

Source inputs:

- `3-plan/modules.md`
- `1-description.md`

Its purpose is to define the full feature list for each module that will later be used to build:

- `4-actions/endpoints.md`
- `4-actions/pages.md`

This file is not an endpoint list and not a page list. It is the feature source-of-truth grouped by module.

---

## How To Use This File

When AI builds `4-actions/endpoints.md`:

- use the same module names from this file
- convert each backend-relevant feature and subfeature into one or more API endpoints under the matching module
- do not assume one feature equals one endpoint

When AI builds `4-actions/pages.md`:

- use the same module names from this file
- convert each frontend-visible feature and subfeature into one or more pages under the matching module
- do not assume one feature equals one page

---

## Product Scope

Roya AI Dynamo allows business analysts to upload CSV files and receive automatically generated, interactive dashboards. AI analyzes column structures and dashboard purpose to generate chart types, layout, and query definitions. The backend executes queries on stored data. The frontend renders dashboards dynamically. Users can customize, share, and export the results.

The main business flow is:

1. User signs up and creates a project
2. User creates a dashboard with a purpose description and uploads CSV files
3. AI analyzes columns and suggests descriptions; user confirms
4. AI generates dashboard structure (charts, layout, queries)
5. Frontend viewer renders the dashboard using live backend data
6. User customizes, shares, and exports the dashboard

---

## Features By Module

---

## Module: Auth

### Module Purpose

Control access to the platform. Authenticate users via email/password and OAuth. Issue and validate JWT tokens. Protect all private routes and endpoints.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users`

### Features In This Module

#### Feature 1: User Registration

##### Purpose

Allow new users to create an account using email and password.

##### Main Subfeatures

- Submit registration form with name, email, and password
- Validate email uniqueness
- Hash password securely (bcrypt)
- Create user record with default `editor` role
- Send welcome email via MailJet
- Return JWT token on successful registration

##### Visibility

- `both`

##### Notes

- Email must be unique across all users
- Default role on signup is `editor`; admin assigns other roles

---

#### Feature 2: User Login

##### Purpose

Authenticate an existing user and issue a JWT access token.

##### Main Subfeatures

- Submit login form with email and password
- Validate credentials against stored password hash
- Issue JWT access token and refresh token
- Track last login timestamp
- Return current user profile with role

##### Visibility

- `both`

##### Notes

- Failed login attempts should be rate-limited
- JWT payload includes user ID and role

---

#### Feature 3: OAuth Login

##### Purpose

Allow users to sign up or log in using Google or Microsoft OAuth.

##### Main Subfeatures

- Redirect to OAuth provider (Google, Microsoft)
- Handle OAuth callback and extract user identity
- Create account if first login via OAuth
- Issue JWT token after successful OAuth flow
- Link OAuth identity to existing account if email matches

##### Visibility

- `both`

##### Notes

- Provider list is configurable via environment
- OAuth is an alternative to email/password, not a replacement

---

#### Feature 4: Token Refresh

##### Purpose

Silently refresh an expired access token using a valid refresh token to maintain user session.

##### Main Subfeatures

- Accept refresh token
- Validate refresh token signature and expiry
- Issue new access token
- Rotate refresh token for security

##### Visibility

- `backend-only`

##### Notes

- Frontend handles token refresh automatically via HTTP interceptor

---

#### Feature 5: Password Reset

##### Purpose

Allow users to recover their account by resetting their password via email.

##### Main Subfeatures

- Request password reset (submit email)
- Send reset link via MailJet
- Validate reset token (expiry and one-time use)
- Accept new password and update hash
- Invalidate token after use

##### Visibility

- `both`

---

#### Feature 6: Logout

##### Purpose

Invalidate the user's session and clear auth state.

##### Main Subfeatures

- Accept logout request
- Invalidate refresh token server-side
- Clear auth state on frontend

##### Visibility

- `both`

---

#### Feature 7: Current User Profile

##### Purpose

Return the authenticated user's profile so the frontend can initialize the app shell with the correct user context and role.

##### Main Subfeatures

- Return user ID, name, email, role, language preference, avatar
- Used by the app shell on load and after token refresh

##### Visibility

- `both`

---

## Module: Users

### Module Purpose

Manage user account profiles (self-service) and provide admin-level user administration including role assignment and account deactivation.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (self-service), admin (management)`

### Features In This Module

#### Feature 1: View and Edit Own Profile

##### Purpose

Allow users to view and update their name, language preference, and avatar.

##### Main Subfeatures

- View current profile details
- Update display name
- Update language preference (English / Arabic)
- Upload or remove avatar image
- Change password (requires current password confirmation)

##### Visibility

- `both`

---

#### Feature 2: Admin — List Users

##### Purpose

Allow admins to view a paginated, searchable list of all system users.

##### Main Subfeatures

- Paginated user list
- Filter by role (admin, editor, viewer)
- Filter by active/inactive status
- Search by name or email
- View user details summary in list

##### Visibility

- `both`

##### Notes

- Admin-only feature

---

#### Feature 3: Admin — Create User

##### Purpose

Allow admins to create a new user account directly without requiring the registration flow.

##### Main Subfeatures

- Create user with name, email, password, and role
- Send welcome email
- Set initial active status

##### Visibility

- `both`

##### Notes

- Admin-only feature

---

#### Feature 4: Admin — Edit User

##### Purpose

Allow admins to update user profile details, change role, or reset password.

##### Main Subfeatures

- Edit name, email, role
- Activate or deactivate user account
- Reset user password (admin-initiated)

##### Visibility

- `both`

##### Notes

- Admin-only feature

---

#### Feature 5: Admin — Delete / Deactivate User

##### Purpose

Allow admins to deactivate or permanently delete a user and all their data (GDPR).

##### Main Subfeatures

- Deactivate user (blocks login, preserves data)
- Delete user and all owned data (GDPR right to erasure)
- Cascade deletion: projects, dashboards, CSV files, audit logs owned by user

##### Visibility

- `both`

##### Notes

- GDPR deletion must complete within 30 days
- Admin-only feature

---

## Module: Projects

### Module Purpose

Provide the organizational container for dashboards. Users create and manage projects to group their work.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins`

### Features In This Module

#### Feature 1: Create Project

##### Purpose

Allow editors to create a new project to organize dashboards.

##### Main Subfeatures

- Submit project name and optional description
- Set project owner to current user
- Validate no server-side name uniqueness constraint (names are free)

##### Visibility

- `both`

---

#### Feature 2: List Projects

##### Purpose

Show the user's own projects in a searchable, paginated list.

##### Main Subfeatures

- List projects owned by the current user
- Search by project name
- Sort by created date or last updated
- Show dashboard count per project

##### Visibility

- `both`

---

#### Feature 3: View Project

##### Purpose

Show the contents of a single project: its dashboards and metadata.

##### Main Subfeatures

- Display project details (name, description, owner, dates)
- List dashboards within the project
- Dashboard status badges (generating, ready, error)
- Quick actions (create dashboard, delete project)

##### Visibility

- `both`

---

#### Feature 4: Edit Project

##### Purpose

Allow the project owner or admin to update project name and description.

##### Main Subfeatures

- Update project name
- Update project description
- Record updated timestamp and updatedBy user

##### Visibility

- `both`

---

#### Feature 5: Delete Project

##### Purpose

Allow the project owner or admin to delete a project and all its contents.

##### Main Subfeatures

- Confirm deletion with user
- Cascade delete all dashboards, widgets, share links, cache entries, and data sources linked to the project
- Remove project record

##### Visibility

- `both`

##### Notes

- Business rule: cascade deletion removes all child entities
- Cannot be undone

---

## Module: Data (CSV Management)

### Module Purpose

Handle all CSV data operations: file upload, row storage, column metadata management, and data reuse across dashboards.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins`

### Features In This Module

#### Feature 1: Upload CSV File

##### Purpose

Allow users to upload a CSV file via drag-and-drop, store the raw file in object storage, and persist the data rows in the database.

##### Main Subfeatures

- Drag-and-drop file picker (PrimeNG FileUpload)
- Validate file type (CSV only) and size (max 50 MB)
- Show upload progress
- Store raw file in Cloudflare R2 as backup
- Parse CSV and insert rows into a dedicated per-file MongoDB collection
- Create `csvfiles` metadata record
- Create `columnmetadata` records per column (name, inferred type, sample values)
- Trigger AI column analysis background job on completion

##### Main CSV Upload Fields

- File name
- File size
- Column names and inferred types
- Row count

##### Visibility

- `both`

##### Notes

- Duplicate file names are allowed; each upload creates a distinct dataset
- Upload is chunked for large files
- Row insertion is done in batches to avoid memory pressure
- AI is triggered automatically after upload completes

---

#### Feature 2: List My CSV Files

##### Purpose

Allow users to see all their previously uploaded CSV files for reuse in new dashboards.

##### Main Subfeatures

- Paginated list of uploaded files
- Show file name, size, upload date, row count, status
- Search by file name
- Filter by status (ready, analyzing, error)
- Select file for use in a new dashboard

##### Visibility

- `both`

---

#### Feature 3: AI Column Analysis (Background)

##### Purpose

Automatically analyze uploaded CSV column names and inferred types in the background and generate meaningful human-readable descriptions per column.

##### Main Subfeatures

- Queue analysis job when CSV upload completes
- Send column names, types, and sample statistics to Claude AI (never raw data rows)
- Receive AI-generated description per column
- Update `columnmetadata` records with AI suggestions
- Update job status to completed or failed
- Notify user when analysis is done

##### Main Column Analysis Inputs

- Column name (as in CSV header)
- Inferred data type (string, number, date, boolean, category)
- Sample values (first 5-10 distinct values)
- Null count and unique value count

##### Visibility

- `backend-only`

##### Notes

- AI never receives actual data rows — only column metadata and statistics
- Job timeout: 5 minutes maximum
- Failed jobs can be manually retried by the user

---

#### Feature 4: Review and Edit Column Descriptions

##### Purpose

Show AI-generated column descriptions to the user and allow them to edit before confirming.

##### Main Subfeatures

- Display each column with AI-generated description and inferred type
- Allow user to edit the description text
- Allow user to confirm or reject AI suggestion per column
- Save finalized descriptions to `columnmetadata`
- Mark file as `ready` after confirmation

##### Visibility

- `both`

##### Notes

- User must confirm column descriptions before the dashboard generation step can begin
- This step creates the semantic context the dashboard AI uses

---

#### Feature 5: Delete CSV File

##### Purpose

Allow users to delete an uploaded CSV file and its stored data.

##### Main Subfeatures

- Check if file is used in any active dashboards
- Warn user if dashboards depend on the file
- Delete `columnmetadata` records
- Delete per-file data rows collection
- Delete raw file from Cloudflare R2
- Remove `csvfiles` metadata record

##### Visibility

- `both`

##### Notes

- Deletion is a destructive action and cannot be undone
- Dashboards using the deleted file will lose their data source

---

## Module: AI Processing

### Module Purpose

Orchestrate all AI-powered background jobs. This module is the domain layer between business logic and the AI provider. It handles prompt construction, response parsing, and result persistence. It has no frontend pages; its status is surfaced through the Dashboards and Data modules.

### Module Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

### Features In This Module

#### Feature 1: CSV Column Analysis Job

##### Purpose

Execute the background AI job that analyzes CSV column metadata and generates descriptions.

##### Main Subfeatures

- Receive job payload (CSVFile ID)
- Load column names, types, and sample statistics from `columnmetadata`
- Construct analysis prompt
- Call Claude AI via the AI Provider integration
- Parse AI response into per-column description objects
- Write results back to `columnmetadata`
- Update `backgroundjobs` record (status, result, timestamps)
- Trigger `dashboard_ready` notification on completion

##### Visibility

- `backend-only`

##### Notes

- Job is queued by the Data module on CSV upload completion
- Never passes raw data rows to AI
- Max timeout: 5 minutes

---

#### Feature 2: Dashboard Generation Job

##### Purpose

Execute the background AI job that generates the full dashboard structure from column metadata and dashboard purpose.

##### Main Subfeatures

- Receive job payload (Dashboard ID and linked CSVFile IDs)
- Load dashboard purpose description
- Load confirmed `columnmetadata` for all linked CSV files
- Construct generation prompt with purpose + data structure context
- Call Claude AI via the AI Provider integration
- Parse AI response into structured widget definitions:
  - chart type per widget (bar, line, pie, KPI card, table, etc.)
  - layout position and size per widget
  - query definition (aggregation pipeline spec) per widget
  - aggregation rules (sum, count, avg, min, max, group by)
  - filter and sort rules
  - chart display config (title, axis labels, colors)
- Write widget definitions to `chartwidgets`
- Update dashboard status to `ready`
- Update `backgroundjobs` record
- Trigger `dashboard_ready` notification

##### Visibility

- `backend-only`

##### Notes

- AI generates the query specification and chart config — it does NOT execute queries or read data
- Backend executes the MongoDB aggregation queries defined by AI
- Job is queued by the Dashboards module on dashboard creation

---

## Module: Dashboards

### Module Purpose

Manage the full dashboard lifecycle. Own dashboard creation, widget configuration, data source linking, generation status tracking, the chart data serving API, manual refresh, and customization.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors (create/edit), viewers (view via share link)`

### Features In This Module

#### Feature 1: Create Dashboard

##### Purpose

Allow editors to create a new dashboard with a name, purpose description, and data source selection.

##### Main Subfeatures

- Enter dashboard name (unique within project)
- Enter purpose description (used as AI generation prompt context)
- Select one or more previously uploaded CSV files as data sources
- OR upload a new CSV file directly from this flow
- Save dashboard record with status `generating`
- Trigger AI dashboard generation background job
- Redirect to generation status page

##### Main Dashboard Fields

- Dashboard name
- Purpose description
- Data sources (one or more CSVFile references)
- Project reference

##### Visibility

- `both`

---

#### Feature 2: Dashboard Generation Status

##### Purpose

Show the user the current status of dashboard generation with progress feedback.

##### Main Subfeatures

- Poll backend for job status (queued, processing, completed, failed)
- Display progress indicator and status message
- On completion: redirect to dashboard viewer
- On failure: show error message and retry option

##### Visibility

- `both`

---

#### Feature 3: View Dashboard (Dynamic Viewer)

##### Purpose

Render the generated dashboard by dynamically loading widget data via parallel backend API calls.

##### Main Subfeatures

- Load dashboard layout and widget configurations
- For each widget: call chart data endpoint in parallel
- Render chart type as defined in widget config (PrimeNG charts)
- Apply aggregations, filters, and sort rules as defined in widget config
- Show per-widget loading state
- Show per-widget error state if data call fails
- Support responsive layout (mobile, tablet, desktop)
- Language-aware labels (English / Arabic)

##### Visibility

- `both`

---

#### Feature 4: Chart Data API

##### Purpose

Backend endpoint that executes the MongoDB aggregation query defined in a widget's configuration and returns the result. Used by the dynamic viewer.

##### Main Subfeatures

- Accept widget ID in request
- Look up chart query definition from `chartwidgets`
- Check Redis cache first, then MongoDB cache
- On cache miss: execute MongoDB aggregation pipeline
- Store result in cache (Redis + DB)
- Return structured data in the format the frontend chart type expects

##### Visibility

- `backend-only`

##### Notes

- This is the performance-critical endpoint; target < 200ms for cached responses
- Parallel calls from the frontend viewer must be handled efficiently

---

#### Feature 5: Manual Data Refresh

##### Purpose

Allow users to manually trigger recalculation of all chart data for a dashboard after adding new CSV data.

##### Main Subfeatures

- User clicks "Refresh Data" button
- Backend invalidates all cache entries for the dashboard
- Backend re-executes aggregation queries for all widgets
- Updated results are stored in cache
- Frontend re-renders charts with fresh data
- Refresh action is rate-limited per subscription tier

##### Visibility

- `both`

---

#### Feature 6: Dashboard Customization

##### Purpose

Allow editors to modify the AI-generated dashboard: edit chart types, adjust layout, change titles, add or remove widgets.

##### Main Subfeatures

- Enter edit/customization mode
- Drag and resize widgets in the grid layout
- Change chart type for a widget (bar ↔ line ↔ pie, etc.)
- Edit widget title and display configuration
- Change aggregation rules for a widget
- Add a new widget manually (select data source, chart type, fields)
- Remove a widget
- Save all customizations back to `chartwidgets`

##### Visibility

- `both`

---

#### Feature 7: Duplicate Dashboard

##### Purpose

Allow editors to create a copy of a dashboard within the same project.

##### Main Subfeatures

- Copy dashboard record with name appended "-copy"
- Copy all widget configurations
- Copy all data source links
- New dashboard starts as `ready` (no re-generation needed)

##### Visibility

- `both`

---

#### Feature 8: Delete Dashboard

##### Purpose

Allow editors or admins to permanently delete a dashboard.

##### Main Subfeatures

- Confirm deletion
- Remove all widgets, data source links, cache entries
- Invalidate all share links
- Remove dashboard record

##### Visibility

- `both`

##### Notes

- Cascade deletion is immediate and irreversible
- All active share links are immediately invalidated

---

#### Feature 9: List Dashboards

##### Purpose

Show all dashboards within a project in a searchable, filterable list.

##### Main Subfeatures

- List dashboards in the current project
- Filter by status (generating, ready, error)
- Search by name
- Show creation date, status, last updated
- Quick actions: open, duplicate, delete

##### Visibility

- `both`

---

## Module: Sharing

### Module Purpose

Generate and manage secure, token-based share links for dashboards. Control view-only or edit-level access per link. Handle public dashboard access via share token.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors (create links), viewers (access links)`

### Features In This Module

#### Feature 1: Create Share Link

##### Purpose

Allow dashboard owners to generate a shareable link with a chosen permission level.

##### Main Subfeatures

- Generate a unique, URL-safe token
- Set permission level: view-only or edit
- Set optional expiry date
- Set viewer refresh permission flag (can viewer refresh data?)
- Store `sharelinks` record
- Return shareable URL for copying

##### Visibility

- `both`

---

#### Feature 2: View Shared Dashboard

##### Purpose

Allow anyone with a valid share link to view (or edit, based on permission) the shared dashboard without needing an account.

##### Main Subfeatures

- Resolve dashboard from share token
- Validate token is active and not expired
- Enforce permission level (view-only blocks customization actions)
- Render dashboard viewer with full chart data
- Respect viewer refresh permission flag

##### Visibility

- `both`

##### Notes

- Share link access works without authentication
- Expired or revoked links show a clear error page

---

#### Feature 3: Manage Share Links

##### Purpose

Allow dashboard owners to see all active share links and revoke them.

##### Main Subfeatures

- List all share links for a dashboard
- Show permission level, created date, expiry, access count
- Revoke a share link (immediate invalidation)
- Copy share link URL

##### Visibility

- `both`

---

## Module: Export

### Module Purpose

Generate and deliver dashboard data exports in PDF and Excel/CSV formats. PDF generation is async; Excel/CSV is synchronous.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors and viewers with export permission`

### Features In This Module

#### Feature 1: Export Dashboard as PDF

##### Purpose

Generate a PDF report of the dashboard with chart visualizations and data.

##### Main Subfeatures

- Trigger PDF generation background job
- Render dashboard to PDF (branded with Roya AI Dynamo colors)
- Include all visible charts with current filter state
- Upload generated PDF to Cloudflare R2
- Notify user when PDF is ready
- Provide signed download URL

##### Visibility

- `both`

##### Notes

- PDF generation is async; target < 60 seconds
- PDF uses brand colors: #ff6043, #5922ea, #282828

---

#### Feature 2: Export Data as Excel

##### Purpose

Export the underlying aggregated chart data for a widget or the full dashboard to Excel format.

##### Main Subfeatures

- Select widget or full dashboard to export
- Apply current filters
- Generate `.xlsx` file with one sheet per widget
- Return file as direct download

##### Visibility

- `both`

---

#### Feature 3: Export Data as CSV

##### Purpose

Export the underlying dataset (raw rows from a CSV data source) as a downloadable CSV.

##### Main Subfeatures

- Select a data source (CSVFile) to export
- Apply optional column filters
- Stream rows from MongoDB to CSV response
- Return file as direct download

##### Visibility

- `both`

---

## Module: Notifications

### Module Purpose

Deliver in-app and email notifications for dashboard generation completion, errors, share events, and export readiness.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `all authenticated users`

### Features In This Module

#### Feature 1: In-App Notification Center

##### Purpose

Show users a list of their notifications with read/unread state in the app shell.

##### Main Subfeatures

- Notification bell in app shell header with unread count badge
- Dropdown preview of latest notifications
- Full notifications list page with pagination
- Mark notification as read (single or all)
- Link each notification to the related entity (dashboard, project, etc.)
- Notification types: `dashboard_ready`, `generation_error`, `dashboard_shared`, `export_ready`, `csv_analysis_complete`

##### Visibility

- `both`

---

#### Feature 2: Email Notifications

##### Purpose

Send transactional emails to users for key system events.

##### Main Subfeatures

- Welcome email on registration
- Dashboard generation complete email (with link to dashboard)
- Dashboard generation failed email (with retry link)
- Dashboard shared notification email (when someone shares a dashboard with the user)
- Export ready email (with download link)
- Password reset email

##### Visibility

- `backend-only`

##### Notes

- Email is sent via MailJet integration in `src/integrations/mail/`
- Email preference settings (opt-out) may be added in future

---

## Module: Admin — User Management

### Module Purpose

Admin-only frontend area for listing, creating, editing, and deactivating user accounts and assigning roles. Backend operations are handled by the Users module.

### Module Scope

- Backend: `no`
- Frontend: `yes`
- Audience: `admin`

### Features In This Module

#### Feature 1: Admin Users List

##### Purpose

Give admins a full, searchable, filterable view of all users in the system.

##### Main Subfeatures

- Display all users with role, status, last login, and created date
- Search by name or email
- Filter by role and active status
- Navigate to create or edit user pages

##### Visibility

- `frontend`

---

#### Feature 2: Admin Create / Edit User

##### Purpose

Allow admins to create a new user or update an existing user's profile, role, and status.

##### Main Subfeatures

- Create user with name, email, password, role
- Edit name, email, role of existing user
- Activate or deactivate user
- Admin-initiated password reset

##### Visibility

- `frontend`

---

## Module: Admin — Subscriptions

### Module Purpose

Manage subscription tiers, user plan assignments, and enforce usage limits per plan.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (management), editors (view own plan)`

### Features In This Module

#### Feature 1: Subscription Plan Management

##### Purpose

Define and manage subscription tiers (free, pro, enterprise) with associated feature limits.

##### Main Subfeatures

- Define plan tiers with limits (max dashboards, max CSV uploads, max refreshes)
- Admin can create, edit, and deactivate plans
- View all active subscriptions

##### Visibility

- `both`

---

#### Feature 2: User Subscription Assignment

##### Purpose

Assign a subscription plan to a user and enforce its limits across all business operations.

##### Main Subfeatures

- Assign plan to user (admin-initiated or self-service upgrade)
- Enforce limits at service layer before creating dashboards, uploading files, or refreshing data
- Return clear error when limit is exceeded
- Show current usage vs limit in the user's billing page

##### Visibility

- `both`

---

#### Feature 3: Billing and Payment

##### Purpose

Process subscription payments via payment gateway and manage billing history.

##### Main Subfeatures

- Initiate subscription payment via payment provider
- Handle payment webhook (success, failure, renewal)
- Show billing history and invoices
- Handle plan upgrade and downgrade
- Cancel subscription

##### Visibility

- `both`

##### Notes

- Payment gateway is abstracted via interface; current default provider configured in env
- Webhook signatures must be validated before processing

---

## Module: Admin — Audit Logs

### Module Purpose

Provide admins with read-only access to the immutable system-wide audit trail.

### Module Scope

- Backend: `no`
- Frontend: `yes`
- Audience: `admin`

### Features In This Module

#### Feature 1: View Audit Logs

##### Purpose

Allow admins to search and browse all user and system events recorded in the audit trail.

##### Main Subfeatures

- Paginated audit log list
- Filter by action type (create, update, delete, share, login, export, etc.)
- Filter by entity type (user, project, dashboard, csv, etc.)
- Filter by user
- Filter by date range
- View full log entry detail (old values, new values, IP, user agent)

##### Visibility

- `frontend`

##### Notes

- Audit logs are immutable — no edit or delete actions exist
- Logs are written by all backend modules via a shared audit service

---

## Module: Admin — System Settings

### Module Purpose

Allow admins to manage global system configuration, AI settings, and feature flags.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin`

### Features In This Module

#### Feature 1: System Configuration

##### Purpose

View and update global operational settings.

##### Main Subfeatures

- View and update system-wide settings (rate limit thresholds, default plan, etc.)
- View AI provider status (model name, availability — never raw API key)
- Manage feature flags (enable/disable specific features)

##### Visibility

- `both`

##### Notes

- Raw API keys must never be exposed to the frontend or API responses
- Feature flags allow safe rollout of new capabilities

---

## Feature Coverage Summary

| Module | Feature Count | Backend Features | Frontend Features |
|---|---:|---:|---:|
| `Auth` | 7 | 7 | 6 |
| `Users` | 5 | 5 | 5 |
| `Projects` | 5 | 5 | 5 |
| `Data (CSV Management)` | 5 | 5 | 4 |
| `AI Processing` | 2 | 2 | 0 |
| `Dashboards` | 9 | 5 | 9 |
| `Sharing` | 3 | 3 | 3 |
| `Export` | 3 | 3 | 3 |
| `Notifications` | 2 | 2 | 1 |
| `Admin — User Management` | 2 | 0 | 2 |
| `Admin — Subscriptions` | 3 | 3 | 3 |
| `Admin — Audit Logs` | 1 | 0 | 1 |
| `Admin — System Settings` | 1 | 1 | 1 |
| **Total** | **48** | **41** | **43** |

---

## Feature Priority For Endpoint And Page Planning

### Phase 1: Core Workflow (MVP)

#### Module: Auth
- User Registration
- User Login
- Token Refresh
- Password Reset
- Logout
- Current User Profile

#### Module: Users
- View and Edit Own Profile

#### Module: Projects
- Create Project
- List Projects
- View Project
- Edit Project
- Delete Project

#### Module: Data (CSV Management)
- Upload CSV File
- List My CSV Files
- Review and Edit Column Descriptions
- Delete CSV File

#### Module: AI Processing
- CSV Column Analysis Job
- Dashboard Generation Job

#### Module: Dashboards
- Create Dashboard
- Dashboard Generation Status
- View Dashboard (Dynamic Viewer)
- Chart Data API
- Manual Data Refresh
- List Dashboards

### Phase 2: Engagement and Collaboration

#### Module: Auth
- OAuth Login

#### Module: Dashboards
- Dashboard Customization
- Duplicate Dashboard
- Delete Dashboard

#### Module: Sharing
- Create Share Link
- View Shared Dashboard
- Manage Share Links

#### Module: Export
- Export Dashboard as PDF
- Export Data as Excel
- Export Data as CSV

#### Module: Notifications
- In-App Notification Center
- Email Notifications

### Phase 3: Platform and Administration

#### Module: Users
- Admin — List Users
- Admin — Create User
- Admin — Edit User
- Admin — Delete / Deactivate User

#### Module: Admin — User Management
- Admin Users List
- Admin Create / Edit User

#### Module: Admin — Subscriptions
- Subscription Plan Management
- User Subscription Assignment
- Billing and Payment

#### Module: Admin — Audit Logs
- View Audit Logs

#### Module: Admin — System Settings
- System Configuration

---

## Important Planning Notes

- `AI Processing` features are backend-only. Their status is surfaced via `Dashboards` module pages (generation status page) and `Data` module pages (column analysis status).
- `Chart Data API` (Dashboards Feature 4) is a backend-only feature — the endpoint is called by the frontend viewer but has no dedicated page.
- `Email Notifications` (Notifications Feature 2) is backend-only — triggered by job completion events, no dedicated page.
- One dashboard involves features from multiple modules: `Data` (upload), `AI Processing` (analysis and generation), `Dashboards` (viewer and customization), `Caching` (performance), `Sharing` (share links), `Export` (reports).
- Admin module frontends reuse backend services from the corresponding business modules.
