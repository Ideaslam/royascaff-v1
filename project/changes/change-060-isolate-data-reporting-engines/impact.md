# Impact Analysis — Isolate Data Source Engine + Dashboards/Reporting Engine

Base backend: `roya-ai-dynamo-api/src`. NestJS 11, single deployable app (not a monorepo today).
This impact covers the **whole isolation program** (context) and marks what **Phase 1 (this change)**
actually touches.

## Code Reconnaissance

### Data Source Engine (spread across 7 areas)

| Layer | State | Location | Coupling / gaps |
|-------|:-----:|----------|-----------------|
| Data module | complete | `modules/data/` (10 controllers, 11 services, 8 repos/schemas, 2 processors) | god-class `DataSyncProcessor`; imports auth/workspace/subscriptions/notifications/audit/analytics/pipelines/filters |
| Connectors | complete | `integrations/connectors/` (`@Global`) | **circular** `forwardRef(DataModule)`; `GoogleSheetsConnector` injects `DataConnectionRepository`; `ConnectorInterface` typed against data schemas; `*DatasetService` orchestration lives here but is a `DataModule` provider |
| OLAP engines | complete | `integrations/olap/` (`@Global`) | clean-ish; `OlapEngineId` enum placement in analytics-store schema |
| Analytics Store | complete | `modules/analytics-store/` | thin facade over `OlapEngineRegistry` |
| Ingest pipeline steps | complete | `modules/pipelines/steps/*` (extract, identify-columns, apply-mapping, transform, load) | live in the **shared** pipelines module |
| Filters (post-sync refresh) | complete | code physically in `dashboards/services/filter-values.service.ts` | `data` processor imports dashboards → **data depends on dashboards** |
| Background jobs / queues | complete | `modules/background-jobs/` (`@Global`) | `DATA_SYNC_QUEUE`, `SCHEMA_DISCOVERY_QUEUE`, `CSV_ANALYSIS_QUEUE`; queue names are loose string constants |

### Dashboards & Reporting (spread across 6 areas)

| Layer | State | Location | Coupling / gaps |
|-------|:-----:|----------|-----------------|
| Dashboards module | complete | `modules/dashboards/` (1 controller, 2 services, 6 repos/schemas) | injects `DatasetRepository`+`CsvFileRepository` (data internals); direct Mongo `@InjectConnection` + raw Redis; `forwardRef(SharingModule)` |
| Dashboard pipeline steps | complete | `modules/pipelines/steps/dashboard/*` | in the **shared** pipelines module; module hand-provides dashboard **and** data repos |
| Sharing | complete | `modules/sharing/` | **circular** `forwardRef(DashboardsModule)` |
| Export | complete | `modules/export/` | Excel/CSV sync; PDF queue has **no worker**; re-exports dashboard repos |
| AI Processing | complete | `modules/ai-processing/` | `DashboardGenerationProcessor`; `CACHE_RECALCULATION`/`PDF_EXPORT` queues have no worker |
| Filters (selection) | complete | `modules/filters/` facade → files in `dashboards/` | logical/physical mismatch |

### Cross-cutting infrastructure

| Concern | State | Notes |
|---------|:-----:|-------|
| Root wiring | complete | `app.module.ts`; global `JwtAuthGuard`+`RolesGuard`+`ThrottlerGuard`; envelope interceptor; prefix `api/v1`; **no** versioning, **no** Swagger |
| Tenant context | **none** | no request-scoped context / AsyncLocalStorage; `workspaceSlug` passed manually + JWT-embedded |
| DB | complete | single Mongoose connection; per-workspace dynamic collections `ws_{slug}_*`; OLAP via separate native clients |
| External access | **none** | no API-key/M2M auth, no MCP, no SDK, no OpenAPI |
| Monorepo | **none** | `nest-cli.json` single `sourceRoot: src`; no `apps/`/`libs/` |

**Feature state:** both features **complete** and working; this is a **refactor** (structural
isolation), not new behavior.

### Plan-vs-code drift (noted, out of scope per decision)
- `modules/templates` and pipeline steps `ensure-canonical-views` / `instantiate-template-widgets` /
  `adapt-template-widgets` (change-049, plan module 22 + S11) **do not exist in code**. Left as-is.
- `pdf-export` and `cache-recalculation` queues are enqueued but have **no workers**. Left as-is.
- `filters` module code physically resides under `dashboards/` (logical/physical mismatch) — will be
  corrected in Phase 3.

## Affected Modules

**Phase 1 (this change):**
- **S11 Pipelines** — neutral engine core (`PipelineEngine`, `StepRegistry`, `PipelineTypeRegistry`,
  interfaces, `TenantContext`, queue + run-store seams) relocated to isolated library `src/engine-core/`.
  Step implementations stay in place (two thin shims keep their imports working).
- **Ripple (import-path only):** `data`, `dashboards`, `ai-processing`, `pipelines` import the kernel
  from `src/engine-core`.
- **Deferred:** no `nest-cli.json`/monorepo/`apps/api`/`libs/` changes this phase (see Phase 4) — the
  `Dockerfile.build` copies only `src/`, so the kernel stays under `src/` to keep the build/CI intact.

**Later phases (context only, not this change):**
- Phase 2 → `data-source-engine` boundary (data + connectors + olap + analytics-store + ingest steps).
- Phase 3 → `reporting-engine` boundary (dashboards + sharing + export + dashboard steps + filters).
- Phase 4 → physical `libs/` + thin `apps/api` + `@roya/*` alias + Docker/build-pipeline changes +
  `@Global()` removal + verify.
- Phase 5 (deferred) → REST M2M API + MCP delivery adapters.

## Plan Docs to Update (this change) — done
- [x] `project/profile.md` — engine-isolation (phased) note: Phase 1 `src/engine-core/`; target `libs/` in Phase 4.
- [x] `project/plan/modules.md` — "Engine Isolation Architecture" note; S11 Pipelines scope/path; templates drift note.
- [x] `project/rules.md` — engine-isolation rules RULE-ARCH-001..006 (contract boundaries, neutral core, TenantContext, hooks, delivery adapters, extend-by-registration).
- [x] `project/actions/backend/services/pipelines.md` + `services/_index.md` — engine-core location + `PIPELINE_RUN_STORE` for SVC-PIPE-ENGINE/STEP-REG/TYPE-REG.

## Code Impact (create / complete / modify) — Phase 1

### Create
- `src/engine-core/` — `engine-core.module.ts`, `pipeline.engine.ts` (generic), `step.registry.ts`,
  `pipeline-type.registry.ts`, `pipeline.interface.ts` (generic/neutral), `pipeline-run-store.ts`
  (`PIPELINE_RUN_STORE` seam), `tenant-context.ts` (contract), `queue-registry.ts` (seam),
  `index.ts` barrel.
- `modules/pipelines/step.registry.ts` + `pipeline.interface.ts` — thin **shims** re-exporting the
  kernel (and specializing `PipelineContext` with domain types) so step files stay untouched.

### Modify (ripple — import paths only, no logic)
- `modules/data/processors/data-sync.processor.ts`, `modules/data/services/dataset.service.ts`,
  `modules/dashboards/services/dashboards.service.ts`,
  `modules/ai-processing/processors/dashboard-generation.processor.ts` — import the kernel from
  `src/engine-core`.
- `modules/pipelines/pipelines.module.ts` — imports `EngineCoreModule`, provides `PipelineEngine` +
  binds `{ provide: PIPELINE_RUN_STORE, useExisting: PipelineRunRepository }`, re-exports the kernel.

### Delete (moved to engine-core)
- `modules/pipelines/pipeline.engine.ts`, `modules/pipelines/pipeline-type.registry.ts`.

### Preserve (must not change)
- Every HTTP route, DTO, response envelope, guard behavior, queue name, and collection name.
- All pipeline **step** implementations and pipeline **type** definitions (behavior identical).

## Ripple map (action)

| Item | Action |
|------|--------|
| `PipelineEngine` / `StepRegistry` / `PipelineTypeRegistry` consumers (data, dashboards, ai-processing) | Repoint imports to `@roya/engine-core` |
| Pipeline step providers (ingest + dashboard) | Keep in `pipelines` step-pack; register against relocated registries |
| `PipelineRunRepository` (`ws_{slug}_pipeline_runs`) | Stays in `pipelines` for now (workspace-scoped repo); engine-core stays persistence-agnostic via interface |
| `ColumnIdentifyService` (provided in pipelines, owned by data) | Untouched this phase; resolved in Phase 2 |
| Global guards/interceptor/prefix | Untouched |
| Queues / processors | Untouched |

## Reuse
- Existing provider-token pattern (`STORAGE_PROVIDER`, `AI_PROVIDER`, `OlapEngineRegistry`,
  `ConnectorRegistry`) as the model for engine contract tokens.
- `FiltersModule` (already a standalone module) as the precedent for a real sub-module boundary.
- NestJS 11 native monorepo (`nest-cli.json` `projects` + `libs`) — no new tooling.

## Risk
- **Complexity:** Medium (structural conversion; low logic risk).
- **Cross-module:** Yes (import repointing across data/dashboards/ai-processing).
- **Migration:** No (no data/schema/collection changes).
- **Highest risks:** monorepo tsconfig/path-alias + build config; asset-copy paths in `nest-cli.json`
  (AI prompts, widget catalogs, mail templates) must still resolve; circular-import surprises when the
  engine core is pulled out. Mitigation: behavior-neutral, verify `nest build` + boot + a smoke run of
  one sync and one dashboard generation before closing the change.

## Recommendation
- **Create:** monorepo config + `libs/engine-core` neutral kernel + `TenantContext` contract.
- **Modify:** repoint pipeline-engine imports to `@roya/engine-core` (no logic).
- **Preserve:** all routes, queues, steps, collections, behavior.
- **Defer:** data/reporting lib moves (phases 2–3), REST/MCP adapters (phase 5), drift fixes.
