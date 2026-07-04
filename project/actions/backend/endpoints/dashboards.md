## Module: Dashboards

`@Controller('dashboards')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DASH-01 | POST | /api/v1/dashboards | JWT | `CreateDashboardDto` { projectId, name, purposeDescription (min 10), datasetIds[] } | 202 `{ dashboardId, jobId, status }` | SVC-DASH.createDashboard() | Async; `datasetIds` replaces legacy `fileIds` |
| EP-DASH-02 | GET | /api/v1/dashboards | JWT | query: projectId, page, limit, search, status | 200 `Paginated<DashboardListItemDto>` | SVC-DASH.listDashboards() | |
| EP-DASH-03 | GET | /api/v1/dashboards/:id | JWT | `:id` param | 200 `DashboardDetailsDto` | SVC-DASH.getDashboard() | Includes widgets + dataSources |
| EP-DASH-04 | GET | /api/v1/dashboards/:id/status | JWT | `:id` param | 200 `DashboardStatusDto` | SVC-DASH.getDashboardStatus() | Frontend polling |
| EP-DASH-05 | PATCH | /api/v1/dashboards/:id | JWT | `:id` · `UpdateDashboardDto` { name?, purposeDescription? } | 200 `DashboardDetailsDto` | SVC-DASH.updateDashboard() | |
| EP-DASH-06 | DELETE | /api/v1/dashboards/:id | JWT | `:id` param | 204 | SVC-DASH.deleteDashboard() | Cascades widgets, cache, share links |
| EP-DASH-07 | POST | /api/v1/dashboards/:id/duplicate | JWT | `:id` param | 201 `DashboardDetailsDto` | SVC-DASH.duplicateDashboard() | Clones dashboard + widgets |
| EP-DASH-08 | GET | /api/v1/dashboards/:id/widgets/:widgetId/data | JWT ǀ token | `:id`, `:widgetId` · query: shareToken?, filters? | 200 aggregation result (varies) | SVC-DASH.getChartData() | @SkipThrottle; OLAP path when querySpec present |
| EP-DASH-09 | POST | /api/v1/dashboards/:id/refresh | JWT | `:id` param | 202 `{ jobId, message }` | SVC-DASH.refreshDashboard() | Async; invalidates cache |
| EP-DASH-10 | POST | /api/v1/dashboards/:id/widgets | JWT | `:id` · `CreateWidgetDto` { widgetRequest (min 10) } | 201 `ChartWidgetDto` | SVC-DASH.addWidget() | Runs `add-widget` pipeline synchronously; AI generates widget |
| EP-DASH-11 | PUT | /api/v1/dashboards/:id/widgets/:widgetId | JWT | `:id`, `:widgetId` · `UpdateWidgetDto` { widgetRequest?, title?, position?, queryDefinition?, displayConfig? } | 200 `ChartWidgetDto` | SVC-DASH.updateWidget() | `widgetRequest` runs `edit-widget` pipeline; title/position for layout-only edits |
| EP-DASH-12 | DELETE | /api/v1/dashboards/:id/widgets/:widgetId | JWT | `:id`, `:widgetId` params | 204 | SVC-DASH.deleteWidget() | Clears widget cache |
| EP-DASH-13 | POST | /api/v1/dashboards/:id/generate/retry | JWT | `:id` param | 202 `{ jobId, status }` | SVC-DASH.retryGeneration() | Async |
| EP-DASH-14 | GET | /api/v1/dashboards/:id/filter-options | JWT ǀ token | `:id` · query: shareToken? | 200 `FilterValueMeta[]` | SVC-DASH.getFilterOptions() | No OLAP query; served from cache/store *(change-021)* |
| EP-DASH-15 | GET | /api/v1/dashboards/datasets/:datasetId/filter-values/:column/search | JWT ǀ token | `:datasetId`, `:column` · query: q (search string), shareToken? | 200 `{ value: unknown; count: number }[]` | SVC-DASH.searchFilterValues() | Typeahead; OLAP LIKE query for search-mode cols *(change-021)* |

**Notes:**
- [EP-DASH-01] Creates dashboard, links it to confirmed Datasets (or legacy CsvFiles), queues AI generation pipeline job. `purposeDescription` used as AI context. `datasetIds` must reference confirmed datasets. *(Renamed from `fileIds` in change-015)*
- [EP-DASH-04] Returns `{ dashboardId, status, jobStatus, progress (0–100), errorMessage }`. Designed for frontend polling during generation.
- [EP-DASH-08] Resolves cached chart data or executes the widget's query. When `widget.querySpec` is non-null, routes to OLAP via `AnalyticsStoreService.runQuery`; otherwise falls back to MongoDB aggregation. Supports access via JWT or share token. `filters` is JSON-encoded. Returns empty result structure (not 404) on no rows.
- [EP-DASH-14] Returns all AI-selected filter columns for the dashboard's linked datasets, including precomputed `values[]` (list mode) or empty values (search mode). Safe for high-traffic page opens — no OLAP query.
- [EP-DASH-15] Route is under `/dashboards/datasets/…` to avoid ambiguity with `/:id` parameter. Used for typeahead input on search-mode filter columns.
