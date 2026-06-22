# Endpoints

## Short Summary

This file documents every backend HTTP endpoint for **Roya AI Dynamo** as actually implemented in `roya-ai-dynamo-api/src`. Endpoints are grouped by module (NestJS controller).

Global conventions:

- **Route prefix:** every route is served under `/api/v1`. Full paths are written out (e.g. `POST /api/v1/auth/login`).
- **Auth model:** a global `JwtAuthGuard` + `RolesGuard` are applied. Each entry marks access as `public`, `JWT`, or `JWT + role:admin`. `UserRole` enum = `admin | editor | viewer`. Public endpoints opt out via `@Public()`.
- **Success envelope:** successful responses are wrapped by a global interceptor as `{ success: true, data: <payload> }`. Paginated payloads are `{ items, page, limit, total }`.
- **Exceptions to the envelope:** Excel/CSV export endpoints return raw file streams (not wrapped); `204 No Content` endpoints return no body.
- Each entry names the service method it calls and the request DTO/query/params plus response shape.

---

## Module: Auth

`@Controller('auth')`

---

### Endpoint 1

- Name: `Register`
- Method: `POST`
- Route: `/api/v1/auth/register`
- Summary: `Create a new user account with email and password.`

#### Description

Validates email uniqueness, hashes the password, creates the user record, and returns JWT access and refresh tokens.

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `RegisterDto`
  - `name: string - display name (required)`
  - `email: string - unique email address (required)`
  - `password: string - min 8 chars (required)`

#### Return

- Status: `201`
- DTO / Shape: `AuthResponseDto`
- Data:
  - `accessToken: string - JWT access token`
  - `refreshToken: string - refresh token`
  - `user: UserProfileDto - id, name, email, role, languagePreference`

#### Services Called

- `AuthService.register() - creates the user and issues tokens`

#### Constraints / Notes

- Rate limit: 10 requests per minute (`@Throttle`)
- Never returns `passwordHash`

---

### Endpoint 2

- Name: `Login`
- Method: `POST`
- Route: `/api/v1/auth/login`
- Summary: `Authenticate a user with email and password and return JWT tokens.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `LoginDto`
  - `email: string - registered email (required)`
  - `password: string - account password (required)`

#### Return

- Status: `200`
- DTO / Shape: `AuthResponseDto`
- Data:
  - `accessToken: string`
  - `refreshToken: string`
  - `user: UserProfileDto`

#### Services Called

- `AuthService.login() - verifies credentials and issues tokens`

#### Constraints / Notes

- Rate limit: 10 requests per minute (`@Throttle`)
- Returns `401` if email not found or password mismatch

---

### Endpoint 3

- Name: `OAuth Callback`
- Method: `POST`
- Route: `/api/v1/auth/oauth/callback`
- Summary: `OAuth provider callback — currently a stub.`

#### Description

Accepts an OAuth authorization code payload but is **not wired** to `AuthService.oauthLogin`. The handler returns a static message only.

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `OAuthCallbackDto`
  - `provider: string - enum: google, microsoft (required)`
  - `code: string - OAuth authorization code (required)`
  - `redirectUri: string - must match registered redirect (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`
- Data:
  - `message: string - "OAuth flow should be handled via passport redirect"`

#### Services Called

- `none - stub handler; does not invoke AuthService.oauthLogin`

#### Constraints / Notes

- **Partial / stub:** not implemented end-to-end. See Known Gaps.

---

### Endpoint 4

- Name: `Refresh Token`
- Method: `POST`
- Route: `/api/v1/auth/refresh`
- Summary: `Issue a new access token using a valid refresh token.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `RefreshTokenDto`
  - `refreshToken: string - current valid refresh token (required)`

#### Return

- Status: `201`
- DTO / Shape: `{ accessToken: string, refreshToken: string }`
- Data:
  - `accessToken: string - new access token`
  - `refreshToken: string - rotated refresh token`

#### Services Called

- `AuthService.refresh() - validates and rotates the refresh token`

#### Constraints / Notes

- Returns `401` if token is invalid or expired

---

### Endpoint 5

- Name: `Forgot Password`
- Method: `POST`
- Route: `/api/v1/auth/forgot-password`
- Summary: `Send a password reset link to the user's email.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `ForgotPasswordDto`
  - `email: string - registered email (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`
- Data:
  - `message: string - generic success message (prevents email enumeration)`

#### Services Called

- `AuthService.forgotPassword() - generates and emails a reset token`

#### Constraints / Notes

- Rate limit: 10 requests per minute (`@Throttle`)
- Always returns 200 even if the email is unknown

---

### Endpoint 6

- Name: `Reset Password`
- Method: `POST`
- Route: `/api/v1/auth/reset-password`
- Summary: `Apply a new password using a valid reset token.`

#### Auth

- Access: `public`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `ResetPasswordDto`
  - `token: string - reset token from email link (required)`
  - `newPassword: string - new password (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`
- Data:
  - `message: string - "Password reset successful."`

#### Services Called

- `AuthService.resetPassword() - validates the token and updates the password`

---

### Endpoint 7

- Name: `Logout`
- Method: `POST`
- Route: `/api/v1/auth/logout`
- Summary: `Invalidate the user's refresh token and end the session.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `AuthService.logout() - clears the stored refresh token hash`

---

### Endpoint 8

- Name: `Get Current User`
- Method: `GET`
- Route: `/api/v1/auth/me`
- Summary: `Return the authenticated user's JWT payload.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `current user payload`
- Data:
  - `id: string`
  - `email: string`
  - `role: string`

#### Services Called

- `none - returns the request user payload directly`

---

## Module: Users

`@Controller('users')`

---

### Endpoint 9

- Name: `Update Own Profile`
- Method: `PATCH`
- Route: `/api/v1/users/me`
- Summary: `Authenticated user updates their own profile.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `UpdateProfileDto`
  - `name: string (optional)`
  - `languagePreference: string - enum: en, ar (optional)`
  - `avatarUrl: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `UserProfileDto`

#### Services Called

- `UsersService.updateProfile() - updates the current user's profile`

#### Constraints / Notes

- User cannot change their own role here

---

### Endpoint 10

- Name: `Change Password`
- Method: `PATCH`
- Route: `/api/v1/users/me/password`
- Summary: `Authenticated user changes their own password.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `ChangePasswordDto`
  - `currentPassword: string (required)`
  - `newPassword: string (required)`

#### Return

- Status: `200`
- DTO / Shape: `{ message: string }`

#### Services Called

- `UsersService.changePassword() - verifies the current password and updates it`

---

### Endpoint 11

- Name: `List Users`
- Method: `GET`
- Route: `/api/v1/users`
- Summary: `Paginated, searchable list of all users.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `page: number - page number`
  - `limit: number - page size`
  - `search: string - search by name or email`
  - `role: string - filter by role enum`
  - `isActive: boolean - filter by active status`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<UserListItemDto>`
- Data:
  - `items: UserListItemDto[]`
  - `page, limit, total`

#### Services Called

- `UsersService.adminList() - loads paginated, filtered users`

#### Constraints / Notes

- Paginated endpoint
- Never returns `passwordHash` or `refreshTokenHash`

---

### Endpoint 12

- Name: `Get User By ID`
- Method: `GET`
- Route: `/api/v1/users/:id`
- Summary: `Return full user details for the admin edit page.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

#### Services Called

- `UsersService.adminGet() - loads a single user by id`

---

### Endpoint 13

- Name: `Create User`
- Method: `POST`
- Route: `/api/v1/users`
- Summary: `Admin creates a new user account.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreateUserDto`
  - `name: string (required)`
  - `email: string (required)`
  - `password: string (required)`
  - `role: string - enum: admin, editor, viewer (required)`

#### Return

- Status: `201`
- DTO / Shape: `UserDetailsDto`

#### Services Called

- `UsersService.adminCreate() - creates a user with the given role`

---

### Endpoint 14

- Name: `Update User`
- Method: `PUT`
- Route: `/api/v1/users/:id`
- Summary: `Admin updates a user's profile, role, status, or password.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `UpdateUserDto`
  - `name: string (optional)`
  - `email: string (optional)`
  - `role: string (optional)`
  - `isActive: boolean (optional)`
  - `newPassword: string - admin-initiated reset (optional)`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

#### Services Called

- `UsersService.adminUpdate() - applies admin edits to the user`

---

### Endpoint 15

- Name: `Delete User`
- Method: `DELETE`
- Route: `/api/v1/users/:id`
- Summary: `Admin deletes a user and owned data.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `UsersService.adminDelete() - deletes the user and cascades owned data`

---

### Endpoint 16

- Name: `Suspend User`
- Method: `PATCH`
- Route: `/api/v1/users/:id/suspend`
- Summary: `Admin suspends (deactivates) a user account.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

#### Services Called

- `UsersService.suspend() - sets the user inactive`

---

### Endpoint 17

- Name: `Reactivate User`
- Method: `PATCH`
- Route: `/api/v1/users/:id/reactivate`
- Summary: `Admin reactivates a suspended user account.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `UserDetailsDto`

#### Services Called

- `UsersService.reactivate() - sets the user active again`

---

## Module: Projects

`@Controller('projects')`

---

### Endpoint 18

- Name: `Create Project`
- Method: `POST`
- Route: `/api/v1/projects`
- Summary: `Create a new project for the authenticated user.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreateProjectDto`
  - `name: string - max 200 chars (required)`
  - `description: string (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ProjectDto`
- Data:
  - `id, name, description, ownerId, isActive, createdAt, updatedAt`

#### Services Called

- `ProjectsService.create() - creates a project owned by the current user`

---

### Endpoint 19

- Name: `List Projects`
- Method: `GET`
- Route: `/api/v1/projects`
- Summary: `Paginated list of projects visible to the current user.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query:
  - `page: number`
  - `limit: number`
  - `search: string - search by project name`
  - `isActive: boolean`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<ProjectListItemDto>`
- Data:
  - `items: ProjectListItemDto[]`
  - `page, limit, total`

#### Services Called

- `ProjectsService.list() - loads paginated, filtered projects`

#### Constraints / Notes

- Paginated endpoint
- Admin sees all projects; others see only owned projects (enforced in service)

---

### Endpoint 20

- Name: `Get Project`
- Method: `GET`
- Route: `/api/v1/projects/:id`
- Summary: `Return project details.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - project ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `ProjectDetailsDto`

#### Services Called

- `ProjectsService.getById() - loads a single project`

#### Constraints / Notes

- Owner-or-admin access enforced in the service

---

### Endpoint 21

- Name: `Update Project`
- Method: `PUT`
- Route: `/api/v1/projects/:id`
- Summary: `Update project name and description.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - project ObjectId`
- Query: `none`
- Body: `UpdateProjectDto`
  - `name: string (optional)`
  - `description: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `ProjectDto`

#### Services Called

- `ProjectsService.update() - applies edits to the project`

#### Constraints / Notes

- Owner-or-admin access enforced in the service

---

### Endpoint 22

- Name: `Delete Project`
- Method: `DELETE`
- Route: `/api/v1/projects/:id`
- Summary: `Delete a project and its dashboards (cascade).`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - project ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `ProjectsService.delete() - deletes the project and cascades dashboards`

#### Constraints / Notes

- Owner-or-admin access enforced in the service

---

## Module: Data (CSV Management)

`@Controller('data')`

---

### Endpoint 23

- Name: `Upload File (Single-Step)`
- Method: `POST`
- Route: `/api/v1/data/upload/file`
- Summary: `Upload a CSV file directly; backend streams it to storage and queues analysis.`

#### Description

Single-step upload where the frontend sends the file as multipart form-data. Backend streams it to R2, creates the `csvfiles` record, and queues the AI column analysis job.

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `multipart/form-data`
  - `file: binary - CSV file, max 50MB (.csv only)`

#### Return

- Status: `202`
- DTO / Shape: `{ fileId, jobId, status }`
- Data:
  - `fileId: string`
  - `jobId: string - background analysis job id`
  - `status: string - "analyzing"`

#### Services Called

- `DataService.uploadFile() - persists the file and queues analysis`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)
- Rejects non-CSV files and files larger than 50MB (52,428,800 bytes)

---

### Endpoint 24

- Name: `Initiate Upload`
- Method: `POST`
- Route: `/api/v1/data/upload/initiate`
- Summary: `Begin a presigned-URL upload session (legacy flow).`

#### Description

Legacy presigned-URL flow. Creates a `csvfiles` record and returns a presigned upload URL plus an upload session id for direct client-to-R2 upload.

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `InitiateUploadDto`
  - `filename: string (required)`
  - `fileSizeBytes: number (required)`
  - `mimeType: string (required)`

#### Return

- Status: `201`
- DTO / Shape: `{ fileId, uploadUrl, uploadId }`
- Data:
  - `fileId: string`
  - `uploadUrl: string - presigned R2 URL`
  - `uploadId: string - multipart upload session id`

#### Services Called

- `DataService.initiateUpload() - creates the record and presigned URL`

---

### Endpoint 25

- Name: `Complete Upload`
- Method: `POST`
- Route: `/api/v1/data/upload/:fileId/complete`
- Summary: `Confirm a presigned upload completed and queue parsing + analysis.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body: `CompleteUploadDto`
  - `storageKey: string - confirmed R2 object key (required)`

#### Return

- Status: `202`
- DTO / Shape: `{ fileId, jobId, status }`

#### Services Called

- `DataService.completeUpload() - parses rows and queues the analysis job`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)

---

### Endpoint 26

- Name: `List CSV Files`
- Method: `GET`
- Route: `/api/v1/data/files`
- Summary: `Paginated list of CSV files for the current user.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query:
  - `page: number`
  - `limit: number`
  - `search: string - search by filename`
  - `status: string - filter by CsvFileStatus enum`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<CsvFileListItemDto>`
- Data:
  - `items: CsvFileListItemDto[]`
  - `page, limit, total`

#### Services Called

- `DataService.listFiles() - loads paginated, filtered files`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 27

- Name: `Get CSV File`
- Method: `GET`
- Route: `/api/v1/data/files/:fileId`
- Summary: `Return CSV file metadata and its column metadata.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `CsvFileDetailsDto`
- Data:
  - `file metadata`
  - `columns: ColumnMetadataDto[]`

#### Services Called

- `DataService.getFile() - loads the file with its columns`

---

### Endpoint 28

- Name: `Update Column Descriptions`
- Method: `PATCH`
- Route: `/api/v1/data/files/:fileId/columns`
- Summary: `Save user-confirmed column descriptions.`

#### Description

Accepts an array of column updates, setting each column's `userDescription`. When all columns are confirmed, the file becomes eligible for dashboard generation.

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body: `UpdateColumnsDto`
  - `columns: { columnId: string, userDescription: string }[] (required)`

#### Return

- Status: `200`
- DTO / Shape: `CsvFileDetailsDto`

#### Services Called

- `DataService.updateColumns() - persists user column descriptions`

---

### Endpoint 29

- Name: `Delete CSV File`
- Method: `DELETE`
- Route: `/api/v1/data/files/:fileId`
- Summary: `Delete a CSV file, its data rows, and its column metadata.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `delete result (e.g. affected dashboards)`

#### Services Called

- `DataService.deleteFile() - removes the file, rows, and columns`

---

### Endpoint 30

- Name: `Retry Column Analysis`
- Method: `POST`
- Route: `/api/v1/data/files/:fileId/analyze/retry`
- Summary: `Manually retry a failed AI column analysis job.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `fileId: string - csvfiles ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId, status }`

#### Services Called

- `DataService.retryAnalysis() - re-queues the analysis job`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)

---

## Module: Dashboards

`@Controller('dashboards')`

---

### Endpoint 31

- Name: `Create Dashboard`
- Method: `POST`
- Route: `/api/v1/dashboards`
- Summary: `Create a dashboard, link data sources, and trigger AI generation.`

#### Description

Creates the dashboard, links it to one or more confirmed CSV files, queues the AI generation job, and returns the job id.

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreateDashboardDto`
  - `projectId: string (required)`
  - `name: string (required)`
  - `purposeDescription: string - min 10 chars, used as AI context (required)`
  - `fileIds: string[] - confirmed csvfiles IDs (required)`

#### Return

- Status: `202`
- DTO / Shape: `{ dashboardId, jobId, status }`
- Data:
  - `dashboardId: string`
  - `jobId: string`
  - `status: string - "generating"`

#### Services Called

- `DashboardsService.createDashboard() - creates the dashboard and queues generation`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)

---

### Endpoint 32

- Name: `List Dashboards`
- Method: `GET`
- Route: `/api/v1/dashboards`
- Summary: `Paginated list of dashboards for the current user.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query:
  - `projectId: string - filter by project`
  - `page: number`
  - `limit: number`
  - `search: string - search by name`
  - `status: string - filter by DashboardStatus enum`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<DashboardListItemDto>`
- Data:
  - `items: DashboardListItemDto[]`
  - `page, limit, total`

#### Services Called

- `DashboardsService.listDashboards() - loads paginated, filtered dashboards`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 33

- Name: `Get Dashboard`
- Method: `GET`
- Route: `/api/v1/dashboards/:id`
- Summary: `Return full dashboard with widgets and data sources.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `DashboardDetailsDto`
- Data:
  - `dashboard fields`
  - `widgets: ChartWidgetDto[]`
  - `dataSources: CsvFileListItemDto[]`

#### Services Called

- `DashboardsService.getDashboard() - loads the dashboard with widgets and sources`

---

### Endpoint 34

- Name: `Get Dashboard Status`
- Method: `GET`
- Route: `/api/v1/dashboards/:id/status`
- Summary: `Poll the AI generation job status for a dashboard.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

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

#### Services Called

- `DashboardsService.getDashboardStatus() - returns generation progress`

#### Constraints / Notes

- Designed for frontend polling during generation

---

### Endpoint 35

- Name: `Update Dashboard`
- Method: `PATCH`
- Route: `/api/v1/dashboards/:id`
- Summary: `Update dashboard name or purpose description.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `UpdateDashboardDto`
  - `name: string (optional)`
  - `purposeDescription: string (optional)`

#### Return

- Status: `200`
- DTO / Shape: `DashboardDetailsDto`

#### Services Called

- `DashboardsService.updateDashboard() - applies edits to the dashboard`

---

### Endpoint 36

- Name: `Delete Dashboard`
- Method: `DELETE`
- Route: `/api/v1/dashboards/:id`
- Summary: `Delete a dashboard and its widgets, cache, and share links.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `DashboardsService.deleteDashboard() - cascades widgets, cache, and share links`

---

### Endpoint 37

- Name: `Duplicate Dashboard`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/duplicate`
- Summary: `Create a copy of a dashboard within the same project.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - source dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `201`
- DTO / Shape: `DashboardDetailsDto`

#### Services Called

- `DashboardsService.duplicateDashboard() - clones the dashboard and widgets`

---

### Endpoint 38

- Name: `Get Chart Data`
- Method: `GET`
- Route: `/api/v1/dashboards/:id/widgets/:widgetId/data`
- Summary: `Return aggregated chart data for a single widget. Cache-first.`

#### Description

Resolves cached chart data or executes the widget's aggregation pipeline. Supports access via JWT or a share token. Decorated with `@SkipThrottle` because it is called in parallel for all widgets on load.

#### Auth

- Access: `JWT` (or share token via `shareToken` query)
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query:
  - `shareToken: string - optional, for share-link access`
  - `filters: string - optional JSON-encoded filter object`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `aggregation result array` (shape varies by widget type)

#### Services Called

- `DashboardsService.getChartData() - resolves or computes widget data`

#### Constraints / Notes

- `@SkipThrottle` applied
- Returns an empty result structure (not 404) when the aggregation yields zero rows

---

### Endpoint 39

- Name: `Refresh Dashboard Data`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/refresh`
- Summary: `Invalidate widget caches and recalculate aggregations.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId, message }`

#### Services Called

- `DashboardsService.refreshDashboard() - invalidates cache and queues recalculation`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)

---

### Endpoint 40

- Name: `Add Widget`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/widgets`
- Summary: `Manually add a new chart widget to a dashboard.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `CreateWidgetDto`
  - `widgetType: string (required)`
  - `title: string (required)`
  - `position: { x, y, w, h } (required)`
  - `queryDefinition: QueryDefinitionDto (required)`
  - `displayConfig: DisplayConfigDto (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ChartWidgetDto`

#### Services Called

- `DashboardsService.addWidget() - creates a new widget on the dashboard`

---

### Endpoint 41

- Name: `Update Widget`
- Method: `PUT`
- Route: `/api/v1/dashboards/:id/widgets/:widgetId`
- Summary: `Save customizations to a chart widget.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query: `none`
- Body: `UpdateWidgetDto`
  - `widgetType, title, position, queryDefinition, displayConfig (all optional)`

#### Return

- Status: `200`
- DTO / Shape: `ChartWidgetDto`

#### Services Called

- `DashboardsService.updateWidget() - applies edits and invalidates affected cache`

---

### Endpoint 42

- Name: `Delete Widget`
- Method: `DELETE`
- Route: `/api/v1/dashboards/:id/widgets/:widgetId`
- Summary: `Remove a widget from a dashboard and invalidate its cache.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `widgetId: string - chartwidget ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `DashboardsService.deleteWidget() - deletes the widget and clears its cache`

---

### Endpoint 43

- Name: `Retry Dashboard Generation`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/generate/retry`
- Summary: `Manually retry a failed AI dashboard generation job.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId, status }`

#### Services Called

- `DashboardsService.retryGeneration() - re-queues the generation job`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)

---

## Module: Sharing

`@Controller()` (root) — routes declared with full paths

---

### Endpoint 44

- Name: `Create Share Link`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/share`
- Summary: `Generate a shareable link for a dashboard.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `CreateShareLinkDto`
  - `permission: string - enum: view, edit (required)`
  - `viewerCanRefresh: boolean (optional)`
  - `expiresAt: string - ISO date (optional)`

#### Return

- Status: `201`
- DTO / Shape: `ShareLinkCreatedResponse`
- Data:
  - `shareLinkId, shareUrl (raw token returned once), permission, expiresAt`

#### Services Called

- `SharingService.createShareLink() - issues a tokenized share link`

---

### Endpoint 45

- Name: `List Share Links`
- Method: `GET`
- Route: `/api/v1/dashboards/:id/share`
- Summary: `List all share links for a dashboard.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `ShareLinkDto[]`

#### Services Called

- `SharingService.listShareLinks() - lists active and revoked share links`

---

### Endpoint 46

- Name: `Revoke Share Link`
- Method: `DELETE`
- Route: `/api/v1/dashboards/:id/share/:shareLinkId`
- Summary: `Revoke a share link immediately.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
  - `shareLinkId: string - share link ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `SharingService.revokeShareLink() - marks the share link revoked`

---

### Endpoint 47

- Name: `Get Shared Dashboard`
- Method: `GET`
- Route: `/api/v1/shared/:token`
- Summary: `Public — resolve a share token and return the dashboard for a viewer.`

#### Description

Validates the share token, enforces permissions/expiry, and returns the public dashboard with cached chart data. No JWT required.

#### Auth

- Access: `public` (token-based)
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
  - `public dashboard + cached chart data`

#### Services Called

- `SharingService.resolveSharedDashboard() - resolves the token to a viewer payload`

---

## Module: Export

`@Controller('dashboards')`

---

### Endpoint 48

- Name: `Export Dashboard as PDF`
- Method: `POST`
- Route: `/api/v1/dashboards/:id/export/pdf`
- Summary: `Queue a PDF export job and return the job id.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `202`
- DTO / Shape: `{ jobId, message }`

#### Services Called

- `ExportService.requestPdfExport() - queues a PDF export job`

#### Constraints / Notes

- Async endpoint (returns 202 immediately)
- **PDF worker not implemented yet** — the job is queued but not processed. See Known Gaps.

---

### Endpoint 49

- Name: `Export Data as Excel`
- Method: `GET`
- Route: `/api/v1/dashboards/:id/export/excel`
- Summary: `Generate and download an Excel file of widget data.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- Headers: `Content-Disposition: attachment; filename="dashboard-{id}.xlsx"`
- Body: **Raw `.xlsx` binary stream — NOT wrapped in the success envelope**

#### Services Called

- `ExportService.getExcelExport() - builds the xlsx workbook buffer`

#### Constraints / Notes

- Response bypasses the success interceptor (raw file stream)

---

### Endpoint 50

- Name: `Export Data as CSV`
- Method: `GET`
- Route: `/api/v1/dashboards/:id/export/csv`
- Summary: `Download widget data as a CSV file.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - dashboard ObjectId`
- Query:
  - `widgetId: string - widget to export`
- Body: `none`

#### Return

- Status: `200`
- Headers: `Content-Disposition: attachment; filename="widget-{widgetId}.csv"`
- Body: **Raw CSV — NOT wrapped in the success envelope**

#### Services Called

- `ExportService.getCsvExport() - builds the CSV payload`

#### Constraints / Notes

- Response bypasses the success interceptor (raw file stream)

---

## Module: Notifications

`@Controller('notifications')`

---

### Endpoint 51

- Name: `List Notifications`
- Method: `GET`
- Route: `/api/v1/notifications`
- Summary: `Paginated list of notifications for the current user.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query:
  - `page: number`
  - `limit: number`
  - `isRead: boolean`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<NotificationDto>`
- Data:
  - `items: NotificationDto[]`
  - `page, limit, total`

#### Services Called

- `NotificationsService.listNotifications() - loads paginated notifications`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 52

- Name: `Get Unread Count`
- Method: `GET`
- Route: `/api/v1/notifications/unread-count`
- Summary: `Return the count of unread notifications.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `{ unreadCount: number }`

#### Services Called

- `NotificationsService.countUnread() - counts unread notifications`

---

### Endpoint 53

- Name: `Mark Notification as Read`
- Method: `PATCH`
- Route: `/api/v1/notifications/:id/read`
- Summary: `Mark a single notification as read.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params:
  - `id: string - notification ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`

#### Services Called

- `NotificationsService.markAsRead() - marks one notification read`

---

### Endpoint 54

- Name: `Mark All Notifications as Read`
- Method: `PATCH`
- Route: `/api/v1/notifications/read-all`
- Summary: `Mark all of the user's notifications as read.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`

#### Services Called

- `NotificationsService.markAllAsRead() - marks every notification read`

---

## Module: Subscriptions

`@Controller('subscriptions')`

---

### Endpoint 55

- Name: `List Active Plans`
- Method: `GET`
- Route: `/api/v1/subscriptions/plans`
- Summary: `List subscription plans available to subscribers.`

#### Auth

- Access: `JWT` (any role)
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PlanDto[]`

#### Services Called

- `SubscriptionsService.listPlans() - lists active plans`

---

### Endpoint 56

- Name: `List All Plans`
- Method: `GET`
- Route: `/api/v1/subscriptions/plans/all`
- Summary: `List all plans including inactive ones (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PlanDto[]`

#### Services Called

- `SubscriptionsService.listAllPlans() - lists every plan`

---

### Endpoint 57

- Name: `Create Plan`
- Method: `POST`
- Route: `/api/v1/subscriptions/plans`
- Summary: `Create a subscription plan.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreatePlanDto`
  - `name: string (required)`
  - `description: string (optional)`
  - `priceMonthlyUsd: number (required)`
  - `maxDashboards: number (required)`
  - `maxDataUploadsPerMonth: number (required)`
  - `maxDataUpdatesPerMonth: number (required)`
  - `isActive: boolean (optional)`

#### Return

- Status: `201`
- DTO / Shape: `PlanDto`

#### Services Called

- `SubscriptionsService.createPlan() - creates a plan`

---

### Endpoint 58

- Name: `Update Plan`
- Method: `PUT`
- Route: `/api/v1/subscriptions/plans/:id`
- Summary: `Update a subscription plan.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - plan ObjectId`
- Query: `none`
- Body: `UpdatePlanDto`

#### Return

- Status: `200`
- DTO / Shape: `PlanDto`

#### Services Called

- `SubscriptionsService.updatePlan() - applies edits to a plan`

---

### Endpoint 59

- Name: `Delete Plan`
- Method: `DELETE`
- Route: `/api/v1/subscriptions/plans/:id`
- Summary: `Delete a subscription plan.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - plan ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `SubscriptionsService.deletePlan() - deletes a plan`

---

### Endpoint 60

- Name: `Get My Subscription`
- Method: `GET`
- Route: `/api/v1/subscriptions/me`
- Summary: `Return the current user's subscription and usage.`

#### Auth

- Access: `JWT`
- Roles: `N/A`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.getMySubscription() - loads the current user's subscription`

---

### Endpoint 61

- Name: `List Subscriptions`
- Method: `GET`
- Route: `/api/v1/subscriptions`
- Summary: `Paginated list of all subscriptions (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `status: string - filter by SubscriptionStatus enum (optional)`
  - `page: number (optional)`
  - `limit: number (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<SubscriptionListItemDto>`

#### Services Called

- `SubscriptionsService.listSubscriptions() - loads paginated subscriptions`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 62

- Name: `Get Subscription`
- Method: `GET`
- Route: `/api/v1/subscriptions/:id`
- Summary: `Return a single subscription by id (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - subscription ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.getSubscription() - loads one subscription`

---

### Endpoint 63

- Name: `Create Subscription`
- Method: `POST`
- Route: `/api/v1/subscriptions`
- Summary: `Create a subscription record for a user (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreateSubscriptionDto`
  - `userId: string (required)`
  - `planId: string (required)`
  - `startDate: string (required)`
  - `endDate: string (optional)`
  - `status: string (optional)`
  - `notes: string (optional)`

#### Return

- Status: `201`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.createSubscription() - creates a subscription`

---

### Endpoint 64

- Name: `Update Subscription`
- Method: `PUT`
- Route: `/api/v1/subscriptions/:id`
- Summary: `Update a subscription record (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - subscription ObjectId`
- Query: `none`
- Body: `UpdateSubscriptionDto`

#### Return

- Status: `200`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.updateSubscription() - applies edits to a subscription`

---

### Endpoint 65

- Name: `Assign Subscription`
- Method: `POST`
- Route: `/api/v1/subscriptions/assign`
- Summary: `Assign a plan to a user (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `AssignSubscriptionDto`
  - `userId: string (required)`
  - `planId: string (required)`

#### Return

- Status: `201`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.assignSubscription() - assigns the plan to the user`

---

### Endpoint 66

- Name: `Change Subscription`
- Method: `POST`
- Route: `/api/v1/subscriptions/change`
- Summary: `Change a user's plan (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `ChangeSubscriptionDto`
  - `userId: string (required)`
  - `planId: string (required)`

#### Return

- Status: `201`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.changeSubscription() - switches the user's plan`

---

### Endpoint 67

- Name: `Cancel Subscription`
- Method: `PATCH`
- Route: `/api/v1/subscriptions/:userId/cancel`
- Summary: `Cancel a user's subscription (admin).`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `userId: string - target user ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SubscriptionDto`

#### Services Called

- `SubscriptionsService.cancelSubscription() - cancels the user's subscription`

#### Constraints / Notes

- The customer frontend calls `POST /api/v1/subscriptions/subscribe` and `POST /api/v1/subscriptions/cancel`, which **do not exist** on the backend. See Known Gaps.

---

## Module: Payments

`@Controller('payments')` — class-level `@Roles(ADMIN)`

---

### Endpoint 68

- Name: `List Payments`
- Method: `GET`
- Route: `/api/v1/payments`
- Summary: `Paginated, filterable list of payments.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `ListPaymentsQueryDto`
  - `userId: string (optional)`
  - `status: string (optional)`
  - `from: string - ISO date (optional)`
  - `to: string - ISO date (optional)`
  - `page: number (optional)`
  - `limit: number (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<PaymentDto>`

#### Services Called

- `PaymentsService.list() - loads paginated, filtered payments`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 69

- Name: `Get Payment`
- Method: `GET`
- Route: `/api/v1/payments/:id`
- Summary: `Return a single payment by id.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - payment ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `PaymentDto`

#### Services Called

- `PaymentsService.getById() - loads one payment`

---

### Endpoint 70

- Name: `Create Payment`
- Method: `POST`
- Route: `/api/v1/payments`
- Summary: `Record a payment.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `CreatePaymentDto`
  - `userId: string (required)`
  - `subscriptionId: string (optional)`
  - `planId: string (optional)`
  - `amountUsd: number (required)`
  - `currency: string (optional)`
  - `status: string (optional)`
  - `method: string (optional)`
  - `reference: string (optional)`
  - `paidAt: string (optional)`
  - `notes: string (optional)`

#### Return

- Status: `201`
- DTO / Shape: `PaymentDto`

#### Services Called

- `PaymentsService.create() - records a new payment`

---

### Endpoint 71

- Name: `Update Payment`
- Method: `PATCH`
- Route: `/api/v1/payments/:id`
- Summary: `Update a payment record.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - payment ObjectId`
- Query: `none`
- Body: `UpdatePaymentDto`

#### Return

- Status: `200`
- DTO / Shape: `PaymentDto`

#### Services Called

- `PaymentsService.update() - applies edits to a payment`

---

### Endpoint 72

- Name: `Delete Payment`
- Method: `DELETE`
- Route: `/api/v1/payments/:id`
- Summary: `Delete a payment record.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - payment ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `204`

#### Services Called

- `PaymentsService.delete() - deletes a payment`

---

## Module: Audit

`@Controller('audit')` — class-level `@Roles(ADMIN)`

---

### Endpoint 73

- Name: `List Audit Logs`
- Method: `GET`
- Route: `/api/v1/audit`
- Summary: `Paginated, filterable audit log list.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `userId: string (optional)`
  - `action: string - filter by AuditAction enum (optional)`
  - `entityType: string (optional)`
  - `entityId: string (optional)`
  - `from: string - ISO date (optional)`
  - `to: string - ISO date (optional)`
  - `page: number (optional)`
  - `limit: number (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<AuditLogDto>`

#### Services Called

- `AuditLogRepository.findPaginated() - loads paginated, filtered audit logs`

#### Constraints / Notes

- Paginated endpoint
- Read-only; no write/update/delete endpoints for audit logs

---

## Module: Settings

`@Controller('settings')`

---

### Endpoint 74

- Name: `Get Settings`
- Method: `GET`
- Route: `/api/v1/settings`
- Summary: `Return system settings.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `SystemSettingsDto`

#### Services Called

- `SettingsService.getSettings() - loads the system settings`

---

### Endpoint 75

- Name: `Update Settings`
- Method: `PATCH`
- Route: `/api/v1/settings`
- Summary: `Update system settings.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `UpdateSystemSettingsDto`
  - `registrationEnabled: boolean (optional)`
  - `maxFileSizeMb: number (optional)`
  - `defaultMaxDashboards: number (optional)`
  - `supportedLanguages: string[] (optional)`

#### Return

- Status: `200`
- DTO / Shape: `SystemSettingsDto`

#### Services Called

- `SettingsService.updateSettings() - applies edits to the system settings`

---

## Module: Admin

`@Controller('admin')` — class-level `@Roles(ADMIN)`

---

### Endpoint 76

- Name: `Get Overview Stats`
- Method: `GET`
- Route: `/api/v1/admin/overview/stats`
- Summary: `Return admin overview KPI counts.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `{ clients, projects, dashboards, subscriptions, aiCost }`

#### Services Called

- `AdminService.getOverviewStats() - aggregates dashboard KPI counts`

---

## Module: AI Logs

`@Controller('ai-logs')` — class-level `@Roles(ADMIN)`

---

### Endpoint 77

- Name: `List AI Logs`
- Method: `GET`
- Route: `/api/v1/ai-logs`
- Summary: `Paginated, filterable list of AI request logs.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `provider: string (optional)`
  - `model: string (optional)`
  - `status: string - filter by AiLogStatus enum (optional)`
  - `from: string - ISO date (optional)`
  - `to: string - ISO date (optional)`
  - `page: number (optional)`
  - `limit: number (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `Paginated<AiLogDto>`

#### Services Called

- `AiLogRepository.findPaginated() - loads paginated, filtered AI logs`

#### Constraints / Notes

- Paginated endpoint

---

### Endpoint 78

- Name: `AI Cost Summary`
- Method: `GET`
- Route: `/api/v1/ai-logs/cost-summary`
- Summary: `Return aggregated AI cost over a date range.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params: `none`
- Query:
  - `from: string - ISO date (optional)`
  - `to: string - ISO date (optional)`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `AiCostSummaryDto`

#### Services Called

- `AiLogRepository.costSummary() - aggregates cost over the range`

---

### Endpoint 79

- Name: `Get AI Log`
- Method: `GET`
- Route: `/api/v1/ai-logs/:id`
- Summary: `Return a single AI log entry by id.`

#### Auth

- Access: `JWT + role:admin`
- Roles: `admin`

#### Input

- Params:
  - `id: string - AI log ObjectId`
- Query: `none`
- Body: `none`

#### Return

- Status: `200`
- DTO / Shape: `AiLogDto`

#### Services Called

- `AiLogRepository.findById() - loads one AI log (404 if missing)`

---

## Known gaps (frontend expects / backend stub)

- **Auth OAuth callback is a stub** — `POST /api/v1/auth/oauth/callback` accepts the payload but only returns a static message; it is not wired to `AuthService.oauthLogin`.
- **Subscriptions subscribe/cancel not implemented** — the customer frontend calls `POST /api/v1/subscriptions/subscribe` and `POST /api/v1/subscriptions/cancel`, but neither route exists on the backend. The implemented admin flows are `assign`, `change`, and `:userId/cancel`.
- **PDF export has no worker** — `POST /api/v1/dashboards/:id/export/pdf` queues a job, but no worker processes PDF export jobs yet, so the export never completes.

---

## Endpoint Count Summary

| Module | Endpoint Count |
|---|---:|
| Auth | 8 |
| Users | 9 |
| Projects | 5 |
| Data (CSV Management) | 8 |
| Dashboards | 13 |
| Sharing | 4 |
| Export | 3 |
| Notifications | 4 |
| Subscriptions | 13 |
| Payments | 5 |
| Audit | 1 |
| Settings | 2 |
| Admin | 1 |
| AI Logs | 3 |
| **Total** | **79** |
