## Module: Dashboards

### SVC-DASH · DashboardsService [internal, application, Dashboards]
Owns dashboard lifecycle, widget management, chart-data aggregation/caching, and generation/refresh orchestration.

**Methods:**
- `createDashboard(dto: CreateDashboardDto, userId, ip?)` — validates unique name + confirmed datasets (or legacy CsvFiles), creates DashboardDatasource records, enqueues dashboard-generation pipeline job, audits DASHBOARD_CREATE
- `listDashboards(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getDashboard(id, userId, userRole)` — returns dashboard with widgets + datasources
- `getDashboardStatus(id, userId, userRole)` — returns status, job status, and progress
- `updateDashboard(id, dto, userId, userRole, ip?)` — guarded update, audits DASHBOARD_UPDATE
- `deleteDashboard(id, userId, userRole, ip?)` — deletes widgets, cache, datasources, dashboard; invalidates Redis; audits DASHBOARD_DELETE
- `duplicateDashboard(id, userId, userRole, ip?)` — deep-copies dashboard + widgets + datasources, audits DASHBOARD_DUPLICATE
- `getChartData(dashboardId, widgetId, userId, userRole, shareToken?, filtersJson?)` — OLAP path when `widget.querySpec` present → `AnalyticsStoreService.runQuery`; legacy path → MongoDB aggregation; Redis + DB cache when unfiltered, fresh query when filtered
- `refreshDashboard(id, userId, userRole, ip?)` — clears caches, enqueues cache-recalculation, audits DASHBOARD_REFRESH
- `addWidget(dashboardId, dto: CreateWidgetDto, userId, userRole, ip?)` — dispatches `add-widget` pipeline, returns new widget on completion
- `updateWidget(dashboardId, widgetId, dto: UpdateWidgetDto, userId, userRole, ip?)` — dispatches `edit-widget` pipeline, returns updated widget; invalidates cache
- `deleteWidget(dashboardId, widgetId, userId, userRole, ip?)` — removes widget and its caches
- `retryGeneration(id, userId, userRole)` — re-enqueues dashboard-generation pipeline for ERROR dashboard
- `getFilterOptions(dashboardId, workspaceSlug)` — returns `FilterValueMeta[]` for all filter columns of the dashboard's datasets via `FilterValuesService.getFilterOptions` *(change-021)*
- `searchFilterValues(datasetId, column, query, workspaceSlug)` — typeahead search for high-cardinality filter columns via `FilterValuesService.searchFilterValues` *(change-021)*

**Deps:** DashboardRepository · ChartWidgetRepository · ChartDataCacheRepository · WidgetDefinitionRepository · DashboardDatasourceRepository · DatasetRepository · CsvFileRepository · BackgroundJobRepository · BackgroundJobsService · FilterValuesService · AnalyticsStoreService · WorkspaceRepository · AuditLogService · DASHBOARD_GENERATION_QUEUE (BullMQ) · CACHE_RECALCULATION_QUEUE (BullMQ) · Redis (ioredis, 1h TTL) · ConfigService · Mongo Connection (@InjectConnection)
**Side effects:** queue enqueue · Redis read/write/delete · OLAP queries · Mongo aggregations · audit writes
**Rules:** Dashboard name unique within project · All datasource Datasets (or legacy CsvFiles) must be confirmed before creation · Widgets added only when dashboard is READY · Filtered chart queries bypass persistent caches; unfiltered cached in Redis (1h) + DB · OLAP path taken when `widget.querySpec` is non-null · Owner-or-admin enforced on all operations · Retry only from ERROR state · Aggregation failures return []

---

### SVC-DASH-FILTER · FilterValuesService [internal, domain, Filters] *(change-021)*
Computes, stores, and serves distinct values for AI-selected dashboard filter columns. Lives in `FiltersModule`.

**Methods:**
- `computeAndStore(workspaceSlug, datasetId, analyticsTable, columns: FilterColumnSpec[])` — for each column: calls `AnalyticsStoreService.distinctValues`, applies cardinality guard (threshold 1000), writes `FilterValueMeta` (mode: `list` or `search`), invalidates Redis cache
- `getFilterOptions(workspaceSlug, datasetId): Promise<FilterValueMeta[]>` — Redis-first; returns all stored filter metas for the dataset; no OLAP call
- `searchFilterValues(workspaceSlug, datasetId, column, query): Promise<{ value: unknown; count: number }[]>` — for `list` mode: in-memory prefix filter; for `search` mode: calls `AnalyticsStoreService.searchValues` via OLAP LIKE query

**Deps:** FilterValueMetaRepository · AnalyticsStoreService · WorkspaceRepository · Redis (ioredis)
**Side effects:** OLAP `distinctValues` / `searchValues` calls · Redis cache invalidation · FilterValueMeta upserts
**Rules:** Cardinality threshold = 1000 distinct values · `search` mode columns have empty `values` array — always query live · `computeAndStore` is idempotent (upsert by workspaceSlug+datasetId+column) · Called by `BuildFiltersStep` (pipeline) and `DataSyncProcessor` (post-sync)

---

### SVC-DASH-SEED · WidgetDefinitionSeeder [internal, domain, Dashboards]
Startup seeder that upserts the widget catalog (bar, line, pie, donut, kpi_card, table, scatter, image, area, radar, funnel, heatmap, gauge, sparkline, timeline, map, text, empty_state, filter) used by AI generation.

**Methods:**
- `onModuleInit(): Promise<void>` — upserts every built-in widget definition, logging the count (failures logged, not thrown)

**Deps:** WidgetDefinitionRepository
**Side effects:** writes to widget-definition collection (idempotent upsert by widget type)
**Rules:** Idempotent upsert by widget type — safe to run on every boot
