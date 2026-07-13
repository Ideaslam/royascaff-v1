# Bug #032 — Dashboard wizard data source selection hard to use and optional

## Status
**DONE** — **Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal / `pages/projects/project-detail` (create dashboard wizard, step 2)

## Description
When creating a dashboard, the "Attach Data" step shows a plain text list of synced datasets that is hard to scan and choose from. The UI copy marks data sources as optional, and the user can click "Generate Dashboard" without selecting any — producing a dashboard with no attached data.

## Expected Behavior
1. The data source selection step should clearly display available synced datasets with recognizable source-type visuals so users can easily pick one or more.
2. The user must select at least one data source before proceeding to generate the dashboard.
3. If none are selected, show a clear validation message and keep the Generate button disabled.

## Steps to Reproduce
1. Open a project → click **New Dashboard**
2. Fill in name and purpose → click **Next**
3. On "Attach Data" step, do not select any dataset
4. Click **Generate Dashboard** → dashboard is created with `datasetIds: []`

## Root Cause
Three gaps in `ProjectDetailPage`:

1. **UX** — Step 1 uses a minimal flat list (`.file-item`) with only text name + source type label. No source icons, no search, no selection summary. Dialog is narrow (560px) making scanning harder when multiple datasets exist.

2. **Copy** — `FILES_HINT` i18n string explicitly says selection is *optional*, contradicting the business need to attach data before generation.

3. **Validation** — `createDashboard()` only checks `dashboardForm.invalid`. `selectedDatasetIds` is never validated. The Generate button has no `[disabled]` binding for empty selection.

```120:124:roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts
  createDashboard() {
    if (this.dashboardForm.invalid) return;
    // no check on selectedDatasetIds().length
    ...
    datasetIds: this.selectedDatasetIds()
```

## Fix Applied
Redesigned step 1 of the create-dashboard wizard and added required-selection validation. Extended with lite API endpoint (`GET /data/datasets/lite`) for server-side filtering, pagination, and type-grouped UI.

### Backend — `GET /data/datasets/lite` (EP-DATA-50)
- Lite projection: `_id`, `name`, `sourceType`, `rowCount`, `columnCount`
- Filters: `search`, `sourceType`, `page`, `limit`
- Only synced datasets (`analyticsTable != null`)
- Returns paginated `items` + `groups` (counts per source type)

### UI redesign
- Type filter chips with counts from server
- Datasets grouped by source type within each page
- Server-side search + pagination
- Selection persists across pages; Generate disabled until ≥1 selected
- Selected tray at top with removable chips + Clear all

### i18n
- Updated `FILES_HINT` to required wording (EN + AR)
- Added dataset picker keys including `DATASETS_ALL_TYPES`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/data/repositories/dataset.repository.ts`
- `roya-ai-dynamo-api/src/modules/data/services/dataset.service.ts`
- `roya-ai-dynamo-api/src/modules/data/controllers/datasets.controller.ts`
- `roya-ai-dynamo-frontend/src/app/core/models/data.models.ts`
- `roya-ai-dynamo-frontend/src/app/core/services/data.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.scss`
- `roya-ai-dynamo-frontend/public/i18n/en.json`
- `roya-ai-dynamo-frontend/public/i18n/ar.json`
