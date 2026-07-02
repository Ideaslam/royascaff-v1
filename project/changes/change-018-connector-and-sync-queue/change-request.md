# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-module
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): new `connectors` module + `background-jobs` (generic queue)
- Feature(s): connector interface + generic sync queue
- Endpoint(s): none now (source endpoints arrive per-source in Phase C)
- Service(s): `ConnectorInterface`, connector registry, `SyncService`, `DataSyncProcessor`

## Description
Define the **connector abstraction** every data source implements, and a **generic sync queue** that runs syncs asynchronously.

Desired behavior:
- `ConnectorInterface` contract: `testConnection(conn)`, `discoverSchema(dataset)`, `extract(dataset, mode)` (full | incremental, streaming/paged), `normalize(rows)`, `load(dataset, rows)` — where `load` targets the per-dataset table via the OLAP strategy (change-014), i.e. the workspace's active engine (ClickHouse or BigQuery), not a specific engine.
- A **connector registry** keyed by `sourceType`; connectors self-register. Resolving a connector by `sourceType` returns the implementation.
- Rename/generalize the current `CSV_ANALYSIS_QUEUE` pattern to a generic **`DATA_SYNC_QUEUE`** with a `DataSyncProcessor` that: loads the dataset + connection, resolves the connector, runs the configured pipeline (change-019) around extract→load, records a `SyncRun`, and updates `Dataset.syncStatus/lastSyncAt/rowCount`.
- `SyncService` enqueues syncs (manual trigger + scheduled by `syncPolicy`) and enforces subscription limits.

Out of scope: concrete connectors (Phase C), the pipeline engine internals (change-019 — this change calls it via an interface), filter computation (change-021).

## Acceptance Criteria
1. `ConnectorInterface` defines `testConnection`, `discoverSchema`, `extract`, `normalize`, `load`.
2. A connector registry resolves a connector by `sourceType`; unknown types fail cleanly.
3. `DATA_SYNC_QUEUE` + `DataSyncProcessor` run an end-to-end sync for a stub/test connector: resolve connector → extract → load to the OLAP engine (via analytics-store) → write `SyncRun` → update dataset status.
4. Both **full** and **incremental** modes are supported by the interface and processor (incremental honored when the connector provides a watermark).
5. Manual trigger and scheduled (`syncPolicy`) enqueue paths both work; subscription limits are enforced on sync.
6. Adding a new source = implement `ConnectorInterface` + one registry entry, with no processor/queue changes.

## Notes (optional)
- Depends on: 014 (load target), 015 (dataset/connection/syncrun model). Uses: 019 (pipeline) via interface.
- The processor invokes the pipeline engine; if 006 not yet present, wire a pass-through pipeline and replace later.
- Extensibility (A11): registry-based; no source-specific branching in the processor.
- Reference: `Phases.md` B15, B16.
