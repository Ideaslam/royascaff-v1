# Services — Activity Log

## Module: Activity Log

### SVC-037 · ActivityLogService [domain, internal, Activity Log]

- Methods:
  - `record(actorId, action, entityType, entityId, metadata?): ActivityLog`
  - `list(userId, query): PaginatedResponse` — filter by project, user, entity type; admin sees all
- Deps: `ActivityLogsRepository`, `RolesService`
- Side effects: persistence
- Rules: RULE-014 audit on wallet, role, project, task mutations
