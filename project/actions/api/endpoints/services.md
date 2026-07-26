# Endpoints — Safqa API · Services

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-SERVICES-01 | GET | /api/data/services | authenticated | list query | paginated | ServicesDataService | done | |
| EP-SERVICES-02 | GET | /api/data/services/lite | authenticated | list query | lite[] | ServicesDataService | done | |
| EP-SERVICES-03 | GET | /api/data/services/:id | authenticated | param | service | ServicesDataService | done | |
| EP-SERVICES-04 | POST | /api/data/services | authenticated | body | created | ServicesDataService | done | |
| EP-SERVICES-05 | PATCH | /api/data/services/:id | authenticated | body | updated | ServicesDataService | done | |
| EP-SERVICES-06 | DELETE | /api/data/services/:id | authenticated | param | ok | ServicesDataService | done | |
