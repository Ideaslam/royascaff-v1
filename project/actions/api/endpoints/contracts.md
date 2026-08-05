# Endpoints — Safqa API · Contracts

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-CONTRACTS-01 | GET | /api/data/contracts | authenticated | list query | paginated | ContractsDataService | done | |
| EP-CONTRACTS-02 | GET | /api/data/contracts/search | authenticated | search | paginated | ContractsDataService | done | |
| EP-CONTRACTS-03 | GET | /api/data/contracts/:id | authenticated | param | contract | ContractsDataService | done | |
| EP-CONTRACTS-04 | POST | /api/data/contracts | authenticated | body: CreateContractDto | created | ContractsDataService | done | create-from-proposal: `proposal.services` string ids **or** `{ id, … }` line items → SOW/financial; optional `templateId` (defaults to system default `contract_templates` doc), optional `notes` (→ `{{contract_notes}}`) |
| EP-CONTRACTS-05 | PATCH | /api/data/contracts/:id | authenticated | body | updated | ContractsDataService | done | `notes` editable pre-sign (forbidden once signed, same as `contract`/`title`/`endAt`) |
| EP-CONTRACTS-06 | DELETE | /api/data/contracts/:id | authenticated | param | ok | ContractsDataService | done | |
| EP-CONTRACTS-07 | POST | /api/data/contracts/:id/send | authenticated | — | ok | ContractsDataService | done | email |
| EP-CONTRACTS-08 | PATCH | /api/data/contracts/:id/status | authenticated | body: status | updated | ContractsDataService | done | |
| EP-CONTRACTS-09 | POST | /api/data/contracts/:id/upload-signed | authenticated | body: base64 | updated | ContractsDataService | done | S3 |
| EP-CONTRACTS-10 | POST | /api/data/contracts/:id/pdf | authenticated + `OwnershipGuard('contracts')` | — | `{ ok, url }` | ContractPdfService | done | Puppeteer render of stored `contract` HTML → S3 `contracts/{id}/generated/`; read-only export, works on `signed`/locked contracts too |
