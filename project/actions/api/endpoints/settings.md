# Endpoints — Safqa API · Settings

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-SETTINGS-01 | GET | /api/data/settings | authenticated | — | settings | SettingsDataService | done | secrets masked; includes `logoUrl` when set |
| EP-SETTINGS-02 | PATCH | /api/data/settings | permission:settings.manage | body | ok | SettingsDataService | done | no `logoUrl` in patch body |
| EP-SETTINGS-03 | POST | /api/data/settings/logo | permission:settings.manage | body: UploadWorkspaceLogoDto (fileBase64, mimeType?, fileName?) | settings | SettingsDataService.uploadLogo | done | S3; 400 invalid/oversize |
| EP-SETTINGS-04 | DELETE | /api/data/settings/logo | permission:settings.manage | — | settings | SettingsDataService.removeLogo | done | clears logo |
