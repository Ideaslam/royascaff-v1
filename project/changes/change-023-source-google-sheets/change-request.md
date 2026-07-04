# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, `connectors`, `integrations` (Google)
- Feature(s): Google Sheets data source
- Endpoint(s): Google OAuth connect/callback, sheet/range picker, dataset create
- Page(s)/View(s): customer-portal: connect Google, pick spreadsheet/sheet/range
- Service(s): `GoogleSheetsConnector`, Google OAuth provider

## Description
Add **Google Sheets** as a connector (closest to CSV — validates scheduled sync end-to-end). Treat a sheet/range as a remote tabular dataset.

Desired behavior:
- Google OAuth connect flow (reuse existing Google OAuth config) → store encrypted token as a `DataConnection` (`sourceType: google_sheets`).
- `discoverSchema` reads the header row + sample; `extract` reads the selected sheet/range via the Sheets API (paged); `normalize` → `load` through the ingest pipeline.
- User picks spreadsheet → sheet → optional range; creates a `Dataset` with AI mapping/flag proposal.
- `syncPolicy` supports **scheduled** refresh (hourly/daily) + manual refresh; incremental not required (sheet re-read), but guard against schema/column moves (drift → change-029).
- Frontend: connect Google, pick spreadsheet/sheet/range, review mapping/flag, set refresh schedule.

Out of scope: e-commerce/SQL sources; write-back to Sheets.

## Acceptance Criteria
1. A user can connect Google via OAuth; the token is stored encrypted as a `DataConnection`.
2. The user can pick a spreadsheet, sheet, and optional range; schema is discovered with an AI mapping/flag proposal.
3. Sync loads sheet rows into the OLAP engine via the ingest pipeline and records a `SyncRun`.
4. Scheduled refresh (hourly/daily) and manual refresh both work; "last updated X ago" is shown.
5. Column additions/moves are detected and surfaced (drift), not silently mismapped.
6. A dashboard can be generated from a Google Sheets dataset (and combined with other datasets).

## Notes (optional)
- Depends on: 014–021. Reuses Google OAuth config already present in backend config.
- Rate limits: page reads and back off; respect Sheets API quotas.
- Reference: `Phases.md` C25.
