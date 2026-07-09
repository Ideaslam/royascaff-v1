## Module: Dashboards

### SVC-DASH · DashboardsService [internal, application, Dashboards]
Owns dashboard lifecycle, widget management, chart-data aggregation/caching, and generation/refresh orchestration.

**Methods:**
- `createDashboard(dto: CreateDashboardDto, userId, ip?)` — validates unique name; resolves `datasetIds` against **`DatasetRepository`** first (requires `analyticsTable != null && syncStatus != syncing`); falls back to `CsvFileRepository` for legacy `CsvFile` IDs (requires `status == CONFIRMED`); creates DashboardDatasource records; enqueues dashboard-generation pipeline job; audits DASHBOARD_CREATE *(updated change-022)*
- `listDashboards(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getDashboard(id, userId, userRole)` — returns dashboard with widgets + datasources
- `getDashboardStatus(id, userId, userRole)` — returns status, job status, and progress
- `updateDashboard(id, dto, userId, userRole, ip?)` — guarded update, audits DASHBOARD_UPDATE
- `deleteDashboard(id, userId, userRole, ip?)` — deletes widgets, cache, datasources, dashboard; invalidates Redis; audits DASHBOARD_DELETE
- `duplicateDashboard(id, userId, userRole, ip?)` — deep-copies dashboard + widgets + datasources, audits DASHBOARD_DUPLICATE
- `getChartData(dashboardId, widgetId, userId, workspaceSlug, userRole, shareToken?, filtersJson?)` — resolves access via JWT owner-or-admin **or** valid `shareToken` (workspace from share link when anonymous); OLAP path when `widget.querySpec` present → `AnalyticsStoreService.runQuery`; legacy path → MongoDB aggregation; Redis + DB cache when unfiltered, fresh query when filtered *(change-051)*
- `refreshDashboard(id, userId, userRole, ip?)` — clears caches, enqueues cache-recalculation, audits DASHBOARD_REFRESH
- `addWidget(dashboardId, dto: CreateWidgetDto, userId, userRole, ip?)` — dispatches `add-widget` pipeline, returns new widget on completion
- `updateWidget(dashboardId, widgetId, dto: UpdateWidgetDto, userId, userRole, ip?)` — dispatches `edit-widget` pipeline, returns updated widget; invalidates cache
- `deleteWidget(dashboardId, widgetId, userId, userRole, ip?)` — removes widget and its caches
- `retryGeneration(id, userId, userRole)` — re-enqueues dashboard-generation pipeline for ERROR dashboard
- `createDashboardFromTemplate(dto: CreateDashboardFromTemplateDto, userId, workspaceSlug, ip?)` — *(change-049)* loads active `DashboardTemplate`; validates `datasetSelections` cover every required canonical model (each dataset must match the model's `semanticFlag`, have `analyticsTable != null`, `syncStatus != syncing`, and a `columnMapping` covering the template's `usedFields` — 400 with per-model errors otherwise); enforces `MAX_DASHBOARDS`; creates dashboard (status `generating`) + DashboardDatasource links; enqueues generation job with `pipelineType: 'dashboard-from-template'` + `templateId` + `modelDatasets` in payload; audits DASHBOARD_CREATE
- `getFilterOptions(dashboardId, userId, workspaceSlug, userRole, shareToken?)` — JWT owner-or-admin **or** valid `shareToken`; returns filter options keyed by datasetId via `FilterValuesService.getFilterOptions` *(change-021, change-051)*
- `searchFilterValues(datasetId, column, query, workspaceSlug, userId?, userRole?, shareToken?)` — typeahead search; JWT **or** shareToken that links a dashboard using `:datasetId` *(change-021, change-051)*

**Deps:** DashboardRepository · ChartWidgetRepository · ChartDataCacheRepository · WidgetDefinitionRepository · DashboardDatasourceRepository · DatasetRepository · CsvFileRepository · BackgroundJobRepository · BackgroundJobsService · FilterValuesService · AnalyticsStoreService · WorkspaceRepository · AuditLogService · **TemplateCatalogService** *(change-049)* · DASHBOARD_GENERATION_QUEUE (BullMQ) · CACHE_RECALCULATION_QUEUE (BullMQ) · Redis (ioredis, 1h TTL) · ConfigService · Mongo Connection (@InjectConnection)
**Side effects:** queue enqueue · Redis read/write/delete · OLAP queries · Mongo aggregations · audit writes
**Rules:** Dashboard name unique within project · Datasets must have `analyticsTable != null && syncStatus != syncing`; legacy CsvFiles must be `CONFIRMED` · Widgets added only when dashboard is READY · Filtered chart queries bypass persistent caches; unfiltered cached in Redis (1h) + DB · OLAP path taken when `widget.querySpec` is non-null · Owner-or-admin enforced on all operations · Retry only from ERROR state · Aggregation failures return []

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
