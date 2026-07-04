# Impact Analysis — Dashboard Operations as Pipelines

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `dashboard-generate` pipeline type | none | `pipeline-type.registry.ts` | Only `ingest` type registered |
| `add-widget` / `edit-widget` pipeline types | none | — | All dashboard operations are one-shot AI calls |
| Dashboard pipeline steps | none | `pipelines/steps/` | No dashboard-specific steps |
| `DashboardGenerationProcessor` | exists | `ai-processing/processors/dashboard-generation.processor.ts` | Direct `AiProvider.generateDashboard()` call; not pipeline-based |
| Multi-datasource generation | partial | `dashboards.service.ts` | M:N link exists (change-015) but generation only reads CSV files, not new datasets |
| Widget `querySpec` field | none | `schemas/chart-widget.schema.ts` | Only `queryDefinition` (MongoDB aggregation) present |
| OLAP widget execution | none | `dashboards.service.ts` | `executeAggregation()` uses only MongoDB; no OLAP path |
| `PipelineContext.metadata` | none | `pipeline.interface.ts` | Context has no general-purpose metadata bag; `dataset`/`connection` required |
| `DashboardsModule` imports | partial | `dashboards.module.ts` | Missing `AnalyticsStoreModule`, `WorkspaceModule` |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `DashboardGenerationProcessor` | Completely replaced with `PipelineEngine.run('dashboard-generate', …)` |
| `DashboardsService.getChartData()` | Must route to OLAP when `widget.querySpec` is present |
| `pipeline.interface.ts` → `PipelineContext` | `dataset`/`connection` made optional; `metadata: Record<string, unknown>` added |
| `ai-processing.module.ts` | Must import `PipelinesModule` + `WorkspaceModule` |

Feature state: **major refactor of generation processor; additive for OLAP widget execution**

---

## Affected Modules

- **`src/modules/pipelines/`** (modify) — 9 new dashboard pipeline steps in `steps/dashboard/`, updated `PipelineTypeRegistry` (3 new types), updated `PipelinesModule`
- **`src/modules/pipelines/pipeline.interface.ts`** (modify) — `dataset`/`connection` optional + `metadata` bag
- **`src/modules/pipelines/pipeline.engine.ts`** (modify) — accept optional `dataset`/`connection`, accept `metadata`
- **`src/modules/dashboards/schemas/chart-widget.schema.ts`** (modify) — add `querySpec` field
- **`src/modules/dashboards/services/dashboards.service.ts`** (modify) — add OLAP execution path, new filter methods + `filterValuesService` + `workspaceRepo` injection
- **`src/modules/dashboards/dashboards.module.ts`** (modify) — add `AnalyticsStoreModule`, `WorkspaceModule`, `FiltersModule` imports
- **`src/modules/ai-processing/processors/dashboard-generation.processor.ts`** (replace) — delegates to `PipelineEngine`
- **`src/modules/ai-processing/ai-processing.module.ts`** (modify) — import `PipelinesModule` + `WorkspaceModule`
- **`src/modules/filters/`** (new) — `FiltersModule` extracted to break circular module dependency

---

## Plan Docs to Update

- [x] `project/actions/backend/services/` — update `DashboardsService` spec

---

## Files Created

```
src/modules/pipelines/steps/dashboard/gather-dataset-schemas.step.ts
src/modules/pipelines/steps/dashboard/load-widget-catalog.step.ts
src/modules/pipelines/steps/dashboard/generate-widgets-ai.step.ts
src/modules/pipelines/steps/dashboard/add-widget-ai.step.ts
src/modules/pipelines/steps/dashboard/edit-widget-ai.step.ts
src/modules/pipelines/steps/dashboard/save-widgets.step.ts
src/modules/pipelines/steps/dashboard/save-single-widget.step.ts
src/modules/pipelines/steps/dashboard/save-updated-widget.step.ts
src/modules/pipelines/steps/dashboard/invalidate-widget-cache.step.ts
src/modules/filters/filters.module.ts   # extracted to break DashboardsModule ↔ DataModule cycle
```

## Files Modified

```
src/modules/pipelines/pipeline.interface.ts                           # dataset/connection optional + metadata
src/modules/pipelines/pipeline.engine.ts                              # optional dataset, metadata support
src/modules/pipelines/pipeline-type.registry.ts                       # +dashboard-generate, +add-widget, +edit-widget
src/modules/pipelines/pipelines.module.ts                             # +dashboard steps, +FiltersModule, +dashboard repos
src/modules/dashboards/schemas/chart-widget.schema.ts                 # +querySpec field
src/modules/dashboards/services/dashboards.service.ts                 # +executeQuerySpec, +filterValuesService
src/modules/dashboards/dashboards.module.ts                           # +AnalyticsStoreModule, +WorkspaceModule, +FiltersModule
src/modules/ai-processing/processors/dashboard-generation.processor.ts  # → PipelineEngine
src/modules/ai-processing/ai-processing.module.ts                    # +PipelinesModule, +WorkspaceModule
src/modules/pipelines/steps/extract.step.ts                          # null-guard ctx.connection
src/modules/pipelines/steps/apply-mapping.step.ts                    # null-guard ctx.dataset
src/modules/pipelines/steps/load.step.ts                             # null-guard ctx.dataset
src/modules/pipelines/steps/transform.steps.ts                       # null-guard ctx.dataset
src/modules/pipelines/steps/clean-data.step.ts                       # null-guard ctx.dataset
```

---

## Risk

- **Complexity: H** — touches generation processor, pipeline types, 9 new steps, schema changes, service injection changes, and module wiring simultaneously.
- **Circular dependency: Y** — `DashboardsModule` → `DataModule` → `PipelinesModule` → `DashboardsModule`; resolved by extracting `FiltersModule` and providing dashboard repos directly in `PipelinesModule`.
- **Migration: N** — existing dashboard generation replaces the processor; widget `querySpec` is optional so existing MongoDB-backed widgets continue to work.
- **Regression risk: M** — `DashboardGenerationProcessor` completely replaced; existing behavior must be verified end-to-end.

---

## Recommendation

### Implementation order within this CR
1. Extend `PipelineContext` (`dataset`/`connection` optional, add `metadata`).
2. Add `querySpec` to `ChartWidget` schema.
3. Create 9 dashboard pipeline steps.
4. Register `dashboard-generate`, `add-widget`, `edit-widget` in `PipelineTypeRegistry`.
5. Extract `FiltersModule` to break circular dep.
6. Refactor `DashboardGenerationProcessor`.
7. Add `executeQuerySpec()` to `DashboardsService` + inject `AnalyticsStoreService` + `WorkspaceRepository`.
8. Update all module wiring.
9. Null-guard data-sync steps for optional context fields.
