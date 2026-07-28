# Endpoints — Safqa API · Templates

> Auth default: `WorkspaceAuthGuard`. Prefix: `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-01 | POST | /api/data/templates/pitch-landscape/fixture-render | permission:`settings.manage` | `body: { language?: 'ar'\|'en', format?: 'html'\|'pdf', templateKey?: 'pitch-landscape'\|'pitch-landscape-formal'\|'website-template'\|'roya-presentation' }` | `200` `{ language, templateKey, html }` or PDF stream | TemplateRenderService | done | route path kept for compat; `templateKey` selects catalog + disk; invalid/inactive → 400 |
| EP-TPL-02 | GET | /api/data/templates | authenticated | — | `{ items: [{ key, version, name, orientation, type, assets }] }` | TemplatesRepository.listActive | done | gallery; latest version per key; strips sections |
