# Architecture Review — Datasource Engine · Pipeline · Actions

**Change:** change-049 (Canonical Dashboard Templates)
**Scope requested:** review the separation of (a) the datasource engine, (b) the pipeline, and (c) the processing actions ("engines" like dashboard creation, future data cleaning, forecasting) — and confirm the system is scalable for new datasources, new actions, and new pipeline steps.

---

## 1. Verdict

The three layers are **already well-separated** and the pipeline is a genuine reusable engine. This change proved the claim in practice: the new `dashboard-from-template` action was added **without touching the pipeline engine, the step registry, or the worker's control flow** — only a new pipeline type definition, three new steps, and a payload field. The same recipe applies to Data Clean and Forecasting.

Two real gaps existed before this change; both are now closed (see §4).

---

## 2. The three layers as they exist in code

### Layer A — Datasource Engine (acquire · integrate · store · map · sync)
| Concern | Where | Extension point |
|---|---|---|
| Acquisition / integration | `src/integrations/connectors/*` (CSV, Google Sheets, Shopify, Salla, Zid, SQL Server, MongoDB Atlas) | implement `ConnectorInterface`, register in `ConnectorRegistry` |
| Storage (OLAP) | `src/integrations/olap/*` (ClickHouse, BigQuery, MongoDB engines) | implement `OlapEngine`, register in `OLAP_ENGINE_REGISTRY`; callers go through `AnalyticsStoreService` |
| Mapping (canonical) | `src/modules/data/config/canonical-fields.config.ts` (dictionary) + `Dataset.columnMapping`/`semanticFlag` | add a flag + fields to the dictionary — **no code changes elsewhere** (proven by `marketing_spend` in this change) |
| Sync | `SyncSchedulerService` + `ingest` pipeline type | add/modify steps in the `ingest` step list |

### Layer B — Pipeline (the engine)
- `PipelineEngine.run({ pipelineType, workspaceSlug, engineId, metadata })` — generic executor: resolves the type, orders enabled steps, threads a `PipelineContext`, records per-step results in `pipeline_runs`.
- `StepRegistry` — steps self-register via `OnModuleInit`; the engine never imports a concrete step.
- `PipelineTypeRegistry` — named recipes (`ingest`, `dashboard-generate`, `add-widget`, `edit-widget`, and now `dashboard-from-template`) as ordered `PipelineStepConfig[]`.
- Steps communicate exclusively through `ctx.metadata` — no step-to-step imports.

### Layer C — Processing Actions ("action engines")
An **action** = a pipeline type + the steps it composes + an enqueue point. Current actions:

| Action | Pipeline type | Entry point |
|---|---|---|
| Ingest/sync data | `ingest` | sync scheduler / manual sync |
| Generate dashboard (AI) | `dashboard-generate` | `POST /dashboards` |
| Add widget (AI) | `add-widget` | `POST /dashboards/:id/widgets` |
| Edit widget (AI) | `edit-widget` | `PUT /dashboards/:id/widgets/:wid` |
| **Instantiate template** *(this change)* | `dashboard-from-template` | `POST /dashboards/from-template` |

---

## 3. Recipe for the next action engines (Data Clean, Forecast)

1. Write the steps (`src/modules/pipelines/steps/<domain>/*.step.ts`), each implementing `PipelineStepInterface` and self-registering.
2. Register a pipeline type (`data-clean`, `forecast`) in `PipelineTypeRegistry` with the ordered step list.
3. Add an enqueue point (endpoint/service) that creates a `BackgroundJob` and adds a queue job carrying `pipelineType` + action-specific payload.
4. Reuse or add a processor. `DashboardGenerationProcessor` is now payload-driven (`pipelineType` from the job data) — a distinct queue+processor per action family is recommended (e.g. `data-clean` queue), but the processor body is ~30 lines of boilerplate.

Nothing in the engine, registries, or existing steps needs to change. Steps like `gather-dataset-schemas` and `ensure-canonical-views` are directly reusable by future actions (forecasting will want both).

## 4. Gaps found during recon — now fixed

1. **Canonical views were never materialized.** `OlapEngine.createCanonicalView()` existed in all three engines but had zero application callers, so the cross-source promise of canonical models was unrealized. → Fixed by the `ensure-canonical-views` step, which builds `cv_{ws}_{flag}` union views from the user's selected datasets (with identity-mapping fallback for connector-normalized datasets, intersection semantics for field coverage, and hard failure on missing required fields).
2. **No query path from semanticFlag → datasets.** `DatasetRepository` had no way to find datasets by flag, blocking any feature that starts from a canonical model. → Fixed with `findBySemanticFlags()` (uses the existing `{ semanticFlag: 1 }` index, filters to dashboard-ready datasets).

## 5. Naming recommendation

For the "processing" layer the codebase-consistent term is **action** (executed as a *pipeline type*). Recommended vocabulary going forward:
- **Datasource engine** — connectors + OLAP store + mapping + sync.
- **Pipeline engine** — the generic executor (`PipelineEngine` + registries).
- **Action** — a named pipeline type that does work on the data (`dashboard-generate`, `dashboard-from-template`, future `data-clean`, `forecast`).

## 6. Watch items (not blockers)

- **Cross-model math**: a `QuerySpec` targets one source, so ratio KPIs spanning two canonical views (e.g. true MER = revenue ÷ spend) can't be expressed as one widget query yet. Options later: a `derived` widget that composes two querySpecs client-side, or engine-level view joins.
- **View lifecycle**: `cv_{ws}_{flag}` views are recreated on every template instantiation (idempotent `CREATE OR REPLACE`), but nothing drops them when datasets are deleted. Harmless (queries would fail loudly), worth a cleanup hook later.
- **One shared generation queue**: template instantiation reuses `DASHBOARD_GENERATION_QUEUE`. Fine at current scale; split per-action queues if long-running actions (forecast training) arrive.
