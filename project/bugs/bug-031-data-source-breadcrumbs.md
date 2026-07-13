# Bug #031 — Data Source Module Breadcrumb Navigation Broken

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal/data (source-detail, dataset-detail, setup wizard)

## Description
Breadcrumb navigation in the data source module does not match the hierarchical pattern used elsewhere in the app (Projects, Dashboards). Pages use a single "back" link with a left arrow instead of a proper trail, and the dataset detail page does not link back to its parent data source — only to the top-level list.

## Expected Behavior
- **Source detail** (`/app/data/sources/:connectionId`): `Data Sources → {source name}`
- **Dataset detail** (`/app/data/datasets/:id`): `Data Sources → {source name} → {table name}` — middle segment links to the parent source
- **Setup wizard** (`/app/data/connect/:type`):
  - New connection: `Data Sources → Connect {source type}`
  - Re-enter from source (with `?connectionId=`): `Data Sources → {source name} → Add tables`
- Breadcrumbs use chevron separators (`pi-angle-right`), clickable ancestor segments, and i18n keys (EN/AR)
- Styling matches project-detail / dashboard-viewer breadcrumb pattern

## Steps to Reproduce
1. Open `/app/data` and click a data source card
2. Observe breadcrumb is a single "Back to Data Sources" link (not hierarchical)
3. Open a table from the source detail page
4. Observe breadcrumb links only to `/app/data` with no parent source name in the trail
5. Click "Add tables" on a source — setup wizard breadcrumb is also a single back link

## Root Cause
Data module pages were implemented with a legacy "back link" pattern (`pi-arrow-left` + single `<a routerLink="/app/data">`) instead of the hierarchical breadcrumb used in `project-detail.page.html` and `dashboard-viewer.page.html`.

Specific issues:
1. **`source-detail.page.html`** (lines 12–14): single back link; no current-page segment showing source name
2. **`dataset-detail.page.html`** (lines 29–34): links to `/app/data` only; ignores `dataset.connectionId` for parent source link; hardcoded English "Data Sources" (i18n key `DATA.DATASET_DETAIL.DATA_SOURCES` exists but is unused)
3. **`dataset-setup-wizard.page.html`** (lines 6–11): single back link; does not load connection name when `connectionId` query param is present
4. **SCSS** on all three pages: breadcrumb styles use back-link layout, not flex + chevron layout from `project-detail.page.scss`

`dataset-detail.page.ts` loads only the dataset via `getDataset()` — it never fetches the parent `DataConnection` needed for the middle breadcrumb segment.

## Fix Applied
Replaced back-link breadcrumbs with hierarchical trails matching the Projects/Dashboards pattern:

1. **source-detail** — `Data Sources → {source name}` with i18n and chevron separators
2. **dataset-detail** — loads parent `DataConnection` via `connectionId`; shows `Data Sources → {source name} → {table name}` with clickable middle segment
3. **dataset-setup-wizard** — conditional trail: with `connectionId` → `Data Sources → {name} → Add tables`; new connect → `Data Sources → Connect {type}`
4. **i18n** — added `DATA.BREADCRUMB.ADD_TABLES` and `DATA.BREADCRUMB.CONNECT` (EN/AR)
5. **SCSS** — aligned breadcrumb styles across all three pages with `project-detail` pattern

## Verification
- [x] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/data/source-detail/source-detail.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/data/source-detail/source-detail.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/dataset-detail.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/dataset-detail.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/dataset-detail.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.scss`
- `roya-ai-dynamo-frontend/public/i18n/en.json`
- `roya-ai-dynamo-frontend/public/i18n/ar.json`
