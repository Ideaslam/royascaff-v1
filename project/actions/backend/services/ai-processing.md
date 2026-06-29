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
BullMQ worker that AI-generates dashboard widgets from confirmed datasources and the widget catalog.

**Methods:**
- `process(job: Job<{ dashboardId; jobId; fileIds; purpose }>): Promise<void>` — builds datasource context, loads widget catalog, calls AI, persists valid widgets, marks READY/COMPLETED (or ERROR/FAILED)

**Deps:** BackgroundJobRepository · CsvFileRepository · ColumnMetadataRepository · DashboardRepository · ChartWidgetRepository · WidgetDefinitionRepository · AI_PROVIDER
**Side effects:** AI call · widget inserts · dashboard status update · progress reports (5/20/30/80/100)
**Rules:** Only widget types in catalog are persisted (unknown dropped) · Column descriptions prefer userDescription → aiDescription → fallback · Default layout 12 columns unless AI specifies otherwise

---

### SVC-AI-DGC · DashboardGenerationComplete [internal, application, AI Processing] — STUB, not implemented
