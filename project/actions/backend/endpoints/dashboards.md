## Module: Dashboards

`@Controller('dashboards')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DASH-01 | POST | /api/v1/dashboards | JWT | `CreateDashboardDto` { projectId, name, purposeDescription (min 10), fileIds[] } | 202 `{ dashboardId, jobId, status }` | SVC-DASH.createDashboard() | Async |
| EP-DASH-02 | GET | /api/v1/dashboards | JWT | query: projectId, page, limit, search, status | 200 `Paginated<DashboardListItemDto>` | SVC-DASH.listDashboards() | |
| EP-DASH-03 | GET | /api/v1/dashboards/:id | JWT | `:id` param | 200 `DashboardDetailsDto` | SVC-DASH.getDashboard() | Includes widgets + dataSources |
| EP-DASH-04 | GET | /api/v1/dashboards/:id/status | JWT | `:id` param | 200 `DashboardStatusDto` | SVC-DASH.getDashboardStatus() | Frontend polling |
| EP-DASH-05 | PATCH | /api/v1/dashboards/:id | JWT | `:id` · `UpdateDashboardDto` { name?, purposeDescription? } | 200 `DashboardDetailsDto` | SVC-DASH.updateDashboard() | |
| EP-DASH-06 | DELETE | /api/v1/dashboards/:id | JWT | `:id` param | 204 | SVC-DASH.deleteDashboard() | Cascades widgets, cache, share links |
| EP-DASH-07 | POST | /api/v1/dashboards/:id/duplicate | JWT | `:id` param | 201 `DashboardDetailsDto` | SVC-DASH.duplicateDashboard() | Clones dashboard + widgets |
| EP-DASH-08 | GET | /api/v1/dashboards/:id/widgets/:widgetId/data | JWT ǀ token | `:id`, `:widgetId` · query: shareToken?, filters? | 200 aggregation result (varies) | SVC-DASH.getChartData() | @SkipThrottle |
| EP-DASH-09 | POST | /api/v1/dashboards/:id/refresh | JWT | `:id` param | 202 `{ jobId, message }` | SVC-DASH.refreshDashboard() | Async; invalidates cache |
| EP-DASH-10 | POST | /api/v1/dashboards/:id/widgets | JWT | `:id` · `CreateWidgetDto` { widgetType, title, position, queryDefinition, displayConfig? } | 201 `ChartWidgetDto` | SVC-DASH.addWidget() | |
| EP-DASH-11 | PUT | /api/v1/dashboards/:id/widgets/:widgetId | JWT | `:id`, `:widgetId` · `UpdateWidgetDto` { widgetType?, title?, position?, queryDefinition?, displayConfig? } | 200 `ChartWidgetDto` | SVC-DASH.updateWidget() | Invalidates affected cache |
| EP-DASH-12 | DELETE | /api/v1/dashboards/:id/widgets/:widgetId | JWT | `:id`, `:widgetId` params | 204 | SVC-DASH.deleteWidget() | Clears widget cache |
| EP-DASH-13 | POST | /api/v1/dashboards/:id/generate/retry | JWT | `:id` param | 202 `{ jobId, status }` | SVC-DASH.retryGeneration() | Async |

**Notes:**
- [EP-DASH-01] Creates dashboard, links it to confirmed CSV files, queues AI generation job. `purposeDescription` used as AI context. `fileIds` must reference confirmed csvfiles.
- [EP-DASH-04] Returns `{ dashboardId, status, jobStatus, progress (0–100), errorMessage }`. Designed for frontend polling during generation.
- [EP-DASH-08] Resolves cached chart data or executes the widget's aggregation pipeline. Supports access via JWT or share token (via `shareToken` query param). `filters` is JSON-encoded. Returns empty result structure (not 404) when aggregation yields zero rows.
