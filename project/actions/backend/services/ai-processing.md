## Module: AI Processing

### SVC-AI-CSV · CsvAnalysisProcessor [internal, application, AI Processing]
BullMQ worker that parses an uploaded CSV, infers columns, calls the AI provider, and persists rows + metadata.

**Methods:**
- `process(job: Job<{ fileId; jobId; userId }>): Promise<void>` — full pipeline: parse → store rows → AI analyze → persist descriptions → mark ANALYZED/COMPLETED (or ERROR/FAILED on throw)

**Deps:** CsvFileRepository · ColumnMetadataRepository · BackgroundJobRepository · AI_PROVIDER · STORAGE_PROVIDER · ConfigService · Mongo Connection (@InjectConnection)
**Side effects:** storage download · AI call · dynamic collection inserts · status updates · progress reports (5/10/30/40/80/100)
**Rules:** Only column metadata + sample values sent to AI (never raw rows) · Rows inserted only if columns not already parsed (idempotent) · Type inference covers number/boolean/date/string with coercion · On error both job (FAILED) and file (ERROR) capture the message

---

### SVC-AI-DASH · DashboardGenerationProcessor [internal, application, AI Processing]
BullMQ worker that triggers the `dashboard-generate` pipeline for AI-powered dashboard creation. *(Refactored in change-020 — no longer directly calls AI)*

**Methods:**
- `process(job: Job<{ dashboardId; jobId; workspaceSlug; purpose }>): Promise<void>` — resolves workspace, calls `PipelineEngine.run('dashboard-generate', { metadata: { dashboardId, purpose } })`, updates BackgroundJob status/progress to COMPLETED (or FAILED on error)

**Deps:** BackgroundJobRepository · PipelineEngine · WorkspaceRepository
**Side effects:** pipeline step side effects (AI calls, widget inserts, filter computation, cache invalidation) · background job status update
**Rules:** Processor is a thin orchestration shell — all business logic lives in pipeline steps · On error: job (FAILED) + dashboard ERROR captured

---

### SVC-AI-DGC · DashboardGenerationComplete [internal, application, AI Processing] — STUB, not implemented
