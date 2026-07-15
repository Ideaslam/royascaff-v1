# Bug #037 — Confirm All Tables runs sequentially

## Status
**DONE** — **Confirmed**: 2026-07-15

## Reported
- **Date**: 2026-07-15
- **Severity**: medium
- **Affected area**: customer-portal/data/setup (dataset-setup-wizard, schema-review-step)

## Description
In the schema review pipeline step, clicking **Confirm All Tables** processes each dataset one at a time. With multiple tables this is slow because each table triggers two sequential API calls (`confirm-schema-selection` then `confirm-mapping`) before the next table starts.

## Expected Behavior
Confirm All Tables should process all datasets in parallel (or via a single bulk backend request), so total wait time is roughly one table's duration instead of N × table duration.

## Steps to Reproduce
1. Connect a multi-table datasource (e.g. Google Ads, SQL Server, Shopify).
2. Select multiple tables and complete schema discovery.
3. On Schema Review, click **Confirm All Tables**.
4. Observe in Network tab: `confirm-schema-selection` / `confirm-mapping` requests fire one table at a time, not concurrently.

## Root Cause
`dataset-setup-wizard.page.ts` → `onConfirmAllTables()` uses RxJS `from(list).pipe(concatMap(...))`, which processes datasets **strictly sequentially**. Each dataset also chains two HTTP calls via `confirmDatasetWithAi()` → `confirmSchemaSelection` then `confirmMapping` with another inner `concatMap`.

No bulk backend endpoint exists for multi-dataset schema confirm. `forkJoin` is already imported in the file but unused for this flow.

Backend `confirmSchemaSelection` / `confirmMapping` operate on independent dataset documents — safe to parallelize per dataset.

## Proposed Fix (Path B — frontend only)
Replace `from(list).pipe(concatMap, toArray)` with `forkJoin(list.map(ds => confirmDatasetWithAi(ds).pipe(catchError(...))))` so all tables confirm concurrently. Keep per-dataset error handling and empty-table skip logic unchanged.

## Fix Applied
`dataset-setup-wizard.page.ts` → `onConfirmAllTables()` now uses `forkJoin` instead of `from().pipe(concatMap())`. All tables start confirming concurrently; per-table `confirmSchemaSelection` → `confirmMapping` chain remains sequential within each table.

## Verification
- [x] Fix implemented in code
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.ts`
- `roya-dynamo-frontend/src/app/shared/components/schema-review-step/schema-review-step.component.html`
