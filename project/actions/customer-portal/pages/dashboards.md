## Module: Dashboards

### Dashboard Generating Page
- Route: `/app/dashboards/:id/generating`
- Components: DashboardGeneratingPage (progress indicator + status text, retry on error)
- Service: DashboardsService.getStatus() → `GET /api/v1/dashboards/:id/status` (polled every ~3s)
- Guard: authGuard + onboardingGuard
- Notes: Generation runs as async BullMQ job. On `ready` redirects to viewer; on `error` shows retry.

### Dashboard Viewer Page
- Route: `/app/dashboards/:id` (`?shareToken=`)
- Components: DashboardViewerPage (breadcrumb Projects → project name → dashboard name, title + purpose description, toolbar with add widget/edit layout/refresh/share/export/delete, widget grid with chart.js + angular-gridster2, add/edit widget AI dialogs, per-widget edit/delete in layout mode, share dialog with permission/expiry/link list, export menu)
- Service: DashboardsService.get() → `GET /api/v1/dashboards/:id`; ProjectsService.get() → `GET /api/v1/projects/:id` (breadcrumb project name); DashboardsService.remove() → `DELETE /api/v1/dashboards/:id`; DashboardsService.addWidget() → `POST /api/v1/dashboards/:id/widgets` { widgetRequest }; DashboardsService.updateWidget() → `PUT /api/v1/dashboards/:dashboardId/widgets/:widgetId` { widgetRequest | title | position }; DashboardsService.removeWidget() → `DELETE /api/v1/dashboards/:dashboardId/widgets/:widgetId`; DashboardsService.getWidgetData() → `GET /api/v1/dashboards/:dashboardId/widgets/:widgetId/data`; DashboardsService.refresh() → `POST /api/v1/dashboards/:id/refresh`; DashboardsService.listShareLinks() → `GET /api/v1/dashboards/:dashboardId/share`; DashboardsService.createShareLink() → `POST /api/v1/dashboards/:dashboardId/share`; DashboardsService.revokeShareLink() → `DELETE /api/v1/dashboards/:dashboardId/share/:shareLinkId`; ExportService.exportPdf() → `POST /api/v1/dashboards/:dashboardId/export/pdf`; ExportService.exportExcel() → browser GET `/api/v1/dashboards/:dashboardId/export/excel?token=...`
- Guard: authGuard + onboardingGuard
- Notes: PDF export is queued; worker is **not implemented yet** so file is not produced. Chart data served from Redis cache when fresh. Layout edits (drag/rename/resize) save via updateWidget title/position. Add/edit widget uses AI pipeline with natural-language `widgetRequest`; a blocking AI loader popup with rotating status messages displays during generation, then the dashboard reloads to show results. Delete confirms then removes widget. Delete dashboard confirms then navigates back to parent project; does not restore dashboard quota.
