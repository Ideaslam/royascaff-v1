# Endpoints — Safqa API · Clients

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-CLIENTS-01 | GET | /api/data/clients | authenticated | list query | paginated | ClientsDataService | done | |
| EP-CLIENTS-02 | GET | /api/data/clients/lite | authenticated | list query | lite[] | ClientsDataService | done | |
| EP-CLIENTS-03 | GET | /api/data/clients/:id | authenticated | param | client | ClientsDataService | done | |
| EP-CLIENTS-04 | POST | /api/data/clients | permission:`client.create` | body: UpsertClientDto | created | ClientsDataService | done | |
| EP-CLIENTS-05 | PATCH | /api/data/clients/:id | permission:`client.edit` + ownership | body | updated | ClientsDataService | done | |
| EP-CLIENTS-06 | POST | /api/data/clients/:id/logo | permission:`client.edit` + ownership | body: base64 | client | ClientsDataService | done | S3 |
| EP-CLIENTS-07 | DELETE | /api/data/clients/:id/logo | permission:`client.edit` + ownership | param | client | ClientsDataService | done | |
| EP-CLIENTS-08 | DELETE | /api/data/clients/:id | permission:`client.delete` + ownership | param | ok | ClientsDataService | done | |
