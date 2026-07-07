# Impact Analysis — change-047

## Feature State

| Area | State |
|------|-------|
| CSV Connector (S10) | **complete** — Excel reading not supported; `upload/file` rejects non-CSV; `CsvConnector` uses only `csv-parse` |
| Google Sheets Connector (S10) | **complete** — no fallback for FAILED_PRECONDITION; fails with opaque error on Office files |
| Frontend CSV Connect | **complete** — `accept=".csv"` only; no sheet picker |

## Code Reconnaissance

### Backend

| File | Path | Action |
|------|------|--------|
| `data.controller.ts` | `src/modules/data/controllers/data.controller.ts` | **Modify** — remove CSV-only check at L46-48; accept `.csv`, `.xlsx`, `.xls`; reject all other extensions |
| `data.service.ts` | `src/modules/data/services/data.service.ts` | **Modify** — in `uploadFile()`: detect Excel by extension; use `exceljs.Workbook.xlsx.load(buffer)` to extract sheet names; return `sheets?: string[]` in response (backward-compatible addition) |
| `csv.connector.ts` | `src/integrations/connectors/csv/csv.connector.ts` | **Modify** — detect file type by `storageKey` extension; for `.xlsx`/`.xls` use `exceljs` to read the sheet named in credentials (`sheetName`) or first sheet; return same row format as CSV path in both `discoverSchema` and `extract` |
| `google-sheets.connector.ts` | `src/integrations/connectors/google-sheets/google-sheets.connector.ts` | **Modify** — in `discoverSchema` and `extract`: wrap Sheets API call in try/catch; on `FAILED_PRECONDITION` (code 400) fall back to `google.drive({ version: 'v3' }).files.export({ fileId, mimeType: 'text/csv' })`; parse CSV via `csv-parse/sync`; log warn on fallback |

### Frontend

| File | Path | Action |
|------|------|--------|
| `csv-connect.component.ts` | `src/app/pages/data/setup/connect/csv-connect.component.ts` | **Modify** — `accept=".csv,.xlsx,.xls"`; handle `sheets?` in upload response; show PrimeNG `p-dropdown` sheet picker when `sheets.length > 1`; auto-select single sheet silently; pass `sheetName` in `createConnection` credentials; fix auto-name stripping to remove any extension |

## Ripple Map

| Ripple | Action | Justification |
|--------|--------|---------------|
| `data.service.ts` response shape | backward-compatible | adds `sheets?` field; callers that don't use it are unaffected |
| Existing CSV connections | no change | `sheetName` absent in old credentials → connector uses first sheet (safe default) |
| Existing Google Sheets native connections | no change | Sheets API succeeds; fallback never triggered |
| Google OAuth scope (`drive.readonly`) | **already present** in `GoogleOAuthService.scopes` | no re-authentication needed |

## Dependencies Confirmed

| Item | Status |
|------|--------|
| `exceljs ^4.4.0` | already in `roya-ai-dynamo-api/package.json` |
| `csv-parse ^7.0.0` | already in `roya-ai-dynamo-api/package.json` |
| `googleapis` (Drive v3) | already used by `GoogleSheetsConnector` |
| `drive.readonly` OAuth scope | already declared in `GoogleOAuthService` |

## Planning Docs to Update

| Doc | Section | Change |
|-----|---------|--------|
| `project/actions/backend/endpoints/data.md` | EP-DATA-01 | Accept types → CSV / XLSX / XLS; response → add `sheets?: string[]` |
| `project/actions/backend/services/connectors.md` | SVC-CONN-CSV | Document Excel support, `sheetName` in credentials, `exceljs` usage |
| `project/actions/backend/services/connectors.md` | SVC-CONN-GOOGLE | Document Drive API fallback for FAILED_PRECONDITION |
| `project/actions/customer-portal/pages/data.md` | CSV connect page | Accept attribute change + sheet picker step |
| `project/plan/modules.md` | S10 feature 3 | Update CSV Connector description to include Excel |

## Risks

| Risk | Mitigation |
|------|------------|
| Large Excel files (up to 50 MB) slow to load via `exceljs` | `exceljs` is streaming-capable; reads only the target sheet; same 50 MB limit as CSV |
| Drive API rate limits | fallback is rare (only for Office files); Drive export is a single API call per sync |
| First-sheet-only for Office exports from Google | logged as warning; documented limitation |
