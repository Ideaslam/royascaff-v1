# Bug #011 — Dashboard wizard shows only legacy CSV files, not Datasets

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-03
- **Severity**: high
- **Affected area**: customer-portal / `pages/projects/project-detail/project-detail.page.ts` + `core/models/dashboard.models.ts` + `core/services/dashboards.service.ts`

## Description
When creating a new dashboard the "Attach Data" step loads only legacy `CsvFile` records (via `GET /data/files?status=confirmed`). Datasets created via any of the new multi-source connectors (CSV on new foundation, Google Sheets, Shopify, Salla, Zid, SQL Server, MongoDB Atlas) never appear in the wizard. As a result users cannot attach any Dataset to a dashboard from the UI.

## Expected Behavior
The "Attach Data" step should list all synced `Dataset` records (any source type) whose `syncStatus` is `idle` (i.e. at least one successful sync). Users can select one or more; the wizard sends `datasetIds` to the backend.

## Root Cause
Three misalignments between frontend and backend:
1. `loadFiles()` calls `dataSvc.getFiles()` (legacy `/data/files`) instead of `dataSvc.listDatasets()`
2. `CreateDashboardRequest` uses `fileIds: string[]`; backend DTO is `datasetIds: string[]`
3. `dashboardsSvc.create()` is called with `{ fileIds }` — the backend receives an empty/wrong field

The backend `resolveDatasetIds()` already handles both new Dataset IDs and legacy CsvFile IDs — it is correct.

## Fix Applied
- `CreateDashboardRequest` model: rename `fileIds` → `datasetIds`
- `project-detail.page.ts`: load `listDatasets()`, filter to `syncStatus === 'idle'`, rename state/signals, pass `datasetIds` to `create()`
- HTML: show dataset name, source type badge, row count

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/core/models/dashboard.models.ts`
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.html`
