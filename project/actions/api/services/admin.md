# Services — Safqa API · Admin

### SVC-ADMIN-01 · AiJobsAdminService [domain, internal, Admin]
- Status: done
- Methods: list/get AI jobs for admin diagnostics
- Deps: AiJobsRepository, PermissionChecker
- Side effects: none

### SVC-ADMIN-02 · AdminResetService [domain, internal, Admin]
- Status: done
- Methods: wipe workspace data collections
- Deps: multiple repositories
- Side effects: destructive delete
- Rules: requires admin or settings.manage
