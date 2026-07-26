# Endpoints — Safqa API · Settings

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-SETTINGS-01 | GET | /api/data/settings | authenticated | — | settings | SettingsDataService | done | secrets masked |
| EP-SETTINGS-02 | PATCH | /api/data/settings | permission:settings.manage | body | settings | SettingsDataService | done | |
