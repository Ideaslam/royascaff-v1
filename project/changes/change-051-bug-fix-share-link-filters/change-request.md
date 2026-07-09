# Change Request

## Metadata
- **date**: 2026-07-09
- **change-type**: bug-fix
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Dashboards, Sharing
- Feature(s): Dashboard filters on public share links
- Endpoint(s): EP-DASH-14 (`GET /dashboards/:id/filter-options`), EP-DASH-15 (`GET /dashboards/datasets/:datasetId/filter-values/:column/search`), EP-DASH-08 (`GET /dashboards/:id/widgets/:widgetId/data`)
- Page(s)/View(s): customer-portal: shared-viewer; filter-widget
- Service(s): DashboardsService.getFilterOptions / searchFilterValues; SharingService (token resolve); FilterWidgetComponent; SharedViewerPage

## Description
On the main dashboard, filters load options and re-query widgets correctly. On the public share-link page (`/shared/:token`), the filter widget stays stuck on **"Loading filters…"**.

Root causes:
1. **Shared viewer never passes `dashboardId`** into `app-widget-renderer`, so `FilterWidgetComponent` never calls `fetchFilterOptions()` (it waits for a non-empty `dashboardId`).
2. **Filter-options / filter-search APIs require JWT** (`@CurrentUser()`), but share-link viewers are anonymous. Plan already specifies `JWT | token` + `shareToken?` for EP-DASH-14/15; code does not implement that yet.
3. **Shared viewer serves static `chartData`** from `GET /shared/:token` and does not subscribe to `FilterService` or re-fetch widget data with filters + share token (unlike dashboard-viewer).

Desired outcome: share-link viewers can load filter controls and apply filters so charts/KPIs update, same as the authenticated dashboard (read-only).

Out of scope: redesigning filter UI; changing share-link permissions model; admin panel.

## Acceptance Criteria
1. Opening a share link with a filter widget shows filter controls (not infinite "Loading filters…").
2. Select/date/search filters work for anonymous share viewers via `shareToken` (no JWT required).
3. Changing a filter reloads other widgets on the share page with filtered data.
4. Authenticated main dashboard filter behavior remains unchanged.
5. Invalid/expired share tokens still return 401/410 on filter endpoints.

## Notes
- Escalated from Path B bug-fix (touches frontend + backend auth path).
- Related bug log: will link as ESCALATED from bug-023.
- Plan docs for EP-DASH-14/15 already claim shareToken support — align implementation with plan.
