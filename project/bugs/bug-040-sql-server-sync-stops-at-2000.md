# Bug #040 — SQL Server sync stops at 2000 rows

## Status
**DONE** — Confirmed 2026-07-19

## Reported
- **Date**: 2026-07-19
- **Severity**: high
- **Affected area**: backend/integrations/connectors/sql-server, backend/pipelines/streaming, customer-portal/data sync

## Description
SQL Server dataset sync (Full Sync and Incremental Sync) completes with status "ready" but only loads ~2000 rows, even when the source table has 1.5M+ rows.

## Expected Behavior
Sync should paginate through all rows in the source table (in batches of the configured page size, default 2000) until the full table is loaded, then mark the sync as done with the correct total row count.

## Steps to Reproduce (if applicable)
1. Connect a SQL Server data source with a table containing 1.5M+ rows.
2. Create/sync a dataset for that table.
3. Click **Full Sync** or **Incremental Sync**.
4. Observe sync completes as "ready" with only ~2000 rows loaded.

## Root Cause
**Confirmed (debug session `eda2a5`, run `pre-fix`).** Page-size mismatch between config and SQL FETCH cap:

- Config resolved `pageSize = 5000` (log line 1: `"pageSize":5000`)
- `SqlServerQueryBuilder.MAX_LIMIT` was hard-coded to **2000**, so SQL only fetched 2000 rows per page
- Extract stop condition used uncapped pageSize: `hasMore = 2000 >= 5000 → false` → generator stopped after page 1 (log line 1: `"hasMoreBefore":false`)
- Streaming coordinator also broke early: `willBreak: true` because `rawBatchLen (2000) < pageSize (5000)` (log line 5)

Hypotheses B, D, E **rejected** — streaming path worked correctly; rows were not dropped.

## Fix Applied
1. **`sql-server-query.builder.ts`**: Replace `MAX_LIMIT=2000` with `MAX_PAGE_SIZE=5000` (matches connector `maxPageSize`); add shared `clampPageSize()`.
2. **`sql-server.connector.ts`**: Use `fetchSize = clampPageSize(pageSize)` for SQL queries and `hasMore` check.
3. **`streaming-sync.coordinator.ts`**: Stop breaking when `rawBatch.length < pageSize` — let the connector generator control pagination termination (prevents early exit when SQL fetch cap < configured page size).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

**Confirmed**: 2026-07-19

## Related Files
- `roya-ai-dynamo-api/src/integrations/connectors/sql-server/sql-server.connector.ts`
- `roya-ai-dynamo-api/src/integrations/connectors/sql-server/sql-server-query.builder.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/streaming/streaming-sync.coordinator.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/load.step.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/extract.step.ts`
