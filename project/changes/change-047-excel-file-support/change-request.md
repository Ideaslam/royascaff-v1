# Change Request — change-047

## Metadata

| Field | Value |
|-------|-------|
| change-id | change-047 |
| change-type | modify-feature |
| target-app | backend + customer-portal |
| affected-repos | `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend` |
| priority | high |
| author | user |
| date | 2026-07-07 |

## Scope

Module **S10 — Connectors**: CSV Connector + Google Sheets Connector.

---

## Description

### Problem

1. **CSV source only accepts `.csv` files.** Users who have their data in Excel (`.xlsx` / `.xls`) must manually convert to CSV before uploading — a friction point that causes failed uploads and confusion.

2. **Google Sheets source rejects Office files with an opaque API error.** When a user pastes a Google Drive URL that points to an Excel file (an uploaded Office file opened in compatibility mode), the Sheets API v4 returns `FAILED_PRECONDITION: "The document must not be an Office file."` — an unintelligible error in the UI. The user's intent (read tabular data from that document) is valid.

### Desired Behavior

**CSV — Excel support:**
- File upload (`POST /data/upload/file`) accepts `.csv`, `.xlsx`, and `.xls` files.
- When the uploaded file is Excel, the backend extracts its sheet names using `exceljs` and returns them in the response as `sheets: string[]`.
- The frontend shows a **sheet picker** when the response includes multiple sheets (no picker when single sheet or CSV).
- The selected `sheetName` is stored in the DataConnection credentials alongside `storageKey`.
- The `CsvConnector` detects the file extension from `storageKey`; for Excel files it uses `exceljs` to read the specified sheet (or first sheet if none stored) and produces rows in the same format as the CSV path.

**Google Sheets — Office file support:**
- The `GoogleSheetsConnector` catches the `FAILED_PRECONDITION` (code 400) error returned by Sheets API v4.
- On fallback, it uses the Google Drive API (`drive.files.export`) with `mimeType: 'text/csv'` to export the Office file.
- The exported CSV is parsed with `csv-parse` and used as the data source.
- `drive.readonly` OAuth scope is **already requested** — no re-authentication required for existing connections.
- Limitation: Drive CSV export always uses the first/default sheet of the Office file; `sheetTitle` stored in credentials is ignored for Office files (noted in logs).

### Who is Affected

All users of the CSV upload flow and the Google Sheets connect flow.

### User Story (Happy Path)

- **CSV / Excel**: User clicks Browse, selects `sales.xlsx`. Frontend shows "sales.xlsx (1.2 MB)" with a sheet picker if multiple sheets are detected. User picks `Sheet2`, clicks Continue, and the rest of the setup wizard runs as before.
- **Google Sheets / Office**: User pastes a Google Drive URL that points to an uploaded `.xlsx`. The connector silently falls back to Drive API export and reads the data; schema discovery and subsequent syncs succeed without error.

### Out of Scope

- Excel files within the **legacy** `CsvFile`/`csvfiles` upload flow (only the new DataConnection-based CSV connector is updated).
- Converting Office files to native Google Sheets via Drive API (copy/conversion) — only read-only export is used.
- Support for `.ods`, `.numbers`, or other spreadsheet formats.
- Multi-sheet Office file export for Google Sheets (Drive export always uses the first sheet).

---

## Acceptance Criteria

1. `POST /data/upload/file` accepts `.csv`, `.xlsx`, `.xls` files; rejects other types with 400.
2. When an Excel file is uploaded, the response includes `sheets: string[]` with the sheet tab names.
3. When response `sheets` has exactly one entry, no sheet picker is shown; the single sheet is used automatically.
4. When response `sheets` has multiple entries, the frontend shows a dropdown/selector and the user must pick before continuing.
5. `CsvConnector.discoverSchema` and `extract` work correctly for both CSV and Excel files, using the `sheetName` stored in credentials.
6. `GoogleSheetsConnector.discoverSchema` succeeds when the spreadsheetId points to an Office file (Drive API fallback), returning correct column headers and sample data.
7. `GoogleSheetsConnector.extract` succeeds for Office files via the Drive API fallback.
8. A server log at `warn` level is emitted when Drive API fallback is used (for observability).
9. No regressions: existing CSV-only connections and native Google Sheets connections continue to work.

---

## Notes

- `exceljs` is already a backend dependency (`^4.4.0`).
- `csv-parse` is already a backend dependency (`^7.0.0`).
- `googleapis` Drive API client is already available (used by `GoogleSheetsConnector` for Sheets API).
- `drive.readonly` scope is already in `GoogleOAuthService.scopes` — no OAuth consent change needed.
