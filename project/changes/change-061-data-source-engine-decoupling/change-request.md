# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Connectors (S10), Data (4), Pipelines/ingest (S11), Filters (S12), Notifications, Subscriptions, engine-core
- Feature(s): none added/removed — structural decoupling only
- Endpoint(s): none changed
- Service(s): `ConnectorRegistry` + all connectors, `DataSyncProcessor`, `*DatasetService`, `StreamingSyncCoordinator`, `FilterValuesService` (call path only)

## Description

**Phase 2 of the engine-isolation program** (blueprint:
`change-060-.../isolation-architecture.md`). Make the **Data Source Engine** depend on no other
engine's internals, and make the **connector SPI** depend on no data internals — eliminating the two
structural blockers found in recon:

1. **connectors ↔ data circular dependency.** `ConnectorInterface` and connector code are typed
   against `modules/data` schemas; `GoogleSheetsConnector` injects `DataConnectionRepository`; three
   `*DatasetService` files live under `integrations/connectors/` but are owned by `DataModule`;
   `StreamingSyncCoordinator` (under connectors) imports `SyncRunRepository`. `ConnectorsModule` masks
   this with `@Global()` + `forwardRef(() => DataModule)`.
2. **data → reporting dependency.** `DataSyncProcessor` post-sync imports and calls
   `dashboards/services/filter-values.service.ts` to refresh filter values — the only place the Data
   Source Engine reaches into the Reporting Engine.

**Recon simplification:** `AnalyticsStoreService` is already a clean shared OLAP facade used by both
ingest (write) and reporting (read); `OlapModule`/`OlapEngineRegistry` stay shared infrastructure. So
Phase 2 does **not** need to move OLAP, and the reporting-side `IDataSourceResolver`/`IQueryExecutor`
contracts are deferred to Phase 3 (reporting) — `AnalyticsStoreService` already serves as the query
facade.

**Recommended split into two behavior-neutral sub-steps** (each independently buildable/bootable):

- **2a — Break connectors→data cycle:**
  - Introduce a neutral **connector SPI** (`integrations/connectors/contract/`): `ConnectorConnection`,
    `ConnectorDataset`, `DiscoveredColumn`, `SyncMode`, `ExtractOptions`, `ConnectionTestResult`,
    `DataSourceEntity`, `StreamingSyncCapability`. Retype `ConnectorInterface` against these.
  - Move `DiscoveredColumn` + sync-mode vocabulary to the neutral SPI; data schemas import them from
    there (data → connectors-contract, one-way).
  - Invert OAuth credential refresh: connectors **return** refreshed credentials; the data layer
    persists them — removing `DataConnectionRepository` from `GoogleSheetsConnector`.
  - Physically move `shopify/salla/zid-dataset.service.ts` into `modules/data` (they are data
    orchestrators). Relocate `StreamingSyncCoordinator` + its types out of `connectors/` into the
    ingest layer, using neutral types.
  - Drop `@Global()` + `forwardRef(DataModule)` from `ConnectorsModule`; wire it explicitly.

- **2b — Sync lifecycle hooks:**
  - Add a neutral `SyncLifecycleHooks` seam in engine-core (`onSyncSucceeded` / `onSyncFailed`).
  - Convert post-sync **filter refresh** to a hook registered by the reporting/filters side — removing
    the `data → dashboards` import from `DataSyncProcessor`. (Notifications + subscription metering may
    also move to hooks, or stay as cross-cutting injections — see gate decision D3.)

**Deferred (not this change):** physical `libs/data-source-engine` relocation (Phase 4),
`IDataSourceResolver`/`IQueryExecutor` reporting contracts (Phase 3), full `TenantContext` adoption
(incremental), and the `templates` drift.

## Acceptance Criteria
1. **Zero imports** from `modules/data/**` (or any `modules/**`) inside `integrations/connectors/**`
   (connector implementations + SPI).
2. `ConnectorsModule` is **not** `@Global()` and uses **no** `forwardRef`; the connector/data
   dependency is one-way (data → connectors).
3. `modules/data/processors/data-sync.processor.ts` has **zero imports** from `modules/dashboards/**`;
   post-sync filter refresh runs via a registered sync lifecycle hook.
4. OAuth credential refresh no longer writes to a data repo from inside a connector.
5. App boots; ingest (all 7 source types), incremental resume, schema-drift, and post-sync filter
   refresh behave identically; `nest build` clean; `dist/main.js` + assets emitted.
6. `change-log` row + `verify-code.md` recorded; planning docs updated where boundaries changed.

## Notes
- High regression surface (touches every connector + the sync processor). Sub-steps 2a and 2b are
  each verified (build + boot + smoke) before proceeding.
- Behavior-neutral: no route/DTO/queue/collection/credential-encryption changes.
