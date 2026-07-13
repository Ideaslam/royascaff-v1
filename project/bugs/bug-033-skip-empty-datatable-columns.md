# Bug #033 — Skip empty datatables in datasource pipeline

## Status
**DONE** — **Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal/data/setup (dataset-setup-wizard, schema-review-step)

## Description
In the datasource setup pipeline, when a selected datatable has zero columns (empty sheet, empty SQL table, etc.), the wizard blocks the user on the Schema Review step. The "Confirm & Continue" button stays disabled and the user cannot proceed to Schedule & Sync for the remaining tables.

## Expected Behavior
Tables with no columns should be automatically skipped during schema review so the user can continue the setup flow for all other tables, regardless of datasource type.

## Steps to Reproduce (if applicable)
1. Connect any datasource (e.g. Google Sheets, SQL Server).
2. Select multiple tables/sheets, including at least one with no columns.
3. Complete schema discovery.
4. On Schema Review, land on the empty table.
5. Observe: empty column table, disabled "Confirm & Continue" — wizard is stuck.

## Root Cause
Schema review requires at least one selected column before continuing:

1. **`schema-review-step.component.ts`** — `canConfirm()` returns `false` when `editableCols` is empty; `emitConfirm()` shows "Select at least one column to continue."
2. **`dataset-setup-wizard.page.ts`** — No logic to auto-skip tables with zero columns when entering or advancing schema review. `confirmDatasetWithAi()` treats empty tables as errors (`No columns for ${ds.name}`), counting them as failures in "Confirm All Tables".
3. **`dataset-setup-wizard.page.ts`** — `onScheduleFinish()` syncs all datasets in the list, including empty ones that were never confirmed.

The backend `identify-columns` pipeline step already skips AI for empty schemas, and schema discovery marks them SUCCESS with `[]` columns — the blockage is purely in the frontend wizard UX.

## Fix Applied
Implemented auto-skip for tables with zero columns across the datasource setup wizard:

1. **`dataset-setup-wizard.page.ts`** — Added `datasetHasColumns()`, `skipEmptyTablesFrom()`, `goToSchemaReview()`, and `syncableDatasets` computed. Empty tables are auto-skipped on schema-review entry and when advancing. `confirmDatasetWithAi()` treats empty tables as skipped (not failed). Schedule/sync only runs on tables with columns.

2. **`schema-review-step`** — Added empty-state banner with **Skip & Continue** fallback button when auto-skip does not apply.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.ts`
- `roya-ai-dynamo-frontend/src/app/shared/components/schema-review-step/schema-review-step.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/components/schema-review-step/schema-review-step.component.html`
