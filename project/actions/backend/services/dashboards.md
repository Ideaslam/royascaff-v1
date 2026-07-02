## Module: Dashboards

### SVC-DASH · DashboardsService [internal, application, Dashboards]
Owns dashboard lifecycle, widget management, chart-data aggregation/caching, and generation/refresh orchestration.

**Methods:**
- `createDashboard(dto: CreateDashboardDto, userId, ip?)` — validates unique name + confirmed files, creates datasources, enqueues dashboard-generation, audits DASHBOARD_CREATE
- `listDashboards(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getDashboard(id, userId, userRole)` — returns dashboard with widgets + datasources
- `getDashboardStatus(id, userId, userRole)` — returns status, job status, and progress
- `updateDashboard(id, dto, userId, userRole, ip?)` — guarded update, audits DASHBOARD_UPDATE
- `deleteDashboard(id, userId, userRole, ip?)` — deletes widgets, cache, datasources, dashboard; invalidates Redis; audits DASHBOARD_DELETE
- `duplicateDashboard(id, userId, userRole, ip?)` — deep-copies dashboard + widgets + datasources, audits DASHBOARD_DUPLICATE
- `getChartData(dashboardId, widgetId, userId, userRole, shareToken?, filtersJson?)` — returns aggregated chart data; Redis + DB cache when unfiltered, fresh aggregation when filtered
- `refreshDashboard(id, userId, userRole, ip?)` — clears caches, enqueues cache-recalculation, audits DASHBOARD_REFRESH
- `addWidget(dashboardId, dto: CreateWidgetDto, userId, userRole, ip?)` — adds widget to READY dashboard
- `updateWidget(dashboardId, widgetId, dto: UpdateWidgetDto, userId, userRole, ip?)` — updates widget; invalidates cache when query changes
- `deleteWidget(dashboardId, widgetId, userId, userRole, ip?)` — removes widget and its caches
- `retryGeneration(id, userId, userRole)` — re-enqueues dashboard-generation for ERROR dashboard

**Deps:** DashboardRepository · ChartWidgetRepository · ChartDataCacheRepository · WidgetDefinitionRepository · CsvFileRepository · BackgroundJobRepository · BackgroundJobsService · AuditLogService · DASHBOARD_GENERATION_QUEUE (BullMQ) · CACHE_RECALCULATION_QUEUE (BullMQ) · Redis (ioredis, 1h TTL) · ConfigService · Mongo Connection (@InjectConnection) · DashboardDatasource model (@InjectModel)
**Side effects:** queue enqueue · Redis read/write/delete · Mongo aggregations · audit writes
**Rules:** Dashboard name unique within project · All datasource CSV files must be CONFIRMED before creation · Widgets added only when dashboard is READY · Filtered chart queries bypass persistent caches (always fresh); unfiltered cached in Redis (1h) + DB · Owner-or-admin enforced on all operations · Retry only from ERROR state · Aggregation failures return [] · Cache/Redis failures don't break reads

---

### SVC-DASH-SEED · WidgetDefinitionSeeder [internal, domain, Dashboards]
Startup seeder that upserts the widget catalog (bar, line, pie, donut, kpi_card, table, scatter, image, area, radar, funnel, heatmap, gauge, sparkline, timeline, map, text, empty_state, filter) used by AI generation.

**Methods:**
- `onModuleInit(): Promise<void>` — upserts every built-in widget definition, logging the count (failures logged, not thrown)

**Deps:** WidgetDefinitionRepository
**Side effects:** writes to widget-definition collection (idempotent upsert by widget type)
**Rules:** Idempotent upsert by widget type — safe to run on every boot
