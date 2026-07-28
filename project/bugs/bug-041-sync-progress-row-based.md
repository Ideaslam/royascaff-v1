# Bug #041 — Sync progress not based on row counts

## Status
**DONE** — Confirmed 2026-07-29

## Reported
- **Date**: 2026-07-19
- **Severity**: medium
- **Affected area**: backend/pipelines/streaming, connectors, customer-portal/data sync UI

## Description
Sync progress percentage uses fixed batch increments (`batchesCompleted * 3`) instead of reflecting actual rows loaded vs total rows. Large tables show misleading progress (e.g. stuck near 94% while millions of rows remain).

## Expected Behavior
When a connector can determine how many rows will be synced, progress should be `(rowsLoaded / estimatedTotal) * loadBand`. When count is unavailable, keep the existing batch-based fallback.

## Root Cause
`StreamingSyncCoordinator` and `ExtractStep` report progress from batch counters only; connectors never expose row totals to the pipeline.

## Fix Applied
1. Optional `estimateRowCount()` on `ConnectorInterface`.
2. Row-based progress helper in `streaming-progress.ts`.
3. Implement counts for SQL Server, MongoDB Atlas, Google Sheets, CSV.
4. `LoadStep` / `ExtractStep` use estimate when available; fallback unchanged for other sources.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

**Confirmed**: 2026-07-29

## Related Files
- `connector.interface.ts`
- `streaming-sync.coordinator.ts`, `streaming-progress.ts`, `streaming-sync.types.ts`
- `load.step.ts`, `extract.step.ts`
- `sql-server.connector.ts`, `sql-server-query.builder.ts`
- `mongodb-atlas.connector.ts`, `google-sheets.connector.ts`, `csv.connector.ts`
