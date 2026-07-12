# Bug #026 — CSV upload stores data in main DB instead of OLAP

## Status
**PENDING** — Fix applied, awaiting user verification

## Fix Applied
1. Added `DataService.uploadSourceFile()` — uploads to R2 at `uploads/{workspaceSlug}/{id}/{filename}`, returns `{ storageKey, sheets? }` only. No `CsvFile`, no analysis job, no `csvdata_*` collection.
2. Added `POST /data/upload/source-file` endpoint in `DataController`.
3. Added `DataService.uploadSourceFile()` client method in frontend.
4. Updated `csv-connect.component.ts` to use the new endpoint instead of legacy `uploadFile()`.

Legacy `POST /data/upload/file` unchanged for `/app/data/upload` wizard.

## Verification
- [x] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Reported
- **Date**: 2026-07-12
- **Severity**: high
- **Affected area**: backend/data, customer-portal/data/setup (CSV connect wizard)

## Description
When uploading a CSV/Excel file through the new data-source setup wizard (`csv-connect`), the file is processed via the **legacy** upload path. This creates a `CsvFile` record in the main MongoDB database and inserts all parsed rows into a dynamic `csvdata_{fileId}` collection — instead of only storing the raw file in R2 and loading row data into the workspace OLAP engine during dataset sync.

## Expected Behavior
1. Upload raw file to Cloudflare R2 only (no `CsvFile` record, no `csvdata_*` collection).
2. Create `DataConnection` (credentials: `{ storageKey, sheetName? }`) + `Dataset`.
3. Schema discovery reads from R2 via `CsvConnector`.
4. Sync pipeline loads rows into the workspace OLAP table (ClickHouse / MongoDB OLAP / etc.) via `LoadStep`.

## Steps to Reproduce
1. Open data setup wizard → select CSV source.
2. Upload a CSV file and complete the wizard.
3. Observe main DB: a `csvfiles` document is created and a `csvdata_{fileId}` collection is populated with all rows.
4. OLAP sync may also run, but main DB already holds duplicate row data.

## Root Cause
`csv-connect.component.ts` calls `DataService.uploadFile()` → `POST /data/upload/file`, which is the **legacy** endpoint implemented in `DataService.uploadFile()`:

1. Creates a `CsvFile` document via `csvFileRepo.create()`.
2. Uploads to R2 (correct).
3. Enqueues `CSV_ANALYSIS` job → `CsvAnalysisProcessor.parseAndStoreRows()` inserts all rows into `this.dbConnection.db.collection('csvdata_${fileId}')` in the **main** MongoDB.

The new connector-based flow (DataConnection → Dataset → sync pipeline → OLAP) is wired correctly **after** upload, but the upload step still uses the legacy path designed for the old `CsvFile`/`csvdata_*` architecture.

## Fix Applied (implemented)
See **Fix Applied** section above.

## Related Files
- `roya-ai-dynamo-api/src/modules/data/services/data.service.ts` (add `uploadSourceFile`)
- `roya-ai-dynamo-api/src/modules/data/controllers/data.controller.ts` (add endpoint)
- `roya-ai-dynamo-frontend/src/app/core/services/data.service.ts` (add client method)
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/csv-connect.component.ts` (switch upload call)
