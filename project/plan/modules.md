# Modules

## Short Summary

This module map defines the application structure for **Roya AI Dynamo**, an AI-powered SaaS dashboard generation platform. Users upload CSV files, AI analyzes the data structure, and an interactive dashboard is automatically generated without manual configuration.

Source inputs:

- `project/description.md`

Its purpose is to define the module list that will later be used to build:

- `project/actions/endpoints.md`
- `project/actions/pages.md`
- backend feature folders (`src/modules/`)
- frontend feature folders (`client/src/app/`)

This file is not an endpoint list and not a page list. It is the module source-of-truth used before those files are created.

---

## How To Use This File

When AI builds `project/actions/endpoints.md`:

- group endpoints under the matching module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds `project/actions/pages.md`:

- group pages under the matching frontend module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds backend code:

- create one NestJS feature module per business module where scope includes backend
- follow the conventions in `engine/rules/backend-rule.md`

When AI builds frontend code:

- create one Angular feature area per frontend-visible module
- keep shell/layout modules separate from business modules
- follow the conventions in `engine/rules/frontend-rule.md`

---

## Product Module Strategy

Roya AI Dynamo is split into three layers of modules:

- **Business modules** own the core product workflows: authentication, projects, data (CSV), AI processing, dashboards, sharing, and exports
- **Admin modules** own platform management: user administration, subscription management, audit logs, and system settings
- **Shared/Infrastructure modules** own cross-cutting concerns: background jobs, caching, notifications, file storage, AI provider integration, email, payments, and monitoring

---

## Business Modules

### 1. Auth

#### Purpose

Handle user registration, login, logout, password management, OAuth, and session/token lifecycle. Own the current-user endpoint used by all other modules.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users`

#### Related Features

- User Authentication & Account Management
- User Roles & Permissions (token and role payload)

#### Backend Module

- Folder: `src/modules/auth/`
- Owns:
  - user registration and login
  - OAuth 2.0 provider authentication (Google, Microsoft)
  - JWT token issuance and refresh
  - password reset flow
  - current user profile endpoint
  - auth guards used by all protected endpoints

#### Frontend Module

- Folder: `client/src/app/pages/auth/`
- Owns:
  - login page
  - register page
  - reset password page
  - OAuth redirect handler page
  - auth layout (separate from app shell)

#### Data Model / Entities

- `users` (authentication fields only; user profile management is in the Users module)

#### Depends On

- `Users`

#### Notes

- Frontend auth pages use the auth layout, not the main app shell
- JWT payload includes user role; guards check role at the route and service layer
- OAuth flow redirects back to the frontend after provider authentication

---

### 2. Users

#### Purpose

Manage user account profiles, roles, and account settings. Admin-facing user management (list, create, edit, deactivate) also lives here.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated users (profile self-service), admin (user management)`

#### Related Features

- User Authentication & Account Management (profile settings)
- User Roles & Permissions (role assignment)
- Audit Logs (admin user actions)

#### Backend Module

- Folder: `src/modules/users/`
- Owns:
  - user profile CRUD (name, email, avatar, language preference)
  - role management (admin assigns roles)
  - user listing and filtering (admin)
  - user deactivation
  - GDPR data deletion

#### Frontend Module

- Folder: `client/src/app/pages/`
- Owns:
  - account settings page (self-service profile editing)
  - admin users list page
  - admin user create/edit page

#### Data Model / Entities

- `users`

#### Depends On

- `Auth`

#### Notes

- Admin user management pages are under `/app/admin/users`
- Profile self-service is under `/app/settings/profile`
- GDPR deletion must cascade to all user-owned entities

---

### 3. Projects

#### Purpose

Provide the organizational container for dashboards. Users create projects to group related dashboards together.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins`

#### Related Features

- Project Management

#### Backend Module

- Folder: `src/modules/projects/`
- Owns:
  - project CRUD (create, read, update, delete)
  - project listing with search and pagination
  - project ownership validation
  - cascade deletion of dashboards when project is deleted

#### Frontend Module

- Folder: `client/src/app/pages/projects/`
- Owns:
  - projects list page
  - project detail/dashboard list page
  - create project page

#### Data Model / Entities

- `projects`

#### Depends On

- `Auth`
- `Users`

#### Notes

- Project names do not need to be unique
- Only the project owner (editor) or admin can edit or delete a project
- Cascade deletion must remove all dashboards, widgets, share links, and associated data

---

### 4. Data (CSV Management)

#### Purpose

Handle all CSV file lifecycle operations: upload, storage, row persistence, column metadata management, and data reuse across dashboards.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors and admins`

#### Related Features

- CSV File Upload & Data Management
- AI Column Analysis
- Column Description Review & Editing

#### Backend Module

- Folder: `src/modules/data/`
- Owns:
  - CSV file upload (chunked, up to 50 MB)
  - file metadata persistence (`csvfiles` collection)
  - CSV row parsing and storage into per-file dynamic collections
  - column metadata creation and update (`columnmetadata` collection)
  - file listing per user
  - file deletion (with dashboard impact warning)
  - triggering AI column analysis background job

#### Frontend Module

- Folder: `client/src/app/pages/data/`
- Owns:
  - CSV upload page (drag-and-drop)
  - upload progress and status page
  - column description review and editing page
  - my data files list page

#### Data Model / Entities

- `csvfiles`
- `csvdatarows` (per-file dynamic collections)
- `columnmetadata`

#### Depends On

- `Auth`
- `AI Processing` (triggers column analysis job)
- `Storage` (uploads raw file to Cloudflare R2)
- `Background Jobs` (async processing)

#### Notes

- Each CSV file gets its own MongoDB collection for its data rows to support dynamic schema
- AI never reads data rows; it only receives column names, types, and sample statistics
- File upload is chunked and must track progress in the frontend
- Deleting a CSV file warns the user if it is used in active dashboards

---

### 5. AI Processing

#### Purpose

Orchestrate all AI-powered background jobs: CSV column analysis and dashboard structure generation. Acts as the domain layer between business logic and the AI provider integration.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system (triggered by Data and Dashboard modules)`

#### Related Features

- AI Column Analysis
- AI Dashboard Generation

#### Backend Module

- Folder: `src/modules/ai-processing/`
- Owns:
  - CSV column analysis job handler
  - dashboard generation job handler
  - prompt construction from column metadata and dashboard purpose
  - parsing and validating AI response into structured output
  - updating `columnmetadata` with AI-generated descriptions
  - updating `dashboards` with AI-generated widget structure
  - job status updates (via `backgroundjobs` collection)

#### Data Model / Entities

- `backgroundjobs`
- `columnmetadata` (writes AI-generated descriptions)
- `dashboards` (writes generated widget structure)

#### Depends On

- `Background Jobs`
- `AI Provider` integration (`src/integrations/ai/`)
- `Data`
- `Dashboards`

#### Notes

- AI receives only column names, inferred data types, and sample value statistics — never raw data rows
- AI returns structured JSON: chart types, layout positions, query definitions, aggregation rules
- Jobs are queued via BullMQ; failures are retried up to a configurable limit
- Job timeout enforced at 5 minutes maximum
- This is a backend-only module; no dedicated pages (status is surfaced via the Dashboards module)

---

### 6. Dashboards

#### Purpose

Manage the full dashboard lifecycle: creation with purpose description, status tracking, widget configuration, data source linking, customization, and the dynamic data-serving endpoints used by the viewer.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `authenticated editors (create/edit), viewers (read), public via share link`

#### Related Features

- Dashboard Management
- AI Dashboard Generation (triggers and receives output)
- Dynamic Dashboard Viewer
- Real-time Data Updates
- Dashboard Customization

#### Backend Module

- Folder: `src/modules/dashboards/`
- Owns:
  - dashboard CRUD (create, read, update, delete, duplicate)
  - dashboard status management (`generating`, `ready`, `error`)
  - widget configuration persistence (`chartwidgets` collection)
  - data source linking (`dashboarddatasources` collection)
  - triggering AI dashboard generation job
  - chart data endpoint: execute MongoDB aggregation queries defined in widget config and return results
  - cache lookup before executing aggregation (Redis → DB → recalculate)
  - manual data refresh: invalidate cache and recalculate

#### Frontend Module

- Folder: `client/src/app/pages/dashboards/`
- Owns:
  - dashboard creation page (name + purpose description + data source selection)
  - dashboard viewer page (renders all widgets dynamically via backend API)
  - dashboard customization/editor page
  - dashboard status/generation progress page

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

- The dashboard viewer calls backend chart data endpoints in parallel to load multiple charts simultaneously (target: 1-2s total load)
- AI generates the widget structure; the backend executes the actual queries
- Dashboard duplication appends "-copy" to the name
- Cascade deletion: deleting a dashboard removes all its widgets, data source links, cache entries, and share links
- Viewers can only see dashboards they have a valid share link for

---

### 7. Sharing

#### Purpose

Generate and manage secure shareable links for dashboards with configurable view-only or edit permissions.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors (create links), viewers (access via link), mixed`

#### Related Features

- Dashboard Sharing

#### Backend Module

- Folder: `src/modules/sharing/`
- Owns:
  - share link generation (unique token)
  - permission validation for incoming share link requests
  - share link revocation
  - share link listing per dashboard
  - public share link resolution (look up dashboard by token, enforce permissions)
  - cascade invalidation when parent dashboard is deleted

#### Frontend Module

- Folder: `client/src/app/pages/`
- Owns:
  - share link management panel (within dashboard pages)
  - shared dashboard view page (public/token-based access)

#### Data Model / Entities

- `sharelinks`

#### Depends On

- `Dashboards`
- `Auth` (optional — share links work without authentication for viewers)

#### Notes

- Share links can be view-only or edit-permission
- Viewer refresh permission is a per-link setting
- Deleting a dashboard immediately invalidates all its share links
- Expired links return a clear error page, not a 404

---

### 8. Export

#### Purpose

Generate and deliver dashboard data exports in PDF and Excel/CSV formats.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `editors and viewers with export permission`

#### Related Features

- Data Export

#### Backend Module

- Folder: `src/modules/export/`
- Owns:
  - PDF report generation (charts + data, brand-styled)
  - Excel export of chart data
  - CSV data export of underlying dataset
  - export job queuing (PDF generation is async)
  - file upload to Cloudflare R2 after generation
  - download URL provision

#### Frontend Module

- Folder: `client/src/app/pages/`
- Owns:
  - export action triggers (within dashboard viewer)
  - export status and download page

#### Data Model / Entities

- `backgroundjobs` (for async PDF generation)

#### Depends On

- `Dashboards`
- `Storage`
- `Background Jobs`

#### Notes

- PDF generation is a background job; user is notified when ready
- Excel and CSV exports can be synchronous for reasonable dataset sizes
- Exports apply current filters at time of export
- Exported PDFs are stored in Cloudflare R2 and served via signed URL

---

### 9. Notifications

#### Purpose

Deliver in-app and email notifications to users for dashboard generation completion, errors, and share events.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `all authenticated users`

#### Related Features

- Notifications

#### Backend Module

- Folder: `src/modules/notifications/`
- Owns:
  - notification record creation
  - in-app notification listing and read/unread state
  - email dispatch via MailJet integration
  - notification types: `dashboard_ready`, `generation_error`, `dashboard_shared`, `export_ready`

#### Frontend Module

- Folder: `client/src/app/`
- Owns:
  - notification bell and dropdown in app shell header
  - notifications list page

#### Data Model / Entities

- `notifications`

#### Depends On

- `Auth`
- `Email` integration (`src/integrations/mail/`)
- `Background Jobs` (notifications triggered by job completion)

#### Notes

- In-app notifications are always created; email is optional per user preference
- Notification bell shows unread count in the app shell header
- Notification center is accessible from all pages via the shell

---

## Admin Modules

### 10. Admin — User Management

#### Purpose

Admin-only area to list, create, edit, and deactivate user accounts and assign roles.

#### Scope

- Backend: `no` (handled by `Users` module backend)
- Frontend: `yes`
- Audience: `admin`

#### Related Features

- User Roles & Permissions (admin assignment)
- Audit Logs (view user activity)

#### Frontend Module

- Folder: `client/src/app/pages/admin/users/`
- Owns:
  - admin users list page
  - admin user create/edit page

#### Depends On

- `Users`
- `Auth`

#### Notes

- Frontend-only module; backend is `Users`
- Route guard must enforce `admin` role

---

### 11. Admin — Subscriptions

#### Purpose

Manage subscription tiers, user plan assignments, and enforce usage limits per subscription plan.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin (management), editors (view own plan)`

#### Related Features

- API Access (subscription tier affects API limits)
- Subscription-based limits (business rule enforcement)

#### Backend Module

- Folder: `src/modules/subscriptions/`
- Owns:
  - subscription plan definitions
  - user subscription assignment
  - usage limit enforcement (dashboards count, CSV uploads, refreshes)
  - payment gateway webhook handling
  - plan upgrade/downgrade flow

#### Frontend Module

- Folder: `client/src/app/pages/`
- Owns:
  - billing and subscription settings page (user self-service)
  - admin subscription management page

#### Data Model / Entities

- `subscriptions` (future collection; defined in data model)

#### Depends On

- `Users`
- `Payment Gateway` integration (`src/integrations/payment/`)

#### Notes

- Use adapter/interface pattern for payment gateway so provider can be swapped
- Usage limit checks must happen at the service layer before creating dashboards or uploading files

---

### 12. Admin — Audit Logs

#### Purpose

Provide admin access to the immutable system-wide audit trail for compliance and security review.

#### Scope

- Backend: `no` (writes happen inside each business module; reads are here)
- Frontend: `yes`
- Audience: `admin`

#### Related Features

- Audit Logs

#### Frontend Module

- Folder: `client/src/app/pages/admin/audit-logs/`
- Owns:
  - audit logs list page (searchable, filterable)
  - audit log detail view

#### Depends On

- `Users`
- `Auth`

#### Notes

- Frontend-only module; audit log records are written by all backend modules via a shared audit service
- Audit logs are immutable; no delete or edit endpoints exist
- Admin-only route guard required

---

### 13. Admin — System Settings

#### Purpose

Manage global system configuration: AI model settings, feature flags, and operational parameters.

#### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `admin`

#### Related Features

- API Access (global API settings)

#### Backend Module

- Folder: `src/modules/settings/`
- Owns:
  - system settings CRUD
  - feature flag management
  - AI provider configuration (model name env variable exposure — no raw key exposure)
  - rate limit configuration

#### Frontend Module

- Folder: `client/src/app/pages/admin/settings/`
- Owns:
  - system settings page
  - feature flags page

#### Data Model / Entities

- `settings`

#### Depends On

- `Auth`

#### Notes

- Admin-only; all endpoints protected by role guard
- Never expose raw API keys in any frontend response

---

## Shared / Infrastructure Modules

### 1. App Shell (Frontend Only)

#### Purpose

Provide the authenticated portal layout: top header with notification bell and language switcher, side navigation, and the main router outlet for all app pages.

#### Scope

- Backend: `no`
- Frontend: `yes`
- Audience: `all authenticated users`

#### Related Features

- Dynamic Dashboard Viewer (hosted within shell)
- Notifications (bell in header)

#### Frontend Module

- Folder: `client/src/app/core/layouts/app-shell/`
- Owns:
  - app shell layout component
  - header component (logo, notification bell, user menu, language switcher)
  - sidebar navigation component
  - route outlet for all authenticated pages

#### Depends On

- `Auth`
- `Notifications`

#### Notes

- Shell uses Angular routing guards to block unauthenticated users
- Language switcher triggers RTL/LTR layout direction change
- Must support both English (LTR) and Arabic (RTL) layouts

---

### 2. Background Jobs

#### Purpose

Provide the shared infrastructure for queuing, executing, monitoring, and retrying asynchronous background jobs across all modules.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- AI Column Analysis (async)
- AI Dashboard Generation (async)
- PDF Export (async)
- Data Export (async)

#### Backend Module

- Folder: `src/modules/background-jobs/`
- Owns:
  - BullMQ queue setup and worker registration
  - job persistence in `backgroundjobs` collection
  - job status tracking (queued, processing, completed, failed)
  - retry logic and timeout enforcement (5-minute max per AI job)
  - job progress broadcasting (used by status polling endpoints)

#### Data Model / Entities

- `backgroundjobs`

#### Depends On

- `Redis` (via `src/integrations/redis/`)

#### Notes

- All AI and export jobs route through this module
- Job results are written back to the originating entity (dashboard, csvfile, etc.)
- Completed jobs trigger notifications via the Notifications module

---

### 3. Caching

#### Purpose

Provide shared Redis + MongoDB caching for pre-calculated chart data. All chart data lookups go through this layer before hitting the aggregation pipeline.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- Dynamic Dashboard Viewer (reads from cache)
- Real-time Data Updates (invalidates cache on refresh)

#### Backend Module

- Folder: `src/modules/caching/`
- Owns:
  - Redis cache read/write for chart results
  - MongoDB persistent cache fallback (`chartdatacache` collection)
  - cache key generation (widget ID + query hash)
  - cache invalidation on manual data refresh
  - cache TTL management

#### Data Model / Entities

- `chartdatacache`

#### Depends On

- `Redis` integration

#### Notes

- Cache lookup order: Redis → MongoDB cache → recalculate
- Cache is invalidated per dashboard when user clicks "Refresh Data"
- Target: 80%+ of dashboard data requests served from cache

---

### 4. Storage

#### Purpose

Abstract file storage operations (upload, download, delete) behind a provider-agnostic interface, with Cloudflare R2 as the current implementation.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Related Features

- CSV File Upload & Data Management
- Data Export (PDF storage)

#### Backend Module

- Folder: `src/integrations/storage/`
- Owns:
  - S3-compatible upload (Cloudflare R2)
  - signed URL generation for downloads
  - file deletion
  - provider interface allowing swap to AWS S3, Azure Blob, etc.

#### Depends On

- None (pure infrastructure)

#### Notes

- All file operations go through this service — no direct SDK calls from business modules
- Provider configured via environment variable

---

### 5. AI Provider

#### Purpose

Abstract all Claude AI (and future provider) API calls behind a provider-agnostic interface. Used exclusively by the AI Processing module.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/ai/`
- Owns:
  - Claude API client
  - prompt sending and response parsing
  - provider interface (allows swapping to OpenAI, Azure OpenAI, etc.)
  - model version configuration via environment variable
  - error handling and timeout management

#### Depends On

- None (pure infrastructure)

#### Notes

- Only the AI Processing module calls this integration
- API key is server-side only; never exposed to frontend or logs

---

### 6. Email

#### Purpose

Deliver transactional emails via MailJet. Used by the Notifications module.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/mail/`
- Owns:
  - MailJet API client
  - email template management (welcome, dashboard ready, share notification, password reset)
  - provider interface for future swap

#### Depends On

- None (pure infrastructure)

#### Notes

- Called by the Notifications module, never directly from controllers
- Email credentials are environment variables only

---

### 7. Payment Gateway

#### Purpose

Process SaaS subscription payments through a provider-agnostic interface, with the current provider configured via environment variable.

#### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `system`

#### Backend Module

- Folder: `src/integrations/payment/`
- Owns:
  - payment provider client (Stripe or equivalent)
  - subscription creation and management
  - webhook handling
  - provider interface for future swap

#### Depends On

- None (pure infrastructure)

#### Notes

- Called by the Subscriptions module only
- Webhook endpoint must validate signatures before processing

---

## Module Priority For Implementation Planning

### Phase 1: Core Workflow (MVP)

These modules must be built first as they form the end-to-end user journey:

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
- `App Shell` (frontend — required to host all pages)

### Phase 2: Engagement and Collaboration

- `Sharing`
- `Export`
- `Notifications`
- `Email` (shared — required by Notifications)

### Phase 3: Platform and Administration

- `Admin — User Management`
- `Admin — Subscriptions`
- `Admin — Audit Logs`
- `Admin — System Settings`
- `Payment Gateway` (shared — required by Subscriptions)

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
- `Admin — User Management` depends on `Users`, `Auth`
- `Admin — Subscriptions` depends on `Users`, `Payment Gateway`
- `Admin — Audit Logs` depends on `Users`, `Auth`
- `Admin — System Settings` depends on `Auth`
- `App Shell` depends on `Auth`, `Notifications`
- `Background Jobs` depends on `Redis`
- `Caching` depends on `Redis`

---

## Important Planning Notes

- One module may contain many endpoints and many pages — for example, `Dashboards` owns the creation page, the viewer page, the customization page, and all chart data endpoints.
- `AI Processing` is backend-only. Its status is surfaced through `Dashboards` module endpoints and pages, not through a separate AI module frontend area.
- `App Shell` is a frontend-only layout module with no backend domain.
- Admin modules share backend logic with their business counterparts (`Admin — User Management` reuses the `Users` backend). The separation is for frontend route organization only.
- `Background Jobs`, `Caching`, `Storage`, `AI Provider`, `Email`, and `Payment Gateway` are infrastructure modules — they never expose public API endpoints directly; they are called by business module services.
- Do not create a separate module per page or per API route — group by business capability.