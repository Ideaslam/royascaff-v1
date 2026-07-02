## Module: Data (CSV Management)

### SVC-DATA · DataService [internal, application, Data]
Manages CSV file uploads (direct and presigned), AI-analysis kickoff, column metadata, and file lifecycle.

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
