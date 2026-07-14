## Module: Pipelines

> **Engine isolation *(change-060)*:** the neutral kernel — `SVC-PIPE-ENGINE`, `SVC-PIPE-STEP-REG`,
> `SVC-PIPE-TYPE-REG`, plus `PipelineContext`/`PipelineStepInterface`/`TenantContext` and the
> `PIPELINE_RUN_STORE` persistence seam — lives in the isolated library `src/engine-core/` (Phase 1;
> relocates to `libs/engine-core` in Phase 4). Concrete step packs (`SVC-PIPE-STEPS-INGEST`,
> `SVC-PIPE-STEPS-DASH`) and `SVC-PIPE-RUN-REPO` remain in `src/modules/pipelines/` until they move
> with their owning engine (ingest → Data Source Engine; dashboard → Reporting Engine) in later phases.
> `PipelineRunRepository` is bound to `PIPELINE_RUN_STORE` so the kernel stays persistence-agnostic.
> Behavior is unchanged.
>
> **Registration seam *(change-064)*:** the kernel now holds **only registration/lookup mechanics** —
> no seeded pipeline types, no source-type names, no wizard tables. Every pipeline **type** is
> registered at bootstrap by its **owning engine**, and every data source's ingest profile travels on
> its connector:
> - **Data Source Engine** (`SVC-DATA-PIPELINE`, `modules/data`) owns the `ingest` type + the default
>   ingest step list, resolves per-source ingest steps and the setup-wizard flow from each connector's
>   `pipelineProfile`, and passes the resolved `steps` to the engine.
> - **Reporting Engine** (`SVC-DASH-PIPELINE-REG`, `modules/dashboards`) registers
>   `dashboard-generate` / `add-widget` / `edit-widget`.
> Adding a new **source type** = one connector `pipelineProfile`; adding a new **pipeline type** = one
> `register()` in the owning engine; adding a **step** to the default ingest pipeline applies to every
> source automatically. Never edit `engine-core` to extend (RULE-ARCH-002 / RULE-ARCH-006).

### SVC-PIPE-ENGINE · PipelineEngine [internal, application, engine-core] *(change-019, change-060, change-064)*
Orchestrates the execution of an ordered sequence of pipeline steps. The single entry point for all pipeline invocations. Located in `src/engine-core/`. `RunPipelineOptions`/`PipelineContext` are generic over the domain dataset/connection types; persists runs via the injected `PIPELINE_RUN_STORE`. **Fully neutral (change-064):** no per-source / per-type special-casing — it runs the caller-supplied `steps` if given, otherwise the registered type's steps.

**Methods:**
- `run(opts: RunPipelineOptions): Promise<{ pipelineRunId, metadata }>` — resolves `PipelineTypeDefinition` from `PipelineTypeRegistry`, initializes `PipelineContext`, executes enabled steps (`opts.steps ?? typeDef.steps`) in order via `StepRegistry`, records a `PipelineRun` document, surfaces first fatal error

**RunPipelineOptions fields:** `pipelineType`, `workspaceSlug`, `engineId`, `syncRunId`, `mode`, `dataset?`, `connection?`, `steps?` (per-run resolved step list — used by ingest for per-source resolution *(change-064)*), `metadata?: Record<string, unknown>` (generic bag for pipeline-specific data like `dashboardId`, `purpose`, etc.)

**Deps:** PipelineTypeRegistry · StepRegistry · PipelineRunRepository
**Side effects:** PipelineRun create/update · step-specific side effects
**Rules:** Steps executed in ascending `order` value · Disabled steps (`enabled: false`) are skipped · On step error: PipelineRun status = `failed`, error captured, pipeline aborts · `metadata` is mutable across steps (accumulation pattern) · the engine never inspects `sourceType` — per-source resolution happens in the Data Source Engine *(change-064)*

---

### SVC-PIPE-STEP-REG · StepRegistry [internal, domain, Pipelines] *(change-019)*
Maps step type strings to `PipelineStepInterface` implementations. Steps self-register (NestJS injection).

**Methods:**
- `register(type: string, step: PipelineStepInterface): void` — called during module init by each step provider
- `resolve(type: string): PipelineStepInterface` — returns step; throws `UnknownStepError` for missing types

**Rules:** New step = implement `PipelineStepInterface` + inject into module + one `register()` call

---

### SVC-PIPE-TYPE-REG · PipelineTypeRegistry [internal, domain, engine-core] *(change-019, change-020, change-045, change-064)*
Neutral registry of named pipeline types, each defining an ordered list of `PipelineStepConfig` entries. **Pure mechanics (change-064):** it seeds nothing and knows no source-type names — types are registered by their owning engine at bootstrap.

**Methods:**
- `register(def: PipelineTypeDefinition): void` — owning engine registers a type on `onModuleInit`
- `resolve(name): PipelineTypeDefinition` · `has(name): boolean` · `list(): string[]`
- `setSteps(name, steps): void` — runtime override of a type's steps (e.g. DB-driven config)

> Per-source ingest resolution (`resolveIngestForSource`) and the setup-wizard flow (`getSetupFlow`)
> **moved to the Data Source Engine** (`SVC-DATA-PIPELINE`) in change-064 — they are feature logic, not
> kernel mechanics.

**Registered pipeline types** (each registered by its owning engine, not the kernel):

| Type | Registered by | Steps (in order) |
|------|---------------|-----------------|
| `ingest` | `SVC-DATA-PIPELINE` (data engine) | extract (10) · identify-columns (15) · apply-mapping (20) · trim (30) · type-cast (40) · dedupe (50) · load (60) |
| `dashboard-generate` | `SVC-DASH-PIPELINE-REG` (reporting) | gather-dataset-schemas (10) · load-widget-catalog (20) · generate-widgets-ai (30) · build-filters (35) · save-widgets (40) · invalidate-widget-cache (50) |
| `add-widget` | `SVC-DASH-PIPELINE-REG` (reporting) | gather-dataset-schemas (10) · load-widget-catalog (20) · add-widget-ai (30) · save-single-widget (40) · invalidate-widget-cache (50) |
| `edit-widget` | `SVC-DASH-PIPELINE-REG` (reporting) | gather-dataset-schemas (10) · edit-widget-ai (20) · save-updated-widget (30) · invalidate-widget-cache (40) |
| `dashboard-from-template` *(change-049; documented, not yet in code)* | reporting | gather-dataset-schemas (10) · ensure-canonical-views (15) · load-widget-catalog (20) · instantiate-template-widgets (25) · adapt-template-widgets-ai (30) · build-filters (35) · save-widgets (40) · invalidate-widget-cache (50) |

**Rules:** Step order values are non-sequential by design (gaps allow inserting steps without renumbering) · Any step can be disabled per pipeline type config without removing it · The kernel never seeds or names a type — owning engines register on bootstrap *(change-064)*

---

### SVC-DATA-PIPELINE · DataSourcePipelineService [internal, domain, Data] *(change-064)*
Data Source Engine owner of the **ingest** pipeline and per-source resolution. Registers the `ingest` type (default ingest step list, incl. wizard `ui` blocks) into `PipelineTypeRegistry` on `onModuleInit`, and derives everything per-source from the connectors' `pipelineProfile`.

**Methods:**
- `resolveIngestSteps(sourceType): PipelineStepConfig[]` — base ingest steps + the connector's `pipelineProfile.ingestOverrides` (enable/disable/reorder). Passed to `PipelineEngine.run({ steps })` by `DataSyncProcessor`.
- `getSetupFlow(sourceType): SetupFlow` — ordered wizard steps derived from the resolved ingest steps' `ui` blocks + the connector's `pipelineProfile.wizard` traits (`chooseConnection` / `entitySelection` / `oneShot`). Backs EP-DATA-41. Each `WizardStepMeta` may carry a neutral `config` bag: the `schedule` step gets `config.allowPolicy = !oneShot`, so the frontend renders one-shot vs scheduled **without any source-type knowledge** *(change-065)*.

**Deps:** PipelineTypeRegistry · ConnectorRegistry
**Rules:** the ingest base step list + wizard-flow logic live here (not in `engine-core`) · a source with no `pipelineProfile` gets the full default pipeline + default wizard traits

---

### SVC-DASH-PIPELINE-REG · DashboardPipelineRegistrar [internal, domain, Dashboards] *(change-064)*
Reporting Engine owner of the dashboard pipeline **type definitions**. On `onModuleInit` registers `dashboard-generate`, `add-widget`, and `edit-widget` into `PipelineTypeRegistry` (step lists as tabled above). Adding a new dashboard/reporting pipeline type = one entry here — no kernel edit.

**Deps:** PipelineTypeRegistry
**Rules:** dashboard step *implementations* still self-register into `StepRegistry` (see `SVC-PIPE-STEPS-DASH`); this registrar only owns the ordered type definitions

---

### SVC-PIPE-STEPS-INGEST · Data Ingestion Steps [internal, domain, Pipelines] *(change-019, change-045)*

*(change-045)* Each ingest step advances `SyncRun.progress`/`phase` via `SyncService.updateProgress()` as it runs, so the frontend percentage loader reflects real stage (discovering → extracting → loading → finalizing). Progress writes are throttled and never block ingestion.

- **ExtractStep** (`extract`) — requires `ctx.connection` + `ctx.dataset`; resolves connector from `ConnectorRegistry`, calls `connector.extract(creds, opts)`; stores raw rows in `ctx.rows` (may still contain extra source keys); sets phase `extracting` and updates `rowsIn`/progress as batches accrue *(change-045)*
- **IdentifyColumnsStep** (`identify-columns`, order 15) *(change-038, change-055)* — AI-assisted via shared column-identify helper; skips if `availableColumns`/`schema` already have descriptions **and** selection flags (idempotent unless `forceRefresh`); samples up to 10 rows from `ctx.rows`; `column-identify` prompt returns `{ name, description, descriptionAr, isPrimaryKey, isSelected, selectionOrder, blocked }` (soft ~25 selected incl. PK + important FKs; sensitive → `blocked`); merges into `availableColumns` (does not prune live `schema` — prune is user confirm only); stores `ctx.metadata['primaryKeyColumn']`; on AI failure: logs warning, sets all `isSelected: false`, continues
- **ApplyMappingStep** (`apply-mapping`) — requires `ctx.dataset`; applies `dataset.columnMapping` to rename row keys to canonical fields; *(change-055)* then projects each row to live `schema` column names only (shared `row-transform` helper; also used in streaming `transformBatch`)
- **TrimStep** (`trim`) — trims leading/trailing whitespace from string values
- **TypeCastStep** (`type-cast`) — casts row values to the types declared in `dataset.schema`
- **DedupeStep** (`dedupe`) — removes exact-duplicate rows within the batch; optionally dedupes by a `keyColumn` step config
- **LoadStep** (`load`) — requires `ctx.dataset`; OLAP DDL from live `schema` (selected columns); on **FULL** sync: drops + recreates OLAP table first *(change-038)*; batch-inserts projected rows via `AnalyticsStoreService` (buffered + streaming); on **INCREMENTAL** sync: appends without truncation; sets phase `loading`/`finalizing` and updates `rowsLoaded`/progress *(change-045, change-055)*

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

### SVC-PIPE-STEPS-TPL · Template Instantiation Steps [internal, domain, Pipelines] *(change-049)*

- **EnsureCanonicalViewsStep** (`ensure-canonical-views`) — reads `ctx.metadata['templateId']` + `modelDatasets` (`{ semanticFlag: datasetId[] }`); for each required model: validates every selected dataset's `columnMapping` covers the template's `usedFields` (fatal, structured error otherwise), then calls `AnalyticsStoreService.createCanonicalView(engineId, 'cv_{ws}_{flag}', sources)` with each dataset's `{ table: analyticsTable, mapping: columnMapping }`; stores `canonicalViews: { semanticFlag: viewName }` in `ctx.metadata`. Idempotent (create-or-replace view).
- **InstantiateTemplateWidgetsStep** (`instantiate-template-widgets`) — deterministic (no AI); loads the `DashboardTemplate` blueprint; resolves each widget's `querySpec.source` `{{semanticFlag}}` placeholder to the materialized view name; applies layout hints (or default grid); stores `generatedWidgets[]` + `layoutColumns` in `ctx.metadata` (same contract as `generate-widgets-ai`, so downstream steps are reused unchanged).
- **AdaptTemplateWidgetsAiStep** (`adapt-template-widgets-ai`) — renders `adapt-template-widgets` prompt with blueprint widgets + the datasets' actual mapped/available canonical columns (never raw rows); AI drops/repairs widgets that reference unmapped optional fields and may add complementary widgets from available columns; replaces `ctx.metadata['generatedWidgets']`; on AI failure: logs warning and keeps the deterministic widgets (pipeline continues).

**Deps:** DashboardTemplateRepository · DatasetRepository · AnalyticsStoreService · WidgetDefinitionRepository · AiProviderRegistry · PromptTemplateService
**Rules:** reuses `build-filters` / `save-widgets` / `invalidate-widget-cache` downstream — output contract identical to `generate-widgets-ai` · canonical view name pattern `cv_{workspaceSlug}_{semanticFlag}` is fixed (never caller-supplied) · `DashboardGenerationProcessor` reads `pipelineType` from the job payload (default `dashboard-generate`) so both flows share the queue/worker

---

### SVC-PIPE-RUN-REPO · PipelineRunRepository [internal, infrastructure, Pipelines] *(change-019)*
CRUD repository for `PipelineRun` documents.

**Methods:** `create(dto)` · `update(id, dto)` · `findById(id)` · `findByWorkspaceAndDataset(workspaceSlug, datasetId, page, limit)`

**Deps:** `pipeline_runs` Mongoose model
