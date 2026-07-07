# Bug #019 — Dashboard Charts, Filters, and Timeline All Broken

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-08
- **Severity**: high
- **Affected area**: customer-portal/dashboards, frontend/widgets

## Description
Multiple elements on the dashboard viewer are broken simultaneously:
1. **Charts broken** — some KPI cards show values, others are empty; bar/line charts may not render
2. **Filter dropdown shows "No results found"** — the ORDER STATUS filter (and likely others) has empty options after loading
3. **Timeline widget (Recent Orders) shows only dots** — event circles render but no title/description text is displayed

The user suspects a recent AI prompt change may have caused this, but the issue also appears to affect previously-generated/existing dashboards.

## Expected Behavior
- All chart/KPI widgets should display data from their respective OLAP queries
- Filter dropdowns should populate with distinct values from the dataset
- Timeline should show event cards with date, title, and description text

## Steps to Reproduce
1. Open a dashboard (e.g. "Sales Overview")
2. Observe KPI cards — some have values, some are empty
3. Click ORDER STATUS dropdown in the filter panel — shows "No results found"
4. Observe "Recent Orders" timeline — shows only purple circles, no text

## Root Cause
`gather-dataset-schemas.step.ts` reads `dataset.schema` which stores the **original CSV column names** (e.g. `Order_Status`, `Payment_Method`, `Order_Date`, `Customer_Name`). The AI uses these names to build `querySpec` and `queryDefinition`. However, the actual OLAP analytics table was built by the `apply-mapping` ingest step which renamed these to **canonical names** (`status`, `channel`, `order_date`, `customer_id`). The mismatch causes:
- OLAP GROUP BY queries to return `{labelField: null}` (column doesn't exist in table)
- KPI filter queries to return `[]` (WHERE status = 'Completed' but column is named wrong)
- Timeline to show only dots (dateField/titleField resolve to null/empty)
- Filter options to return `distinctCount: 0` (computed for wrong column name)

Secondary artifact: `Order_Date: null` appears in stored documents because the `type-cast` step processes schema columns (original names) after `apply-mapping` has already renamed them — it writes null for any schema column not found in the row.

## Fix Applied
1. **`gather-dataset-schemas.step.ts`** — Apply inverse of `dataset.columnMapping` when building the column list. Source column names (original CSV names) are now translated to their canonical equivalents (analytics-table names) before being passed to the AI.
2. **`dashboards.service.ts`** — `retryGeneration` now accepts dashboards in any non-generating state (previously ERROR-only), enabling force-regeneration of existing READY dashboards.
3. **`dashboards.service.ts` (frontend)** — Added `regenerate()` method calling `POST /dashboards/:id/generate/retry`.
4. **`dashboard-viewer.page.ts`** — Added "Regenerate widgets" option to the Export dropdown. Opens a confirmation dialog, shows the AI loader, then redirects to the generating screen.

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/pipelines/steps/dashboard/gather-dataset-schemas.step.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/services/dashboards.service.ts`
- `roya-ai-dynamo-frontend/src/app/core/services/dashboards.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/dashboard-viewer/dashboard-viewer.page.ts`
