# Change Request

## Metadata
- **date**: 2026-07-09
- **change-type**: bug-fix
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data (connections, datasets, sync pipeline), Pipelines (extract/load), Customer Portal data setup wizard
- Feature(s): SQL Server / MongoDB Atlas connect wizards; schema discovery; ingest pipeline memory model
- Endpoint(s): `POST /data/datasets/:id/discover-schema`, ingest pipeline extract/load steps
- Page(s)/View(s): customer-portal: SQL Server connect, MongoDB Atlas connect, shared entity-select step
- Service(s): DatasetService, SqlServerConnector, ExtractStep, LoadStep, PipelineEngine

## Description

Three related production issues found while testing SQL Server data sources against a large database (~1108 tables; wide tables like `Bookings` with 92 columns):

1. **Slow "Creating datasets and analyzing columns with AI"** — User suspected unique-count / sample queries. Investigation shows SQL Server `discoverSchema` only reads `INFORMATION_SCHEMA.COLUMNS` (no `COUNT(DISTINCT)`). Slowness is dominated by sequential per-dataset AI `analyzeColumns` calls (and empty/default samples), especially for wide tables. Need faster samples (random/TOP-N) and skip or bound expensive stats; optionally skip/chunk AI for very wide schemas.

2. **No search on table/collection picker** — SQL Server and MongoDB Atlas connect UIs (and shared entity-select) render a long scrollable list with no filter. Databases with 1000+ tables are unusable. Add a client-side search field over table/collection/entity name.

3. **Sync OOM / Failed on large tables** — Ingest pipeline `ExtractStep` buffers the entire extract into `ctx.rows[]` before `LoadStep` inserts in batches. Large tables fill Node heap and fail. Need streaming extract→load (process/load each page, release memory) so sync does not hold the full table in RAM.

Observed sync failures also included intermittent `Failed to connect … in 10000ms` to the SQL Server host; that is environmental/network, separate from the memory architecture bug. One successful sync loaded 6592 rows after buffering the full extract in memory — confirms the non-streaming design.

## Acceptance Criteria
1. Schema discovery for SQL Server completes without full-table unique-count scans; samples use a cheap random/TOP-N query; uniqueCount is skipped or capped when row estimate is large.
2. AI column analysis does not block the wizard for minutes on wide tables (chunk, timeout, or defer non-critical AI) — measured duration logged.
3. SQL Server table picker, MongoDB collection picker, and shared entity-select step each have a search/filter input that filters the list by name as the user types.
4. Ingest sync streams pages from extract into load without retaining the full dataset in `ctx.rows`; large tables sync without process OOM.
5. Existing incremental sync, progress reporting, and FULL truncate behavior still work.

## Notes
- Escalated from bug-fix Path A (multi-module: backend pipelines + frontend wizards; changes ingest architecture).
- Debug session instrumentation remains until post-fix verification.
- Next change number: **053**.
