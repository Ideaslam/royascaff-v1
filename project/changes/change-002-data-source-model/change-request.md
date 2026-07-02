# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: modify-data-model
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Data (generalize), Dashboards (datasource link)
- Feature(s): data-source domain model
- Endpoint(s): CRUD for connections & datasets (added here or in source changes — see notes)
- Service(s): `DataConnectionService`, `DatasetService`, `SyncRunRepository`

## Description
Replace the CSV-centric model with a general **three-entity** data-source model, all stored in MongoDB (workspace-prefixed collections, matching the existing `ws_{slug}_*` convention):

- **DataConnection** — a configured source + encrypted credentials. Fields: `sourceType` (`csv | google_sheets | shopify | salla | zid | sql_server | mongodb_atlas`), `name`, `status`, `credentialsRef` (encrypted), `createdBy`, timestamps.
- **Dataset** — one table/sheet/entity/query from a connection. Fields: `connectionId`, `sourceType`, `name` (free-form), `semanticFlag` (`arbitrary | orders | products | customers | …`), `columnMapping` (source column → canonical field, editable metadata), `schema` (discovered columns + inferred types), `syncPolicy` (`manual | hourly | daily | webhook`), `lastSyncAt`, `syncStatus`, `rowCount`, `analyticsTable` (engine-neutral per-dataset table/dataset reference in the workspace's chosen OLAP engine).
- **SyncRun** — one execution record. Fields: `datasetId`, `mode` (`full | incremental`), `status`, `rowsIn/rowsLoaded`, `startedAt`, `finishedAt`, `errorMessage`, `pipelineRunRef`.

Also:
- **Dataset ↔ Dashboard many-to-many** — generalize the current `DashboardDatasource(fileId)` to `datasetId` so **one dashboard can use many datasets** (preserve today's multi-file feature, A9).
- Add the **filter-values** metadata table stub (`dataset_filter_values` reference), fully implemented in change-008.
- Provide a **canonical field dictionary** per semantic flag (config/seed) that mapping validates against.
- **OLAP engine selection** — add an `olapEngine` field (`clickhouse | bigquery`) on the **workspace/account**, chosen **at account creation** (default configurable). The analytics-store (change-001) resolves the active engine per workspace from this field. `Dataset.clickhouseTable` is renamed to a neutral `analyticsTable` (the per-engine table/dataset ref).

Desired behavior: datasets are **editable and re-syncable anytime**; editing `columnMapping` or `semanticFlag` updates metadata without requiring a re-sync (mapping applied at read time via the OLAP engine's canonical views from change-001).

Out of scope: the connector/sync execution (change-005), pipeline (change-006), filter computation (change-008). **No migration of existing CSV data — start over** (A/B12, B23).

## Acceptance Criteria
1. `DataConnection`, `Dataset`, and `SyncRun` schemas exist as workspace-scoped Mongo collections with the fields above.
2. Credentials are stored **encrypted**; plaintext secrets never persisted or logged.
3. `Dataset` carries `semanticFlag` and editable `columnMapping`; a canonical field dictionary per flag is available and used to validate mappings.
4. A dashboard can reference **multiple datasets** (many-to-many) and reading a dashboard returns all its datasets.
5. Editing `columnMapping`/`semanticFlag` persists without triggering a sync.
6. `SyncRun` records can be created and queried per dataset with status/timings/error.
7. The workspace/account carries an `olapEngine` (`clickhouse | bigquery`) set at account creation (default configurable); analytics-store resolves the active engine from it.

## Notes (optional)
- Depends on: 001 (OLAP strategy — engine-neutral table/view naming + `olapEngine` selection) — foundation pair; may build together.
- Deprecates: `CsvFile` schema and `csvdata_{fileId}` collections (removed/rebuilt in change-009).
- Extensibility (A11): adding a `sourceType` must not require schema changes here — `sourceType` is an open enum + connector registry (change-005).
- Reference: `Phases.md` A4, A9, B12, B14.
