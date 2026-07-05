# Bug #012 — Google Sheets setup requires spreadsheet ID instead of URL

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-05
- **Severity**: medium
- **Affected area**: customer-portal/data/google-sheets-setup

## Description
On the Google Sheets setup wizard (Step 1), users must manually extract and paste the spreadsheet ID from the Google Sheets URL. Most users expect to paste the full URL directly.

## Expected Behavior
Users can paste either the full Google Sheets URL or a raw spreadsheet ID; the app extracts the ID before saving credentials.

## Steps to Reproduce
1. Connect Google Sheets via OAuth.
2. On the setup page, paste a full URL like `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit`.
3. Click "Discover Schema" — fails or sends invalid ID to the API.

## Root Cause
`GoogleSheetsSetupPage` binds the input directly to `spreadsheetId` and sends the raw value to the backend without parsing. The UI label and placeholder instruct users to copy only the ID segment from the URL.

## Fix Applied
- Add `extractSpreadsheetId()` utility to parse ID from a Google Sheets URL (or accept a plain ID).
- Update setup page to normalize input before validation and API calls.
- Update field label, placeholder, and validation message to refer to URL.

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/core/utils/google-sheets.util.ts` (new)
- `roya-ai-dynamo-frontend/src/app/pages/data/google-sheets-setup/google-sheets-setup.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/google-sheets-setup/google-sheets-setup.page.html`
