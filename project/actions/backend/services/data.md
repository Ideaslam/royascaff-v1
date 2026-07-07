## Module: Data (Multi-Source Data Management)

### SVC-DATA · DataService [internal, application, Data]
Manages CSV file uploads (direct and presigned), AI-analysis kickoff, column metadata, and file lifecycle. *(Legacy CSV path — kept for backward compat)*

**Methods:**
- `uploadFile(file: Express.Multer.File, userId: string, ip?)` — validates size, uploads buffer to R2, marks ANALYZING, creates job + enqueues csv-analysis, audits CSVFILE_UPLOAD_COMPLETE
- `initiateUpload(dto: InitiateUploadDto, userId, ip?)` — creates file record and returns R2 presigned URL, audits CSVFILE_UPLOAD
- `completeUpload(fileId, dto: CompleteUploadDto, userId, ip?)` — finalizes presigned upload, marks ANALYZING, creates job + enqueues analysis
- `listFiles(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getFile(fileId, userId, userRole)` — returns file plus column metadata
- `updateColumns(fileId, dto: UpdateColumnsDto, userId, userRole)` — saves user column descriptions; marks CONFIRMED once none remain unconfirmed
- `deleteFile(fileId, userId, userRole, ip?)` — deletes column metadata, drops dynamic csvdata_{fileId} collection, deletes R2 object and record, audits CSVFILE_DELETE
- `retryAnalysis(fileId, userId, userRole)` — clears prior metadata/rows and re-enqueues csv-analysis (only from retryable states)

**Deps:** CsvFileRepository · ColumnMetadataRepository · BackgroundJobRepository (via BackgroundJobsService) · BackgroundJobsService · AuditLogService · CSV_ANALYSIS_QUEUE (BullMQ) · STORAGE_PROVIDER · Mongo Connection (@InjectConnection)
**Side effects:** R2 upload/delete/presign · queue enqueue · dynamic collection drop/clear · audit writes
**Rules:** Max file size 50 MB · Status flow: UPLOADING → ANALYZING → ANALYZED → CONFIRMED (or ERROR); dashboards require CONFIRMED files · Owner-or-admin enforced on read/update/delete/retry · Delete removes storage object, metadata, and dynamic row collection

---

### SVC-DATA-CONN · DataConnectionService [internal, application, Data] *(change-015)*
Manages named source connection credentials; encrypts/decrypts credentials; validates test results.

**Methods:**
- `create(dto: CreateDataConnectionDto, userId, workspaceSlug)` — validates sourceType, encrypts credentials, creates record, optionally calls testConnection
- `list(workspaceSlug, filters)` — paginated list; credentials never returned
- `get(id, workspaceSlug)` — returns connection metadata (no credentials)
- `update(id, dto, workspaceSlug)` — re-encrypts credentials if changed
- `delete(id, workspaceSlug)` — soft-checks linked Datasets; hard-deletes record
- `testConnection(id, workspaceSlug)` — resolves connector, decrypts credentials, calls `connector.testConnection(creds)`, writes lastTestedAt + lastTestResult
- `decryptCredentials(id, workspaceSlug): Promise<Record<string, unknown>>` — internal only; used by connectors; never called from controllers

**Deps:** DataConnectionRepository · ConnectorRegistry · AES encryption utility · AuditLogService · WorkspaceRepository
**Rules:** Credentials always AES-256-GCM encrypted at rest · `decryptCredentials` never called from a controller · Delete blocked if datasets with `status != pending` reference this connection

---

### SVC-DATA-DS · DatasetService [internal, application, Data] *(change-015, updated change-022, change-045)*
Manages dataset definitions, column mapping, schema discovery, AI-assisted mapping proposals, and grouping of tables under a data source.

**Methods:**
- `create(dto: CreateDatasetDto, userId, workspaceSlug)` — links connection, sets semanticFlag; for CSV datasets calls `discoverSchemaWithAiProposal()` automatically after creation
- `list(workspaceSlug, filters)` — paginated; filterable by connectionId, semanticFlag, syncStatus
- `listByConnection(connectionId, workspaceSlug, filters)` — *(change-045)* paginated list of all Tables (Datasets) grouped under one Data Source; powers EP-DATA-42 and the Data Source detail page
- `createFromEntities(connectionId, workspaceSlug, userId, entities)` — *(change-045)* creates one Dataset per selected entity from the wizard; **idempotent per (connectionId, entity)** so re-entering the wizard adds only new tables and never duplicates; runs `discoverSchemaWithAiProposal()` per created dataset; backs EP-DATA-44 and the e-commerce/DB/Sheets `select-entities` step
- `get(id, workspaceSlug)` — dataset with schema, last sync info, AI proposal fields
- `update(id, dto, workspaceSlug)` — updates columnMapping, semanticFlag, description, extractOptions; mapping changes do NOT re-trigger sync
- `delete(id, workspaceSlug)` — drops OLAP table via `AnalyticsStoreService`; deletes FilterValueMeta; hard-deletes record
- `discoverSchemaWithAiProposal(id, workspaceSlug)` — *(change-022, change-045)* decrypts connection credentials; calls `connector.discoverSchema(conn, dataset)` → writes `Dataset.schema`; then calls AI with `column-mapping` prompt (column names + inferred types + available canonical fields) → writes `aiProposedMapping` + `aiProposedSemanticFlag` as draft fields for user review; never sends raw rows to AI. *(change-045)* Applies a deterministic **name-match prefill** for required canonical fields before/after the AI call so obvious mappings (e.g. `id → customer_id`) are never left blank; runs for every semantic source, not just csv/google_sheets
- `confirmMapping(id, workspaceSlug, dto: ConfirmMappingDto)` — *(change-022, change-045)* writes user-edited (or AI-proposed) values into `columnMapping` + `semanticFlag`; clears `aiProposedMapping` + `aiProposedSemanticFlag`. *(change-045)* Computes required canonical fields for `semanticFlag`; when any are unmapped, throws `UnprocessableEntity({ missing: string[] })` instead of an opaque validation error, so the UI can highlight the missing rows
- `proposeMappingForFlag(id, workspaceSlug, semanticFlag)` — *(change-045)* on-demand AI mapping for the **user-chosen** semantic type (backs EP-DATA-46 / the "Map with AI" button). Runs the shared `runAiMappingProposal` helper against the already-discovered `Dataset.schema`, stores the result as the `aiProposedMapping` draft, and returns `{ semanticFlag, columnMapping }` for the user to edit; never mutates the live `columnMapping`. Works for any source (incl. csv); `arbitrary` returns an empty mapping
- `runAiMappingProposal(cols, semanticFlag)` *(private, change-045)* — shared proposal helper: sends **rich per-column metadata** (type + sample value + AI/user description) to the `column-mapping` prompt (v2) so the model maps by *purpose* not literal name (e.g. `Unit_Price_USD`→`price`, `stock_level`→`stock`), parses the JSON, applies the token-aware name/synonym prefill fallback, and filters to the flag's canonical fields. Reused by both `discoverSchemaWithAiProposal` and `proposeMappingForFlag` so automatic and on-demand mapping behave identically. Prompt lives in `integrations/ai/prompts/column-mapping.md` (all AI prompts are editable `.md` files)
- `updateSchemaColumns(id, workspaceSlug, updates: Array<{name, userDescription?, isPrimaryKey?}>)` — *(change-038)* patches individual `Dataset.schema` columns; setting `isPrimaryKey: true` on one column clears it from all others; used by EP-DATA-40
- `enqueueSyncJob(id, workspaceSlug, mode: 'full' | 'incremental', triggeredBy)` — validates `syncStatus != syncing`; creates SyncRun record (`progress: 0`, `phase: queued`); enqueues `DATA_SYNC_QUEUE` job
- `getRun(id, runId, workspaceSlug)` — *(change-045)* returns a single `SyncRun` with live `progress`/`phase`; backs EP-DATA-45 (frontend progress loader)

**Deps:** DatasetRepository · DataConnectionRepository · DataConnectionService · ConnectorRegistry · AiProviderRegistry · PromptTemplateService · SyncRunRepository · DATA_SYNC_QUEUE (BullMQ) · AnalyticsStoreService · AuditLogService · `canonical-fields.config` (required-field resolver)
**Rules:** `analyticsTable` derived automatically as `ds_{workspaceSlug}_{datasetId}` — never caller-supplied · Sync enqueue blocked if `syncStatus = syncing` · `discoverSchemaWithAiProposal` never exposes raw rows to AI — only column names, inferred types, and sample values · `confirmMapping` is the only way to promote AI proposal fields into live `columnMapping`, and enforces required-field completeness via structured `{ missing }` *(change-045)* · `createFromEntities` is non-destructive/idempotent so data sources stay fully editable *(change-045)*

---

### SVC-DATA-SYNC · SyncService (DataSyncProcessor) [internal, application, Data] *(change-018, updated change-045)*
BullMQ worker that executes a full or incremental dataset sync via the PipelineEngine.

**Methods:**
- `process(job: Job<{ datasetId, syncRunId, workspaceSlug, pipelineRunId?, mode }>): Promise<void>` — resolves Dataset + DataConnection, runs `PipelineEngine.run('ingest', { dataset, connection, … })`, marks SyncRun completed/failed, calls `FilterValuesService.computeAndStore` after success
- `updateProgress(syncRunId, workspaceSlug, { progress, phase, rowsIn?, rowsLoaded? })` — *(change-045)* throttled writer used by pipeline steps to advance `SyncRun.progress`/`phase` (and running row counts) so the frontend loader reflects live status

**Deps:** DatasetRepository · DataConnectionRepository · SyncRunRepository · FilterValueMetaRepository · FilterValuesService · PipelineEngine · WorkspaceRepository
**Side effects:** OLAP inserts · FilterValueMeta refresh · SyncRun status/progress updates
**Rules:** On pipeline error: SyncRun.status = `failed` + errorMessage captured · Filter refresh only after successful sync · Never re-runs a running SyncRun · *(change-045)* `progress`/`phase` are advisory and throttled (e.g. ≤1 write/sec); terminal truth remains `status`

---

### SVC-DATA-SCHEMA-DRIFT — SchemaDriftService [internal, application, Data] *(change-029)*
`src/modules/data/services/schema-drift.service.ts`

Compares the **stored** `Dataset.schema` (from last discovery) against a freshly discovered schema from the connector. Returns a structured drift report.

**Methods:**
- `detect(stored: DiscoveredColumn[], fresh: DiscoveredColumn[]): SchemaDriftReport`
  - `added: string[]` — columns present in `fresh` but absent in `stored` → safe, auto-applied
  - `removed: string[]` — columns in `stored` absent from `fresh` → breaking
  - `retyped: { name, oldType, newType }[]` — columns present in both but different canonical type → breaking
  - `hasBreaking: boolean` — true if `removed.length > 0 || retyped.length > 0`

**Called by:** `DataSyncProcessor` before the ingest pipeline step. If `hasBreaking`, processor sets `Dataset.hasSchemaDrift = true`; embeds report in `SyncRun.schemaDrift`; triggers `SYNC_SCHEMA_DRIFT` notification. Safe additions are appended to `Dataset.schema` automatically.

**New fields added to schemas:**
- `SyncRun.schemaDrift: SchemaDriftReport | null` — embedded drift snapshot per run
- `Dataset.hasSchemaDrift: boolean` — true when the stored schema has unresolved breaking drift

---

### SVC-DATA-SCHED · ScheduledSyncService [internal, application, Data] *(change-023)*
`@nestjs/schedule` cron service that enqueues periodic syncs for datasets with `syncPolicy = HOURLY | DAILY`.

**Methods:**
- `runHourlySyncs()` — `@Cron(CronExpression.EVERY_HOUR)` — queries all workspace datasets with `syncPolicy = hourly`; skips any where `syncStatus = syncing`; enqueues `DATA_SYNC_QUEUE` job for each via `SyncService.triggerSync()`
- `runDailySyncs()` — `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` — same logic for `syncPolicy = daily`

**Deps:** DatasetRepository (multi-workspace fan-out query) · WorkspaceRepository (enumerate workspace slugs) · SyncService
**Side effects:** BullMQ job enqueue
**Rules:** Guard against duplicate enqueue: skip dataset if `syncStatus = syncing` · *(change-038)* Auto-sync uses `mode = incremental` when `dataset.schema` contains a column with `isPrimaryKey = true`; falls back to `full` otherwise · Google Sheets datasets always use `full` (no watermark support) · On app restart all eligible datasets are naturally re-evaluated at next cron tick — no catch-up backfill

---

### SVC-DSTYPE · DatasourceTypeMetaService [internal, application, Data] *(change-048)*
Global lookup table service for data source type display metadata (title, logo, instructions, active flag). One document per `DataSourceType` enum value; not workspace-scoped.

**Methods:**
- `findAll(activeOnly?: boolean): Promise<DatasourceTypeMeta[]>` — returns all 7 type records; when `activeOnly = true` returns only `isActive = true` entries (used by customer endpoint)
- `findOne(sourceType: string): Promise<DatasourceTypeMeta>` — returns single record; throws 404 if unknown type
- `update(sourceType: string, dto: UpdateDatasourceTypeMetaDto): Promise<DatasourceTypeMeta>` — admin-only; updates `titleEn`, `titleAr`, `logoUrl`, `instructionEn`, `instructionAr` in-place
- `toggleActive(sourceType: string): Promise<DatasourceTypeMeta>` — admin-only; flips `isActive` and returns updated record

**Deps:** DatasourceTypeMetaRepository
**Rules:** Collection is seeded via manual script; never created/deleted via API · `sourceType` is the natural primary key (unique string) — no ObjectId param on public read · `isActive = false` hides the type from the customer portal source picker only; existing `DataConnection` records for disabled types remain functional

---

### SVC-DATA-WHROUTE · WebhookRouteService [internal, application, Data] *(change-043)*
Maintains the global `webhook_routes` index mapping an external store identifier to a Dynamo workspace. Used by Shopify, Salla, and Zid webhook handlers to resolve `workspaceSlug` for dispatch.

**Methods:**
- `upsert(sourceType, externalStoreId, workspaceSlug, connectionId)` — creates or updates the route entry (upsert by sourceType+externalStoreId)
- `findByStore(sourceType, externalStoreId): Promise<{ workspaceSlug: string; connectionId: string } | null>` — lookup used by webhook handlers

**Deps:** WebhookRouteRepository
**Side effects:** MongoDB upsert on `webhook_routes`
**Rules:** Called fire-and-forget during provisioning; failure must never block OAuth provisioning · Used by webhook handlers before calling `applyWebhookEvent()`
