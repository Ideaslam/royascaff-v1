## Module: Dashboards

### SVC-DASH · DashboardsService [internal, application, Dashboards]
Owns dashboard lifecycle, widget management, chart-data aggregation/caching, and generation/refresh orchestration.

**Methods:**
- `createDashboard(dto: CreateDashboardDto, userId, ip?)` — validates project, name uniqueness and dataset readiness first, then atomically reserves `MAX_DASHBOARDS` (cap on dashboards that currently exist) as the last step; creates records/job; releases on failure; audits *(change-080)*
- `listDashboards(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getDashboard(id, userId, userRole)` — returns dashboard with widgets + datasources
- `getDashboardStatus(id, userId, userRole)` — returns status, job status, and progress
- `updateDashboard(id, dto, userId, userRole, ip?)` — guarded update, audits DASHBOARD_UPDATE
- `deleteDashboard(id, userId, userRole, ip?)` — deletes widgets, cache, datasources, dashboard; invalidates Redis; frees a `MAX_DASHBOARDS` slot *(change-080)*; audits DASHBOARD_DELETE
- `duplicateDashboard(id, userId, userRole, ip?)` — asserts the resource lock and reserves `MAX_DASHBOARDS` after validation; deep-copies dashboard + widgets + datasources; releases on failure *(change-080)*; audits DASHBOARD_DUPLICATE
- `getChartData(dashboardId, widgetId, userId, workspaceSlug, userRole, shareToken?, filtersJson?)` — resolves access via JWT owner-or-admin **or** valid `shareToken` (workspace from share link when anonymous); OLAP path when `widget.querySpec` present → `AnalyticsStoreService.runQuery`; legacy path → MongoDB aggregation; Redis + DB cache when unfiltered, fresh query when filtered *(change-051)*
- `refreshDashboard(id, userId, userRole, ip?)` — validates the dashboard exists/is accessible first, then atomically reserves the refresh/update limit *(change-080)*, clears caches, enqueues recalculation, compensates on enqueue failure, audits DASHBOARD_REFRESH
- `addWidget(dashboardId, dto: CreateWidgetDto, userId, userRole, ip?)` — asserts the resource lock *(change-080)*; dispatches `add-widget` pipeline, returns new widget on completion
- `updateWidget(dashboardId, widgetId, dto: UpdateWidgetDto, userId, userRole, ip?)` — asserts the resource lock *(change-080)*; dispatches `edit-widget` pipeline, returns updated widget; invalidates cache
- `deleteWidget(dashboardId, widgetId, userId, userRole, ip?)` — removes widget and its caches
- `retryGeneration(id, userId, userRole)` — asserts the resource lock *(change-080)*; re-enqueues dashboard-generation pipeline for ERROR dashboard
- `createDashboardFromTemplate(dto: CreateDashboardFromTemplateDto, userId, workspaceSlug, ip?)` — validates the template/model mappings, atomically reserves `MAX_DASHBOARDS`, creates dashboard/links, enqueues generation, and compensates reservation on failure
- `getFilterOptions(dashboardId, userId, workspaceSlug, userRole, shareToken?)` — JWT owner-or-admin **or** valid `shareToken`; returns filter options keyed by datasetId via `FilterValuesService.getFilterOptions` *(change-021, change-051)*
- `searchFilterValues(datasetId, column, query, workspaceSlug, userId?, userRole?, shareToken?)` — typeahead search; JWT **or** shareToken that links a dashboard using `:datasetId` *(change-021, change-051)*

**Deps:** DashboardRepository · ChartWidgetRepository · ChartDataCacheRepository · WidgetDefinitionRepository · DashboardDatasourceRepository · DatasetRepository · CsvFileRepository · SubscriptionLimitService · BackgroundJobRepository · BackgroundJobsService · FilterValuesService · AnalyticsStoreService · WorkspaceRepository · AuditLogService · **TemplateCatalogService** *(change-049)* · DASHBOARD_GENERATION_QUEUE · CACHE_RECALCULATION_QUEUE · Redis · ConfigService · Mongo Connection
**Side effects:** queue enqueue · Redis read/write/delete · OLAP queries · Mongo aggregations · audit writes
**Rules:** Limited creates/duplicates/refreshes validate first and require current-usage-period atomic reservation last, released on failure; entitlement failure denies write · `maxDashboards` counts existing dashboards · widget mutations and retry-generation respect the subscription lock *(change-080)* · over-limit existing dashboards remain readable/deletable · dashboard name unique within project · datasets ready · owner/admin authorization · filtered queries bypass caches

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
