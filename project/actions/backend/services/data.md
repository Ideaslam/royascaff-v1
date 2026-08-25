## Module: Data (Multi-Source Data Management)

### SVC-DATA · DataService [internal, application, Data]
Manages CSV file uploads (direct and presigned), AI-analysis kickoff, column metadata, and file lifecycle. *(Legacy CSV path — kept for backward compat)*

**Methods:**
- `uploadFile(file: Express.Multer.File, userId: string, ip?)` — atomically reserves the upload limit for current workspace period, validates/uploads/enqueues, compensates reservation on failure, audits completion
- `initiateUpload(dto: InitiateUploadDto, userId, ip?)` — creates an operation-bound upload reservation and returns presigned URL; abandoned reservations expire/compensate idempotently
- `completeUpload(fileId, dto: CompleteUploadDto, userId, ip?)` — commits the existing reservation, finalizes upload, and enqueues analysis; compensates on failure
- `listFiles(userId, userRole, filters): Promise<PaginatedResponseDto>` — paginated; non-admins scoped to ownerId
- `getFile(fileId, userId, userRole)` — returns file plus column metadata
- `updateColumns(fileId, dto: UpdateColumnsDto, userId, userRole)` — saves user column descriptions; marks CONFIRMED once none remain unconfirmed
- `deleteFile(fileId, userId, userRole, ip?)` — deletes column metadata, drops dynamic csvdata_{fileId} collection, deletes R2 object and record, audits CSVFILE_DELETE
- `retryAnalysis(fileId, userId, userRole)` — clears prior metadata/rows and re-enqueues csv-analysis (only from retryable states)

**Deps:** CsvFileRepository · ColumnMetadataRepository · SubscriptionLimitService · BackgroundJobRepository (via BackgroundJobsService) · BackgroundJobsService · AuditLogService · CSV_ANALYSIS_QUEUE · STORAGE_PROVIDER · Mongo Connection
**Side effects:** R2 upload/delete/presign · queue enqueue · dynamic collection drop/clear · audit writes
**Rules:** Current entitlement and atomic quota reservation precede upload writes · max file size 50 MB · status flow enforced · over-limit existing files remain readable/deletable · delete removes storage object, metadata, and dynamic collection

---

### SVC-DATA-CONN · ConnectionService [internal, application, Data] *(change-015, evolved change-059)*
Manages **auth-only** Connection credentials; encrypts/decrypts; test-before-save; re-auth. (Formerly DataConnectionService conflating source + auth.)

**Methods:**
- `create(dto: CreateConnectionDto, userId, workspaceSlug)` — calls `SVC-DSTYPE.assertConnectable(sourceType)` *(change-072)*; validates sourceType (non-CSV), runs real `testConnection` with plaintext creds (**must pass**), then encrypts auth-only credentials and creates record
- `list(workspaceSlug, filters)` — paginated searchable/filterable/sortable list; credentials never returned; optional `dataSourceCount`
- `get(id, workspaceSlug)` — connection metadata (no secrets); may include safe display fields (host, shop domain) without passwords/tokens
- `update(id, dto, workspaceSlug)` — rename and/or re-encrypt credentials if changed; credential updates require successful test first; does not change linked Data Sources
- `reauth(id, workspaceSlug, tokensOrCreds)` — OAuth / credential refresh in place for expired tokens *(change-059)*
- `delete(id, workspaceSlug)` — **blocked** if any Data Source references this Connection (409 with count); otherwise hard-deletes
- `testConnection(id | inlineCreds, workspaceSlug)` — resolves connector, decrypts or uses inline creds, calls `connector.testConnection`, writes `lastTestedAt` + `lastTestResult`; rate-limited
- `decryptCredentials(id, workspaceSlug): Promise<Record<string, unknown>>` — internal only; used by DataSource/Dataset/sync resolution; never called from controllers
- `setStatus(id, status)` / `setError(id, message)` — status helpers

**Deps:** ConnectionRepository · DataSourceRepository (in-use count) · ConnectorRegistry · AES encryption utility · AuditLogService (deferred) · WorkspaceRepository
**Rules:** Credentials always AES-256-GCM encrypted at rest · auth-only blob (no scope) · `decryptCredentials` never from a controller · delete blocked while Data Sources reference Connection · test must pass before persist *(change-059)*

---

### SVC-DATA-SOURCE · DataSourceService [internal, application, Data] *(change-059)*
Manages Data Sources (name + connectionId + scope); cascade delete; dashboard usage guard.

**Methods:**
- `create(dto: CreateDataSourceDto, userId, workspaceSlug)` — calls `SVC-DSTYPE.assertConnectable(sourceType)` *(change-072)*; validates `connectionId` exists and `sourceType` matches (or CSV with null connection); stores scope; no rebind later
- `list(workspaceSlug, filters)` — paginated list with table counts; powers Data Sources home
- `get(id, workspaceSlug)` — metadata + linked Connection summary (no secrets)
- `update(id, dto, workspaceSlug)` — rename and/or update **scope** only; `connectionId` immutable
- `delete(id, workspaceSlug)` — if any child Dataset is referenced by DashboardDatasource → **block** (409); else confirmation already done on FE → cascade-delete Datasets (OLAP + FilterValueMeta) + SyncRuns + DataSource
- `resolveConnection(dataSourceId, workspaceSlug)` — returns Connection doc + decrypted credentials + scope overlay for connectors

**Deps:** DataSourceRepository · ConnectionRepository · DatasetRepository · DashboardDatasourceRepository · AnalyticsStoreService · SyncRunRepository · FilterValueMetaRepository
**Rules:** Many Data Sources → one Connection · CSV one-off without Connection · cascade delete only when no dashboard links · never returns Connection secrets

---

### SVC-DATA-DS · DatasetService [internal, application, Data] *(change-015, updated change-022, change-045, change-059)*
Manages dataset definitions, column mapping, schema discovery, AI-assisted mapping proposals, and grouping of tables under a **Data Source**.

**Methods:**
- `create(dto: CreateDatasetDto, userId, workspaceSlug)` — links `dataSourceId`; for CSV datasets **enqueues** schema discovery (does not await AI) *(change-058)*
- `list(workspaceSlug, filters)` — paginated; filterable by `dataSourceId`, semanticFlag, syncStatus
- `listByDataSource(dataSourceId, workspaceSlug, filters)` — *(change-045, change-058, change-059)* paginated Tables under one Data Source; optional `schemaDiscoveryBatchId`; powers EP-DATA-42
- `createFromEntities(dataSourceId, workspaceSlug, userId, entities)` — *(change-045, change-058, change-059)* creates one Dataset per selected entity; **idempotent per (dataSourceId, entity)**; assigns `schemaDiscoveryBatchId`; enqueues parallel `SCHEMA_DISCOVERY_QUEUE` jobs; returns `{ datasetIds, createdIds, schemaDiscoveryBatchId }`; backs EP-DATA-44
- `listDataSourceEntities(dataSourceId, workspaceSlug)` — resolves Connection + scope via DataSourceService; calls `connector.listEntities`; backs EP-DATA-43
- `get(id, workspaceSlug)` — dataset with schema, last sync info, AI proposal fields, discovery status fields, parent `dataSourceId`
- `update(id, dto, workspaceSlug)` — updates columnMapping, semanticFlag, description, extractOptions; mapping changes do NOT re-trigger sync
- `delete(id, workspaceSlug)` — drops OLAP table via `AnalyticsStoreService`; deletes FilterValueMeta; hard-deletes record (dashboard guard enforced at Data Source delete; single-table delete may also check dashboard links)
- `discoverSchemaWithAiProposal(id, workspaceSlug)` — *(change-022, change-045, change-055)* worker-side: resolve credentials via `dataset → dataSource → connection`; `connector.discoverSchema` → `availableColumns` + column-identify AI + mapping proposal
- `enqueueSchemaDiscovery(id, workspaceSlug, opts?: { batchId?, mode?: 'full' | 'new-columns-only' })` — *(change-058)* sets `schemaDiscoveryStatus=queued`, enqueues job; blocked while queued/running (409) except retry from `failed`
- `confirmMapping(id, workspaceSlug, dto: ConfirmMappingDto)` — *(change-022, change-045)* promotes mapping; returns `422 { missing }` when required canonical fields unmapped
- `proposeMappingForFlag(id, workspaceSlug, semanticFlag)` — *(change-045)* on-demand AI mapping (EP-DATA-46)
- `runAiMappingProposal(cols, semanticFlag)` *(private, change-045)* — shared proposal helper
- `updateSchemaColumns(id, workspaceSlug, updates)` — *(change-038, change-055)* patches `availableColumns`
- `confirmSchemaSelection(id, workspaceSlug, userId, dto, ip?)` — *(change-055)* prunes live `schema`; audits `dataset.schema_selection`
- `refreshAvailableColumns(id, workspaceSlug)` — *(change-055)* Add-column path for worker
- `enqueueSyncJob(id, workspaceSlug, mode, triggeredBy)` — creates SyncRun; enqueues `DATA_SYNC_QUEUE`
- `getRun(id, runId, workspaceSlug)` — *(change-045)* single SyncRun with progress/phase
- `listBySemanticFlags(workspaceSlug, flags: string[])` — *(change-049)* template picker datasets

**Deps:** DatasetRepository · DataSourceRepository · ConnectionRepository · ConnectionService · DataSourceService · ConnectorRegistry · AiProviderRegistry · PromptTemplateService · SyncRunRepository · DATA_SYNC_QUEUE · SCHEMA_DISCOVERY_QUEUE *(change-058)* · AnalyticsStoreService · AuditLogService · `canonical-fields.config` · column-identify helper
**Rules:** Credential path `dataset → dataSource → connection` *(change-059)* · `analyticsTable` = `ds_{workspaceSlug}_{datasetId}` · Sync enqueue blocked if syncing · never expose raw rows to AI · `createFromEntities` idempotent per `(dataSourceId, entity)` · *(change-058)* discovery HTTP paths enqueue only

---

### SVC-DATA-SCHEMA-DISCOVERY · SchemaDiscoveryProcessor [internal, application, Data] *(change-058)*
BullMQ worker that runs setup-time schema discovery + column-identify (+ mapping proposal) **in parallel per dataset**.

**Methods:**
- `process(job: Job<{ workspaceSlug, datasetId, mode: 'full' | 'new-columns-only', batchId? }>): Promise<void>` — sets status `running`; calls `discoverSchemaWithAiProposal` (`full`) or `refreshAvailableColumns` (`new-columns-only`); on success → `success` + finishedAt; on failure → `failed` + `schemaDiscoveryError`; if dataset missing → no-op

**Deps:** DatasetService · DatasetRepository · SCHEMA_DISCOVERY_QUEUE
**Side effects:** Dataset availableColumns / AI proposal / discovery status fields
**Rules:** Concurrency > 1 (e.g. 3–5) · one job per dataset · does not run ingest sync · reuse existing discovery logging (no new audit events)

---

### SVC-DATA-SYNC · SyncService (DataSyncProcessor) [internal, application, Data] *(change-018, updated change-045, change-059)*
BullMQ worker that executes a full or incremental dataset sync via the PipelineEngine.

**Methods:**
- `process(job: Job<{ datasetId, syncRunId, workspaceSlug, pipelineRunId?, mode }>): Promise<void>` — consumes the operation's atomic daily-sync reservation, resolves Dataset → DataSource → Connection, runs ingest, atomically adds actual synced rows to the current period (or fails/clamps before exceeding), marks run, refreshes filters; compensates reserved usage on failure
- `updateProgress(syncRunId, workspaceSlug, { progress, phase, rowsIn?, rowsLoaded? })` — *(change-045)* throttled writer for live progress

**Deps:** DatasetRepository · DataSourceRepository · ConnectionRepository · SyncRunRepository · SubscriptionLimitService · FilterValueMetaRepository · FilterValuesService · PipelineEngine · WorkspaceRepository
**Side effects:** OLAP inserts · FilterValueMeta refresh · SyncRun status/progress updates
**Rules:** Sync trigger reserves current-period/daily quota before enqueue and fails closed on entitlement errors · actual rows are accounted atomically · failed runs compensate reservations · filter refresh only after success · never re-run a running SyncRun

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

### SVC-DSTYPE · DatasourceTypeMetaService [internal, application, Data] *(change-048, change-072)*
Global lookup table service for data source type display metadata (title, logo, instructions, active flag, coming-soon flag). One document per `DataSourceType` enum value; not workspace-scoped.

**Methods:**
- `findAll(activeOnly?: boolean): Promise<DatasourceTypeMeta[]>` — returns all type records; when `activeOnly = true` returns only `isActive = true` entries including `comingSoon = true` (used by customer endpoint)
- `findOne(sourceType: string): Promise<DatasourceTypeMeta>` — returns single record; throws 404 if unknown type
- `update(sourceType: string, dto: UpdateDatasourceTypeMetaDto): Promise<DatasourceTypeMeta>` — admin-only; updates `titleEn`, `titleAr`, `logoUrl`, `instructionEn`, `instructionAr`, `comingSoon` in-place
- `toggleActive(sourceType: string): Promise<DatasourceTypeMeta>` — admin-only; flips `isActive` and returns updated record
- `assertConnectable(sourceType: string): Promise<void>` — throws 400 if type unknown, `isActive = false`, or `comingSoon = true`; used by connection/source create and OAuth authorize starts *(change-072)*

**Deps:** DatasourceTypeMetaRepository
**Rules:** Collection is seeded via manual script; never created/deleted via API · `sourceType` is the natural primary key (unique string) — no ObjectId param on public read · `isActive = false` hides the type from the customer portal source picker · `comingSoon = true` keeps the type visible but non-selectable; create/OAuth-start rejected · existing `DataConnection` / `DataSource` records for disabled or coming-soon types remain functional (sync/reauth allowed)

---

### SVC-DATA-WHROUTE · WebhookRouteService [internal, application, Data] *(change-043)*
Maintains the global `webhook_routes` index mapping an external store identifier to a Dynamo workspace. Used by Shopify, Salla, and Zid webhook handlers to resolve `workspaceSlug` for dispatch.

**Methods:**
- `upsert(sourceType, externalStoreId, workspaceSlug, connectionId)` — creates or updates the route entry (upsert by sourceType+externalStoreId)
- `findByStore(sourceType, externalStoreId): Promise<{ workspaceSlug: string; connectionId: string } | null>` — lookup used by webhook handlers

**Deps:** WebhookRouteRepository
**Side effects:** MongoDB upsert on `webhook_routes`
**Rules:** Called fire-and-forget during provisioning; failure must never block OAuth provisioning · Used by webhook handlers before calling `applyWebhookEvent()`
