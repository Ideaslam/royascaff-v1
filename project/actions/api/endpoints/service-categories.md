# Endpoints — Safqa API · Service Categories

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-SVCCAT-01 | GET | /api/data/service-categories | authenticated | list query | paginated | ServiceCategoriesDataService | done | |
| EP-SVCCAT-02 | GET | /api/data/service-categories/lite | authenticated | list query | lite[] | ServiceCategoriesDataService | done | |
| EP-SVCCAT-03 | GET | /api/data/service-categories/:id | authenticated | param | category | ServiceCategoriesDataService | done | |
| EP-SVCCAT-04 | POST | /api/data/service-categories | authenticated | body | created | ServiceCategoriesDataService | done | |
| EP-SVCCAT-05 | PATCH | /api/data/service-categories/:id | authenticated | body | updated | ServiceCategoriesDataService | done | |
| EP-SVCCAT-06 | DELETE | /api/data/service-categories/:id | authenticated | param | ok | ServiceCategoriesDataService | done | |
