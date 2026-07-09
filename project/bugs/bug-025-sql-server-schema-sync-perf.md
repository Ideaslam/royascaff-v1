# Bug #025 — SQL Server schema analysis slow + no table search + sync memory failure

## Status
**PENDING** — Fix implemented in change-053; awaiting user verification

## Escalated
Tracked as [change-053-bug-fix-sql-server-perf-streaming](../changes/change-053-bug-fix-sql-server-perf-streaming/)

## Reported
- **Date**: 2026-07-09
- **Severity**: high
- **Affected area**: backend/data + pipelines, customer-portal/data setup (SQL Server, MongoDB Atlas, entity-select)

## Description
1. "Creating datasets and analyzing columns with AI" takes a very long time (user suspected unique count / sample queries).
2. Table/collection picker has no search — unusable with ~1100 tables.
3. Data store sync fails on large tables; user expects streaming so memory is not filled.

## Expected Behavior
1. Schema analysis finishes quickly with cheap samples; skip heavy unique counts on large tables.
2. Search/filter on table/collection/entity lists.
3. Sync streams pages into OLAP without holding the full table in Node memory.

## Steps to Reproduce
1. Connect SQL Server with a large DB (1000+ tables).
2. Select a wide table (e.g. Bookings, 92 cols) → Create & Continue → observe long AI analysis wait.
3. Scroll table list with no search.
4. Trigger sync on a large table → Failed / risk of OOM.

## Root Cause
1. Schema slowness: not uniqueCount (always 0) — AI `analyzeColumns` on all columns + empty samples.
2. No search UI on table/collection/entity pickers.
3. ExtractStep buffered entire table in `ctx.rows` before LoadStep.

## Fix Applied
1. SQL Server TOP(5) samples; AI capped at 40 columns; uniqueCount remains 0.
2. Search on SQL Server, MongoDB Atlas, and shared entity-select.
3. Streaming load for sql_server/mongodb_atlas: sample extract + LoadStep page-by-page insert.

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `dataset.service.ts` (discoverSchema + AI)
- `sql-server.connector.ts` / query builder
- `extract.step.ts` / `load.step.ts` / `pipeline.engine.ts`
- `sql-server-connect.component.*`, `mongodb-atlas-connect.component.*`, `entity-select-step.component.ts`
