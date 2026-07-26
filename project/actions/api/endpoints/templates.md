# Endpoints — Safqa API · Templates

> Auth default: `WorkspaceAuthGuard`. Prefix: `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-01 | POST | /api/data/templates/pitch-landscape/fixture-render | permission:`settings.manage` | `body: { language?: 'ar'\|'en', format?: 'html'\|'pdf' }` | `200` `{ html }` or PDF stream | TemplateRenderService | done | no AI; verify design |
| EP-TPL-02 | GET | /api/data/templates | authenticated | — | `{ items: [{ key, version, name, orientation, type, assets }] }` | TemplatesRepository.listActive | done | gallery; latest version per key; strips sections |
