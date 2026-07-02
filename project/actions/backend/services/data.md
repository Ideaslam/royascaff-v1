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

### SVC-DATA-DS · DatasetService [internal, application, Data] *(change-015, updated change-022)*
Manages dataset definitions, column mapping, schema discovery, and AI-assisted mapping proposals.

**Methods:**
- `create(dto: CreateDatasetDto, userId, workspaceSlug)` — links connection, sets semanticFlag; for CSV datasets calls `discoverSchemaWithAiProposal()` automatically after creation
- `list(workspaceSlug, filters)` — paginated; filterable by connectionId, semanticFlag, syncStatus
- `get(id, workspaceSlug)` — dataset with schema, last sync info, AI proposal fields
- `update(id, dto, workspaceSlug)` — updates columnMapping, semanticFlag, description, extractOptions; mapping changes do NOT re-trigger sync
- `delete(id, workspaceSlug)` — drops OLAP table via `AnalyticsStoreService`; deletes FilterValueMeta; hard-deletes record
- `discoverSchemaWithAiProposal(id, workspaceSlug)` — *(change-022)* decrypts connection credentials; calls `connector.discoverSchema(conn, dataset)` → writes `Dataset.schema`; then calls AI with `column-mapping` prompt (column names + inferred types + available canonical fields) → writes `aiProposedMapping` + `aiProposedSemanticFlag` as draft fields for user review; never sends raw rows to AI
- `confirmMapping(id, workspaceSlug, dto: ConfirmMappingDto)` — *(change-022)* writes user-edited (or AI-proposed) values into `columnMapping` + `semanticFlag`; clears `aiProposedMapping` + `aiProposedSemanticFlag`
- `enqueueSyncJob(id, workspaceSlug, mode: 'full' | 'incremental', triggeredBy)` — validates `syncStatus != syncing`; creates SyncRun record; enqueues `DATA_SYNC_QUEUE` job

**Deps:** DatasetRepository · DataConnectionRepository · DataConnectionService · ConnectorRegistry · AiProviderRegistry · PromptTemplateService · SyncRunRepository · DATA_SYNC_QUEUE (BullMQ) · AnalyticsStoreService · AuditLogService
**Rules:** `analyticsTable` derived automatically as `ds_{workspaceSlug}_{datasetId}` — never caller-supplied · Sync enqueue blocked if `syncStatus = syncing` · `discoverSchemaWithAiProposal` never exposes raw rows to AI — only column names, inferred types, and sample values · `confirmMapping` is the only way to promote AI proposal fields into live `columnMapping`

---

### SVC-DATA-SYNC · SyncService (DataSyncProcessor) [internal, application, Data] *(change-018)*
BullMQ worker that executes a full or incremental dataset sync via the PipelineEngine.

**Methods:**
- `process(job: Job<{ datasetId, syncRunId, workspaceSlug, pipelineRunId?, mode }>): Promise<void>` — resolves Dataset + DataConnection, runs `PipelineEngine.run('ingest', { dataset, connection, … })`, marks SyncRun completed/failed, calls `FilterValuesService.computeAndStore` after success

**Deps:** DatasetRepository · DataConnectionRepository · SyncRunRepository · FilterValueMetaRepository · FilterValuesService · PipelineEngine · WorkspaceRepository
**Side effects:** OLAP inserts · FilterValueMeta refresh · SyncRun status updates
**Rules:** On pipeline error: SyncRun.status = `failed` + errorMessage captured · Filter refresh only after successful sync · Never re-runs a running SyncRun
