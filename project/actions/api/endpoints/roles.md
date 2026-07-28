# Endpoints — Safqa API · Roles

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-ROLES-01 | POST | /api/data/roles/batch | permission:`roles.manage` | body: BatchRolesDto | result | RolesDataService | done | |
| EP-ROLES-02 | GET | /api/data/roles | authenticated | list query | paginated | RolesDataService | done | |
| EP-ROLES-03 | GET | /api/data/roles/lite | authenticated | list query | lite[] | RolesDataService | done | |
| EP-ROLES-04 | GET | /api/data/roles/:id | authenticated | param | role | RolesDataService | done | |
| EP-ROLES-05 | POST | /api/data/roles | permission:`roles.manage` | body | created | RolesDataService | done | |
| EP-ROLES-06 | PATCH | /api/data/roles/:id | permission:`roles.manage` | body | updated | RolesDataService | done | |
| EP-ROLES-07 | DELETE | /api/data/roles/:id | permission:`roles.manage` | param | ok | RolesDataService | done | |
