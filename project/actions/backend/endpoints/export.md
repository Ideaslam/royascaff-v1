## Module: Export

`@Controller('dashboards')` — shares controller prefix with Dashboards module

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-EXPORT-01 | POST | /api/v1/dashboards/:id/export/pdf | JWT | `:id` param | 202 `{ jobId, message }` | SVC-EXPORT.requestPdfExport() | Async; **worker not implemented** |
| EP-EXPORT-02 | GET | /api/v1/dashboards/:id/export/excel | JWT | `:id` param | 200 raw `.xlsx` stream | SVC-EXPORT.getExcelExport() | Bypasses success envelope |
| EP-EXPORT-03 | GET | /api/v1/dashboards/:id/export/csv | JWT | `:id` · query: widgetId | 200 raw CSV stream | SVC-EXPORT.getCsvExport() | Bypasses success envelope |

**Notes:**
- [EP-EXPORT-01] PDF job is queued but **no worker processes PDF export jobs yet** — export never completes. See Known Gaps.
- [EP-EXPORT-02] Header: `Content-Disposition: attachment; filename="dashboard-{id}.xlsx"`.
- [EP-EXPORT-03] Header: `Content-Disposition: attachment; filename="widget-{widgetId}.csv"`.
