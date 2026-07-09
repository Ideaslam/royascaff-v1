## Module: Sharing (public)

### Shared Dashboard Viewer
- Route: `/shared/:token`
- Components: SharedViewerPage (dashboard title, widget grid read-only, loading skeleton, token error state); FilterWidget via WidgetRenderer
- Service: Direct HttpClient → `GET /api/v1/shared/:token` for initial layout + cached chartData; `DashboardsService.getFilterOptions` / `searchFilterValues` / `getWidgetData` with `shareToken` for interactive filters *(change-051)*
- Guard: none (public, token-gated)
- Notes: No app shell or auth. Honors link permission and expiry; increments access count server-side. Passes `dashboardId` + `shareToken` into filter widgets. Subscribes to `FilterService` and re-fetches queryable widgets with filters when the user changes a control. *(change-051)*
