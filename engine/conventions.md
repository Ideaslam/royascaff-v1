# Engine Conventions — Global Defaults

All spec files (endpoints, services, pages, views) inherit these defaults.
A spec only documents a value when it **deviates** from this file.

---

## API Conventions

| Convention | Default |
|------------|---------|
| Route prefix | `/api/v1` |
| Auth model | `JwtAuthGuard` + `RolesGuard` (applied globally) |
| Workspace auth | `WorkspaceRoleGuard` + `@WorkspaceRoles()` (per-endpoint when workspace-scoped) |
| Success envelope | `{ success: true, data: <payload> }` |
| Error envelope | `{ success: false, message: string, error?: string, statusCode: number }` |
| Pagination | `{ data: T[], total: number, page: number, limit: number }` via `PaginationDto` query params `?page=1&limit=20` |
| Validation | `class-validator` DTOs + global `ValidationPipe` (whitelist + forbidNonWhitelisted) |
| Rate limiting | Auth endpoints: 10/min/IP · Data refresh: per subscription tier · All other: 100/min/user |

## Frontend Conventions

| Convention | Default |
|------------|---------|
| API base | `environment.apiUrl` — all HTTP calls go through this, never third-party directly |
| Auth | JWT in `Authorization: Bearer` header via `AuthInterceptor` |
| Loading state | Spinner on async operations |
| Error state | Toast notification on failure (via shared toast service) |
| Success state | Navigates to next route or shows success feedback |
| Empty state | Context-appropriate empty message + optional CTA |
| Guards | `AuthGuard` (redirect to `/auth/login` if unauthenticated) · `GuestGuard` (redirect to `/dashboard` if already logged in) · `AdminGuard` · `WorkspaceGuard` |

## Architecture Conventions

| Convention | Default |
|------------|---------|
| Framework | NestJS (backend) · Angular (frontend) |
| Database | MongoDB with Mongoose ODM |
| Queue | BullMQ (Redis-backed) for all async jobs |
| Caching | Redis (TTL-based) + MongoDB `chartdatacache` for persistent cache |
| Storage | Cloudflare R2 (S3-compatible) via `src/integrations/storage/` |
| AI | Claude via `src/integrations/ai/` (IAIProvider interface) |
| Email | MailJet via `src/integrations/mail/` |
| Payment | PayUp via `src/integrations/payment/` (PaymentProvider interface) |
| Audit | All CRUD + auth events → `auditlogs` via `AuditService` |

## Naming Conventions

| Item | Convention |
|------|-----------|
| Entities | PascalCase singular (`User`, `Project`, `Dashboard`) |
| Collections | lowercase plural (`users`, `projects`, `dashboards`) |
| DTOs | PascalCase + `Dto` suffix (`CreateProjectDto`, `AuthResponseDto`) |
| Services | PascalCase + `Service` (`AuthService`, `ProjectService`) |
| Controllers | PascalCase + `Controller` (`AuthController`) |
| Guards | PascalCase + `Guard` (`JwtAuthGuard`, `WorkspaceRoleGuard`) |
| Modules | PascalCase + `Module` (`AuthModule`) |
| Frontend services | PascalCase + `Service` (`AuthService`, `ProjectApiService`) |
| Frontend components | PascalCase + `Component` (`LoginFormComponent`) |

## Build Status

Every buildable artifact (service, endpoint, page/view) carries a **status** so any reader — human or AI — can tell at a glance what is built, what is half-built, what is only planned, and what was deliberately postponed. This is what lets a model resume work without re-discovering the whole codebase.

### Status Values

| Status | Meaning | When to use |
|--------|---------|-------------|
| `planned` | Specced in the blueprint, **no code yet** | Artifact was designed but implementation hasn't started |
| `partial` | **Code exists but is incomplete** (missing methods, states, validation, or endpoints wired) | Work was started and paused, or only part of the spec is implemented |
| `done` | **Implemented and verified** against its spec | Code exists, compiles, and matches the spec |
| `deferred` | **Intentionally postponed** to a later time | A decision was made to skip this for now — **must include a reason** in Notes |

Rules:
- **Default on creation is `planned`.** A spec written before code always starts `planned`.
- **`deferred` always needs a reason** (e.g. `deferred: post-MVP`, `deferred: waiting on payment provider`). Without a reason, use `planned`.
- **Never delete a `deferred`/`planned` artifact silently** — it is the record of unfinished work. Only remove it via an explicit change or bug fix.
- Status is **maintained in-place** next to the spec; it is never tracked only in a separate log.

### Where status is recorded (single source of truth → summary)

| Level | File | Granularity | Role |
|-------|------|-------------|------|
| Per artifact | `endpoints/<module>.md`, `services/<module>.md`, `pages/<module>.md`, `views/<module>.md` | one status per endpoint / service / page | **source of truth** |
| Per module | each subdirectory's `_index.md` | rolled-up status + `Done/Total` count | fast scan map |
| Whole system | `project/status.md` | per-app + roadmap (In Progress / Next Up / Deferred) | bird's-eye "where are we / what's next" |

### Rollup rule (per-module status in `_index.md`)

- All artifacts `done` → module is `done`
- Any artifact `partial`, or a mix of `done` + `planned` → module is `partial`
- No code started (all `planned`) → module is `planned`
- All remaining work is `deferred` → module is `deferred`

`project/status.md` and each `_index.md` are **summaries** — they must always agree with the per-artifact status in the spec files. History of *what changed* stays in `project/changes/change-log.md`; **status is the current state, not the history.**

## Brand

| Token | Value |
|-------|-------|
| Main color | `#ff6043` |
| Primary color | `#5922ea` |
| Secondary color | `#282828` |
| Product name | Roya AI Dynamo |
