```
# Endpoints

## Short Summary

This file defines every backend API endpoint for **Roya AI Dynamo**. Endpoints are grouped by module matching `project/plan/modules.md`. All inputs, outputs, auth rules, and constraints are derived from `project/plan/features.md`, `project/plan/data-model.md`, and `project/rules.md`.

All routes are prefixed with `/api/v1`.

---

## Module: Auth

---

### Endpoint 1

- Name: `Register`
- Method: `POST`
- Route: `/auth/register`
- Summary: `Create a new user account with email and password.`

#### Description

Validates uniqueness of email, hashes password with bcrypt (12 rounds), creates a user record with role `editor`, sends a welcome email, and returns JWT access and refresh tokens.

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `name: string - display name (required)`
  - `email: string - unique email address (required)`
  - `password: string - min 8 chars (required)`

#### Return

- Status: `201`
- DTO / Shape: `AuthResponse`
- Data:
  - `accessToken: string - JWT access token`
  - `refreshToken: string - rotation-based refresh token`
  - `user: UserProfileDto - id, name, email, role, languagePreference`

#### Business Rules

- Email must be unique across all users
- Password must be hashed before persisting
- Welcome email sent via MailJet after user record is created

#### Constraints / Notes

- Rate limit: 10 requests per minute per IP
- Never return `passwordHash` in any response
- Write `user.register` audit log entry

---

### Endpoint 2

- Name: `Login`
- Method: `POST`
- Route: `/auth/login`
- Summary: `Authenticate a user with email and password and return JWT tokens.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `email: string - registered email (required)`
  - `password: string - account password (required)`

#### Return

- Status: `200`
- DTO / Shape: `AuthResponse`
- Data:
  - `accessToken: string`
  - `refreshToken: string`
  - `user: UserProfileDto`

#### Business Rules

- Return `401` if email not found or password does not match
- Update `lastLoginAt` on successful login
- Store hashed refresh token in `users.refreshTokenHash`

#### Constraints / Notes

- Rate limit: 10 requests per minute per IP
- Write `user.login` on success and `user.login_failed` on failure audit log entries

---

### Endpoint 3

- Name: `OAuth Login`
- Method: `POST`
- Route: `/auth/oauth/callback`
- Summary: `Complete OAuth flow and return JWT tokens after provider authentication.`

#### Description

Receives OAuth authorization code from provider, exchanges for user identity, creates account if new, links to existing account if email matches, and returns JWT tokens.

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `provider: string - enum: google, microsoft (required)`
  - `code: string - OAuth authorization code (required)`
  - `redirectUri: string - must match registered redirect (required)`

#### Return

- Status: `200`
- DTO / Shape: `AuthResponse`
- Data:
  - `accessToken: string`
  - `refreshToken: string`
  - `user: UserProfileDto`

#### Business Rules

- Create new user with role `editor` if no existing account matches the OAuth email
- Link OAuth identity to existing account if email already registered
- Never trust OAuth payload without verifying with provider

#### Constraints / Notes

- OAuth client secrets are server-side only; never returned or logged
- Write `user.login` audit log entry

---

### Endpoint 4

- Name: `Refresh Token`
- Method: `POST`
- Route: `/auth/refresh`
- Summary: `Issue a new access token using a valid refresh token.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `refreshToken: string - current valid refresh token (required)`

#### Return

- Status: `200`
- DTO / Shape: `TokenRefreshResponse`
- Data:
  - `accessToken: string - new access token`
  - `refreshToken: string - new rotated refresh token`

#### Business Rules

- Validate refresh token against stored hash
- Rotate refresh token on every use (invalidate old, issue new)
- Return `401` if token is invalid, expired, or already used

#### Constraints / Notes

- Refresh tokens are one-time use (rotation pattern)

---

### Endpoint 5

- Name: `Forgot Password`
- Method: `POST`
- Route: `/auth/forgot-password`
- Summary: `Send a password reset link to the user's email.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `email: string - registered email (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`
- Data:
  - `message: string - always returns success to prevent email enumeration`

#### Constraints / Notes

- Rate limit: 10 requests per minute per IP
- Always return 200 even if email not found (prevents enumeration)
- Token expires in 1 hour; one-time use

---

### Endpoint 6

- Name: `Reset Password`
- Method: `POST`
- Route: `/auth/reset-password`
- Summary: `Apply a new password using a valid reset token.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `token: string - reset token from email link (required)`
  - `newPassword: string - min 8 chars (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`

#### Business Rules

- Validate token expiry and one-time use
- Hash new password before storing
- Invalidate token after use

---

### Endpoint 7

- Name: `Logout`
- Method: `POST`
- Route: `/auth/logout`
- Summary: `Invalidate the user's refresh token and end the session.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Clear `users.refreshTokenHash` for the current user
- Write `user.logout` audit log entry

---

### Endpoint 8

- Name: `Get Current User`
- Method: `GET`
- Route: `/auth/me`
- Summary: `Return the authenticated user's profile.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `UserProfileDto`
- Data:
  - `id: string`
  - `name: string`
  - `email: string`
  - `role: string`
  - `avatarUrl: string | null`
  - `languagePreference: string`
  - `createdAt: string`

---

## Module: Users

---

### Endpoint 9

- Name: `Get Users List`
- Method: `GET`
- Route: `/users`
- Summary: `Paginated, searchable list of all users. Admin only.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `page: number - page number (default 1)`
  - `limit: number - page size (default 20, max 100)`
  - `search: string - search by name or email`
  - `role: string - filter by role enum`
  - `isActive: boolean - filter by active status`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<UserListItemDto>`
- Data:
  - `items: UserListItemDto[] - id, name, email, role, isActive, lastLoginAt, createdAt`
  - `page: number`
  - `limit: number`
  - `total: number`

#### Constraints / Notes

- Paginated endpoint
- Never return `passwordHash` or `refreshTokenHash`

---

### Endpoint 10

- Name: `Get User By ID`
- Method: `GET`
- Route: `/users/:id`
- Summary: `Return full user details for admin edit page.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

---

### Endpoint 11

- Name: `Create User`
- Method: `POST`
- Route: `/users`
- Summary: `Admin creates a new user account.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `name: string (required)`
  - `email: string (required)`
  - `password: string (required)`
  - `role: string - enum: admin, editor, viewer (required)`

#### Return

- Status: `201`
- DTO / Shape: `UserDetailsDto`

#### Constraints / Notes

- Write `user.register` audit log entry

---

### Endpoint 12

- Name: `Update User`
- Method: `PUT`
- Route: `/users/:id`
- Summary: `Admin updates user profile, role, active status, or resets password.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body:
  - `name: string (optional)`
  - `email: string (optional)`
  - `role: string (optional)`
  - `isActive: boolean (optional)`
  - `newPassword: string - admin-initiated password reset, min 8 chars (optional)`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

#### Constraints / Notes

- Write `user.update` audit log entry

---

### Endpoint 13

- Name: `Delete User`
- Method: `DELETE`
- Route: `/users/:id`
- Summary: `Admin permanently deletes a user and all owned data (GDPR).`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Cascade delete all user-owned data: projects, dashboards, csvfiles, notifications, subscriptions
- Redact `userId` in audit logs (set to null); do not delete audit records
- Must complete within 30 days (GDPR)

#### Constraints / Notes

- Write `user.delete` audit log entry

---

### Endpoint 14

- Name: `Update Own Profile`
- Method: `PATCH`
- Route: `/users/me`
- Summary: `Authenticated user updates their own profile.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `name: string (optional)`
  - `languagePreference: string - enum: en, ar (optional)`
  - `avatarUrl: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `UserProfileDto`

#### Constraints / Notes

- User cannot change their own role via this endpoint

---

### Endpoint 15

- Name: `Change Password`
- Method: `PATCH`
- Route: `/users/me/password`
- Summary: `Authenticated user changes their password.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `currentPassword: string (required)`
  - `newPassword: string - min 8 chars (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`

#### Business Rules

- Verify `currentPassword` against stored hash before updating

---

## Module: Projects

---

### Endpoint 16

- Name: `Create Project`
- Method: `POST`
- Route: `/projects`
- Summary: `Create a new project for the authenticated user.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `name: string (required)`
  - `description: string (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ProjectDto`
- Data:
  - `id, name, description, ownerId, isActive, createdAt, updatedAt`

#### Constraints / Notes

- Write `project.create` audit log entry

---

### Endpoint 17

- Name: `List Projects`
- Method: `GET`
- Route: `/projects`
- Summary: `Paginated list of projects owned by the current user.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query:
  - `page: number (default 1)`
  - `limit: number (default 20)`
  - `search: string - search by project name`
  - `isActive: boolean (default true)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<ProjectListItemDto>`
- Data:
  - `items: ProjectListItemDto[] - id, name, description, dashboardCount, createdAt`
  - `page, limit, total`

#### Constraints / Notes

- Paginated endpoint
- Admin sees all projects; editor sees only owned projects

---

### Endpoint 18

- Name: `Get Project`
- Method: `GET`
- Route: `/projects/:id`
- Summary: `Return project details and its dashboards list.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - project ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `ProjectDetailsDto`
- Data:
  - `id, name, description, ownerId, createdAt, updatedAt`
  - `dashboards: DashboardListItemDto[] - id, name, status, createdAt`

#### Business Rules

- Editor can only access their own projects
- Admin can access any project

---

### Endpoint 19

- Name: `Update Project`
- Method: `PUT`
- Route: `/projects/:id`
- Summary: `Update project name and description.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body:
  - `name: string (optional)`
  - `description: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `ProjectDto`

#### Constraints / Notes

- Write `project.update` audit log entry

---

### Endpoint 20

- Name: `Delete Project`
- Method: `DELETE`
- Route: `/projects/:id`
- Summary: `Delete project and all its dashboards (cascade).`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Cascade delete: all dashboards, chartwidgets, dashboarddatasources, chartdatacache, sharelinks
- Only owner or admin can delete

#### Constraints / Notes

- Write `project.delete` audit log entry

---

## Module: Data (CSV Management)

---

### Endpoint 21

- Name: `Initiate CSV Upload`
- Method: `POST`
- Route: `/data/upload/initiate`
- Summary: `Initiate a chunked CSV upload session and return an upload ID.`

#### Description

Creates a `csvfiles` record with status `uploading`, returns an upload session ID and upload URL for direct chunked upload to Cloudflare R2.

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `filename: string (required)`
  - `fileSizeBytes: number (required)`
  - `mimeType: string - must be text/csv (required)`

#### Return

- Status: `201`
- DTO / Shape: `UploadInitiateResponse`
- Data:
  - `fileId: string - csvfiles ObjectId`
  - `uploadUrl: string - presigned R2 URL for chunked upload`
  - `uploadId: string - multipart upload session ID`

#### Business Rules

- Reject files larger than 52,428,800 bytes (50 MB) with `400`
- Check subscription upload limit before creating record; return `403` if exceeded
- Write `csvfile.upload` audit log entry on initiation

---

### Endpoint 22

- Name: `Complete CSV Upload`
- Method: `POST`
- Route: `/data/upload/:fileId/complete`
- Summary: `Confirm upload completed, trigger row parsing and AI analysis.`

#### Description

Called by frontend after all chunks are uploaded to R2. Backend parses CSV rows into `csvdata_{fileId}` collection, creates `columnmetadata` records, queues the AI column analysis job, and returns the background job ID.

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body:
  - `storageKey: string - confirmed R2 object key (required)`

#### Return

- Status: `202`
- DTO / Shape: `UploadCompleteResponse`
- Data:
  - `fileId: string`
  - `jobId: string - backgroundjobs ObjectId for AI analysis`
  - `status: string - analyzing`

#### Constraints / Notes

- Row parsing is async (background job); this endpoint returns immediately
- Chunked batch insert: 1,000 rows per batch
- Write `csvfile.upload_complete` audit log entry

---

### Endpoint 23

- Name: `List CSV Files`
- Method: `GET`
- Route: `/data/files`
- Summary: `Paginated list of CSV files uploaded by the current user.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query:
  - `page: number (default 1)`
  - `limit: number (default 20)`
  - `search: string - search by filename`
  - `status: string - filter by CsvFileStatus enum`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<CsvFileListItemDto>`
- Data:
  - `items: CsvFileListItemDto[] - id, originalFilename, fileSizeBytes, rowCount, columnCount, status, uploadedAt`
  - `page, limit, total`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 24

- Name: `Get CSV File`
- Method: `GET`
- Route: `/data/files/:fileId`
- Summary: `Return CSV file metadata and all column metadata.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `CsvFileDetailsDto`
- Data:
  - `id, originalFilename, fileSizeBytes, rowCount, columnCount, status, uploadedAt`
  - `columns: ColumnMetadataDto[] - id, columnName, columnIndex, inferredType, aiDescription, userDescription, status`

---

### Endpoint 25

- Name: `Update Column Descriptions`
- Method: `PATCH`
- Route: `/data/files/:fileId/columns`
- Summary: `Save user-confirmed column descriptions for a CSV file.`

#### Description

Accepts an array of column updates. Sets each column's `userDescription` and `status` to `user_confirmed`. When all columns are confirmed, sets `csvfiles.status` to `confirmed`.

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string`
- Query: `none`
- Body:
  - `columns: ColumnUpdateDto[] - array of { columnId, userDescription }`

#### Return

- Status: `200`
- DTO / Shape: `CsvFileDetailsDto`

#### Business Rules

- After all columns are `user_confirmed`, set `csvfiles.status` to `confirmed`
- Confirmed status is the prerequisite gate for dashboard generation

---

### Endpoint 26

- Name: `Delete CSV File`
- Method: `DELETE`
- Route: `/data/files/:fileId`
- Summary: `Delete a CSV file, its data rows, and its column metadata.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `DeleteCsvFileResponse`
- Data:
  - `deleted: boolean`
  - `affectedDashboards: string[] - IDs of dashboards that used this file`

#### Business Rules

- Delete `columnmetadata` records
- Drop `csvdata_{fileId}` MongoDB collection
- Delete raw file from Cloudflare R2
- Delete `csvfiles` record
- Return list of affected dashboard IDs as a warning (do not cascade-delete dashboards)

#### Constraints / Notes

- Write `csvfile.delete` audit log entry

---

### Endpoint 27

- Name: `Retry Column Analysis`
- Method: `POST`
- Route: `/data/files/:fileId/analyze/retry`
- Summary: `Manually retry a failed AI column analysis job.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId: string, status: string }`

#### Business Rules

- Only allowed when `csvfiles.status` is `error`
- Creates a new `backgroundjobs` record and re-queues the analysis job

---

## Module: Dashboards

---

### Endpoint 28

- Name: `Create Dashboard`
- Method: `POST`
- Route: `/dashboards`
- Summary: `Create a dashboard, link data sources, and trigger AI generation.`

#### Description

Creates the dashboard record, links it to one or more CSV files (all must be `confirmed`), queues the AI dashboard generation background job, and returns the dashboard with the job ID.

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `projectId: string (required)`
  - `name: string - unique within project (required)`
  - `purposeDescription: string - used as AI prompt context (required)`
  - `fileIds: string[] - one or more confirmed csvfiles IDs (required)`

#### Return

- Status: `202`
- DTO / Shape: `DashboardCreatedResponse`
- Data:
  - `dashboardId: string`
  - `jobId: string - backgroundjobs ObjectId`
  - `status: string - generating`

#### Business Rules

- `name` must be unique within the same `projectId`
- All `fileIds` must have `csvfiles.status === 'confirmed'`; return `400` if any are not confirmed
- Check subscription dashboard limit before creating; return `403` if exceeded

#### Constraints / Notes

- Async endpoint — generation runs in background
- Write `dashboard.create` audit log entry

---

### Endpoint 29

- Name: `List Dashboards`
- Method: `GET`
- Route: `/dashboards`
- Summary: `Paginated list of dashboards for the current user.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params: `none`
- Query:
  - `projectId: string - filter by project (required)`
  - `page: number (default 1)`
  - `limit: number (default 20)`
  - `search: string - search by name`
  - `status: string - filter by DashboardStatus enum`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<DashboardListItemDto>`
- Data:
  - `items: DashboardListItemDto[] - id, name, status, createdAt, updatedAt, lastRefreshedAt`
  - `page, limit, total`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 30

- Name: `Get Dashboard`
- Method: `GET`
- Route: `/dashboards/:id`
- Summary: `Return full dashboard definition with all widget configurations.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `DashboardDetailsDto`
- Data:
  - `id, name, purposeDescription, status, layoutColumns, generatedAt, lastRefreshedAt`
  - `widgets: ChartWidgetDto[] - all widget configs`
  - `dataSources: CsvFileListItemDto[] - linked CSV files`

---

### Endpoint 31

- Name: `Get Dashboard Generation Status`
- Method: `GET`
- Route: `/dashboards/:id/status`
- Summary: `Poll the AI generation job status for a dashboard.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `DashboardStatusDto`
- Data:
  - `dashboardId: string`
  - `status: string - DashboardStatus enum`
  - `jobStatus: string - BackgroundJobStatus enum`
  - `progress: number - 0 to 100`
  - `errorMessage: string | null`

#### Constraints / Notes

- Designed for frontend polling at 3–5 second intervals during generation

---

### Endpoint 32

- Name: `Update Dashboard`
- Method: `PATCH`
- Route: `/dashboards/:id`
- Summary: `Update dashboard name or purpose description.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body:
  - `name: string (optional)`
  - `purposeDescription: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `DashboardDetailsDto`

#### Constraints / Notes

- Write `dashboard.update` audit log entry

---

### Endpoint 33

- Name: `Delete Dashboard`
- Method: `DELETE`
- Route: `/dashboards/:id`
- Summary: `Delete a dashboard and all its widgets, cache, and share links.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Cascade delete: chartwidgets, dashboarddatasources, chartdatacache, sharelinks
- Invalidate all Redis cache entries for this dashboard

#### Constraints / Notes

- Write `dashboard.delete` audit log entry

---

### Endpoint 34

- Name: `Duplicate Dashboard`
- Method: `POST`
- Route: `/dashboards/:id/duplicate`
- Summary: `Create a copy of a dashboard within the same project.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - source dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `201`
- DTO / Shape: `DashboardDetailsDto`

#### Business Rules

- New dashboard name = `{originalName}-copy`
- Copy all `chartwidgets` and `dashboarddatasources`
- New dashboard status is `ready` (no re-generation)
- No share links are copied

#### Constraints / Notes

- Write `dashboard.duplicate` audit log entry

---

### Endpoint 35

- Name: `Get Chart Data`
- Method: `GET`
- Route: `/dashboards/:id/widgets/:widgetId/data`
- Summary: `Return aggregated chart data for a single widget. Cache-first.`

#### Description

Checks Redis cache, then `chartdatacache` MongoDB collection. On cache miss, executes the MongoDB aggregation pipeline defined in `chartwidgets.queryDefinition` against `csvdata_{fileId}`, stores the result, and returns formatted chart data.

#### Auth

- Access: `authenticated or share-token`
- Roles: `editor, admin, viewer (via share link)`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query:
  - `shareToken: string - optional, for share link access without JWT`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `ChartDataResponse`
- Data (varies by widget type):
  - bar/line/scatter: `{ labels: string[], datasets: [{ label: string, data: number[] }] }`
  - pie/donut: `{ labels: string[], values: number[] }`
  - kpi_card: `{ value: number|string, label: string, change: number|null }`
  - table: `{ columns: ColumnDefDto[], rows: Record<string, any>[] }`

#### Business Rules

- Cache lookup order: Redis → MongoDB cache → recalculate
- Cache hit: return in < 200ms
- Cache miss: execute aggregation, store in both Redis (TTL 1h) and MongoDB cache
- Validate user owns dashboard OR has valid active share token

#### Constraints / Notes

- This endpoint is called in parallel for all widgets on dashboard load
- Return `200` with empty data structure if aggregation returns zero results (not `404`)
- Target: < 200ms cached, < 2s uncached

---

### Endpoint 36

- Name: `Refresh Dashboard Data`
- Method: `POST`
- Route: `/dashboards/:id/refresh`
- Summary: `Invalidate all widget caches and recalculate aggregations.`

#### Auth

- Access: `authenticated or share-token (if viewerCanRefresh is true)`
- Roles: `editor, admin, viewer (if permitted)`

#### Input

- Params:
  - `id: string`
- Query:
  - `shareToken: string - optional, for share link refresh`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId: string, message: string }`

#### Business Rules

- Check subscription refresh limit; return `429` with retry-after if exceeded
- Validate `viewerCanRefresh` flag if accessed via share token
- Invalidate all Redis keys `chart:{widgetId}:`* for the dashboard
- Delete all `chartdatacache` entries for the dashboard
- Queue `cache_recalculation` background job
- Update `dashboard.lastRefreshedAt` on completion

#### Constraints / Notes

- Write `dashboard.refresh` audit log entry

---

### Endpoint 37

- Name: `Update Widget`
- Method: `PUT`
- Route: `/dashboards/:id/widgets/:widgetId`
- Summary: `Save customizations to a chart widget configuration.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query: `none`
- Body:
  - `widgetType: string (optional)`
  - `title: string (optional)`
  - `position: { x, y, w, h } (optional)`
  - `queryDefinition: QueryDefinitionDto (optional)`
  - `displayConfig: DisplayConfigDto (optional)`

#### Return

- Status: `200`
- DTO / Shape: `ChartWidgetDto`

#### Business Rules

- If `queryDefinition` changes, invalidate this widget's Redis and MongoDB cache entries
- Validate `queryDefinition` against schema before persisting

#### Constraints / Notes

- Write `dashboard.update` audit log entry

---

### Endpoint 38

- Name: `Add Widget`
- Method: `POST`
- Route: `/dashboards/:id/widgets`
- Summary: `Manually add a new chart widget to an existing dashboard.`

#### Description

Creates a new `chartwidgets` record with a user-supplied chart type, data source, title, query definition, and display config. Called from the dashboard customization UI when the editor adds a widget manually (not AI-generated).

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body:
  - `widgetType: string - enum: bar, line, pie, donut, kpi_card, table, scatter (required)`
  - `title: string (required)`
  - `position: { x: number, y: number, w: number, h: number } (required)`
  - `queryDefinition: QueryDefinitionDto (required)`
  - `displayConfig: DisplayConfigDto (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ChartWidgetDto`
- Data:
  - `id, widgetType, title, position, queryDefinition, displayConfig, createdAt`

#### Business Rules

- Dashboard must have status `ready`; return `400` if status is `generating` or `error`
- Validate `queryDefinition` against schema before persisting
- Only the dashboard owner or admin can add widgets

#### Constraints / Notes

- Write `dashboard.update` audit log entry

---

### Endpoint 39

- Name: `Delete Widget`
- Method: `DELETE`
- Route: `/dashboards/:id/widgets/:widgetId`
- Summary: `Remove a widget from a dashboard and invalidate its cache.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Delete `chartwidgets` record
- Delete all `chartdatacache` entries for this widget
- Invalidate Redis cache key `chart:{widgetId}:*`
- Only the dashboard owner or admin can delete widgets

#### Constraints / Notes

- Write `dashboard.update` audit log entry

---

### Endpoint 40

- Name: `Retry Dashboard Generation`
- Method: `POST`
- Route: `/dashboards/:id/generate/retry`
- Summary: `Manually retry a failed AI dashboard generation job.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId: string, status: string }`

#### Business Rules

- Only allowed when `dashboards.status === 'error'`
- Creates a new `backgroundjobs` record and re-queues the generation job

---

## Module: Sharing

---

### Endpoint 41

- Name: `Create Share Link`
- Method: `POST`
- Route: `/dashboards/:id/share`
- Summary: `Generate a shareable link for the dashboard.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body:
  - `permission: string - enum: view, edit (required)`
  - `viewerCanRefresh: boolean (default false)`
  - `expiresAt: string - ISO date (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ShareLinkCreatedResponse`
- Data:
  - `shareLinkId: string`
  - `shareUrl: string - full URL with raw token (returned once only)`
  - `permission: string`
  - `expiresAt: string | null`

#### Business Rules

- Token is cryptographically random (32 bytes, base64url encoded)
- Only the hash is stored; raw token returned to caller exactly once
- Only the dashboard owner can create share links

#### Constraints / Notes

- Write `sharelink.create` audit log entry

---

### Endpoint 42

- Name: `List Share Links`
- Method: `GET`
- Route: `/dashboards/:id/share`
- Summary: `List all share links for a dashboard.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `ShareLinkDto[]`
- Data:
  - `id, permission, viewerCanRefresh, accessCount, lastAccessedAt, expiresAt, status, createdAt`

---

### Endpoint 43

- Name: `Revoke Share Link`
- Method: `DELETE`
- Route: `/dashboards/:id/share/:shareLinkId`
- Summary: `Revoke a share link immediately.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `shareLinkId: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Business Rules

- Set `sharelinks.status` to `revoked`
- Subsequent access with this token returns `410 Gone`

#### Constraints / Notes

- Write `sharelink.revoke` audit log entry

---

### Endpoint 44

- Name: `Get Shared Dashboard`
- Method: `GET`
- Route: `/shared/:token`
- Summary: `Public endpoint — resolve share token and return dashboard for viewer.`

#### Description

Validates the share token, checks expiry and revocation, enforces permission level, and returns the full dashboard with widget configurations. No JWT required.

#### Auth

- Access: `public (token-based)`
- Roles: `N/A`

#### Input

- Params:
  - `token: string - raw share token from URL`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SharedDashboardDto`
- Data:
  - `dashboardId, name, widgets, permission, viewerCanRefresh`

#### Business Rules

- Hash the incoming token and look up by hash
- Return `410 Gone` if revoked, `401` if expired
- Increment `accessCount` and update `lastAccessedAt`
- Never expose owner user ID or email in response

#### Constraints / Notes

- This endpoint serves the public shared dashboard view page

---

## Module: Export

---

### Endpoint 45

- Name: `Export Dashboard as PDF`
- Method: `POST`
- Route: `/dashboards/:id/export/pdf`
- Summary: `Queue a PDF export job and return the job ID.`

#### Auth

- Access: `authenticated or share-token`
- Roles: `editor, admin, viewer`

#### Input

- Params:
  - `id: string`
- Query:
  - `shareToken: string (optional)`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId: string, message: string }`

#### Business Rules

- Queue `pdf_export` background job
- On completion: upload PDF to R2, send `export_ready` notification with signed URL

#### Constraints / Notes

- Write `export.pdf` audit log entry
- Async endpoint

---

### Endpoint 46

- Name: `Export Data as Excel`
- Method: `GET`
- Route: `/dashboards/:id/export/excel`
- Summary: `Generate and download an Excel file with aggregated widget data.`

#### Auth

- Access: `authenticated or share-token`
- Roles: `editor, admin, viewer`

#### Input

- Params:
  - `id: string`
- Query:
  - `shareToken: string (optional)`
- Body: `none`

#### Return

- Status: `200`
- Headers: `Content-Disposition: attachment; filename="dashboard-{id}.xlsx"`
- Body: Binary `.xlsx` file stream

#### Constraints / Notes

- Synchronous for reasonable sizes; stream for datasets > 100,000 rows
- Write `export.excel` audit log entry

---

### Endpoint 47

- Name: `Export Data as CSV`
- Method: `GET`
- Route: `/data/files/:fileId/export/csv`
- Summary: `Stream raw CSV data rows as a downloadable CSV file.`

#### Auth

- Access: `authenticated`
- Roles: `editor, admin`

#### Input

- Params:
  - `fileId: string`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- Headers: `Content-Disposition: attachment; filename="{originalFilename}"`
- Body: Streamed CSV content

#### Constraints / Notes

- Must stream rows from MongoDB to avoid loading all rows into memory
- Write `export.csv` audit log entry

---

## Module: Notifications

---

### Endpoint 48

- Name: `List Notifications`
- Method: `GET`
- Route: `/notifications`
- Summary: `Paginated list of notifications for the current user.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query:
  - `page: number (default 1)`
  - `limit: number (default 20)`
  - `isRead: boolean (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<NotificationDto>`
- Data:
  - `items: NotificationDto[] - id, type, title, message, isRead, relatedEntityType, relatedEntityId, createdAt`
  - `page, limit, total`
  - `unreadCount: number`

---

### Endpoint 49

- Name: `Mark Notifications as Read`
- Method: `PATCH`
- Route: `/notifications/read`
- Summary: `Mark one or all notifications as read.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `notificationIds: string[] - specific IDs to mark read (optional)`
  - `markAll: boolean - if true, mark all as read (optional)`

#### Return

- Status: `200`
- DTO / Shape: `{ updatedCount: number }`

---

## Module: Admin — Subscriptions

---

### Endpoint 50

- Name: `Get Current Subscription`
- Method: `GET`
- Route: `/subscriptions/me`
- Summary: `Return the current user's subscription plan and usage.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SubscriptionDto`
- Data:
  - `planId, planName, limits, usage, status, expiresAt`

---

### Endpoint 51

- Name: `List Subscriptions (Admin)`
- Method: `GET`
- Route: `/subscriptions`
- Summary: `Paginated list of all user subscriptions. Admin only.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `page: number (default 1)`
  - `limit: number (default 20)`
  - `status: string - filter by SubscriptionStatus enum`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<SubscriptionListItemDto>`

---

### Endpoint 52

- Name: `Assign Subscription`
- Method: `POST`
- Route: `/subscriptions`
- Summary: `Assign or update a subscription plan for a user.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body:
  - `userId: string (required)`
  - `planId: string - enum: free, pro, enterprise (required)`
  - `expiresAt: string - ISO date (optional)`

#### Return

- Status: `201`
- DTO / Shape: `SubscriptionDto`

#### Constraints / Notes

- Write `subscription.assign` audit log entry

---

### Endpoint 53

- Name: `Payment Webhook`
- Method: `POST`
- Route: `/subscriptions/webhook`
- Summary: `Receive payment provider webhook events.`

#### Auth

- Access: `public (signature-validated)`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Headers:
  - Provider signature header (e.g., `Stripe-Signature`)
- Body: Raw webhook payload

#### Return

- Status: `200`

#### Business Rules

- Validate webhook signature before processing
- Handle events: `payment.succeeded`, `payment.failed`, `subscription.renewed`, `subscription.cancelled`
- Idempotent: duplicate webhook events must not double-process

#### Constraints / Notes

- This endpoint must be public (no JWT auth) but must validate provider signature

---

## Module: Admin — Audit Logs

---

### Endpoint 54

- Name: `List Audit Logs`
- Method: `GET`
- Route: `/audit-logs`
- Summary: `Paginated, filterable audit log list. Admin only.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `page: number (default 1)`
  - `limit: number (default 50)`
  - `userId: string (optional)`
  - `action: string - filter by AuditAction enum (optional)`
  - `entityType: string (optional)`
  - `entityId: string (optional)`
  - `from: string - ISO date start (optional)`
  - `to: string - ISO date end (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedResponse<AuditLogDto>`
- Data:
  - `items: AuditLogDto[] - id, userId, action, entityType, entityId, ipAddress, timestamp, details`
  - `page, limit, total`

#### Constraints / Notes

- Paginated endpoint
- No write, update, or delete endpoints exist for audit logs

---

## Module: Admin — System Settings

---

### Endpoint 55

- Name: `List Settings`
- Method: `GET`
- Route: `/settings`
- Summary: `Return all system settings. Admin only.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SettingDto[]`
- Data:
  - `key, value, description, updatedBy, updatedAt`

#### Business Rules

- Never return settings whose keys contain `key`, `secret`, `token`, or `password` in their value field

---

### Endpoint 56

- Name: `Update Setting`
- Method: `PATCH`
- Route: `/settings/:key`
- Summary: `Update the value of a specific system setting.`

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params:
  - `key: string - setting key`
- Query: `none`
- Body:
  - `value: any - new setting value (required)`

#### Return

- Status: `200`
- DTO / Shape: `SettingDto`

#### Constraints / Notes

- Write `settings.update` audit log entry

---

## Module: Background Jobs

---

### Endpoint 57

- Name: `Get Job Status`
- Method: `GET`
- Route: `/jobs/:jobId`
- Summary: `Return the current status and progress of a background job.`

#### Auth

- Access: `authenticated`
- Roles: `N/A`

#### Input

- Params:
  - `jobId: string - backgroundjobs ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `BackgroundJobDto`
- Data:
  - `id, type, entityType, entityId, status, progress, queuedAt, startedAt, completedAt, errorMessage, retryCount`

#### Business Rules

- User can only access their own jobs (by `ownerId`)
- Admin can access any job

---

## Endpoint Count Summary

| Module | Endpoint Count |
|---|---:|
| Auth | 8 |
| Users | 7 |
| Projects | 5 |
| Data (CSV Management) | 7 |
| Dashboards | 13 |
| Sharing | 4 |
| Export | 3 |
| Notifications | 2 |
| Admin — Subscriptions | 4 |
| Admin — Audit Logs | 1 |
| Admin — System Settings | 2 |
| Background Jobs | 1 |
| **Total** | **57** |
```

