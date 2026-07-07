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

### SVC-PIPE-TYPE-REG · PipelineTypeRegistry [internal, domain, Pipelines] *(change-019, change-020, change-045)*
Registry of named pipeline types, each defining an ordered list of `PipelineStepConfig` entries. Also the single source of truth for the backend-driven **setup flow** (wizard step sequence per data source).

**Methods (change-045):**
- `getSetupFlow(sourceType: DataSourceType): WizardStep[]` — returns the ordered wizard step list for a source; step kinds `connect | select-entities | schema-review | schedule`. Emits `select-entities` for every source except `csv`. Backs EP-DATA-41 so the frontend renders each source's flow without per-source hardcoding.

**Registered pipeline types:**

| Type | Steps (in order) |
|------|-----------------|
| `ingest` | extract (10) · identify-columns (15) · apply-mapping (20) · trim (30) · type-cast (40) · dedupe (50) · load (60) |
| `dashboard-generate` | gather-dataset-schemas (10) · load-widget-catalog (20) · generate-widgets-ai (30) · build-filters (35) · save-widgets (40) · invalidate-widget-cache (50) |
| `add-widget` | gather-dataset-schemas (10) · load-widget-catalog (20) · add-widget-ai (30) · save-single-widget (40) · invalidate-widget-cache (50) |
| `edit-widget` | gather-dataset-schemas (10) · edit-widget-ai (20) · save-updated-widget (30) · invalidate-widget-cache (40) |

**Rules:** Step order values are non-sequential by design (gaps allow inserting steps without renumbering) · Any step can be disabled per pipeline type config without removing it

---

### SVC-PIPE-STEPS-INGEST · Data Ingestion Steps [internal, domain, Pipelines] *(change-019, change-045)*

*(change-045)* Each ingest step advances `SyncRun.progress`/`phase` via `SyncService.updateProgress()` as it runs, so the frontend percentage loader reflects real stage (discovering → extracting → loading → finalizing). Progress writes are throttled and never block ingestion.

- **ExtractStep** (`extract`) — requires `ctx.connection` + `ctx.dataset`; resolves connector from `ConnectorRegistry`, calls `connector.extract(creds, opts)`; stores raw rows in `ctx.rows`; sets phase `extracting` and updates `rowsIn`/progress as batches accrue *(change-045)*
- **IdentifyColumnsStep** (`identify-columns`, order 15) *(change-038)* — AI-assisted; skips if all columns already have descriptions (idempotent); samples up to 10 rows from `ctx.rows`; calls AI with `column-identify` prompt (column name, type, up to 5 sample values per column) → receives `{ name, description, descriptionAr, isPrimaryKey }` per column; writes results into `Dataset.schema` in DB; stores `ctx.metadata['primaryKeyColumn']` for downstream steps; on AI failure: logs warning + continues
- **ApplyMappingStep** (`apply-mapping`) — requires `ctx.dataset`; applies `dataset.columnMapping` to rename row keys to canonical fields
- **TrimStep** (`trim`) — trims leading/trailing whitespace from string values
- **TypeCastStep** (`type-cast`) — casts row values to the types declared in `dataset.schema`
- **DedupeStep** (`dedupe`) — removes exact-duplicate rows within the batch; optionally dedupes by a `keyColumn` step config
- **LoadStep** (`load`) — requires `ctx.dataset`; on **FULL** sync: drops + recreates OLAP table first to prevent data duplication *(change-038)*; then batch-inserts `ctx.rows` via `AnalyticsStoreService`; on **INCREMENTAL** sync: appends without truncation; sets phase `loading`/`finalizing` and updates `rowsLoaded`/progress as batches insert *(change-045)*

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
