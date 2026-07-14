# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Dashboards (S?), Sharing, Export, Filters, Data (contract surface only), engine-core
- Feature(s): none added/removed — structural decoupling only
- Endpoint(s): none changed
- Service(s): `DashboardsService`, `SharingService` (registration only), `DataSourceResolver` (new facade)

## Description

**Phase 3 of the engine-isolation program** (blueprint: `change-060-.../isolation-architecture.md`).
Make the **Reporting Engine** depend on **no data-source internals** (only a data **contract**) and remove
the last cross-cycle inside reporting — mirroring the Phase 2 treatment of the Data Source Engine.

Recon (`impact.md`) found the reporting cluster is small and clean:

1. **dashboards ↔ sharing circular dependency.** `DashboardsService` injects `SharingService`
   (`@Inject(forwardRef())`) only for `resolveShareToken` (2 call sites); `SharingService` injects three
   dashboards repos (`DashboardRepository`, `ChartWidgetRepository`, `ChartDataCacheRepository`). Both
   modules use `forwardRef`. Natural arrow is **sharing → dashboards** (sharing reads dashboards).
2. **dashboards → data internals.** `DashboardsService` imports `DatasetRepository` + `CsvFileRepository`
   and the `SyncStatus` / `CsvFileStatus` / `SyncRunMode` enums from `modules/data/**` to (a) read dataset
   metadata (`analyticsTable`, `syncStatus`) and (b) check CSV readiness before dashboard creation. Actual
   OLAP queries already run through the **shared** `AnalyticsStoreService` (the `IQueryExecutor` facade),
   so only a read-only **`IDataSourceResolver`** is needed.

**Recon simplifications (no work needed):**
- **Export** is already one-way (`export → dashboards`), no data coupling.
- **Filters** is already clean (no data imports; the post-sync refresh hook landed in change-061 / 2b).
- **`AnalyticsStoreService`** stays the shared OLAP facade for reporting reads (`IQueryExecutor` satisfied).

**Recommended split into two behavior-neutral sub-steps** (each independently buildable/bootable):

- **3a — Break dashboards ↔ sharing cycle (inversion of control):**
  - Add a consumer-owned port in dashboards: `ShareTokenResolver` interface + `ShareTokenResolverRegistry`
    (neutral registry, provided/exported by `DashboardsModule`).
  - `SharingService` implements the port and self-registers (`OnModuleInit`) — zero behavior change
    (`resolveShareToken` already returns `{ dashboardId, workspaceSlug, permission }`).
  - `DashboardsService` injects the **registry** instead of `SharingService`; drop the `forwardRef`.
  - `DashboardsModule` stops importing `SharingModule`; `SharingModule` imports `DashboardsModule`
    **without** `forwardRef` → one-way `sharing → dashboards`.

- **3b — Reporting depends on the data contract only:**
  - Introduce a read-only **`IDataSourceResolver`** contract (`modules/data/contract/`): dataset metadata
    (`analyticsTable`, `syncStatus`, name, engineId) + CSV-file readiness; `DATA_SOURCE_RESOLVER` token.
  - Implement `DataSourceResolverService` in the data engine (wraps `DatasetRepository` + `CsvFileRepository`);
    `DataModule` provides + exports the token.
  - Repoint `DashboardsService` off `DatasetRepository`/`CsvFileRepository`/data schema enums onto the
    resolver contract; source `SyncMode` from the connector contract (`integrations/connectors/contract`).
  - Result: **zero `modules/data/**` imports in `dashboards/**`** except the contract token.

**Deferred (not this change):** physical `libs/reporting-engine` relocation + dropping the `DataModule`
module-import from `DashboardsModule` (Phase 4); moving dashboard-generation pipeline steps + filters to
their physical reporting home (Phase 4); full `TenantContext` adoption; `IReportingEngine` public delivery
contract (Phase 5 delivery adapters).

## Acceptance Criteria
1. `modules/dashboards/**` has **zero imports** from `modules/sharing/**`; `DashboardsModule` does **not**
   import `SharingModule` and uses **no** `forwardRef`. Sharing → dashboards is one-way.
2. `modules/sharing/**` uses **no** `forwardRef`; share-token resolution for dashboards runs via the
   registered `ShareTokenResolver` port.
3. `modules/dashboards/**` has **zero imports** from `modules/data/repositories/**` and
   `modules/data/schemas/**`; dataset/CSV metadata is read via `IDataSourceResolver`; queries via
   `AnalyticsStoreService`.
4. App boots; share-link view/create/revoke, anonymous share-token filter/chart access, dashboard
   creation readiness checks, and dashboard-from-template sync all behave identically; `nest build`
   clean; `dist/main.js` emitted.
5. `change-log` rows (062a, 062b) + `verify-code.md` recorded; planning docs updated where boundaries
   changed.

## Notes
- Behavior-neutral: no route/DTO/queue/collection changes.
- Sub-steps 3a and 3b are each verified (build + boot + smoke) before proceeding.
- Consistent with change-061 patterns: consumer-owned port + self-registering adapter (like the sync
  lifecycle hook), and a read-only resolver contract for cross-engine reads.
