# Endpoints — Safqa API · Templates (Phase 1 thin)

> Optional verify aid. Full gallery `GET /templates` lands with FE pack.
> Auth: WorkspaceAuthGuard + privileged permission (reuse `settings.manage` or `pipeline-traces.read` — prefer `settings.manage` for ops smoke).

## Delta

- **Create** EP-TPL-01 for fixture HTML/PDF smoke without waiting for pipeline
- Defer public catalog list to change-009

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-01 | POST | /api/data/templates/pitch-landscape/fixture-render | permission:`settings.manage` | `body: { language?: 'ar'\|'en', format?: 'html'\|'pdf' }` | `200` `{ html }` or PDF binary (`application/pdf`) | `TemplateRenderService` / fixture helper | planned | verify Handlebars + PDF; no AI |

## Deferred

| Route | Reason |
|-------|--------|
| GET /api/templates | gallery — change-009 |
| GET /api/templates/:key | abstract/full — later packs |
