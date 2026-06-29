## Module: Audit Logs

### Audit Log Page
- Route: `/app/audit`
- Components: AuditPage (filter bar with userId/action/entityType/entityId/from/to, audit table with actor/action/entity/time)
- Service: AuditService.list() → `GET /api/v1/audit`
- Guard: authGuard + adminGuard
- Notes: Read-only; audit entries are immutable.
