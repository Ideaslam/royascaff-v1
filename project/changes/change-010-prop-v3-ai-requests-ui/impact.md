# Impact Analysis — change-010-prop-v3-ai-requests-ui

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / models (FE) | none | `core/models` | no PipelineTrace types |
| Service(s) FE | none | `core/services` | no traces client |
| Endpoint(s) API | partial | `pipeline-traces.controller.ts` | list + getById **done**; **missing** proposal summary + cost-summary |
| Service API | partial | `pipeline-trace.service.ts` | `getWorkspaceTraces` / `getById` done; no aggregate helpers |
| Repo | partial | `pipeline-traces.repository` | `listPage` filters OK; no dedicated aggregate query (can scan/filter in service for v1) |
| Page(s) | none | `pages/*`, routes, sidebar | no `/ai-requests`; Chart.js pattern exists on dashboard |

Feature state: **partial** (API list/detail ready; FE + summaries none)

## Affected Modules

- **Pipeline Traces (API)** — add summary + cost-summary methods/routes (register before `:id`)
- **Pipeline Traces (web, new)** — AI Requests page + cost charts
- **Layout / i18n** — nav + ar/en keys

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Traces FE + API summary features
- [ ] `blueprint/actions/web/pages/ai-requests.md` — PG-AIREQ-01..03
- [ ] `blueprint/actions/api/endpoints/pipeline-traces.md` — EP-TRACES-03..04
- [ ] `blueprint/actions/api/services/pipeline-traces.md` — SVC-TRACES-01..02 (or extend PIPEV3-04)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

| Area | Create / Modify |
|------|-----------------|
| API `PipelineTraceService` | + `getProposalSummary`, `getCostSummary` |
| API `PipelineTracesController` | + `GET …/proposals/:proposalId/summary`, `GET …/cost-summary` (before `:id`) |
| FE `PipelineTracesService` | Create |
| FE `pages/ai-requests/` | Create — table, filters, detail dialog, summary card, cost charts |
| FE routes + sidebar | Modify — `/ai-requests`, `pipeline-traces.read` |
| FE i18n | Modify — `aiRequests.*` |

## Risk

- **Complexity**: Medium (FE page + thin aggregates)
- **Cross-module**: Yes (Traces API + web + layout)
- **Migration**: No

## Recommendation

- **Create**: AI Requests page + FE service + summary/cost endpoints
- **Complete**: Pipeline traces read UX (list/detail already on API)
- **Defer**: admin cross-workspace traces

## Status target (pack artifacts after implement)

| ID / Name | Target |
|-----------|--------|
| PG-AIREQ-01 list + filters | done |
| PG-AIREQ-02 detail dialog | done |
| PG-AIREQ-03 cost dashboard | done |
| EP-TRACES-03 proposal summary | done |
| EP-TRACES-04 cost-summary | done |
| Admin cross-workspace traces | deferred → later |

## Dependencies

- **depends-on**: change-009 — pack-status: **merged**
- Blocks: change-011 (cutover)
