# Impact — change-053

## Feature state (before)
- SQL Server `discoverSchema` used column defaults as samples; AI analyzed all columns (slow on wide tables).
- Table/collection pickers had no search.
- Ingest `ExtractStep` buffered the entire table in `ctx.rows` before load → OOM risk.

## Files changed

### Backend
- `sql-server-query.builder.ts` — `buildSampleQuery` (TOP N)
- `sql-server.connector.ts` — cheap TOP(5) samples in discoverSchema
- `dataset.service.ts` — AI column cap (40); uniqueCount stays 0
- `extract.step.ts` — sample-only buffer for `sql_server` / `mongodb_atlas`
- `load.step.ts` — streaming re-extract → transform → insert
- `row-transform.util.ts` — batch transforms for streaming load
- `transform.steps.ts` / `apply-mapping.step.ts` — skip when `streamLoad`
- `pipeline.engine.ts` — `rowsLoaded` accounting for load step
- `pipeline.interface.ts` — docs for sample vs stream

### Frontend
- `sql-server-connect.component.*` — table search
- `mongodb-atlas-connect.component.*` — collection search
- `connect-shared.scss` — search styles
- `entity-select-step.component.ts` — entity search

## Ripple
- Streaming sources re-extract once in LoadStep (extra DB round-trip; memory-safe).
- Cross-batch exact dedupe skipped for streaming; PK within-batch dedupe retained.
- CSV / Sheets / e-commerce keep full-buffer extract (no double download/API pull).
