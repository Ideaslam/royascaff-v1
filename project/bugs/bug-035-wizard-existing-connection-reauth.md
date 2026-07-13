# Bug #035 — Data Source wizard re-auths when choosing an existing Connection

## Status
**DONE** — **Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: high
- **Affected area**: customer-portal/data/setup (wizard + connect components)

## Description
When creating a new Data Source and choosing an existing Connection on the Choose Connection step, the wizard still sent the user through auth again (OAuth button or DB credentials form) instead of reusing the selected Connection.

## Expected Behavior
Choosing an existing Connection skips auth and continues with type-specific scope / entity selection (spreadsheet, tables, collections, or e-commerce resources) using that Connection.

## Steps to Reproduce (if applicable)
1. Ensure at least one Connection exists for a type (Google Sheets, SQL Server, MongoDB, Zid, etc.).
2. Go to Connect Source → pick that type.
3. On Choose Connection, select the existing Connection, enter a Data Source name, Continue.
4. Observe: auth UI appears (OAuth / credentials) instead of scope or entity selection.

## Root Cause
1. Connect components were mounted once with `connectionId = null` and never remounted/updated when an existing Connection was chosen.
2. Google Sheets / SQL / Mongo then showed auth UI; e-commerce already skipped to `select-entities`.

## Fix Applied
1. Wizard remounts the connect component with `connectionId` + `dataSourceId` after an existing Connection is chosen.
2. Existing + e-commerce → `select-entities`. Existing + GS/SQL/Mongo → scope/tables UI only (no OAuth/credentials).
3. Choose Connection: auto-fill data source name from connection; connection list search.
4. Mongo list-collections accepts optional `database` body for URI-only Connections.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/source-connect.contract.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/choose-connection-step.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/google-sheets-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/sql-server-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/mongodb-atlas-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/mongodb-atlas-connect.component.html`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/zid-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/salla-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/shopify-connect.component.ts`
- `roya-ai-dynamo-frontend/src/app/core/services/data.service.ts`
- `roya-ai-dynamo-api/src/modules/data/controllers/mongodb-atlas.controller.ts`
