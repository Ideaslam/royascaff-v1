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

## Brand

| Token | Value |
|-------|-------|
| Main color | `#ff6043` |
| Primary color | `#5922ea` |
| Secondary color | `#282828` |
| Product name | Roya AI Dynamo |
