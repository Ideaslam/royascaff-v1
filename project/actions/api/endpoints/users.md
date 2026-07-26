# Endpoints — Safqa API · Users

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-USERS-01 | GET | /api/data/user | authenticated | list query | paginated | UserDataService | done | |
| EP-USERS-02 | GET | /api/data/user/lookup | authenticated | ?uid,?email | user | UserDataService | done | |
| EP-USERS-03 | GET | /api/data/user/lite | authenticated | list query | lite[] | UserDataService | done | |
| EP-USERS-04 | GET | /api/data/user/:id | authenticated | param | user | UserDataService | done | |
| EP-USERS-05 | POST | /api/data/user | permission:user.create | body: UpsertUserDto | created | UserDataService | done | |
| EP-USERS-06 | PATCH | /api/data/user/:id | permission:user.edit | body: PatchUserDto | updated | UserDataService | done | |
| EP-USERS-07 | DELETE | /api/data/user/:id | permission:user.delete | param | 204/ok | UserDataService | done | |
