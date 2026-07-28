# Endpoints — Safqa API · Permissions

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PERMS-01 | GET | /api/data/permissions | authenticated | list query | paginated | PermissionsDataService | done | |
| EP-PERMS-02 | GET | /api/data/permissions/by-key/:key | authenticated | param | permission | PermissionsDataService | done | |
| EP-PERMS-03 | GET | /api/data/permissions/:id | authenticated | param | permission | PermissionsDataService | done | |
| EP-PERMS-04 | POST | /api/data/permissions | permission:`roles.manage` | body | created | PermissionsDataService | done | |
| EP-PERMS-05 | PATCH | /api/data/permissions/:id | permission:`roles.manage` | body | updated | PermissionsDataService | done | |
| EP-PERMS-06 | DELETE | /api/data/permissions/:id | permission:`roles.manage` | param | ok | PermissionsDataService | done | |
