## Module: Data

`@Controller('data')`

### Legacy CSV Endpoints

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-01 | POST | /api/v1/data/upload/file | JWT | `multipart/form-data` file (CSV, max 50 MB) | 202 `{ fileId, jobId, status }` | SVC-DATA.uploadFile() | Async; rejects non-CSV / >50 MB |
| EP-DATA-02 | POST | /api/v1/data/upload/initiate | JWT | `InitiateUploadDto` { filename, fileSizeBytes, mimeType } | 201 `{ fileId, uploadUrl, uploadId }` | SVC-DATA.initiateUpload() | Legacy presigned-URL flow |
| EP-DATA-03 | POST | /api/v1/data/upload/:fileId/complete | JWT | `:fileId` · `CompleteUploadDto` { storageKey } | 202 `{ fileId, jobId, status }` | SVC-DATA.completeUpload() | Async |
| EP-DATA-04 | GET | /api/v1/data/files | JWT | query: page, limit, search, status | 200 `Paginated<CsvFileListItemDto>` | SVC-DATA.listFiles() | |
| EP-DATA-05 | GET | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 `CsvFileDetailsDto` | SVC-DATA.getFile() | Includes `columns: ColumnMetadataDto[]` |
| EP-DATA-06 | PATCH | /api/v1/data/files/:fileId/columns | JWT | `:fileId` · `UpdateColumnsDto` { columns: [{ columnId, userDescription }] } | 200 `CsvFileDetailsDto` | SVC-DATA.updateColumns() | |
| EP-DATA-07 | DELETE | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 delete result | SVC-DATA.deleteFile() | Removes file, rows, columns |
| EP-DATA-08 | POST | /api/v1/data/files/:fileId/analyze/retry | JWT | `:fileId` param | 202 `{ jobId, status }` | SVC-DATA.retryAnalysis() | Async |

### DataConnection Endpoints *(change-015)*

`@Controller('data/connections')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-09 | POST | /api/v1/data/connections | JWT | `CreateDataConnectionDto` { name, sourceType, credentials } | 201 `DataConnectionDto` | SVC-DATA-CONN.create() | Credentials encrypted before persist; never returned |
| EP-DATA-10 | GET | /api/v1/data/connections | JWT | query: page, limit, sourceType | 200 `Paginated<DataConnectionListItemDto>` | SVC-DATA-CONN.list() | No credentials in response |
| EP-DATA-11 | GET | /api/v1/data/connections/:id | JWT | `:id` | 200 `DataConnectionDto` | SVC-DATA-CONN.get() | |
| EP-DATA-12 | PATCH | /api/v1/data/connections/:id | JWT | `:id` · `UpdateDataConnectionDto` | 200 `DataConnectionDto` | SVC-DATA-CONN.update() | Re-encrypts if credentials changed |
| EP-DATA-13 | DELETE | /api/v1/data/connections/:id | JWT | `:id` | 204 | SVC-DATA-CONN.delete() | Blocked if active datasets reference it |
| EP-DATA-14 | POST | /api/v1/data/connections/:id/test | JWT | `:id` | 200 `{ ok: boolean, error?: string, testedAt: Date }` | SVC-DATA-CONN.testConnection() | |

### Dataset Endpoints *(change-015, updated change-022)*

`@Controller('data/datasets')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-15 | POST | /api/v1/data/datasets | JWT | `CreateDatasetDto` { connectionId, name, semanticFlag?, extractOptions? } | 201 `DatasetDto` | SVC-DATA-DS.create() | For CSV: auto-triggers `discoverSchemaWithAiProposal` *(change-022)* |
| EP-DATA-16 | GET | /api/v1/data/datasets | JWT | query: page, limit, connectionId, semanticFlag, syncStatus | 200 `Paginated<DatasetListItemDto>` | SVC-DATA-DS.list() | |
| EP-DATA-17 | GET | /api/v1/data/datasets/:id | JWT | `:id` | 200 `DatasetDto` | SVC-DATA-DS.get() | Includes schema, aiProposedMapping, aiProposedSemanticFlag, last sync info |
| EP-DATA-18 | PATCH | /api/v1/data/datasets/:id | JWT | `:id` · `UpdateDatasetDto` { name?, description?, extractOptions? } | 200 `DatasetDto` | SVC-DATA-DS.update() | Mapping changes via EP-DATA-23 (confirm); this endpoint does NOT update columnMapping directly |
| EP-DATA-19 | DELETE | /api/v1/data/datasets/:id | JWT | `:id` | 204 | SVC-DATA-DS.delete() | Drops OLAP table + FilterValueMeta |
| EP-DATA-20 | POST | /api/v1/data/datasets/:id/sync | JWT | `:id` · `SyncDatasetDto` { mode: 'full' \| 'incremental' } | 202 `{ syncRunId, status }` | SVC-DATA-DS.enqueueSyncJob() | Async; blocked if already syncing |
| EP-DATA-21 | GET | /api/v1/data/datasets/:id/sync-history | JWT | `:id` · query: page, limit | 200 `Paginated<SyncRunDto>` | SVC-DATA-DS.listSyncHistory() | |
| EP-DATA-22 | POST | /api/v1/data/datasets/:id/discover-schema | JWT | `:id` | 200 `DatasetDto` | SVC-DATA-DS.discoverSchemaWithAiProposal() | Re-discovers schema + refreshes AI mapping proposal *(change-022)* |
| EP-DATA-23 | POST | /api/v1/data/datasets/:id/confirm-mapping | JWT | `:id` · `ConfirmMappingDto` { columnMapping: Record<string,string>, semanticFlag: string } | 200 `DatasetDto` | SVC-DATA-DS.confirmMapping() | Promotes mapping into live fields; clears AI proposals *(change-022)* |

**Notes:**
- [EP-DATA-01] Single-step upload: frontend sends file as multipart, backend streams to R2, creates `csvfiles` record, queues AI column analysis job.
- [EP-DATA-02] Legacy presigned-URL flow: creates a `csvfiles` record and returns a presigned upload URL plus upload session id for direct client-to-R2 upload.
- [EP-DATA-06] Accepts array of column updates setting each column's `userDescription`. When all columns confirmed, file becomes eligible for dashboard generation.
- [EP-DATA-09] Credentials are accepted in plain text over HTTPS, then immediately encrypted with AES-256-GCM before persisting. Never stored or returned in plaintext.
- [EP-DATA-15] For CSV datasets, after creating the Dataset record the backend automatically triggers schema discovery + AI mapping proposal. The response includes `aiProposedMapping` and `aiProposedSemanticFlag` for user review.
- [EP-DATA-20] Creates a `SyncRun` record immediately and returns `syncRunId`; actual sync runs asynchronously via BullMQ `DATA_SYNC_QUEUE`.
- [EP-DATA-22] Can be called again at any time to refresh schema (e.g. after re-uploading a CSV). Re-runs connector `discoverSchema` + AI proposal. Clears previous proposal.
- [EP-DATA-23] User confirms (or edits) the AI-proposed mapping. Only after this call does the Dataset become eligible for dashboard generation.
