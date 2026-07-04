# Impact Analysis — Query-Backed Filter Values Store

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `FilterValueMeta` schema | none | — | No filter-value persistence anywhere |
| `FilterValueMetaRepository` | none | — | Does not exist |
| `FilterValuesService` | none | — | Does not exist |
| `build-filters` pipeline step | none | `pipelines/steps/dashboard/` | Not registered; no AI filter selection step |
| Cardinality guard | none | — | No threshold logic; distinct values never precomputed |
| Redis filter cache | none | — | Filter values never cached |
| `AnalyticsStoreService.distinctValues()` | exists | `analytics-store.service.ts` | Already delegates to OLAP engine; ready to use |
| `AnalyticsStoreService.searchValues()` | exists | `analytics-store.service.ts` | Already delegates to OLAP engine; ready to use |
| `filter-selection.md` prompt | exists | `prompts/filter-selection.md` | Already authored in change-017; ready to consume |
| `DataSyncProcessor` | exists | `data-sync.processor.ts` | Only runs pipeline + marks sync done; no filter refresh |
| Dashboard filter endpoints | none | `dashboards.controller.ts` | No `GET /dashboards/:id/filter-options` or search endpoint |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `pipeline-type.registry.ts` — `dashboard-generate` steps | `build-filters` step must be inserted at order 35 (after AI generation) |
| `DataSyncProcessor` | Must call `refreshFilterValues()` after successful sync |
| `DashboardsService` | Must add `getFilterOptions()` + `searchFilterValues()` methods |
| `dashboards.controller.ts` | Must add 2 new GET endpoints |
| `DashboardsModule` | Must import `FiltersModule` |
| `DataModule` | Must import `FiltersModule` |
| `PipelinesModule` | `BuildFiltersStep` must be provided |

Feature state: **greenfield service/schema; integration into existing pipeline + sync**

---

## Affected Modules

- **`src/modules/filters/`** (new module) — `FiltersModule`, `FilterValueMetaRepository`, `FilterValuesService`
- **`src/modules/dashboards/schemas/`** (new schema) — `FilterValueMeta`
- **`src/modules/dashboards/repositories/`** (new repo) — `FilterValueMetaRepository`
- **`src/modules/dashboards/services/`** (new service) — `FilterValuesService`
- **`src/modules/pipelines/steps/dashboard/`** (new step) — `BuildFiltersStep`
- **`src/modules/pipelines/pipeline-type.registry.ts`** (modify) — insert `build-filters` at order 35
- **`src/modules/pipelines/pipelines.module.ts`** (modify) — provide `BuildFiltersStep`
- **`src/modules/dashboards/services/dashboards.service.ts`** (modify) — add filter methods + inject `FilterValuesService`
- **`src/modules/dashboards/controllers/dashboards.controller.ts`** (modify) — add 2 endpoints
- **`src/modules/data/processors/data-sync.processor.ts`** (modify) — add `refreshFilterValues()` post-sync
- **`src/modules/dashboards/dashboards.module.ts`** (modify) — import `FiltersModule`
- **`src/modules/data/data.module.ts`** (modify) — import `FiltersModule`

---

## Plan Docs to Update

- [x] `project/actions/backend/endpoints/` — add filter-options + search endpoints

---

## Files Created

```
src/modules/filters/filters.module.ts
src/modules/dashboards/schemas/filter-value-meta.schema.ts
src/modules/dashboards/repositories/filter-value-meta.repository.ts
src/modules/dashboards/services/filter-values.service.ts
src/modules/pipelines/steps/dashboard/build-filters.step.ts
```

## Files Modified

```
src/modules/pipelines/pipeline-type.registry.ts                  # +build-filters step at order 35
src/modules/pipelines/pipelines.module.ts                        # +BuildFiltersStep provider
src/modules/dashboards/services/dashboards.service.ts            # +getFilterOptions + searchFilterValues + inject FilterValuesService
src/modules/dashboards/controllers/dashboards.controller.ts      # +GET filter-options, +GET filter-values/:column/search
src/modules/dashboards/dashboards.module.ts                      # +FiltersModule
src/modules/data/data.module.ts                                  # +FiltersModule
src/modules/data/processors/data-sync.processor.ts               # +refreshFilterValues() post-sync
```

---

## Risk

- **Complexity: M** — cardinality guard logic is new but simple; the main complexity is the `FiltersModule` dependency design to avoid the 3-way circular dep.
- **Circular dependency: RESOLVED** — `FiltersModule` is dependency-free (only `AnalyticsStoreModule` + `WorkspaceModule`); both `DataModule` and `DashboardsModule` import it without creating cycles.
- **Migration: N** — new tables/collections; no existing data to migrate.
- **Cardinality threshold: configurable** — defaults to 1000 via `config`; no hardcoded constant in logic.
- **Performance risk: L** — filter computation runs post-sync asynchronously; a failed computation logs a warning but does not fail the sync.

---

## Recommendation

### Implementation order within this CR
1. Create `FilterValueMeta` schema.
2. Create `FilterValueMetaRepository`.
3. Create `FilterValuesService` (compute + cache + search).
4. Extract into `FiltersModule` (import: `AnalyticsStoreModule`, `WorkspaceModule`).
5. Create `BuildFiltersStep` (AI filter-column selection → `FilterValuesService.computeAndStore()`).
6. Insert step at order 35 in `dashboard-generate` pipeline type.
7. Add `refreshFilterValues()` to `DataSyncProcessor`.
8. Add filter methods to `DashboardsService`.
9. Add filter endpoints to `DashboardsController`.
10. Import `FiltersModule` in `DashboardsModule` + `DataModule`.
