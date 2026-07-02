# Services — Attachments

## Module: Attachments

### SVC-035 · AttachmentsService [domain, internal, Attachments]

- Status: partial

- Methods:
  - `requestUploadUrl(userId, dto): PresignedUploadDto` — validate target access; return key + presigned PUT
  - `confirmUpload(userId, dto): AttachmentDto` — persist metadata after client upload
  - `list(userId, targetType, targetId): AttachmentDto[]`
  - `getDownloadUrl(userId, attachmentId): PresignedDownloadDto`
  - `delete(userId, attachmentId): void`
- Deps: `AttachmentsRepository`, `R2StorageProvider`, `RolesGuardHelper`
- Side effects: R2 upload/delete
- Rules: RULE-008 presigned via API only

### SVC-036 · R2StorageProvider [integration, external, Attachments]

- Status: planned

- Methods:
  - `getPresignedUploadUrl(key, contentType): PresignedUrl`
  - `getPresignedDownloadUrl(key): PresignedUrl`
  - `deleteObject(key): void`
- Deps: Cloudflare R2 config
- Side effects: remote storage
- Rules: RULE-008; never called from controllers
