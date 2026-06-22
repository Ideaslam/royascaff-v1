# Services

## Short Summary

This file documents every backend service and integration provider for **Roya AI Dynamo** as actually implemented in `roya-ai-dynamo-api/src`. Services are grouped by module (same module names as `endpoints.md`).

> **App scope:** this is the `backend` app — the single NestJS API (`roya-ai-dynamo-api`) shared by every frontend app. Its companion spec is `endpoints.md` in this same folder. Frontend page specs live per app under `project/actions/<app-key>/` (`customer-portal/pages.md`, `admin-panel/pages.md`).

Global conventions:

- **Architecture:** NestJS with a strict layered flow — controller → service → repository. Controllers never touch repositories or external SDKs directly; they call **internal** services. Internal services own business logic and may call repositories, other internal services, and **external** providers. External providers are integration adapters hidden behind an interface token and stay isolated per `backend-rule.md` (config-driven credentials only).
- **Route prefix:** every HTTP route is served under `/api/v1`. Transport details (method, path) live in `endpoints.md`, not here.
- **Service Type:** `internal` (domain/application logic) or `external` (integration adapter behind an interface). External providers are bound to DI tokens (`AI_PROVIDER`, `MAIL_PROVIDER`, `STORAGE_PROVIDER`, `PAYMENT_PROVIDER`) so the implementation is swappable.
- **Async work:** heavy work (CSV analysis, dashboard generation) runs on BullMQ queues backed by Redis. Queue workers (`@Processor`) are documented under `## Module: AI Processing`.
- **Side effects** (bcrypt hashing, JWT signing, email, file upload/delete, queue enqueue, Redis caching, audit writes) are called out explicitly per service.
- **Auditing:** most write services depend on `AuditLogService`, whose `log()` is fire-and-forget (errors swallowed) so auditing never blocks or fails a request.

---

## Module: Auth

`src/modules/auth/services` + `src/modules/auth/strategies`

---

### Service 1

- Name: `AuthService`
- Type: `internal`
- Module: `Auth`
- Summary: `Owns registration, credential and OAuth login, token rotation, logout, and password reset.`

#### Description

Application service for the entire authentication lifecycle. Verifies credentials, hashes passwords with bcrypt, issues and rotates JWT access/refresh token pairs, persists hashed refresh tokens for session invalidation, and orchestrates welcome and password-reset emails. Controllers call this service; they never access `UserRepository` or `JwtService` directly.

#### Purpose

- Register new users and issue an initial token pair
- Authenticate users by email/password or OAuth provider identity
- Refresh, rotate, and revoke sessions; drive forgot/reset password flows

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `auth`

#### Public Methods

- `register(dto: RegisterDto, ip?: string): Promise<AuthResponseDto> — rejects duplicate email, bcrypt-hashes password, creates an EDITOR user, issues tokens, sends welcome email, audits USER_REGISTER`
- `login(dto: LoginDto, ip?: string): Promise<AuthResponseDto> — validates credentials and active status, updates lastLoginAt, audits USER_LOGIN / USER_LOGIN_FAILED`
- `oauthLogin(provider: string, oauthUserId: string, email: string, name: string, ip?: string): Promise<AuthResponseDto> — finds-or-links-or-creates a user from an OAuth identity and issues tokens (present but the controller OAuth callback is a stub)`
- `refresh(dto: RefreshTokenDto): Promise<{ accessToken; refreshToken }> — verifies refresh JWT, compares against stored hash, issues a new pair`
- `logout(userId: string, ip?: string): Promise<void> — clears the stored refresh-token hash, audits USER_LOGOUT`
- `forgotPassword(email: string): Promise<void> — generates a reset token, stores its hash with 1h expiry, emails a reset link (silent no-op if email unknown)`
- `resetPassword(token: string, newPassword: string): Promise<void> — matches a hashed reset token, sets new password, clears reset fields and refresh hash`
- `toProfileDto(user): UserProfileDto — maps a user document to the safe public profile shape`

#### Dependencies

- Repositories:
  - `UserRepository — user persistence, email/OAuth lookups, reset-token queries`
- Internal Services:
  - `AuditLogService — security audit trail for auth events`
- External Providers:
  - `JwtService (@nestjs/jwt) — signs/verifies access and refresh tokens`
  - `ConfigService — JWT secrets, expiries, frontend URL`
  - `MAIL_PROVIDER — welcome and password-reset emails`

#### Entities / DTOs

- `User — persisted entity (passwordHash, refreshTokenHash, oauthProviders, reset fields)`
- `RegisterDto / LoginDto / RefreshTokenDto — request inputs`
- `AuthResponseDto — { accessToken, refreshToken, user: UserProfileDto }`
- `UserProfileDto — safe public user projection`

#### Business Rules

- Email must be unique; stored lowercased
- New self-registered users default to role `EDITOR`
- Passwords hashed with bcrypt (12 rounds); refresh tokens hashed (10 rounds) before storage
- Inactive accounts cannot log in
- `forgotPassword` never reveals whether an email exists
- Reset tokens are single-use and expire after 1 hour; a successful reset also revokes existing sessions

#### Constraints / Notes

- All methods are `async`
- Side effects: bcrypt hashing, JWT signing, email send (best-effort, `.catch(() => {})`), audit writes
- Token issuance rotates and persists the refresh-token hash on every issue, enabling server-side logout/refresh invalidation

---

### Service 2

- Name: `JwtStrategy`
- Type: `internal`
- Module: `Auth`
- Summary: `Passport JWT strategy that validates access tokens and loads the active user for each request.`

#### Description

Passport strategy registered via `PassportStrategy(Strategy)`. Extracts the bearer token, verifies its signature against the configured JWT secret, then loads the user and confirms they are still active. The returned object becomes `request.user` for the global `JwtAuthGuard`.

#### Purpose

- Authenticate every guarded request from its bearer token
- Reject tokens for missing or deactivated users
- Expose a minimal `{ id, email, role }` principal to guards and controllers

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `auth`

#### Public Methods

- `validate(payload: JwtPayload): Promise<{ id: string; email: string; role: string }> — loads the user by payload.sub, throws UnauthorizedException if missing/inactive, returns the request principal`

#### Dependencies

- Repositories:
  - `UserRepository — loads the user referenced by the token`
- Internal Services:
  - `none`
- External Providers:
  - `ConfigService — JWT verification secret`

#### Entities / DTOs

- `JwtPayload — { sub, email, role } token claims`
- `User — read to confirm existence and active status`

#### Business Rules

- Expired tokens are rejected (`ignoreExpiration: false`)
- A valid signature is not enough — the user must still exist and be active

#### Constraints / Notes

- `validate()` is `async`; runs on every authenticated request (one DB read per request)
- No side effects beyond the read

---

## Module: Users

`src/modules/users/services`

---

### Service 1

- Name: `UsersService`
- Type: `internal`
- Module: `Users`
- Summary: `Self-service profile/password management plus admin user CRUD and account state changes.`

#### Description

Application service for user records beyond auth. Handles a user editing their own profile and password, plus admin operations: paginated listing, fetch, create, update, delete, suspend, and reactivate. Strips all sensitive fields before returning. Reuses `UserRepository` from the Auth module.

#### Purpose

- Let users update their profile and change their password
- Give admins full user lifecycle management
- Suspend/reactivate accounts without deletion

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `updateProfile(userId: string, dto: UpdateProfileDto) — updates own profile, returns sanitized user`
- `changePassword(userId: string, dto: ChangePasswordDto) — verifies current password, sets a new hash, revokes sessions (blocked for OAuth-only accounts)`
- `listUsers(filters): Promise<PaginatedResponseDto> — paginated admin list`
- `getUserById(id: string) — fetch one user (admin), 404 if missing`
- `createUser(dto: CreateUserDto, actorId?, ip?) — admin-creates a user with chosen role, audits USER_REGISTER`
- `updateUser(id: string, dto: UpdateUserDto, actorId?, ip?) — admin-updates name/email/role/isActive/password, audits USER_UPDATE`
- `deleteUser(id: string, actorId?, ip?) — hard-deletes a user, audits USER_DELETE`
- `suspendUser(id, actorId?, ip?) — sets isActive=false, audits USER_SUSPEND`
- `reactivateUser(id, actorId?, ip?) — sets isActive=true, audits USER_REACTIVATE`

#### Dependencies

- Repositories:
  - `UserRepository — user persistence (imported from the Auth module)`
- Internal Services:
  - `AuditLogService — audit trail for admin user actions`
- External Providers:
  - `none`

#### Entities / DTOs

- `User — persisted entity`
- `UpdateProfileDto / ChangePasswordDto / CreateUserDto / UpdateUserDto — inputs`
- `PaginatedResponseDto — list output envelope`

#### Business Rules

- Email stored lowercased; duplicate email on create throws Conflict
- `changePassword` requires a matching current password and is rejected for accounts without a password (OAuth-only)
- Password changes (self or admin) clear the refresh-token hash, forcing re-login
- Never returns `passwordHash`, `refreshTokenHash`, or reset fields (`safeUser` sanitization)

#### Constraints / Notes

- All public methods are `async`
- Side effects: bcrypt hashing, audit writes
- `deleteUser` is a hard delete

---

## Module: Projects

`src/modules/projects/services`

---

### Service 1

- Name: `ProjectsService`
- Type: `internal`
- Module: `Projects`
- Summary: `CRUD for projects (dashboard containers) with owner-or-admin access enforcement.`

#### Description

Domain service for projects, which group dashboards under an owner. Enforces that only the owner or an admin may read or mutate a project; admins see all projects, regular users see only their own in lists.

#### Purpose

- Create and manage projects owned by a user
- Scope project lists to the caller (or all, for admins)
- Guard every read/mutation with owner-or-admin checks

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `create(dto: CreateProjectDto, userId: string, ip?) — creates a project owned by userId, audits PROJECT_CREATE`
- `list(userId: string, userRole: string, filters): Promise<PaginatedResponseDto> — paginated; non-admins scoped to ownerId`
- `getById(id: string, userId: string, userRole: string) — fetch one with owner-or-admin guard`
- `update(id, dto: UpdateProjectDto, userId, userRole, ip?) — guarded update, audits PROJECT_UPDATE`
- `delete(id, userId, userRole, ip?) — guarded delete, audits PROJECT_DELETE`

#### Dependencies

- Repositories:
  - `ProjectRepository — project persistence and pagination`
- Internal Services:
  - `AuditLogService — audit trail`
- External Providers:
  - `none`

#### Entities / DTOs

- `Project — persisted entity (ownerId, name, description)`
- `CreateProjectDto / UpdateProjectDto — inputs`
- `PaginatedResponseDto — list output`

#### Business Rules

- Admins bypass ownership checks; everyone else must own the project (`enforceOwnerOrAdmin`)
- Missing projects throw 404; ownership violations throw 403

#### Constraints / Notes

- All methods are `async`
- Side effects: audit writes

---

## Module: Data (CSV Management)

`src/modules/data/services`

---

### Service 1

- Name: `DataService`
- Type: `internal`
- Module: `Data (CSV Management)`
- Summary: `Manages CSV file uploads (direct and presigned), AI-analysis kickoff, column metadata, and file lifecycle.`

#### Description

Application service for CSV datasets. Supports a one-step server-side upload (multipart buffer → R2) and a two-step presigned-URL flow, then enqueues asynchronous AI column analysis on the `csv-analysis` BullMQ queue. Manages file records, user-edited column metadata, retries, and full cleanup (object storage, column metadata, and the dynamic `csvdata_{fileId}` row collection). Owner-or-admin access is enforced on every file.

#### Purpose

- Upload CSV files and trigger AI column analysis
- Let users review/confirm AI-inferred column descriptions
- Manage file lifecycle: list, fetch, retry analysis, delete with full cleanup

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `uploadFile(file: Express.Multer.File, userId: string, ip?) — validates size, uploads buffer to R2, marks ANALYZING, creates a job + enqueues csv-analysis, audits CSVFILE_UPLOAD_COMPLETE`
- `initiateUpload(dto: InitiateUploadDto, userId, ip?) — creates a file record and returns an R2 presigned URL, audits CSVFILE_UPLOAD`
- `completeUpload(fileId, dto: CompleteUploadDto, userId, ip?) — finalizes a presigned upload, marks ANALYZING, creates a job + enqueues analysis`
- `listFiles(userId, userRole, filters): Promise<PaginatedResponseDto> — paginated; non-admins scoped to ownerId`
- `getFile(fileId, userId, userRole) — returns the file plus its column metadata`
- `updateColumns(fileId, dto: UpdateColumnsDto, userId, userRole) — saves user column descriptions; marks CONFIRMED once none remain unconfirmed`
- `deleteFile(fileId, userId, userRole, ip?) — deletes column metadata, drops the dynamic csvdata_{fileId} collection, deletes the R2 object and record, audits CSVFILE_DELETE`
- `retryAnalysis(fileId, userId, userRole) — clears prior metadata/rows and re-enqueues csv-analysis (only from retryable states)`

#### Dependencies

- Repositories:
  - `CsvFileRepository — CSV file records and status`
  - `ColumnMetadataRepository — per-column inferred/user descriptions`
  - `BackgroundJobRepository — job tracking (via BackgroundJobsService)`
- Internal Services:
  - `BackgroundJobsService — creates job records for analysis`
  - `AuditLogService — audit trail`
- External Providers:
  - `CSV_ANALYSIS_QUEUE (BullMQ Queue) — enqueues async column analysis`
  - `STORAGE_PROVIDER — R2 upload, presigned URL, delete`
  - `Mongo Connection (@InjectConnection) — drops/clears the dynamic csvdata_{fileId} collection`

#### Entities / DTOs

- `CsvFile — file record (storageKey, status, row/column counts)`
- `ColumnMetadata — per-column metadata`
- `InitiateUploadDto / CompleteUploadDto / UpdateColumnsDto — inputs`
- `csvdata_{fileId} — dynamic per-file MongoDB collection of parsed rows`

#### Business Rules

- Max file size 50 MB (`MAX_FILE_SIZE`)
- Status flow: UPLOADING → ANALYZING → ANALYZED → CONFIRMED (or ERROR); dashboards require CONFIRMED files
- Owner-or-admin enforced on read/update/delete/retry
- Delete is destructive and removes storage object, metadata, and the dynamic row collection

#### Constraints / Notes

- All methods are `async`; AI analysis itself runs asynchronously on the queue (see `CsvAnalysisProcessor`)
- Side effects: R2 upload/delete/presign, queue enqueue, dynamic collection drop/clear, audit writes
- Storage and DB cleanup failures during delete are swallowed to keep deletion resilient

---

## Module: AI Processing

`src/modules/ai-processing` — BullMQ workers (no HTTP controller of their own)

---

### Service 1

- Name: `CsvAnalysisProcessor`
- Type: `internal`
- Module: `AI Processing`
- Summary: `BullMQ worker that parses an uploaded CSV, infers columns, calls the AI provider, and persists rows + metadata.`

#### Description

`@Processor('csv-analysis')` worker (extends `WorkerHost`). On each job it downloads the CSV from storage, parses it, infers per-column types and samples, inserts parsed rows into the dynamic `csvdata_{fileId}` collection, asks `AI_PROVIDER` to describe the columns, writes AI descriptions to `ColumnMetadata`, and advances the file and job status with progress checkpoints.

#### Purpose

- Convert a raw uploaded CSV into queryable MongoDB rows
- Infer column types and produce AI-written column descriptions
- Track progress and surface failures on the job record

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `ai`

#### Public Methods

- `process(job: Job<{ fileId; jobId; userId }>): Promise<void> — full pipeline: parse → store rows → AI analyze → persist descriptions → mark ANALYZED / COMPLETED (or ERROR / FAILED on throw)`

#### Dependencies

- Repositories:
  - `CsvFileRepository — file status and row/column counts`
  - `ColumnMetadataRepository — create columns, write AI descriptions`
  - `BackgroundJobRepository — job status/progress updates`
- Internal Services:
  - `none`
- External Providers:
  - `AI_PROVIDER — analyzeColumns()`
  - `STORAGE_PROVIDER — downloads the CSV buffer`
  - `ConfigService — runtime configuration`
  - `Mongo Connection (@InjectConnection) — inserts rows into csvdata_{fileId}`

#### Entities / DTOs

- `CsvFile / ColumnMetadata / BackgroundJob — persisted entities`
- `AiColumnAnalysisInput / AiColumnAnalysisResult — AI contract`
- `csvdata_{fileId} — dynamic per-file row collection (batched 1000-row inserts)`

#### Business Rules

- Sends only column metadata + sample values to the AI — never raw rows
- Rows are inserted only if columns were not already parsed (idempotent re-runs)
- Type inference covers number / boolean / date / string with value coercion
- On error, both the job (FAILED) and file (ERROR) capture the message

#### Constraints / Notes

- `async`; runs out-of-band on the BullMQ worker, not in the request cycle
- Side effects: storage download, AI call, dynamic collection inserts, status updates
- Progress is reported at 5/10/30/40/80/100

---

### Service 2

- Name: `DashboardGenerationProcessor`
- Type: `internal`
- Module: `AI Processing`
- Summary: `BullMQ worker that AI-generates dashboard widgets from confirmed datasources and the widget catalog.`

#### Description

`@Processor('dashboard-generation')` worker (extends `WorkerHost`). Loads the dashboard's datasources (files + column descriptions) and the active widget catalog, asks `AI_PROVIDER.generateDashboard()` for a widget layout, filters results to known widget types, persists the widgets, and marks the dashboard READY (or ERROR on failure).

#### Purpose

- Turn a dashboard purpose + datasources into concrete widgets
- Constrain AI output to the seeded widget catalog
- Persist widgets and finalize dashboard status/layout

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `ai`

#### Public Methods

- `process(job: Job<{ dashboardId; jobId; fileIds; purpose }>): Promise<void> — builds datasource context, loads widget catalog, calls AI, persists valid widgets, marks READY / COMPLETED (or ERROR / FAILED)`

#### Dependencies

- Repositories:
  - `BackgroundJobRepository — job status/progress`
  - `CsvFileRepository — datasource filenames`
  - `ColumnMetadataRepository — column descriptions for prompt context`
  - `DashboardRepository — finalize status/layout`
  - `ChartWidgetRepository — persist generated widgets`
  - `WidgetDefinitionRepository — load the active widget catalog`
- Internal Services:
  - `none`
- External Providers:
  - `AI_PROVIDER — generateDashboard()`

#### Entities / DTOs

- `Dashboard / ChartWidget / WidgetDefinition / BackgroundJob — persisted entities`
- `AiDashboardGenerationInput / AiDashboardGenerationResult — AI contract`

#### Business Rules

- Only widget types present in the catalog are persisted (unknown types dropped)
- Column descriptions prefer userDescription → aiDescription → fallback
- Default layout is 12 columns unless the AI specifies otherwise

#### Constraints / Notes

- `async`; runs on the BullMQ worker
- Side effects: AI call, widget inserts, dashboard status update
- Progress is reported at 5/20/30/80/100

---

### Service 3

- Name: `DashboardGenerationComplete`
- Type: `internal`
- Module: `AI Processing`
- Summary: `Empty stub class — placeholder for post-generation completion handling that is not yet implemented.`

#### Description

Currently an empty exported class with no logic, dependencies, or wiring. Reserved for future post-generation work (e.g. completion notifications or cache warmup) but presently a no-op.

#### Purpose

- Placeholder for future "generation complete" side effects

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `none — empty class`

#### Dependencies

- Repositories:
  - `none`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `none`

#### Business Rules

- None

#### Constraints / Notes

- Not implemented — empty stub (see Implementation gaps)

---

## Module: Dashboards

`src/modules/dashboards/services` + `src/modules/dashboards/seeders`

---

### Service 1

- Name: `DashboardsService`
- Type: `internal`
- Module: `Dashboards`
- Summary: `Owns dashboard lifecycle, widget management, chart-data aggregation/caching, and generation/refresh orchestration.`

#### Description

The largest application service. Creates dashboards (validating confirmed datasources and enqueuing AI generation), manages widgets, and resolves chart data by running MongoDB aggregation pipelines over the dynamic `csvdata_*` collections with a two-tier cache (Redis + a persistent `ChartDataCache`). Also handles duplication, refresh (cache invalidation + recalculation job), and generation retry. Owner-or-admin access is enforced throughout.

#### Purpose

- Create, list, fetch, update, delete, and duplicate dashboards
- Orchestrate async AI generation, refresh, and retry via queues
- Serve cached/aggregated chart data and manage widgets

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `createDashboard(dto: CreateDashboardDto, userId, ip?) — validates unique name + confirmed files, creates datasources, enqueues dashboard-generation, audits DASHBOARD_CREATE`
- `listDashboards(userId, userRole, filters): Promise<PaginatedResponseDto> — paginated; non-admins scoped to ownerId`
- `getDashboard(id, userId, userRole) — returns dashboard with widgets + datasources`
- `getDashboardStatus(id, userId, userRole) — returns status, job status, and progress`
- `updateDashboard(id, dto, userId, userRole, ip?) — guarded update, audits DASHBOARD_UPDATE`
- `deleteDashboard(id, userId, userRole, ip?) — deletes widgets, cache, datasources, dashboard; invalidates Redis; audits DASHBOARD_DELETE`
- `duplicateDashboard(id, userId, userRole, ip?) — deep-copies dashboard + widgets + datasources, audits DASHBOARD_DUPLICATE`
- `getChartData(dashboardId, widgetId, userId, userRole, shareToken?, filtersJson?) — returns aggregated chart data; Redis + DB cache when unfiltered, fresh aggregation when filtered`
- `refreshDashboard(id, userId, userRole, ip?) — clears caches, enqueues cache-recalculation, audits DASHBOARD_REFRESH`
- `addWidget(dashboardId, dto: CreateWidgetDto, userId, userRole, ip?) — adds a widget to a READY dashboard`
- `updateWidget(dashboardId, widgetId, dto: UpdateWidgetDto, userId, userRole, ip?) — updates a widget; invalidates its cache when the query changes`
- `deleteWidget(dashboardId, widgetId, userId, userRole, ip?) — removes a widget and its caches`
- `retryGeneration(id, userId, userRole) — re-enqueues dashboard-generation for an ERROR dashboard`

#### Dependencies

- Repositories:
  - `DashboardRepository — dashboard persistence and name checks`
  - `ChartWidgetRepository — widget persistence`
  - `ChartDataCacheRepository — persistent per-widget chart-data cache`
  - `WidgetDefinitionRepository — widget catalog (read indirectly via generation)`
  - `CsvFileRepository — datasource validation (confirmed status)`
  - `BackgroundJobRepository — job status lookups`
- Internal Services:
  - `BackgroundJobsService — creates generation/recalculation jobs`
  - `AuditLogService — audit trail`
- External Providers:
  - `DASHBOARD_GENERATION_QUEUE / CACHE_RECALCULATION_QUEUE (BullMQ) — enqueue async work`
  - `Redis (ioredis, lazyConnect) — hot chart-data cache (1h TTL)`
  - `ConfigService — Redis connection config`
  - `Mongo Connection (@InjectConnection) — aggregation over csvdata_* collections`
  - `DashboardDatasource model (@InjectModel) — dashboard↔file links`

#### Entities / DTOs

- `Dashboard / ChartWidget / ChartDataCache / DashboardDatasource — persisted entities`
- `CreateDashboardDto / UpdateDashboardDto / CreateWidgetDto / UpdateWidgetDto — inputs`
- `ParsedFilters — internal { match, dateRanges } filter shape`

#### Business Rules

- Dashboard name must be unique within its project
- All datasource CSV files must be CONFIRMED before creation
- Widgets can only be added when the dashboard is READY
- Filtered chart queries bypass persistent caches (always fresh); unfiltered results are cached in Redis (1h) and the DB
- Owner-or-admin enforced on all dashboard operations
- Retry only allowed from ERROR state

#### Constraints / Notes

- All public methods are `async`; generation/refresh complete asynchronously on workers
- Side effects: queue enqueue, Redis read/write/delete, Mongo aggregations, audit writes
- Aggregation failures are caught and return `[]` rather than throwing
- Cache/Redis operations are wrapped in try/catch so cache outages don't break reads

---

### Service 2

- Name: `WidgetDefinitionSeeder`
- Type: `internal`
- Module: `Dashboards`
- Summary: `Startup seeder that upserts the widget catalog (chart/stat/data/media/geo/layout/control types) used by AI generation.`

#### Description

Implements `OnModuleInit`; on application start it upserts the full built-in widget catalog (bar, line, pie, donut, kpi_card, table, scatter, image, area, radar, funnel, heatmap, gauge, sparkline, timeline, map, text, empty_state, filter) into the widget-definition store. This catalog drives and constrains AI dashboard generation.

#### Purpose

- Guarantee the widget catalog exists and is up to date at boot
- Provide the AI with valid widget types, structures, and selection hints

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `onModuleInit(): Promise<void> — upserts every built-in widget definition, logging the count (failures logged, not thrown)`

#### Dependencies

- Repositories:
  - `WidgetDefinitionRepository — upsert widget catalog entries`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `WidgetDefinition — catalog entry (widgetType, displayName, requiredStructure, selectionHints, example, defaultSize)`

#### Business Rules

- Idempotent upsert by widget type — safe to run on every boot

#### Constraints / Notes

- `async` lifecycle hook (runs once at startup)
- Side effects: writes to the widget-definition collection; seeding errors are logged and swallowed

---

## Module: Sharing

`src/modules/sharing/services`

---

### Service 1

- Name: `SharingService`
- Type: `internal`
- Module: `Sharing`
- Summary: `Creates and manages tokenized public share links and resolves shared dashboards for unauthenticated viewers.`

#### Description

Domain service for read-only dashboard sharing. Generates a random share token, stores only its SHA-256 hash, and resolves public access by re-hashing the supplied token. On resolution it enforces revocation/expiry, increments an access counter, and returns the dashboard with each widget's cached chart data.

#### Purpose

- Let owners mint and revoke tokenized share links
- Resolve a shared dashboard publicly without authentication
- Track access counts and enforce expiry/revocation

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `createShareLink(dashboardId, dto: CreateShareLinkDto, userId, ip?) — owner-only; stores SHA-256 token hash, returns the raw share URL once, audits SHARELINK_CREATE`
- `listShareLinks(dashboardId, userId) — owner-only list of a dashboard's links`
- `revokeShareLink(dashboardId, shareLinkId, userId, ip?) — owner-only revoke, audits SHARELINK_REVOKE`
- `resolveSharedDashboard(token: string) — public; validates token/expiry/revocation, increments access count, returns dashboard + widgets with cached data`

#### Dependencies

- Repositories:
  - `ShareLinkRepository — link persistence, token-hash lookup, access increment, revoke`
  - `DashboardRepository — owner checks and dashboard load`
  - `ChartWidgetRepository — widgets for the shared view`
  - `ChartDataCacheRepository — cached chart data per widget`
- Internal Services:
  - `AuditLogService — audit trail`
- External Providers:
  - `ConfigService — frontend URL for share links`

#### Entities / DTOs

- `ShareLink — link record (tokenHash, permission, viewerCanRefresh, expiresAt, status)`
- `CreateShareLinkDto — input`

#### Business Rules

- Only the dashboard owner can create/list/revoke links
- The raw token is returned once at creation; only its SHA-256 hash is persisted
- Revoked links return 410 Gone; expired links return 401 Unauthorized
- Shared views read from cached chart data only (no live aggregation)

#### Constraints / Notes

- All methods are `async`
- Side effects: SHA-256 hashing, access-count increment, audit writes
- `resolveSharedDashboard` is the only public (unauthenticated) entry point

---

## Module: Export

`src/modules/export/services`

---

### Service 1

- Name: `ExportService`
- Type: `internal`
- Module: `Export`
- Summary: `Produces dashboard exports — async PDF (queued), synchronous Excel workbook, and synchronous CSV.`

#### Description

Application service for exporting dashboards. PDF export enqueues a `pdf-export` job (note: no consumer worker is implemented yet). Excel and CSV exports run synchronously: they re-run each widget's aggregation pipeline and stream the result as an ExcelJS workbook buffer or a CSV string. Owner-or-admin access is enforced.

#### Purpose

- Queue PDF export jobs for dashboards
- Generate Excel workbooks (one sheet per widget) on demand
- Generate CSV output for a single widget on demand

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `requestPdfExport(dashboardId, userId, userRole, ip?) — creates a job and enqueues pdf-export, audits EXPORT_PDF (no worker consumes this yet)`
- `getExcelExport(dashboardId, userId, userRole, ip?): Promise<Buffer> — builds an ExcelJS workbook with one sheet per widget, audits EXPORT_EXCEL`
- `getCsvExport(dashboardId, widgetId, userId, userRole, ip?): Promise<string> — returns CSV text for one widget's aggregation, audits EXPORT_CSV`

#### Dependencies

- Repositories:
  - `DashboardRepository — dashboard load and access checks`
  - `ChartWidgetRepository — widgets to export`
- Internal Services:
  - `BackgroundJobsService — creates the PDF export job`
  - `AuditLogService — audit trail`
- External Providers:
  - `PDF_EXPORT_QUEUE (BullMQ) — enqueues async PDF export`
  - `STORAGE_PROVIDER — injected for export artifact storage`
  - `Mongo Connection (@InjectConnection) — re-runs widget aggregations`

#### Entities / DTOs

- `Dashboard / ChartWidget — read for export`
- `Buffer (Excel) / string (CSV) — raw outputs (returned unwrapped by their endpoints)`

#### Business Rules

- Owner-or-admin enforced on all exports
- Excel sheet names are truncated to 31 chars; the `_id` field is excluded from output
- Aggregation failures per widget are swallowed so one bad widget doesn't break the export

#### Constraints / Notes

- `getExcelExport`/`getCsvExport` are `async` but synchronous in effect (return data directly, bypassing the success envelope)
- `requestPdfExport` enqueues work that currently has no worker (see Implementation gaps)
- Side effects: queue enqueue, audit writes

---

## Module: Notifications

`src/modules/notifications/services`

---

### Service 1

- Name: `NotificationsService`
- Type: `internal`
- Module: `Notifications`
- Summary: `Creates in-app notifications (with optional email) and serves the user's notification inbox.`

#### Description

Domain service for user notifications. `notify()` writes a notification record and optionally sends an email; the read methods power the user inbox (list, mark read, mark all read, unread count). Note: `notify()` exists but is not currently invoked by the AI processors, so generation/analysis completion does not yet produce notifications.

#### Purpose

- Persist in-app notifications and optionally email the user
- Serve a paginated notification inbox and unread counts
- Mark notifications read individually or in bulk

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `notify(data): Promise<void> — creates a notification and, if userEmail given, sends an email (best-effort) — currently not called by processors`
- `listNotifications(userId, filters): Promise<PaginatedResponseDto> — paginated inbox`
- `markAsRead(id, userId) — marks one notification read`
- `markAllAsRead(userId) — marks all of a user's notifications read`
- `countUnread(userId) — returns { unreadCount }`

#### Dependencies

- Repositories:
  - `NotificationRepository — notification persistence and queries`
- Internal Services:
  - `none`
- External Providers:
  - `MAIL_PROVIDER — optional email delivery`

#### Entities / DTOs

- `Notification — record (type, title, message, relatedEntity, actionUrl, read state)`
- `NotificationType — enum`
- `PaginatedResponseDto — inbox output`

#### Business Rules

- Email is only sent when `userEmail` is provided; failures are swallowed
- Inbox queries are scoped to the requesting user

#### Constraints / Notes

- All methods are `async`
- Side effects: notification writes, optional email (best-effort)
- `notify()` is wired into endpoints but not yet triggered by background processors (see Implementation gaps)

---

## Module: Subscriptions

`src/modules/subscriptions/services`

---

### Service 1

- Name: `SubscriptionsService`
- Type: `internal`
- Module: `Subscriptions`
- Summary: `Manages subscription plan catalog (admin), per-user subscription assignment/changes/cancellation (admin), and customer self-service subscribe and cancel.`

#### Description

Domain service spanning two concerns: the plan catalog (public active plans + admin CRUD) and user subscriptions (the caller's own subscription, customer self-service subscribe/cancel, plus admin assignment, change, cancel, and full CRUD). The underlying repository also exposes an `incrementUsage` helper, but it is not yet wired into any usage-enforcement flow.

#### Purpose

- Expose active plans publicly and let admins manage the plan catalog
- Assign, change, and cancel user subscriptions (admin)
- Let a user read their own subscription
- Let a user self-subscribe to a plan or self-cancel (customer self-service — change-001)

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `listPlans() — public list of active plans`
- `listAllPlans() — admin list of all plans (incl. inactive)`
- `createPlan(dto: CreatePlanDto) — creates a plan (defaults isActive true)`
- `updatePlan(id, dto: UpdatePlanDto) — updates a plan, 404 if missing`
- `deletePlan(id) — deletes a plan, 404 if missing`
- `getMySubscription(userId) — the caller's current subscription`
- `selfSubscribe(userId, planId, ip?) — customer self-service: subscribes/switches the current user to a plan, audits (change-001)`
- `selfCancel(userId, ip?) — customer self-service: cancels the current user's own subscription, audits (change-001)`
- `listAllSubscriptions(filters) — admin paginated/filterable list of user subscriptions`
- `getSubscriptionById(id) — fetch one subscription, 404 if missing`
- `createSubscription(dto: CreateSubscriptionDto, actorId?, ip?) — validates user + plan, creates/updates a subscription, audits SUBSCRIPTION_ASSIGN`
- `updateSubscription(id, dto: UpdateSubscriptionDto, actorId?, ip?) — updates plan/dates/status/notes, audits SUBSCRIPTION_CHANGE`
- `assignSubscription(userId, planId, actorId?, ip?) — upserts a user's subscription to a plan, audits SUBSCRIPTION_ASSIGN`
- `changeSubscription(userId, planId, actorId?, ip?) — switches a user's plan, audits SUBSCRIPTION_CHANGE`
- `cancelSubscription(userId, actorId?, ip?) — cancels a user's subscription, audits SUBSCRIPTION_CHANGE`
- `selfSubscribe(userId, planId, ip?) — customer self-service: assigns plan to the calling user, audits SUBSCRIPTION_ASSIGN, returns { redirectUrl }` *(added change-001)*
- `selfCancel(userId, ip?) — customer self-service: cancels the calling user's own subscription, audits SUBSCRIPTION_CHANGE, returns { message }` *(added change-001)*

#### Dependencies

- Repositories:
  - `SubscriptionRepository — SubscriptionPlan + UserSubscription persistence (also exposes an unused incrementUsage helper)`
- Internal Services:
  - `AuditLogService — audit trail`
- External Providers:
  - `UserRepository — validates the target user exists (imported from the Auth module)`

#### Entities / DTOs

- `SubscriptionPlan — plan catalog entity`
- `UserSubscription — per-user subscription (status, dates, notes)`
- `CreatePlanDto / UpdatePlanDto / CreateSubscriptionDto / UpdateSubscriptionDto / AssignSubscriptionDto / ChangeSubscriptionDto — admin inputs`
- `SelfSubscribeDto { planId: string } — customer self-subscribe input` *(added change-001)*
- `SubscriptionStatus — enum`

#### Business Rules

- Plan and user existence are validated before assignment/creation
- `assign`/`change` upsert a single subscription per user
- Public plan listing returns only active plans

#### Constraints / Notes

- All methods are `async`
- Side effects: audit writes
- `SubscriptionRepository.incrementUsage` is implemented but not wired to any quota enforcement (see Implementation gaps)

---

## Module: Payments

`src/modules/payments/services`

---

### Service 1

- Name: `PaymentsService`
- Type: `internal`
- Module: `Payments`
- Summary: `Admin manual payment ledger — record and manage payment entries (not a gateway checkout flow).`

#### Description

Domain service implementing a manual payment ledger for admins. Supports listing (filterable), fetch, create, update, and delete of payment records. It is not connected to any payment gateway or webhook — the `PAYMENT_PROVIDER` stub is not consumed here.

#### Purpose

- Record manual payments against users/subscriptions/plans
- List and filter payments for admin reconciliation
- Update or delete ledger entries

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `payment`

#### Public Methods

- `list(filters): Promise<paginated> — filterable by user/status/date range, paginated`
- `getById(id) — fetch one payment, 404 if missing`
- `create(data, actorId?, ip?) — records a manual payment, audits PAYMENT_CREATE`
- `update(id, data, actorId?, ip?) — updates ledger fields, audits PAYMENT_UPDATE`
- `delete(id, actorId?, ip?) — deletes a payment, audits PAYMENT_DELETE`

#### Dependencies

- Repositories:
  - `PaymentRepository — payment ledger persistence and pagination`
- Internal Services:
  - `AuditLogService — audit trail`
- External Providers:
  - `none (PAYMENT_PROVIDER stub is not used here)`

#### Entities / DTOs

- `Payment — ledger entry (amountUsd, currency, status, method, reference, paidAt, notes)`
- `PaymentStatus — enum`

#### Business Rules

- Manual, admin-driven ledger; defaults currency USD and status PENDING
- No gateway validation or webhook processing

#### Constraints / Notes

- All methods are `async`
- Side effects: audit writes
- Decoupled from `PAYMENT_PROVIDER` (see Implementation gaps)

---

## Module: Audit

`src/modules/audit/services`

---

### Service 1

- Name: `AuditLogService`
- Type: `internal`
- Module: `Audit`
- Summary: `Global fire-and-forget audit logger used by nearly every write service.`

#### Description

A `@Global` application service exposing a single `log()` method that persists an audit entry. Failures are intentionally swallowed so audit writes never block or fail the originating business operation.

#### Purpose

- Provide a single, app-wide audit-write entry point
- Guarantee auditing never breaks the primary request

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `log(dto: CreateAuditLogDto): Promise<void> — writes an audit entry; errors caught and ignored`

#### Dependencies

- Repositories:
  - `AuditLogRepository — audit-log persistence`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `AuditLog — persisted entry (userId, action, entityId, ipAddress, details)`
- `CreateAuditLogDto — input`
- `AuditAction — enum of audit actions`

#### Business Rules

- Audit writes are best-effort and must never propagate errors to callers

#### Constraints / Notes

- `async`, globally available (no per-module import needed)
- Side effect: a single DB write per call, error-swallowed

---

## Module: Settings

`src/modules/settings/services`

---

### Service 1

- Name: `SettingsService`
- Type: `internal`
- Module: `Settings`
- Summary: `Reads and updates the single global system-settings document.`

#### Description

Domain service for the application's global settings singleton. Returns the current settings and applies admin updates, auditing each change.

#### Purpose

- Expose the global system settings
- Apply and audit admin settings changes

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `getSettings() — returns the global settings singleton`
- `updateSettings(dto: UpdateSystemSettingsDto, actorId?, ip?) — updates global settings, audits SETTINGS_UPDATE`

#### Dependencies

- Repositories:
  - `SettingsRepository — global settings persistence (singleton)`
- Internal Services:
  - `AuditLogService — audit trail`
- External Providers:
  - `none`

#### Entities / DTOs

- `SystemSettings — global singleton entity`
- `UpdateSystemSettingsDto — input`

#### Business Rules

- Operates on a single global settings document

#### Constraints / Notes

- Both methods are `async`
- Side effects: audit write on update

---

## Module: Admin

`src/modules/admin`

---

### Service 1

- Name: `AdminService`
- Type: `internal`
- Module: `Admin`
- Summary: `Computes the admin overview dashboard — parallel entity counts plus a 30-day AI cost summary.`

#### Description

Application service for the admin overview. Runs counts (clients, active clients, projects, dashboards, active subscriptions, new clients this month) and a 30-day AI cost summary in parallel and assembles a single stats payload. Reads models/repositories directly for aggregation efficiency.

#### Purpose

- Provide the admin home with high-level platform metrics
- Surface 30-day AI spend and call volume

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `getOverviewStats() — returns clients/projects/dashboards/subscriptions counts and a 30-day AI cost summary (totals + per-day breakdown)`

#### Dependencies

- Repositories:
  - `AiLogRepository — 30-day AI cost summary`
  - `SubscriptionRepository — active subscription count`
- Internal Services:
  - `none`
- External Providers:
  - `User / Project / Dashboard models (@InjectModel) — parallel countDocuments queries`

#### Entities / DTOs

- `User / Project / Dashboard — counted entities`
- `Overview stats payload — { clients, projects, dashboards, subscriptions, aiCost }`

#### Business Rules

- "This month" / cost window is the trailing 30 days
- All counts and the cost summary are gathered with `Promise.all` for latency

#### Constraints / Notes

- `async`, read-only; admin-guarded at the controller
- No side effects

---

## Module: Background Jobs

`src/modules/background-jobs/services`

---

### Service 1

- Name: `BackgroundJobsService`
- Type: `internal`
- Module: `Background Jobs`
- Summary: `Global helper to create job records and read job status; registers the app's BullMQ queues.`

#### Description

A `@Global` application service that creates `BackgroundJob` tracking records (consumed by Data, Dashboards, and Export) and returns job status with owner-or-admin access checks. The module registers the four BullMQ queues used across the app: `csv-analysis`, `dashboard-generation`, `pdf-export`, and `cache-recalculation` (the last two currently have no worker).

#### Purpose

- Create job records that pair with enqueued BullMQ jobs
- Let callers poll job status safely (owner-or-admin)
- Centralize queue registration

#### Type Details

- Category: `application`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `getJobStatus(jobId, userId, userRole) — returns the job; 404 if missing, 403 unless owner or admin`
- `createJob(ownerId, type: JobType, entityType?, entityId?) — creates a job tracking record`

#### Dependencies

- Repositories:
  - `BackgroundJobRepository — job record persistence`
- Internal Services:
  - `none`
- External Providers:
  - `BullMQ queues (registered at module level): csv-analysis, dashboard-generation, pdf-export, cache-recalculation`

#### Entities / DTOs

- `BackgroundJob — job record (ownerId, type, status, progress, errorMessage)`
- `JobType / JobStatus — enums`

#### Business Rules

- Non-admins may only read their own jobs

#### Constraints / Notes

- `async`, globally available
- `pdf-export` and `cache-recalculation` queues are registered but have no consumer worker (see Implementation gaps)

---

## Module: AI Logs

`src/integrations/ai/repositories` + `src/integrations/ai/seeders` — exposed via the admin `ai-logs` endpoints

---

### Service 1

- Name: `AiLogRepository`
- Type: `internal`
- Module: `AI Logs`
- Summary: `Persists and queries AI request logs; computes cost/usage summaries.`

#### Description

Repository for AI request logging. The `AnthropicProvider` writes a pending log before each call and finalizes it after; admin `ai-logs` endpoints read paginated logs and cost summaries; `AdminService` uses its cost summary for the overview. (Documented here because the AI Logs module is repository-driven with no dedicated service layer.)

#### Purpose

- Record every AI call with prompt, response, tokens, cost, and status
- Serve paginated, filterable AI logs to admins
- Aggregate cost/usage by totals, day, and model

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `ai`

#### Public Methods

- `create(data: CreateAiLogData): Promise<AiLogDocument> — inserts an AI log (often PENDING) and returns it`
- `updateById(id, data: UpdateAiLogData): Promise<void> — finalizes a log with response/tokens/cost/status`
- `findById(id) — fetch one log`
- `findPaginated(filters) — paginated logs filtered by provider/model/status/date`
- `costSummary(filters) — totals, per-day, and per-model cost/usage aggregations`

#### Dependencies

- Repositories:
  - `none (is a repository)`
- Internal Services:
  - `none`
- External Providers:
  - `AiLog model (@InjectModel) — MongoDB persistence and aggregation`

#### Entities / DTOs

- `AiLog — log entry (provider, model, method, tokens, costUsd, durationMs, status)`
- `CreateAiLogData / UpdateAiLogData — inputs`
- `AiLogStatus — enum (PENDING/SUCCESS/FAILED)`

#### Business Rules

- A pending log is created before each AI call so stuck/in-flight calls are visible
- Cost summaries default to zeroed totals when no data matches

#### Constraints / Notes

- `async`; read by admin `ai-logs` endpoints and `AdminService`
- Side effects: DB writes/aggregations

---

### Service 2

- Name: `AiModelPricingRepository`
- Type: `internal`
- Module: `AI Logs`
- Summary: `Stores and resolves per-model token pricing used to compute AI call costs.`

#### Description

Repository for AI model pricing. The `AnthropicProvider` looks up pricing by provider+model to compute `costUsd` for each logged call; admin endpoints may list/maintain pricing.

#### Purpose

- Resolve input/output per-million-token pricing for a model
- Maintain (upsert) and list the pricing catalog

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `ai`

#### Public Methods

- `findByModelId(provider, modelId): Promise<AiModelPricing | null> — active pricing for a model`
- `upsert(data): Promise<void> — inserts or updates a pricing record`
- `findAll(): Promise<AiModelPricing[]> — all pricing records, sorted`

#### Dependencies

- Repositories:
  - `none (is a repository)`
- Internal Services:
  - `none`
- External Providers:
  - `AiModelPricing model (@InjectModel) — MongoDB persistence`

#### Entities / DTOs

- `AiModelPricing — pricing record (provider, modelId, input/output price per M token, isActive)`

#### Business Rules

- Only active pricing is resolved for cost calculation
- Missing pricing results in a `costUsd` of 0 (with a warning logged by the provider)

#### Constraints / Notes

- `async`; supports cost computation and admin pricing maintenance

---

### Service 3

- Name: `AiModelPricingSeeder`
- Type: `internal`
- Module: `AI Logs`
- Summary: `Startup seeder that upserts a baseline catalog of Anthropic model pricing.`

#### Description

Implements `OnModuleInit`; on boot it upserts a fixed list of Anthropic model prices (Claude 3/3.5 and Claude 4.5 families) so cost calculation has data immediately.

#### Purpose

- Ensure baseline model pricing exists at startup
- Keep AI cost computation accurate out of the box

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `ai`

#### Public Methods

- `onModuleInit(): Promise<void> — upserts each baseline Anthropic pricing record (failures logged, not thrown)`

#### Dependencies

- Repositories:
  - `AiModelPricingRepository — upsert pricing records`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `AiModelPricing — seeded pricing records`

#### Business Rules

- Idempotent upsert by provider+modelId — safe to run on every boot

#### Constraints / Notes

- `async` lifecycle hook (runs once at startup)
- Side effect: writes pricing records; errors logged and swallowed

---

## Integration Providers (External)

These are integration adapters bound to DI tokens behind interfaces. Internal services depend on the token (never the concrete class), so providers are swappable and isolated. Credentials always come from `ConfigService` (environment), never hardcoded.

---

### Service 1

- Name: `AnthropicProvider`
- Type: `external`
- Module: `Integration Providers`
- Summary: `Anthropic AI adapter (bound to AI_PROVIDER) for column analysis and dashboard generation, with full call logging and cost tracking.`

#### Description

Implements the provider-agnostic `AiProvider` interface and is bound to the `AI_PROVIDER` token. Wraps the Anthropic SDK, builds prompts for column analysis and dashboard generation, parses the JSON responses, and logs every call (prompt, response, tokens, duration, cost, status) via `AiLogRepository` + `AiModelPricingRepository`.

#### Purpose

- Generate human-readable column descriptions from CSV metadata
- Generate a constrained dashboard widget layout from datasources + catalog
- Log and cost every AI call for observability

#### Type Details

- Category: `integration`
- Provider: `Anthropic (Claude)`
- Capability: `ai`

#### Public Methods

- `analyzeColumns(input: AiColumnAnalysisInput, jobId?): Promise<AiColumnAnalysisResult> — prompts the model for per-column descriptions, parses JSON`
- `generateDashboard(input: AiDashboardGenerationInput, jobId?): Promise<AiDashboardGenerationResult> — prompts the model to assemble widgets from the catalog, parses JSON`

#### Dependencies

- Repositories:
  - `AiLogRepository — pending + finalized call logs`
  - `AiModelPricingRepository — per-model cost lookup`
- Internal Services:
  - `none`
- External Providers:
  - `Anthropic SDK — chat/messages API`
  - `ConfigService — ANTHROPIC_API_KEY (ai.apiKey), AI_MODEL (ai.model), AI_MAX_TOKENS (ai.maxTokens)`

#### Entities / DTOs

- `AiColumnAnalysisInput / AiColumnAnalysisResult — column-analysis contract`
- `AiDashboardGenerationInput / AiDashboardGenerationResult — dashboard-generation contract`
- `AiLog / AiModelPricing — logging + cost entities`

#### Business Rules

- Prompts forbid using raw data rows — only column metadata and sample values
- Responses must be valid JSON; non-JSON throws a descriptive error and is logged FAILED
- Cost is computed from token usage × resolved pricing (0 if pricing missing)

#### Constraints / Notes

- External provider — only called by internal services/processors via `AI_PROVIDER`, never controllers
- All methods are `async`; provider-agnostic so a different LLM vendor can be swapped behind the same token
- Side effects: outbound AI API calls and AI-log writes

---

### Service 2

- Name: `MailjetProvider`
- Type: `external`
- Module: `Integration Providers`
- Summary: `Mailjet email adapter (bound to MAIL_PROVIDER) for transactional email.`

#### Description

Implements the `MailProvider` interface and is bound to the `MAIL_PROVIDER` token. Wraps the Mailjet SDK to send transactional emails (welcome, password reset, notifications) using a configured from-address.

#### Purpose

- Send transactional emails behind a vendor-agnostic interface
- Centralize from-address and credential configuration

#### Type Details

- Category: `integration`
- Provider: `Mailjet`
- Capability: `email`

#### Public Methods

- `send(options: SendMailOptions): Promise<void> — sends an email (to, subject, htmlBody, optional textBody); logs and rethrows on failure`

#### Dependencies

- Repositories:
  - `none`
- Internal Services:
  - `none`
- External Providers:
  - `Mailjet SDK — send API`
  - `ConfigService — MAILJET_* credentials and from email/name (mail.apiKey, mail.apiSecret, mail.fromEmail, mail.fromName)`

#### Entities / DTOs

- `SendMailOptions — { to, subject, htmlBody, textBody? }`

#### Business Rules

- Sender identity comes from config only

#### Constraints / Notes

- External provider — called only by internal services (`AuthService`, `NotificationsService`) via `MAIL_PROVIDER`
- `async`; throws on send failure (callers typically wrap in best-effort `.catch`)
- Side effect: outbound email

---

### Service 3

- Name: `R2StorageProvider`
- Type: `external`
- Module: `Integration Providers`
- Summary: `Cloudflare R2 (S3-compatible) object storage adapter (bound to STORAGE_PROVIDER) for CSV files.`

#### Description

Implements the `StorageProvider` interface and is bound to the `STORAGE_PROVIDER` token. Uses the AWS S3 SDK against Cloudflare R2 to upload, presign, download, and delete objects (primarily uploaded CSV files).

#### Purpose

- Upload CSV buffers server-side to object storage
- Generate presigned URLs for client-direct flows
- Download objects for processing and delete on cleanup

#### Type Details

- Category: `integration`
- Provider: `Cloudflare R2 (S3-compatible)`
- Capability: `storage`

#### Public Methods

- `upload(options: UploadFileOptions): Promise<string> — puts an object, returns its key`
- `getPresignedUrl(options: PresignedUrlOptions): Promise<string> — short-lived signed URL (default 1h)`
- `delete(key: string): Promise<void> — removes an object`
- `download(key: string): Promise<Buffer> — streams an object into a Buffer`

#### Dependencies

- Repositories:
  - `none`
- Internal Services:
  - `none`
- External Providers:
  - `AWS S3 SDK (S3Client, presigner) — object operations against R2`
  - `ConfigService — R2_* settings (storage.bucketName, storage.endpoint, storage.accessKeyId, storage.secretAccessKey)`

#### Entities / DTOs

- `UploadFileOptions — { key, body, contentType }`
- `PresignedUrlOptions — { key, expiresInSeconds? }`

#### Business Rules

- Bucket and credentials come from config only; region fixed to `auto` for R2

#### Constraints / Notes

- External provider — called only by `DataService`, `ExportService`, and `CsvAnalysisProcessor` via `STORAGE_PROVIDER`
- All methods are `async`; S3-compatible, so swapping to AWS S3/MinIO requires only config + token rebinding
- Side effects: network object operations

---

### Service 4

- Name: `DefaultPaymentProvider`
- Type: `external`
- Module: `Integration Providers`
- Summary: `Stub payment adapter (bound to PAYMENT_PROVIDER) — no real gateway integration; currently unused.`

#### Description

Implements the `PaymentProvider` interface and is bound to the global `PAYMENT_PROVIDER` token, but is a no-op stub: signature validation always returns false and webhook processing does nothing. The Payments module operates as a manual ledger and does not consume this provider.

#### Purpose

- Reserve the integration seam for a future payment gateway
- Provide a safe default so DI resolves while no gateway is configured

#### Type Details

- Category: `integration`
- Provider: `N/A (stub)`
- Capability: `payment`

#### Public Methods

- `validateWebhookSignature(payload: Buffer, signature: string): boolean — always returns false (stub)`
- `processWebhookEvent(event: any): Promise<void> — no-op (stub)`

#### Dependencies

- Repositories:
  - `none`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `none`

#### Business Rules

- No real signature verification or event handling implemented

#### Constraints / Notes

- External provider stub — bound globally but not injected anywhere (see Implementation gaps)
- `processWebhookEvent` is `async`; no side effects

---

### Service 5

- Name: `OAuth (Google / Microsoft)`
- Type: `external`
- Module: `Integration Providers`
- Summary: `Partially implemented OAuth login — config and provider linking exist, but there is no integration adapter and the callback is a stub.`

#### Description

There is no `integrations/oauth` adapter folder. OAuth configuration lives in `src/config` (`GOOGLE_*`, `MICROSOFT_*`) and the linking logic lives in the Auth module (`AuthService.oauthLogin` plus `UserRepository.findByOAuthProvider` and the user's `oauthProviders`). However, the OAuth controller callback is a stub, so the end-to-end flow is not wired.

#### Purpose

- Allow sign-in/linking via Google and Microsoft identities (intended)
- Reuse `AuthService.oauthLogin` to find-or-link-or-create users

#### Type Details

- Category: `integration`
- Provider: `Google, Microsoft`
- Capability: `auth`

#### Public Methods

- `none dedicated — relies on AuthService.oauthLogin(provider, oauthUserId, email, name, ip?)`

#### Dependencies

- Repositories:
  - `UserRepository — OAuth identity lookup/linking (via AuthService)`
- Internal Services:
  - `AuthService — oauthLogin token issuance`
- External Providers:
  - `ConfigService — GOOGLE_* / MICROSOFT_* client config (src/config)`

#### Entities / DTOs

- `User.oauthProviders — linked provider identities`

#### Business Rules

- An OAuth identity links to an existing email if present, otherwise creates a new EDITOR user

#### Constraints / Notes

- Partially implemented: no dedicated integration adapter; the controller OAuth callback is a stub (see Implementation gaps)

---

## Implementation gaps vs. plan

The following are documented as implemented-but-incomplete relative to the intended design:

- **PDF export has no worker.** `ExportService.requestPdfExport` enqueues `pdf-export` and `BackgroundJobsService` registers the queue, but no `@Processor('pdf-export')` consumer exists — jobs are created and never processed.
- **Cache recalculation has no worker.** `DashboardsService.refreshDashboard` enqueues `cache-recalculation` and the queue is registered, but there is no `@Processor('cache-recalculation')` consumer.
- **OAuth callback is a stub.** `AuthService.oauthLogin` and provider linking exist, but the controller OAuth callback is not implemented and there is no `integrations/oauth` adapter — the end-to-end OAuth flow is not wired.
- **PAYMENT_PROVIDER is unused.** `DefaultPaymentProvider` is a no-op stub (`validateWebhookSignature` always false, `processWebhookEvent` no-op) and is not injected anywhere; the Payments module is a manual admin ledger only.
- **NotificationsService.notify is not wired to processors.** The method (and optional email) exists, but the CSV-analysis and dashboard-generation processors do not call it, so completion/failure events do not currently produce notifications.
- **SubscriptionRepository.incrementUsage is not wired.** A usage-increment helper exists on the repository but no usage-enforcement / quota flow calls it.
- **DashboardGenerationComplete is an empty stub.** The class exists with no logic, dependencies, or wiring — reserved for future post-generation handling.
