## Module: Pipelines

### SVC-PIPE-ENGINE · PipelineEngine [internal, application, Pipelines] *(change-019)*
Orchestrates the execution of an ordered sequence of pipeline steps. The single entry point for all pipeline invocations.

**Methods:**
- `run(type: string, opts: RunPipelineOptions): Promise<PipelineContext>` — resolves `PipelineTypeDefinition` from `PipelineTypeRegistry`, initializes `PipelineContext`, executes enabled steps in order via `StepRegistry`, records a `PipelineRun` document, surfaces first fatal error

**RunPipelineOptions fields:** `workspaceSlug`, `dataset?`, `connection?`, `syncRunId?`, `metadata?: Record<string, unknown>` (generic bag for pipeline-specific data like `dashboardId`, `purpose`, etc.)

**Deps:** PipelineTypeRegistry · StepRegistry · PipelineRunRepository
**Side effects:** PipelineRun create/update · step-specific side effects
**Rules:** Steps executed in ascending `order` value · Disabled steps (`enabled: false`) are skipped · On step error: PipelineRun status = `failed`, error captured, pipeline aborts · `metadata` is mutable across steps (accumulation pattern)

---

### SVC-PIPE-STEP-REG · StepRegistry [internal, domain, Pipelines] *(change-019)*
Maps step type strings to `PipelineStepInterface` implementations. Steps self-register (NestJS injection).

**Methods:**
- `register(type: string, step: PipelineStepInterface): void` — called during module init by each step provider
- `resolve(type: string): PipelineStepInterface` — returns step; throws `UnknownStepError` for missing types

**Rules:** New step = implement `PipelineStepInterface` + inject into module + one `register()` call

---

### SVC-PIPE-TYPE-REG · PipelineTypeRegistry [internal, domain, Pipelines] *(change-019, change-020)*
Registry of named pipeline types, each defining an ordered list of `PipelineStepConfig` entries.

**Registered pipeline types:**

| Type | Steps (in order) |
|------|-----------------|
| `ingest` | extract (10) · clean-data (20) · transform (30) · apply-mapping (40) · load (50) · sync-run-complete (60) |
| `dashboard-generate` | gather-dataset-schemas (10) · load-widget-catalog (20) · generate-widgets-ai (30) · build-filters (35) · save-widgets (40) · invalidate-widget-cache (50) |
| `add-widget` | gather-dataset-schemas (10) · load-widget-catalog (20) · add-widget-ai (30) · save-single-widget (40) · invalidate-widget-cache (50) |
| `edit-widget` | gather-dataset-schemas (10) · edit-widget-ai (20) · save-updated-widget (30) · invalidate-widget-cache (40) |

**Rules:** Step order values are non-sequential by design (gaps allow inserting steps without renumbering) · Any step can be disabled per pipeline type config without removing it

---

### SVC-PIPE-STEPS-INGEST · Data Ingestion Steps [internal, domain, Pipelines] *(change-019)*

- **ExtractStep** (`extract`) — requires `ctx.connection` + `ctx.dataset`; resolves connector from `ConnectorRegistry`, calls `connector.extract(creds, opts)`; stores raw rows in `ctx.rows`
- **CleanDataStep** (`clean-data`) — AI-assisted; sends sample rows to AI to detect junk patterns; removes/flags bad rows in `ctx.rows`
- **TransformStep** (`transform`) — AI-assisted; applies computed transformations to `ctx.rows` (e.g. type normalization, date parsing)
- **ApplyMappingStep** (`apply-mapping`) — requires `ctx.dataset`; applies `dataset.columnMapping` to rename row keys to canonical fields
- **LoadStep** (`load`) — requires `ctx.dataset`; batch-inserts `ctx.rows` into OLAP table via `AnalyticsStoreService.batchInsert`; updates `ctx.rowsLoaded`
- **SyncRunCompleteStep** (`sync-run-complete`) — marks `SyncRun.status = success`, sets `finishedAt`, updates `Dataset.rowCount` + `lastSyncAt`

---

### SVC-PIPE-STEPS-DASH · Dashboard Pipeline Steps [internal, domain, Pipelines] *(change-020, change-021)*

- **GatherDatasetSchemasStep** (`gather-dataset-schemas`) — reads `dashboardId` from `ctx.metadata`; fetches `DashboardDatasource` records; resolves each `Dataset` (or legacy `CsvFile`); stores `DataSourceInfo[]` in `ctx.metadata['dataSources']`
- **LoadWidgetCatalogStep** (`load-widget-catalog`) — fetches `WidgetDefinition` docs; stores `catalog[]` + `validWidgetTypes` Set in `ctx.metadata`
- **GenerateWidgetsAiStep** (`generate-widgets-ai`) — renders `generate-dashboard` prompt via `PromptTemplateService`; calls `AiProvider.generateDashboard`; parses response; stores `generatedWidgets[]` + `layoutColumns` in `ctx.metadata`
- **BuildFiltersStep** (`build-filters`) — renders `filter-selection` prompt; calls AI to select filter columns; calls `FilterValuesService.computeAndStore` for selected columns *(change-021)*
- **SaveWidgetsStep** (`save-widgets`) — creates `ChartWidget` documents from `ctx.metadata['generatedWidgets']` (includes `querySpec`); sets Dashboard.status = `READY`
- **AddWidgetAiStep** (`add-widget-ai`) — renders `add-widget` prompt; calls AI; parses single widget; stores `newWidget` in `ctx.metadata`
- **SaveSingleWidgetStep** (`save-single-widget`) — creates one `ChartWidget` from `ctx.metadata['newWidget']`
- **EditWidgetAiStep** (`edit-widget-ai`) — renders `edit-widget` prompt with existing widget context; calls AI; parses updated widget; stores `updatedWidget` in `ctx.metadata`
- **SaveUpdatedWidgetStep** (`save-updated-widget`) — updates existing `ChartWidget` using `ctx.metadata['targetWidgetId']` + `ctx.metadata['updatedWidget']`
- **InvalidateWidgetCacheStep** (`invalidate-widget-cache`) — fetches all widgets for the dashboard; deletes Redis cache keys; invalidates `ChartDataCache` records

---

### SVC-PIPE-RUN-REPO · PipelineRunRepository [internal, infrastructure, Pipelines] *(change-019)*
CRUD repository for `PipelineRun` documents.

**Methods:** `create(dto)` · `update(id, dto)` · `findById(id)` · `findByWorkspaceAndDataset(workspaceSlug, datasetId, page, limit)`

**Deps:** `pipeline_runs` Mongoose model
