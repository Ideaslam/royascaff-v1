# Endpoints — Safqa API · Config

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-CONFIG-01 | GET | /api/data/config | authenticated | — | designStyles, themes, aiProviders, … | ConfigRepository | done | FE bootstrap config |
