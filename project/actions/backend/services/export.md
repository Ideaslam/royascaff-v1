## Module: Export

### SVC-EXPORT · ExportService [internal, application, Export]
Produces dashboard exports — async PDF (queued), synchronous Excel workbook, and synchronous CSV.

**Methods:**
- `requestPdfExport(dashboardId, userId, userRole, ip?)` — creates job and enqueues pdf-export, audits EXPORT_PDF (no worker consumes this yet)
- `getExcelExport(dashboardId, userId, userRole, ip?): Promise<Buffer>` — builds ExcelJS workbook with one sheet per widget, audits EXPORT_EXCEL
- `getCsvExport(dashboardId, widgetId, userId, userRole, ip?): Promise<string>` — returns CSV text for one widget's aggregation, audits EXPORT_CSV

**Deps:** DashboardRepository · ChartWidgetRepository · BackgroundJobsService · AuditLogService · PDF_EXPORT_QUEUE (BullMQ) · STORAGE_PROVIDER · Mongo Connection (@InjectConnection)
**Side effects:** queue enqueue · audit writes
**Rules:** Owner-or-admin enforced on all exports · Excel sheet names truncated to 31 chars; _id field excluded · Aggregation failures per widget swallowed (one bad widget doesn't break export) · PDF export has no worker (jobs created but never processed)
