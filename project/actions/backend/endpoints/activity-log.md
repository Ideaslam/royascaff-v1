# Endpoints — Activity Log

## Module: Activity Log

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-098 | GET | /activity | authenticated | `?projectId,userId,entityType,page,limit` | `200 PaginatedActivityLogs` | `ActivityLogService.list()` | admin unscoped |
| EP-099 | GET | /projects/:projectId/activity | authenticated | `param: projectId, ?page,limit` | `200 PaginatedActivityLogs` | `ActivityLogService.list()` | project scoped |
