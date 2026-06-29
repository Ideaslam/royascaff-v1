## Module: Data

`@Controller('data')`

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

**Notes:**
- [EP-DATA-01] Single-step upload: frontend sends file as multipart, backend streams to R2, creates `csvfiles` record, queues AI column analysis job.
- [EP-DATA-02] Legacy presigned-URL flow: creates a `csvfiles` record and returns a presigned upload URL plus upload session id for direct client-to-R2 upload.
- [EP-DATA-06] Accepts array of column updates setting each column's `userDescription`. When all columns confirmed, file becomes eligible for dashboard generation.
