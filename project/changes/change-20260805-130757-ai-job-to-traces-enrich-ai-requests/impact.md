# Impact Analysis — AI Job → AI Requests + enrich projects overview

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `projects.createdAt` / `clientName`; `pipelineTraces.projectId` / `proposalId` / `startedAt` | No new entities; `byProject` summary lacks project meta |
| Service(s) | partial | `PipelineTraceService.getCostSummary`; Mongo `aggregateCostSummary` (`byProject` sorted by `totalCost`); `AiJobsAdminService`; keep `AiJobsService` for chat | No project join / `createdAt` sort; admin list still live |
| Endpoint(s) | partial | EP-TRACES-04 `GET …/cost-summary`; EP-ADMIN-02/03 `GET /admin/ai-jobs[+/:id]`; core `/api/ai-jobs*` | byProject payload thin; admin diagnostics still exposed |
| Page(s) | partial | Proposals list `openAiJobDetails` → `/ai-jobs/:id`; AI Requests projects table (name/id/tokens/cost only); AI Jobs list+details + sidebar; no queryParam deep-link on AI Requests | Wrong Open target; missing project datetime + helpers; AI Jobs page still navigable |

Feature state: **partial**

## Affected Modules
- **Proposals (web)** — AIJob Open → `/ai-requests?projectId&proposalId`; column label/i18n; enable on `projectId`
- **AI Requests (web)** — queryParam deep-link; projects overview columns + default sort `createdAt` desc; optional link to `/projects/:id`
- **Pipeline Traces (api)** — enrich EP-TRACES-04 `byProject` (createdAt, clientName, lastActivityAt, proposalCount, optional pipelineVersion); sort by project createdAt desc
- **Admin AI Jobs (api+web)** — remove FE pages/routes/sidebar + EP-ADMIN-02/03 + admin client methods; keep chat `/api/ai-jobs`

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/pipeline-traces.md` — SVC-TRACES-02 enrichment + sort
- [ ] `blueprint/actions/api/endpoints/pipeline-traces.md` — EP-TRACES-04 response delta
- [ ] `blueprint/actions/api/endpoints/admin.md` — retire EP-ADMIN-02/03
- [ ] `blueprint/actions/web/pages/proposals.md` — Open → AI Requests
- [ ] `blueprint/actions/web/pages/ai-requests.md` — deep-link + projects columns/sort
- [ ] `blueprint/actions/web/pages/ai-jobs.md` — page removed / cancelled
- [ ] `blueprint/plan/modules.md` — Job Monitoring / Admin AI Job Diagnostics note (observability → AI Requests)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity M, cross-module Y, migration N

- Chat `/api/ai-jobs` must remain; only admin list/detail + FE monitor pages go away.
- Deep-link needs `ActivatedRoute` query handling on AI Requests init.
- Project enrich: batch-load projects after facet (avoid N+1 in UI); `unknown` projectId rows stay without createdAt (sort last).

## Recommendation
- **Modify**: Proposals Open; AI Requests overview + deep-link; EP-TRACES-04 / SVC-TRACES-02
- **Retire**: PG-AIJOBS-01/02; EP-ADMIN-02/03; `listAiJobsAdmin` / `getAiJobByIdAdmin`
- **Keep**: `AiJobsService`, poller, `AiService` chat create/get/stream
- **Complete**: projects overview identifying columns + default sort

## Status target (per artifact in the pack after implement)
- SVC-TRACES-02 / EP-TRACES-04 → done
- EP-ADMIN-02/03 → done (removed)
- PG-PROPOSALS-01 Open link → done
- PG-AIREQ-03 projects overview → done
- PG-AIJOBS-01/02 → done (removed)
- modules.md Job Monitoring note → done

## Dependencies
- depends-on: — 
- Related in-flight (no hard dep): `change-20260805-130421-creative-v2-full-traces` (more traces) — orthogonal; this pack only changes navigation + summary UI/API shape

## Code touch list (implement preview)

| Area | Files (expected) |
|------|------------------|
| API traces | `mongodb-pipeline-traces.repository.ts`, `pipeline-traces.repository.ts` (types), `pipeline-trace.service.ts` (+ projects/clients lookup) |
| API admin | `admin.controller.ts` (drop ai-jobs routes); optionally stop exporting `AiJobsAdminService` usage |
| FE proposals | `proposals.component.ts`, i18n `en.json`/`ar.json` |
| FE ai-requests | `ai-requests.component.ts`, `pipeline-traces.service.ts` types, i18n |
| FE retire ai-jobs | `app.routes.ts`, `sidebar.component.ts`, delete/stop wiring `pages/ai-jobs/**`, `app-data.service` admin methods |
