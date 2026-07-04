# Impact Analysis — OLAP Foundation (ClickHouse | BigQuery Strategy + Admin Benchmark)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| OLAP provider interface | none | — | Entire `integrations/olap/` subtree does not exist |
| `ClickHouseEngine` | none | — | No ClickHouse client or adapter anywhere |
| `BigQueryEngine` | none | — | No BigQuery client or adapter anywhere |
| `OlapEngineRegistry` | none | — | No engine registry |
| `QueryCompiler` | none | — | No dialect-neutral query spec or compiler |
| `AnalyticsStoreService` | none | — | No analytics-store module |
| Redis result-cache helper | partial | `dashboards/services/dashboards.service.ts` (lines 339–378) | Inline IoRedis usage, not extracted into a reusable helper; hard to share across the new stack |
| Aggregate / pre-aggregation | none | — | No materialized-view management anywhere |
| `OlapBenchmarkService` | none | — | Does not exist |
| Admin benchmark endpoints | none | — | `admin.controller.ts` has no benchmark routes |
| Admin benchmark page | none | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/` | No `olap-benchmark` folder/page |
| Admin benchmark service (FE) | none | `roya-ai-dynamo-frontend-admin/src/app/core/services/` | No `olap-benchmark.service.ts` |
| OLAP config (env vars) | none | `src/config/config.ts`, `src/config/env.validation.ts` | No ClickHouse or BigQuery env keys |
| `app.module.ts` wiring | partial | `src/app.module.ts` | `AnalyticsStoreModule` not yet registered |

**Existing code that is a direct ripple (must be aware, not changed in this CR):**

| Code | Why it matters |
|------|---------------|
| `dashboards/services/dashboards.service.ts` — `executeAggregation()` | Currently runs Mongo aggregation; this CR replaces that path in a later change (007). Do not touch now, but `QueryCompiler` output must be drop-in compatible. |
| `integrations/ai/ai.interface.ts` — `AiProvider` | Already defines a provider interface pattern; use the same convention for `OlapEngine`. |
| `integrations/ai/ai.module.ts` / `anthropic.provider.ts` | Pattern to follow exactly for `integrations/olap/` submodule structure. |
| `src/modules/admin/admin.module.ts` | New benchmark endpoints go here; module must import `AnalyticsStoreModule`. |
| `workspace.schema.ts` | `olapEngine` field added in change-015 (not this CR); `AnalyticsStoreService` will read it from the workspace object passed by callers. |
| `src/config/config.ts` + `env.validation.ts` | Must add `clickhouse.*` and `bigquery.*` config blocks and Joi validations. |

Feature state: **none** (fully greenfield)

---

## Affected Modules

- **`integrations/olap/`** (new) — ClickHouseEngine, BigQueryEngine, OlapEngineRegistry, QueryCompiler, two dialect partials (`dialect-clickhouse.ts`, `dialect-bigquery.ts`)
- **`src/modules/analytics-store/`** (new) — AnalyticsStoreService, OlapBenchmarkService, module wiring
- **`src/modules/admin/`** (modify) — add benchmark controller routes + import AnalyticsStoreModule
- **`src/config/config.ts`** (modify) — add `clickhouse` and `bigquery` config blocks
- **`src/config/env.validation.ts`** (modify) — add Joi keys for both engines
- **`src/app.module.ts`** (modify) — register `AnalyticsStoreModule`
- **Admin frontend** — new `pages/admin/olap-benchmark/` page + `core/services/olap-benchmark.service.ts`

---

## Plan Docs to Update

- [ ] `project/plan/modules.md` — add `analytics-store` module + `olap-benchmark` feature
- [ ] `project/plan/data-model.md` — add `OlapBenchmarkRun` schema (Mongo, stores benchmark results)
- [ ] `project/actions/backend/services/` — add `AnalyticsStoreService`, `OlapBenchmarkService`
- [ ] `project/actions/backend/endpoints/` — add `POST /admin/olap/benchmark` + `GET /admin/olap/benchmark/:id`
- [ ] `project/actions/admin-panel/pages/` — add OLAP Benchmark page spec

---

## Files to Create

```
roya-ai-dynamo-api/src/integrations/olap/
  olap-engine.interface.ts          # OlapEngine + QuerySpec interfaces
  olap-engine.registry.ts           # OlapEngineRegistry
  query-compiler.interface.ts       # QueryCompiler interface
  olap.module.ts                    # integration provider module
  clickhouse/
    clickhouse-engine.ts            # implements OlapEngine
    clickhouse-query-compiler.ts    # implements QueryCompiler → CH SQL
    clickhouse.client.ts            # raw ClickHouse HTTP client wrapper
  bigquery/
    bigquery-engine.ts              # implements OlapEngine
    bigquery-query-compiler.ts      # implements QueryCompiler → BQ SQL
    bigquery.client.ts              # @google-cloud/bigquery wrapper
  dialect-partials/
    dialect-clickhouse.ts           # SQL capabilities context (for prompts, change-017)
    dialect-bigquery.ts

roya-ai-dynamo-api/src/modules/analytics-store/
  analytics-store.module.ts
  analytics-store.service.ts        # AnalyticsStoreService (engine-neutral ops)
  olap-benchmark.service.ts         # OlapBenchmarkService
  schemas/
    olap-benchmark-run.schema.ts    # Mongo schema for benchmark results

roya-ai-dynamo-api/src/modules/admin/
  # existing files — add routes only
  dto/
    run-benchmark.dto.ts

roya-ai-dynamo-frontend-admin/src/app/
  core/services/
    olap-benchmark.service.ts
  pages/admin/olap-benchmark/
    olap-benchmark.component.ts
    olap-benchmark.component.html
    olap-benchmark.component.scss
```

## Files to Modify

```
roya-ai-dynamo-api/src/config/config.ts            # add clickhouse{} + bigquery{} blocks
roya-ai-dynamo-api/src/config/env.validation.ts    # add Joi keys
roya-ai-dynamo-api/src/app.module.ts               # register AnalyticsStoreModule + OlapModule
roya-ai-dynamo-api/src/modules/admin/admin.module.ts   # import AnalyticsStoreModule
roya-ai-dynamo-api/src/modules/admin/admin.controller.ts  # add benchmark routes
roya-ai-dynamo-api/src/modules/admin/admin.service.ts     # delegate to OlapBenchmarkService
roya-ai-dynamo-frontend-admin/src/app/app.routes.ts (or routing module)  # add /admin/olap-benchmark route
```

---

## Risk

- **Complexity: H** — two external OLAP engines with different SDKs, a dialect compiler, and an admin feature all in one CR; all greenfield so no regression risk on existing flows.
- **Cross-module: Y** — config, admin module, and app root are all touched; admin frontend gets a new page.
- **Migration: N** — no existing data to migrate; this CR introduces net-new infrastructure only.
- **External dependency risk: M** — ClickHouse HTTP client and `@google-cloud/bigquery` SDK both need adding to `package.json`; BigQuery requires a GCP service-account credential (new env var).
- **Do not touch** `dashboards/services/dashboards.service.ts` `executeAggregation()` in this CR — that migration is change-020.

---

## Recommendation

- **Create**: `integrations/olap/` (interface + registry + both engines + compilers + dialect partials), `analytics-store/` module (service + benchmark service + Mongo benchmark-run schema), admin benchmark routes + DTO, admin frontend page + service.
- **Modify**: `config.ts`, `env.validation.ts`, `app.module.ts`, `admin.module.ts`, `admin.controller.ts`, `admin.service.ts`, admin frontend routing.
- **No modify/complete** on existing analytical paths — those are changed in later CRs (007).

### Implementation order within this CR

1. Add env config + Joi validation for both engines.
2. Create `integrations/olap/` — interface → registry → ClickHouseEngine → BigQueryEngine → QueryCompiler impls → dialect partials.
3. Create `analytics-store/` module and wire `OlapModule` + `AnalyticsStoreModule` into `app.module.ts`.
4. Add `OlapBenchmarkRun` Mongo schema + `OlapBenchmarkService`.
5. Add admin benchmark endpoints (backend) + import into `AdminModule`.
6. Add admin benchmark page + service (frontend).
