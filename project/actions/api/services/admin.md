# Services — Safqa API · Admin

### SVC-ADMIN-01 · AiJobsAdminService
- Status: cancelled
- Notes: **removed** — admin AI job diagnostics retired; observability via Pipeline Traces / AI Requests. Core `AiJobsService` (`/api/ai-jobs*`) remains for chat.

### SVC-ADMIN-02 · AdminResetService [domain, internal, Admin]
- Status: done
- Methods: wipe workspace data collections
- Deps: multiple repositories
- Side effects: destructive delete
- Rules: requires admin or settings.manage
