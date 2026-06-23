# Features

## Short Summary

This feature map documents all product features for **Roya AI Dynamo**, an AI-powered SaaS platform that turns uploaded CSV files into automatically generated, interactive dashboards. Features are grouped by the modules defined in `project/plan/modules.md` and reconciled against the implemented code: the NestJS backend (`roya-ai-dynamo-api/src`, global prefix `/api/v1`) and the two Angular frontends — the **Customer Portal** (`roya-ai-dynamo-frontend`) and the **Admin Panel** (`roya-ai-dynamo-frontend-admin`).

Source inputs:

- `project/plan/modules.md`
- `project/actions/backend/endpoints.md`
- `roya-ai-dynamo-api/src` (backend)
- `roya-ai-dynamo-frontend` (Customer Portal)
- `roya-ai-dynamo-frontend-admin` (Admin Panel)

Its purpose is to define the full feature list for each module that will later be used to build:

- `project/actions/backend/endpoints.md`
- each app's `project/actions/<app-key>/pages.md`

This file is not an endpoint list and not a page list. It is the feature source-of-truth grouped by module. Where a feature is only partially implemented or planned, it is marked explicitly (`partial` / `planned — backend not implemented`).

---

## How To Use This File

When AI builds `project/actions/backend/endpoints.md`:

- use the same module names from this file
- convert each backend-relevant feature and subfeature into one or more API endpoints under the matching module
- do not assume one feature equals one endpoint

When AI builds each app's `project/actions/<app-key>/pages.md`:

- use the same module names from this file
- convert each frontend-visible feature and subfeature into one or more pages under the matching module
- do not assume one feature equals one page

---

## Product Scope

Roya AI Dynamo lets business users upload CSV files and receive automatically generated, interactive dashboards. AI analyzes column structure (names, inferred types, sample statistics — never raw rows) to produce human-readable column descriptions, then generates a dashboard structure by selecting widgets from a catalog and defining aggregation queries. The backend executes those queries on the stored data and serves cached chart data. The product ships as two apps over one backend: a **Customer Portal** for end users and an **Admin Panel** for platform operators.

The main business flow is:

1. A user signs up (Customer Portal) and creates a project
2. The user uploads a CSV file; the backend stores it and runs async AI column analysis
3. The user reviews and confirms the AI-generated column descriptions
4. The user creates a dashboard with a purpose description; AI generates its widgets and queries asynchronously
5. The Customer Portal viewer renders the dashboard from live, cached backend data
6. The user customizes, shares, and exports the dashboard
7. Admins manage clients, subscriptions, plans, payments, AI usage/cost, audit logs, and global settings via the Admin Panel

---

## Features By Module

---

## Module: Auth

### Module Purpose

Control access to the platform. Authenticate users via email/password (and, partially, OAuth). Issue, refresh, and revoke JWT tokens. Provide the current-user endpoint used by both frontends to bootstrap their app shells.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users (Customer Portal + Admin Panel)`

### Features In This Module

#### Feature 1: User Registration

##### Purpose

Allow new users to create an account using name, email, and password.

##### Main Subfeatures

- Submit registration form with name, email, and password
- Validate email uniqueness
- Hash password securely (bcrypt)
- Create user record with the default non-admin role
- Issue JWT access and refresh tokens on success

##### Visibility

- `both`

##### Notes

- Registration UI exists only in the **Customer Portal**; the Admin Panel has no register page
- Rate-limited (`@Throttle`, 10 req/min)
- Subject to the `registrationEnabled` system setting

---

#### Feature 2: User Login

##### Purpose

Authenticate an existing user and issue JWT access and refresh tokens.

##### Main Subfeatures

- Submit login form with email and password
- Validate credentials against the stored password hash
- Issue access token and refresh token
- Return the user profile (id, name, email, role) for app bootstrap

##### Visibility

- `both`

##### Notes

- Login exists in **both** apps; the Admin Panel additionally requires the `admin` role (enforced by an admin route guard)
- Rate-limited (`@Throttle`, 10 req/min); returns `401` on bad credentials

---

#### Feature 3: OAuth Login (Google / Microsoft)

##### Purpose

Allow users to sign in via Google or Microsoft OAuth as an alternative to email/password.

##### Main Subfeatures

- Provider configuration (Google, Microsoft) via environment
- OAuth login service logic (`AuthService.oauthLogin`) to map provider identity to a user
- Intended callback endpoint to exchange the authorization code and issue JWT tokens

##### Visibility

- `both`

##### Notes

- **Partial.** Provider config and `AuthService.oauthLogin` exist, but `POST /api/v1/auth/oauth/callback` is a **stub** that returns a static message and is not wired to the service. End-to-end OAuth is not yet functional.

---

#### Feature 4: Token Refresh

##### Purpose

Silently issue a new access token from a valid refresh token to keep the session alive.

##### Main Subfeatures

- Accept a refresh token
- Validate its signature and expiry
- Issue a new access token and rotate the refresh token

##### Visibility

- `backend-only`

##### Notes

- Frontends call this automatically via an HTTP interceptor; there is no dedicated page
- Returns `401` if the token is invalid or expired

---

#### Feature 5: Password Reset

##### Purpose

Let users recover their account by requesting a reset link and setting a new password.

##### Main Subfeatures

- Request password reset by email (`forgot-password`)
- Send the reset link via the MailJet mail integration
- Validate the reset token (expiry, one-time use)
- Accept and apply a new password (`reset-password`)

##### Visibility

- `both`

##### Notes

- Available in **both** apps (forgot-password and reset-password pages)
- `forgot-password` always returns `200` to prevent email enumeration

---

#### Feature 6: Logout

##### Purpose

End the session by invalidating the stored refresh token.

##### Main Subfeatures

- Accept an authenticated logout request
- Clear the server-side refresh token hash
- Clear auth state on the frontend

##### Visibility

- `both`

---

#### Feature 7: Current User Profile

##### Purpose

Return the authenticated user's payload so each frontend can initialize its shell with the correct identity and role.

##### Main Subfeatures

- Return the current user payload (id, email, role) from `/auth/me`
- Used by both app shells on load and after token refresh

##### Visibility

- `both`

---

## Module: Users

### Module Purpose

Own the user entity and self-service account management (profile and password). The same backend powers the admin-facing client operations, which are documented under **Admin — Client Management**.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (self-service)`

### Features In This Module

#### Feature 1: View and Edit Own Profile

##### Purpose

Allow a user to view and update their own profile.

##### Main Subfeatures

- View current profile (name, email, role, language preference, avatar)
- Update display name
- Update language preference (English / Arabic)
- Update avatar URL

##### Visibility

- `both`

##### Notes

- A profile page exists in **both** apps (Customer Portal and Admin Panel)
- Users cannot change their own role here

---

#### Feature 2: Change Own Password

##### Purpose

Allow a user to change their password after confirming the current one.

##### Main Subfeatures

- Submit current password and new password
- Verify the current password before updating
- Persist the new password hash

##### Visibility

- `both`

##### Notes

- Admin-facing user create/edit/suspend/delete operations are documented under **Admin — Client Management** (they reuse this module's backend)

---

## Module: Projects

### Module Purpose

Provide the organizational container that groups dashboards. Users create and manage projects in the Customer Portal.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins (Customer Portal)`

### Features In This Module

#### Feature 1: Create Project

##### Purpose

Allow a user to create a new project to organize dashboards.

##### Main Subfeatures

- Submit project name (max 200 chars) and optional description
- Set the project owner to the current user

##### Visibility

- `both`

##### Notes

- Project names do not need to be unique

---

#### Feature 2: List Projects

##### Purpose

Show the user's projects in a searchable, paginated list.

##### Main Subfeatures

- Paginated list of projects
- Search by project name
- Filter by active status
- Admin sees all projects; others see only owned projects (enforced in the service)

##### Visibility

- `both`

---

#### Feature 3: View Project

##### Purpose

Show a single project's details and its dashboards.

##### Main Subfeatures

- Display project details (name, description, owner, dates)
- List dashboards within the project with status badges
- Quick actions (create dashboard, delete project)

##### Visibility

- `both`

##### Notes

- Owner-or-admin access enforced in the service

---

#### Feature 4: Edit Project

##### Purpose

Allow the owner or an admin to update project name and description.

##### Main Subfeatures

- Update project name
- Update project description
- Record the updated timestamp

##### Visibility

- `both`

---

#### Feature 5: Delete Project

##### Purpose

Allow the owner or an admin to delete a project and its contents.

##### Main Subfeatures

- Confirm deletion
- Cascade delete all dashboards (and their widgets, share links, cache entries, data source links)
- Remove the project record

##### Visibility

- `both`

##### Notes

- Cascade deletion is irreversible

---

## Module: Data (CSV Management)

### Module Purpose

Handle the full CSV lifecycle: file upload (direct or presigned), row storage into per-file dynamic collections, column metadata management, AI column analysis triggering, and file reuse across dashboards.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins (Customer Portal)`

### Features In This Module

#### Feature 1: Upload CSV File

##### Purpose

Let users upload a CSV file, store it in object storage, parse its rows into the database, and trigger AI column analysis.

##### Main Subfeatures

- **Direct multipart upload**: send the file as form-data; backend streams it to Cloudflare R2, creates the `csvfiles` record, and queues analysis (returns `202`)
- **Presigned upload (legacy)**: initiate an upload session for a direct client-to-R2 upload, then confirm completion to queue parsing + analysis
- Validate file type (CSV only) and size (max 50 MB)
- Parse rows into a dedicated per-file collection (`csvdata_{fileId}`)
- Create `columnmetadata` records per column (name, inferred type, sample values)

##### Main CSV Upload Fields

- File name and file size
- Column names and inferred types
- Row count

##### Visibility

- `both`

##### Notes

- The Customer Portal upload wizard uses the direct multipart flow
- AI column analysis is queued automatically once the file is stored
- AI never receives raw data rows — only column names, types, and sample statistics

---

#### Feature 2: List My CSV Files

##### Purpose

Let users see their uploaded CSV files for reuse in new dashboards.

##### Main Subfeatures

- Paginated list of files
- Search by filename
- Filter by status (analyzing, ready, error)
- Show file name, size, upload date, row count, status

##### Visibility

- `both`

---

#### Feature 3: View CSV File Details

##### Purpose

Show a file's metadata together with its column metadata for review.

##### Main Subfeatures

- Return file metadata
- Return the file's columns (`columnmetadata`) with inferred type, samples, and descriptions

##### Visibility

- `both`

---

#### Feature 4: AI Column Analysis (Background)

##### Purpose

Automatically analyze uploaded CSV columns in the background and generate human-readable descriptions per column.

##### Main Subfeatures

- Queue an analysis job when an upload completes
- Infer column types and compute sample statistics
- Send column metadata to the AI provider and receive a description per column
- Write AI descriptions back to `columnmetadata`
- Update the `backgroundjobs` record status

##### Main Column Analysis Inputs

- Column name (CSV header)
- Inferred data type
- Sample values and null/unique counts

##### Visibility

- `backend-only`

##### Notes

- Owned operationally by the **AI Processing** module worker; surfaced to the user via the Data pages
- Never passes raw data rows to AI

---

#### Feature 5: Review and Edit Column Descriptions

##### Purpose

Show AI-generated column descriptions and let users edit/confirm them before the file is used for dashboard generation.

##### Main Subfeatures

- Display each column with its AI description and inferred type
- Edit the description text per column (`userDescription`)
- Save confirmed descriptions to `columnmetadata`

##### Visibility

- `both`

##### Notes

- Confirmed column descriptions form the semantic context the dashboard generation step uses

---

#### Feature 6: Retry Column Analysis

##### Purpose

Let users manually re-run a failed AI column analysis job.

##### Main Subfeatures

- Re-queue the analysis job for the file (returns `202`)
- Reset job status for tracking

##### Visibility

- `both`

---

#### Feature 7: Delete CSV File

##### Purpose

Let users delete an uploaded CSV file and all of its stored data.

##### Main Subfeatures

- Delete `columnmetadata` records
- Drop the per-file data rows collection (`csvdata_{fileId}`)
- Remove the `csvfiles` metadata record
- Report affected dashboards in the delete result

##### Visibility

- `both`

##### Notes

- Destructive and irreversible; dependent dashboards lose their data source

---

## Module: AI Processing

### Module Purpose

Orchestrate AI-powered background jobs via BullMQ workers. This is the domain layer between business logic and the AI provider. It has no frontend pages; its status is surfaced through the Data and Dashboards modules.

### Module Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

### Features In This Module

#### Feature 1: CSV Column Analysis Job

##### Purpose

Run the async worker that loads CSV rows, infers column structure, and generates AI column descriptions.

##### Main Subfeatures

- Consume the `csv-analysis` queue
- Load CSV rows into the dynamic per-file collection (`csvdata_{fileId}`)
- Infer columns and compute sample statistics
- Call the AI provider to generate per-column descriptions
- Write results to `columnmetadata` and update the `backgroundjobs` record

##### Visibility

- `backend-only`

##### Notes

- Queued by the Data module on upload completion or retry
- Never passes raw data rows to AI

---

#### Feature 2: AI Dashboard Generation Job

##### Purpose

Run the async worker that generates a dashboard's structure from confirmed column metadata and the dashboard purpose.

##### Main Subfeatures

- Consume the `dashboard-generation` queue
- Load the dashboard purpose and confirmed `columnmetadata` for linked files
- Select widgets from the `WidgetDefinition` catalog and define each widget's aggregation query
- Write widget definitions to `chartwidgets` and set dashboard status to `ready`
- Update the `backgroundjobs` record

##### Visibility

- `backend-only`

##### Notes

- AI selects widgets and defines query specs; the backend executes the actual MongoDB aggregations
- Queued by the Dashboards module on creation or generation retry
- **Gap:** the `pdf-export` and `cache-recalculation` queues are declared and have jobs enqueued, but **no worker consumes them yet** (PDF export and dashboard refresh recalculation do not complete).

---

## Module: Dashboards

### Module Purpose

Own the full dashboard lifecycle: creation, AI generation status, the dynamic viewer, widget CRUD/customization, the cache-first chart data API with filters, refresh, duplicate, delete, and generation retry.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors (create/edit), viewers (via share link)`

### Features In This Module

#### Feature 1: Create Dashboard

##### Purpose

Create a dashboard, link confirmed CSV data sources, and trigger AI generation.

##### Main Subfeatures

- Enter dashboard name and purpose description (min 10 chars, used as AI context)
- Select one or more confirmed CSV files as data sources
- Save the dashboard with status `generating` and queue the AI generation job (returns `202`)

##### Main Dashboard Fields

- Name, purpose description
- Project reference
- Data sources (one or more CSVFile references)

##### Visibility

- `both`

---

#### Feature 2: Dashboard Generation Status

##### Purpose

Let the user track generation progress while AI builds the dashboard.

##### Main Subfeatures

- Poll the dashboard status endpoint (status, job status, progress, error message)
- Show a progress indicator and status message
- Redirect to the viewer on completion; show retry on failure

##### Visibility

- `both`

##### Notes

- Designed for frontend polling during generation

---

#### Feature 3: List Dashboards

##### Purpose

Show dashboards in a searchable, filterable, paginated list.

##### Main Subfeatures

- Paginated list, optionally filtered by project
- Search by name
- Filter by status (generating, ready, error)
- Quick actions: open, duplicate, delete

##### Visibility

- `both`

---

#### Feature 4: View Dashboard (Dynamic Viewer)

##### Purpose

Render a generated dashboard by loading each widget's data dynamically.

##### Main Subfeatures

- Load dashboard layout, widgets, and data sources
- Call the chart data endpoint per widget (in parallel)
- Render each widget's chart type and apply its display config
- Per-widget loading and error states
- Responsive, language-aware (English / Arabic) layout

##### Visibility

- `both`

---

#### Feature 5: Chart Data API (Cache-First, Filterable)

##### Purpose

Serve aggregated chart data for a widget, resolving from cache first and applying optional filters.

##### Main Subfeatures

- Look up cached chart data (Redis) before executing the aggregation
- Execute the widget's MongoDB aggregation pipeline on a cache miss
- Apply optional JSON-encoded filters from the query
- Support access via JWT or a share token
- Skip throttling (called in parallel for all widgets on load)

##### Visibility

- `backend-only`

##### Notes

- Performance-critical; returns an empty result structure (not `404`) when the aggregation yields no rows

---

#### Feature 6: Manual Data Refresh

##### Purpose

Let users invalidate cached chart data and recalculate aggregations after data changes.

##### Main Subfeatures

- Invalidate the dashboard's cache entries
- Enqueue a recalculation job (returns `202`)

##### Visibility

- `both`

##### Notes

- **Partial.** The refresh request enqueues a `cache-recalculation` job, but **no worker processes that queue yet**, so recalculation does not complete asynchronously.

---

#### Feature 7: Dashboard Customization (Widget CRUD)

##### Purpose

Let editors modify the AI-generated dashboard by adding, editing, and removing widgets.

##### Main Subfeatures

- Add a widget manually (type, title, position, query definition, display config)
- Update a widget (type, title, position, query, display config) and invalidate its cache
- Delete a widget and clear its cache

##### Visibility

- `both`

---

#### Feature 8: Edit Dashboard Details

##### Purpose

Let editors update the dashboard's name and purpose description.

##### Main Subfeatures

- Update name
- Update purpose description

##### Visibility

- `both`

---

#### Feature 9: Duplicate Dashboard

##### Purpose

Let editors create a copy of a dashboard within the same project.

##### Main Subfeatures

- Clone the dashboard record and its widgets
- Copy data source links
- New dashboard is ready immediately (no regeneration)

##### Visibility

- `both`

---

#### Feature 10: Delete Dashboard

##### Purpose

Let editors or admins permanently delete a dashboard.

##### Main Subfeatures

- Confirm deletion
- Cascade delete widgets, cache entries, and share links
- Remove the dashboard record

##### Visibility

- `both`

##### Notes

- Active share links are immediately invalidated

---

#### Feature 11: Retry Dashboard Generation

##### Purpose

Let users re-run a failed AI dashboard generation job.

##### Main Subfeatures

- Re-queue the generation job (returns `202`)
- Reset dashboard/job status for tracking

##### Visibility

- `both`

---

## Module: Sharing

### Module Purpose

Generate and manage secure, token-based share links for dashboards with view or edit permission, optional expiry, and revocation. Resolve public dashboards by share token.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors (create/manage links), public viewers (access via token)`

### Features In This Module

#### Feature 1: Create Share Link

##### Purpose

Let a dashboard owner generate a shareable link with a chosen permission level.

##### Main Subfeatures

- Generate a unique, URL-safe token (raw token returned once)
- Set permission: view or edit
- Set an optional expiry date
- Set whether the viewer can refresh data

##### Visibility

- `both`

---

#### Feature 2: Manage Share Links

##### Purpose

Let a dashboard owner review and revoke existing share links.

##### Main Subfeatures

- List a dashboard's active and revoked share links
- Show permission, created date, expiry, access count
- Revoke a link (immediate invalidation)

##### Visibility

- `both`

---

#### Feature 3: View Shared Dashboard (Public)

##### Purpose

Let anyone with a valid token view (or edit, per permission) a shared dashboard without an account.

##### Main Subfeatures

- Resolve the dashboard from the raw share token
- Validate the token is active and not expired
- Enforce the permission level and viewer-refresh flag
- Return the public dashboard with cached chart data

##### Visibility

- `both`

##### Notes

- Works without authentication; expired/revoked links return a clear error, not a `404`

---

## Module: Export

### Module Purpose

Generate and deliver dashboard exports. Excel and CSV are synchronous file streams; PDF is queued (async).

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors and viewers with export permission`

### Features In This Module

#### Feature 1: Export Dashboard as PDF

##### Purpose

Request a branded PDF report of the dashboard.

##### Main Subfeatures

- Queue a PDF export job (returns `202` with a job id)

##### Visibility

- `both`

##### Notes

- **Partial.** The job is enqueued on the `pdf-export` queue, but **no worker is implemented yet**, so the PDF is never produced.

---

#### Feature 2: Export Data as Excel

##### Purpose

Download widget/dashboard data as an Excel workbook.

##### Main Subfeatures

- Build an `.xlsx` workbook of the dashboard's widget data
- Return the file as a direct download stream

##### Visibility

- `both`

##### Notes

- Response is a raw `.xlsx` stream and bypasses the success envelope

---

#### Feature 3: Export Data as CSV

##### Purpose

Download a widget's data as a CSV file.

##### Main Subfeatures

- Select a widget to export
- Build the CSV payload
- Return the file as a direct download stream

##### Visibility

- `both`

##### Notes

- Response is a raw CSV stream and bypasses the success envelope

---

## Module: Notifications

### Module Purpose

Provide the in-app notification center: list notifications, show the unread count, and mark notifications read.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `all authenticated users (Customer Portal)`

### Features In This Module

#### Feature 1: In-App Notification Center

##### Purpose

Let users see their notifications with read/unread state and manage them.

##### Main Subfeatures

- Paginated notifications list (filterable by read state)
- Unread count for the app shell bell badge
- Mark a single notification as read
- Mark all notifications as read

##### Visibility

- `both`

##### Notes

- **Partial wiring.** `NotificationsService.notify` exists to create notifications, but it is **not yet called by the AI or export workers**, so notifications are not auto-generated by background events yet.
- Transactional emails (welcome, password reset) are sent directly by the Auth flow via the MailJet integration, not through this module.

---

## Module: Subscriptions

### Module Purpose

Customer-facing subscription area: view available plans and view the current user's own subscription and usage. (Admin-side plan and subscription management lives in **Admin — Subscriptions & Plans**.)

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (Customer Portal)`

### Features In This Module

#### Feature 1: View Available Plans

##### Purpose

Let a user browse the subscription plans available to subscribers.

##### Main Subfeatures

- List active plans with price and limits (max dashboards, monthly upload/update limits)

##### Visibility

- `both`

---

#### Feature 2: View My Subscription and Usage

##### Purpose

Let a user see their current subscription and usage against plan limits.

##### Main Subfeatures

- Load the current user's subscription (plan, status, dates)
- Show current usage vs plan limits

##### Visibility

- `both`

---

#### Feature 3: Subscribe to a Plan

##### Purpose

Let a user self-subscribe to a chosen plan from the Customer Portal.

##### Main Subfeatures

- Choose a plan and submit a subscribe request

##### Visibility

- `frontend`

##### Notes

- Implemented in change-001 (2026-06-22); upgraded to real payment in change-003 (2026-06-23). `POST /api/v1/subscriptions/subscribe` is live.
- **Now processes a real payment via PayUp**: returns the hosted-checkout `redirectUrl`; the subscription activates only after the payment is confirmed (via the `subscription-activation` event).

---

#### Feature 4: Cancel My Subscription

##### Purpose

Let a user cancel their own subscription from the Customer Portal.

##### Main Subfeatures

- Submit a self-service cancel request

##### Visibility

- `frontend`

##### Notes

- Implemented in change-001 (2026-06-22). `POST /api/v1/subscriptions/cancel` is now live.
- Sets the subscription status to `cancelled` and sets `endDate` to the current date.

---

#### Feature 5: Subscription Usage Limits *(change-004)*

##### Purpose

Enforce plan-defined limits on resources and actions (dashboards, monthly uploads, monthly data updates) with an extensible registry so new limits can be added without rewriting enforcement logic.

##### Main Subfeatures

- `SubscriptionLimitRegistry` — one handler per limit key (`maxDashboards`, `maxDataUploadsPerMonth`, `maxDataUpdatesPerMonth`)
- `SubscriptionLimitService.check` / `assertAllowed` — called from business services before writes
- Atomic counter increment via `SubscriptionRepository.incrementUsage` for monthly limits
- Dashboard count via live query (or cached) for `maxDashboards`
- Monthly counter reset on period rollover job

##### Visibility

- `backend`

##### Notes

- Applies only when subscription `status = active`; expired/inactive/cancelled hit resource lock first
- Returns `403` with clear user-facing message when limit exceeded

---

#### Feature 6: Subscription Resource Lock *(change-004)*

##### Purpose

When a subscription is `expired` or admin-`inactive`, the user can log in and view data but cannot create dashboards, upload files, or update/refresh data.

##### Main Subfeatures

- `SubscriptionResourceGuard` (or shared service helper) blocks mutating actions
- Allowed: read dashboards/files, view subscription page, subscribe/upgrade

##### Visibility

- `backend`

---

#### Feature 7: Free Plan Subscribe *(change-004)*

##### Purpose

Let users subscribe to a free plan (`priceMonthlyUsd = 0`) without PayUp checkout, activated via the same durable `subscription-activation` BullMQ event as paid plans.

##### Main Subfeatures

- `POST /subscriptions/subscribe` branches: free → enqueue activation; paid → PayUp checkout (change-003)
- No payment log for free plans

##### Visibility

- `both`

---

## Module: Admin — Overview

### Module Purpose

Give admins a platform health snapshot: key counts (clients, projects, dashboards, subscriptions) and a 30-day AI cost summary with a chart.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: Platform Statistics

##### Purpose

Show high-level KPI counts across the platform.

##### Main Subfeatures

- Aggregate counts of clients, projects, dashboards, and subscriptions
- Display them as overview KPI cards

##### Visibility

- `both`

---

#### Feature 2: AI Cost Summary (30-Day)

##### Purpose

Show recent AI spend so admins can monitor cost.

##### Main Subfeatures

- Summarize AI cost over a recent window (default 30 days)
- Render the trend as a chart on the overview page

##### Visibility

- `both`

##### Notes

- Backed by the AI Logs cost-summary aggregation (see **Admin — AI Logs**)

---

## Module: Admin — Client Management

### Module Purpose

Admin-facing client (user) administration. Backend operations reuse the **Users** module backend; the UI lives in the Admin Panel.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: List / Search Clients

##### Purpose

Give admins a paginated, searchable, filterable view of all users.

##### Main Subfeatures

- Paginated user list with role, status, last login, created date
- Search by name or email
- Filter by role and active status

##### Visibility

- `both`

##### Notes

- Never returns `passwordHash` or `refreshTokenHash`

---

#### Feature 2: View Client Details

##### Purpose

Show full details for a single client on the admin edit screen.

##### Main Subfeatures

- Load one user by id with full profile and status

##### Visibility

- `both`

---

#### Feature 3: Create Client

##### Purpose

Let an admin create a user account directly.

##### Main Subfeatures

- Create a user with name, email, password, and role

##### Visibility

- `both`

---

#### Feature 4: Edit Client (Role / Status)

##### Purpose

Let an admin update a user's profile, role, status, or password.

##### Main Subfeatures

- Edit name, email, role
- Toggle active status
- Admin-initiated password reset

##### Visibility

- `both`

---

#### Feature 5: Suspend Client

##### Purpose

Let an admin deactivate a user account (blocks login, preserves data).

##### Main Subfeatures

- Set the user inactive

##### Visibility

- `both`

---

#### Feature 6: Reactivate Client

##### Purpose

Let an admin reactivate a previously suspended user.

##### Main Subfeatures

- Set the user active again

##### Visibility

- `both`

---

#### Feature 7: Delete Client

##### Purpose

Let an admin delete a user and their owned data.

##### Main Subfeatures

- Delete the user and cascade owned data

##### Visibility

- `both`

##### Notes

- Destructive; aligns with GDPR right-to-erasure

---

## Module: Admin — Subscriptions & Plans

### Module Purpose

Admin management of subscription plans and user subscriptions: define plans (CRUD) and assign/create/update/change/cancel user subscriptions.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: Manage Subscription Plans

##### Purpose

Define and maintain the subscription plans offered by the platform.

##### Main Subfeatures

- List all plans (including inactive)
- Create a plan (name, description, monthly price, max dashboards, monthly upload/update limits, active flag)
- Update a plan
- Delete a plan

##### Main Plan Fields

- Name, description
- Monthly price (USD)
- Max dashboards
- Max data uploads per month
- Max data updates per month
- Active flag

##### Visibility

- `both`

---

#### Feature 2: Manage User Subscriptions

##### Purpose

Create and administer subscriptions tied to users.

##### Main Subfeatures

- List subscriptions (paginated, filter by status)
- View a single subscription
- Create a subscription for a user
- Update a subscription
- Assign a plan to a user
- Change a user's plan
- Cancel a user's subscription (`:userId/cancel`)

##### Visibility

- `both`

##### Notes

- Self-service customer `subscribe` / `cancel` are **implemented** on the backend (`POST /api/v1/subscriptions/subscribe`, `POST /api/v1/subscriptions/cancel`, change-001)

---

#### Feature 3: Activate / Deactivate User Subscription *(change-004)*

##### Purpose

Let admins activate or deactivate a user's subscription without deleting it — distinct from cancel (which sets `cancelled`).

##### Main Subfeatures

- Activate subscription (`POST /subscriptions/:id/activate`) — sets `status = active`, valid period dates
- Deactivate subscription (`POST /subscriptions/:id/deactivate`) — sets `status = inactive`; user retains login but resource lock applies

##### Visibility

- `both`

---

#### Feature 4: Account Suspension *(change-004)*

##### Purpose

Block suspended accounts from entering the system. Suspension can be admin-initiated or automatic after two consecutive unpaid payment invoices.

##### Main Subfeatures

- Admin suspend/reactivate via existing `PATCH /users/:id/suspend|reactivate` (extended: revoke refresh tokens, clearer errors)
- Auto-suspend when two consecutive payment records end unpaid without an intervening `paid` payment
- Suspended users: login rejected; API returns `403` with `ACCOUNT_SUSPENDED`

##### Visibility

- `backend` (admin UI already exists on Clients page)

---

## Module: Admin — Payments

### Module Purpose

A payment log for admins to track payments and the resulting subscriptions. Combines a manual bookkeeping
ledger **and** the live PayUp gateway checkout log (change-003).

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: Payment Ledger Management

##### Purpose

Let admins record, browse, edit, and delete payment entries manually, and view gateway-generated logs.

##### Main Subfeatures

- List/filter payments (by user, status, date range; paginated)
- View a single payment (incl. gateway + session reference + plan)
- Create a payment record
- Edit a payment record
- Delete a payment record

##### Main Payment Fields

- User reference (and optional subscription/plan reference)
- Amount (USD) and currency
- Status, method, reference
- Gateway (`manual` / `payup`) + provider session reference *(change-003)*
- Paid-at date and notes

##### Visibility

- `both`

#### Feature 2: PayUp Gateway Checkout (backend integration) *(change-003)*

##### Purpose

Take real subscription payments through PayUp and activate the subscription only after a confirmed payment.

##### Main Subfeatures

- Customer self-subscribe opens a PayUp hosted-checkout session (backend integration: auth → create session)
- A `pending` payment log is written on init, then updated with the PayUp session + return URLs
- Public confirm/cancel return endpoints finalize the log on the customer's return from PayUp
- A confirmed payment emits a durable `subscription-activation` BullMQ event that activates the subscription
- API base URL auto-selected by environment (sandbox vs prod), overridable by env var

##### Visibility

- `both` (customer initiates; admin tracks)

##### Notes

- All PayUp HTTP is isolated in `src/integrations/payment/` (`PayUpProvider`); keys are env-only.

---

## Module: Admin — Audit Logs

### Module Purpose

Give admins read-only access to the immutable, system-wide audit trail of user and system actions.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: View Audit Logs

##### Purpose

Let admins search and browse recorded user/system events.

##### Main Subfeatures

- Paginated audit log list
- Filter by user, action, entity type, entity id, and date range
- View full log entry detail (old/new values, IP, user agent)

##### Visibility

- `both`

##### Notes

- Audit logs are immutable — read-only; no create/update/delete endpoints
- Records are written by backend modules via a shared audit service

---

## Module: Admin — AI Logs

### Module Purpose

Give admins visibility into AI usage: per-request logs, per-request cost, cost summary over time, and individual log detail.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (Admin Panel)`

### Features In This Module

#### Feature 1: View AI Usage Logs

##### Purpose

Let admins browse AI request logs with per-request cost.

##### Main Subfeatures

- Paginated AI log list
- Filter by provider, model, status, and date range
- View a single AI log entry detail (404 if missing)

##### Main AI Log Fields

- Provider and model
- Status
- Token usage and per-request cost
- Timestamp

##### Visibility

- `both`

---

#### Feature 2: AI Cost Summary Over Time

##### Purpose

Aggregate AI cost across a date range for monitoring and the overview chart.

##### Main Subfeatures

- Summarize cost over a `from`/`to` range
- Feed the Admin — Overview 30-day cost chart

##### Visibility

- `both`

---

## Module: Admin — System Settings

### Module Purpose

Manage the global system settings singleton: registration toggle, max file size, default max dashboards, and supported languages.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin`

### Features In This Module

#### Feature 1: Global System Settings

##### Purpose

View and update platform-wide configuration.

##### Main Subfeatures

- Get the system settings singleton
- Update settings: `registrationEnabled`, `maxFileSizeMb`, `defaultMaxDashboards`, `supportedLanguages`

##### Visibility

- `both`

##### Notes

- Admin-only (role guard). The settings backend is shared; the management UI is exposed in the admin-guarded settings area.

---

## Feature Coverage Summary

| Module | Feature Count | Backend Features | Frontend Features |
|---|---:|---:|---:|
| `Auth` | 7 | 7 | 6 |
| `Users` | 2 | 2 | 2 |
| `Projects` | 5 | 5 | 5 |
| `Data (CSV Management)` | 7 | 7 | 6 |
| `AI Processing` | 2 | 2 | 0 |
| `Dashboards` | 11 | 11 | 10 |
| `Sharing` | 3 | 3 | 3 |
| `Export` | 3 | 3 | 3 |
| `Notifications` | 1 | 1 | 1 |
| `Subscriptions` | 4 | 4 | 4 |
| `Admin — Overview` | 2 | 2 | 2 |
| `Admin — Client Management` | 7 | 7 | 7 |
| `Admin — Subscriptions & Plans` | 2 | 2 | 2 |
| `Admin — Payments` | 2 | 2 | 2 |
| `Admin — Audit Logs` | 1 | 1 | 1 |
| `Admin — AI Logs` | 2 | 2 | 2 |
| `Admin — System Settings` | 1 | 1 | 1 |
| **Total** | **62** | **62** | **57** |

> Notes on counts: "Backend Features" counts features with a working backend implementation. "Frontend Features" counts features with a UI; `Token Refresh`, `AI Column Analysis`, the two AI Processing jobs, and `Chart Data API` have no dedicated page.

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
- Change Own Password

#### Module: Projects
- Create Project
- List Projects
- View Project
- Edit Project
- Delete Project

#### Module: Data (CSV Management)
- Upload CSV File
- List My CSV Files
- View CSV File Details
- AI Column Analysis (Background)
- Review and Edit Column Descriptions
- Retry Column Analysis
- Delete CSV File

#### Module: AI Processing
- CSV Column Analysis Job
- AI Dashboard Generation Job

#### Module: Dashboards
- Create Dashboard
- Dashboard Generation Status
- List Dashboards
- View Dashboard (Dynamic Viewer)
- Chart Data API (Cache-First, Filterable)
- Manual Data Refresh
- Retry Dashboard Generation

### Phase 2: Engagement, Collaboration, and Delivery

#### Module: Auth
- OAuth Login (Google / Microsoft) — partial

#### Module: Dashboards
- Dashboard Customization (Widget CRUD)
- Edit Dashboard Details
- Duplicate Dashboard
- Delete Dashboard

#### Module: Sharing
- Create Share Link
- Manage Share Links
- View Shared Dashboard (Public)

#### Module: Export
- Export Dashboard as PDF — partial (no worker)
- Export Data as Excel
- Export Data as CSV

#### Module: Notifications
- In-App Notification Center

#### Module: Subscriptions
- View Available Plans
- View My Subscription and Usage
- Subscribe to a Plan
- Cancel My Subscription

### Phase 3: Platform Administration (Admin Panel)

#### Module: Admin — Overview
- Platform Statistics
- AI Cost Summary (30-Day)

#### Module: Admin — Client Management
- List / Search Clients
- View Client Details
- Create Client
- Edit Client (Role / Status)
- Suspend Client
- Reactivate Client
- Delete Client

#### Module: Admin — Subscriptions & Plans
- Manage Subscription Plans
- Manage User Subscriptions

#### Module: Admin — Payments
- Payment Ledger Management
- PayUp Gateway Checkout (backend integration)

#### Module: Admin — Audit Logs
- View Audit Logs

#### Module: Admin — AI Logs
- View AI Usage Logs
- AI Cost Summary Over Time

#### Module: Admin — System Settings
- Global System Settings

---

## Important Planning Notes

- The product ships as **two frontends over one backend**: the Customer Portal (`roya-ai-dynamo-frontend`) and the Admin Panel (`roya-ai-dynamo-frontend-admin`). All routes are served under `/api/v1`.
- `AI Processing` features are backend-only BullMQ workers. Their status is surfaced via `Data` (column analysis) and `Dashboards` (generation status) pages.
- `Chart Data API` (Dashboards) is backend-only — called in parallel by the viewer and shared viewer, with no dedicated page.
- Admin-facing client operations reuse the `Users` backend; they are documented under `Admin — Client Management` to match the Admin Panel app.
- Known partial / planned items, marked at the feature level:
  - `Auth` → OAuth Login: provider config + service exist, but the `oauth/callback` endpoint is a stub (**partial**).
  - `Export` → PDF: job is queued but **no `pdf-export` worker** is implemented.
  - `Dashboards` → Manual Data Refresh: enqueues a `cache-recalculation` job but **no worker** consumes it.
  - `Notifications`: `NotificationsService.notify` exists but is **not wired** to the AI/export workers, so notifications are not auto-generated yet.
  - `Subscriptions` → Subscribe / Cancel: **implemented** in change-001 (2026-06-22). Both `POST /subscriptions/subscribe` and `POST /subscriptions/cancel` now exist on the backend.
- `Admin — Payments` is now both a **manual ledger** and a **PayUp gateway checkout log** (change-003). Subscription activation happens via a durable `subscription-activation` event after a confirmed payment.
