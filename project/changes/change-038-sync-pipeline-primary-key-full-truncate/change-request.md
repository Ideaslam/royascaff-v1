# Change Request

## Metadata
- **date**: 2026-07-05
- **change-type**: new-feature + modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, Pipelines
- Feature(s): AI column identification step, primary key detection, full-sync truncate, incremental/full sync UI controls
- Endpoint(s): EP-DATA-40 (new), EP-DATA-20 (updated to accept mode)
- Page(s)/View(s): Dataset Detail Page, Data Sources Page
- Service(s): DatasetService, SyncService, ScheduledSyncService, LoadStep, IdentifyColumnsStep (new)

## Description

Four related improvements that complete the sync pipeline:

1. **AI column identification as a dedicated pipeline step** (`identify-columns`, order 15 in ingest) — instead of embedding column description logic in connector-specific code, a shared step runs after extraction, calls AI to generate English + Arabic descriptions for each column, and identifies the primary key column. Descriptions are stored in `Dataset.schema[].description`; the PK is flagged via `isPrimaryKey: boolean`. Step skips if all columns already have descriptions (idempotent). Users can override descriptions or PK flag via UI.

2. **Primary key flag stored in schema** — `DiscoveredColumn` gains `isPrimaryKey?: boolean`. A new endpoint `EP-DATA-40 PATCH /datasets/:id/schema-columns` lets the user save edited descriptions + toggle the PK flag per column. Selecting a column as PK automatically clears the PK flag from all other columns.

3. **FULL sync truncates the OLAP table first** — `LoadStep` now drops and recreates the dataset table before inserting when `mode === FULL`. This eliminates data duplication on repeated full syncs (the core bug reported).

4. **Two manual sync buttons + smart auto-sync** — Dataset Detail and Data Sources pages show two sync buttons: "Full Sync" (always enabled) and "Incremental Sync" (enabled only if the dataset has a PK column). Scheduled syncs (`HOURLY`/`DAILY`) automatically use INCREMENTAL when the dataset has a PK column, FULL otherwise.

## Acceptance Criteria
1. A re-sync of any dataset (CSV, Shopify, Salla, Zid, SQL Server, MongoDB Atlas, Google Sheets) does not produce duplicate rows — the OLAP table is truncated on FULL sync before inserting.
2. After the first sync, `Dataset.schema` columns have `description` (AI-generated) populated via the `identify-columns` pipeline step.
3. The `identify-columns` step identifies exactly one column as primary key where possible; the flag is stored as `isPrimaryKey: true` in `Dataset.schema`.
4. A second sync does not re-call the AI if all columns already have descriptions (idempotent unless forced).
5. The Dataset Detail page shows two sync buttons; the Incremental Sync button is disabled when no PK column exists.
6. `EP-DATA-40 PATCH /datasets/:id/schema-columns` allows users to edit column descriptions and toggle the primary key flag.
7. Scheduled (HOURLY/DAILY) syncs use INCREMENTAL mode for datasets that have a PK column, FULL for those that do not.
8. The Data Sources page shows both Full Sync and Incremental Sync actions per dataset card.
