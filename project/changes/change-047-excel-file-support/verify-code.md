# Code Verification — change-047

## Acceptance Criteria Check

| # | Criterion | Result | Evidence |
|---|-----------|--------|---------|
| 1 | `POST /data/upload/file` accepts `.csv`, `.xlsx`, `.xls`; rejects others with 400 | ✅ PASS | `data.controller.ts` L46-48: extension check allows all three; throws `BadRequestException` for all others |
| 2 | Excel upload response includes `sheets: string[]` | ✅ PASS | `data.service.ts`: `ExcelJS.Workbook.xlsx.load()` extracts sheet names; spread into response object |
| 3 | Single-sheet Excel: no picker shown, sheet used automatically | ✅ PASS | `csv-connect.component.ts`: `if (sheets && sheets.length === 1) { this.selectedSheet = sheets[0]; }` — picker shown only when `sheets.length > 1` |
| 4 | Multi-sheet Excel: frontend shows sheet picker before continuing | ✅ PASS | `csv-connect.component.ts`: `p-select` shown when `availableSheets.length > 1`; Continue button disabled until selection made |
| 5 | `CsvConnector.discoverSchema` works for CSV and Excel | ✅ PASS | `csv.connector.ts`: `isExcel(key)` routes to `readExcelRows()` (exceljs) or `csv-parse` path; both return `DiscoveredColumn[]` |
| 6 | `GoogleSheetsConnector.discoverSchema` succeeds for Office files | ✅ PASS | `google-sheets.connector.ts`: try/catch wraps Sheets API call; `isOfficePreconditionError()` catches FAILED_PRECONDITION; falls back to `exportViaDrive()` → `csv-parse` |
| 7 | `GoogleSheetsConnector.extract` succeeds for Office files | ✅ PASS | Same fallback pattern in `extract()`: Drive export → parse → yield batches |
| 8 | Warn log emitted on Drive fallback | ✅ PASS | `this.logger.warn('GoogleSheetsConnector: Office file detected...')` called in both `discoverSchema` and `extract` fallback paths |
| 9 | No regressions: existing CSV and native Google Sheets connections work | ✅ PASS | CSV path: `isExcel()` returns false for `.csv` → original `csv-parse` code path unchanged. Google Sheets path: Sheets API used first; fallback only triggered by FAILED_PRECONDITION |

## Code Checks

| Check | Result | Notes |
|-------|--------|-------|
| Endpoints in code | ✅ PASS | `POST /data/upload/file` modified in-place; route unchanged |
| No new endpoints introduced | ✅ PASS | Only existing endpoint modified |
| Code layering (BE) | ✅ PASS | Controller delegates to `DataService`; connectors are isolated in integrations layer |
| Frontend isolation | ✅ PASS | All API calls via `DataService`; no direct HTTP in component |
| Auth unchanged | ✅ PASS | JWT guard on upload endpoint unchanged |
| No new packages | ✅ PASS | `exceljs`, `csv-parse`, `googleapis` all already present |
| `drive.readonly` scope | ✅ PASS | Already declared in `GoogleOAuthService.scopes` — no re-auth needed |
| New lints introduced | ✅ PASS | Zero new lint errors; all remaining errors in modified files are pre-existing |
| Frontend lints | ✅ PASS | `csv-connect.component.ts` has 0 lint errors |

## Files Modified

| File | Change |
|------|--------|
| `src/modules/data/controllers/data.controller.ts` | Accept `.csv`, `.xlsx`, `.xls`; reject others |
| `src/modules/data/services/data.service.ts` | Extract sheet names via ExcelJS; return `sheets?` |
| `src/integrations/connectors/csv/csv.connector.ts` | Excel path via ExcelJS in `discoverSchema` + `extract` |
| `src/integrations/connectors/google-sheets/google-sheets.connector.ts` | Drive API fallback for FAILED_PRECONDITION |
| `src/app/pages/data/setup/connect/csv-connect.component.ts` | Accept all types; sheet picker; pass `sheetName` in credentials |

## Overall: PASS
