# Endpoints — Safqa API · Clients (delta)

## Delta — Auth column after-state for mutations

| ID | Method | Route | Auth (after) | Notes |
|----|--------|-------|--------------|-------|
| EP-CLIENTS-04 | POST | /api/data/clients | permission:client.create | |
| EP-CLIENTS-05 | PATCH | /api/data/clients/:id | permission:client.edit | |
| EP-CLIENTS-06 | POST | /api/data/clients/:id/logo | permission:client.edit | |
| EP-CLIENTS-07 | DELETE | /api/data/clients/:id/logo | permission:client.edit | |
| EP-CLIENTS-08 | DELETE | /api/data/clients/:id | permission:client.delete | |

Reads stay `authenticated`.
