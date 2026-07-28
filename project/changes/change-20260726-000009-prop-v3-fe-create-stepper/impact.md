# Impact Analysis — change-20260726-000009-prop-v3-fe-create-stepper

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / models (FE) | none | `core/models/app.models.ts` | no Project / PipelineGeneration / Template types |
| Service(s) FE | none | `core/services/*` | no ProjectsService; AppDataService has proposals/settings only; AiService polls `/ai-jobs` not `/proposals/:id/status` |
| Endpoint(s) API | partial | `projects.controller.ts`, `proposals-data.controller.ts`, `templates.controller.ts` | projects CRUD+RFP+images+create-proposal+status/retry/rendered/regen/translate **done**; **no** `GET /data/templates` list |
| Page(s) | none | `pages/*`, `app.routes.ts`, sidebar | no `/projects*`; creative is long form + ai-jobs poll; proposal-view uses client PDF/print |
| Settings flag (FE) | none | settings page / bootstrap | `pipelineV3Enabled` not read in UI to gate nav/create |

Feature state: **none** (API ready; FE greenfield for v3 UX)

## Affected Modules

- **Projects (web, new)** — list, create, detail/workspace pages; multipart RFP/images
- **Templates (web + thin API)** — gallery UI; `GET /api/data/templates` list active
- **Proposals (web)** — v3 branch on view: stepper, server PDF, lang tabs, retry/translate/sibling
- **Creative (web)** — leave intact when flag off; optional nav hint toward Projects when flag on
- **Layout / i18n** — sidebar nav + ar/en keys
- **Settings (web, light)** — surface or at least consume `pipelineV3Enabled` for gating

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Projects/Proposals/Templates FE features after-state
- [ ] `blueprint/actions/web/pages/projects.md` — PG-PROJECTS-01..03
- [ ] `blueprint/actions/web/pages/proposals.md` — delta v3 view/stepper/actions
- [ ] `blueprint/actions/web/pages/creative.md` — dual-path note (no break)
- [ ] `blueprint/actions/api/endpoints/templates.md` — EP-TPL-02 list
- [ ] `blueprint/actions/api/services/templates.md` — thin list service
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

| Area | Create / Modify |
|------|-----------------|
| FE `ProjectsService` (or AppData methods) | Create — CRUD, RFP, images, createProposal, status, rendered, retry, translate, regenerate, sibling |
| FE `TemplatesService` | Create — list active |
| FE pages `projects/` | Create — list, create (multi-step), detail/workspace |
| FE shared `pipeline-stepper` | Create — maps `generation.steps` → PrimeNG Steps/Stepper |
| FE `proposal-view` | Modify — v3 path: iframe HTML + PDF download URL; actions |
| FE `app.routes.ts` + sidebar | Modify — `/projects`, `/projects/:id`, create child routes |
| FE i18n `en.json` / `ar.json` | Modify — projects/pipeline keys |
| FE settings/bootstrap | Modify — read `pipelineV3Enabled` |
| API `TemplatesController` | Modify — `GET /api/data/templates` → `listActive()` |
| Creative / ai-jobs pages | No functional change when flag off |

## Risk

- **Complexity**: High (multi-page FE + thin API + flag dual-path)
- **Cross-module**: Yes (Projects, Proposals, Templates, Layout, Settings)
- **Migration**: No (no data migration; dual-path preserves v2)

## Recommendation

- **Create**: Projects pages + FE services + pipeline stepper component + templates list API
- **Modify**: proposal-view (v3 branch), routes, sidebar, i18n, settings gate
- **Leave**: `/creative`, `/ai-jobs`, legacy proposal editor HTML path for non-v3

## Status target (pack artifacts after implement)

| ID / Name | Target |
|-----------|--------|
| PG-PROJECTS-01 list | done |
| PG-PROJECTS-02 create (+ gallery) | done |
| PG-PROJECTS-03 workspace | done |
| PG-PROP-V3-01 stepper / progress | done |
| PG-PROP-V3-02 view PDF / lang / actions | done |
| EP-TPL-02 list templates | done |
| Creative dual-path | done (no regression) |
| Structured section editor | deferred → later |
| AI Requests page | deferred → change-20260726-000010 |

## Dependencies

- **depends-on**: change-20260726-000008 — pack-status: **merged**
- Blocks: change-20260726-000010 (AI Requests UI)
