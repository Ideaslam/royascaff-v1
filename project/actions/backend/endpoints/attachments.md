# Endpoints — Attachments

## Module: Attachments

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-093 | POST | /attachments/upload-url | authenticated | `body: RequestUploadDto` | `200 PresignedUploadDto` | `AttachmentsService.requestUploadUrl()` | RULE-008 |
| EP-094 | POST | /attachments/confirm | authenticated | `body: ConfirmUploadDto` | `201 AttachmentDto` | `AttachmentsService.confirmUpload()` | after PUT to R2 |
| EP-095 | GET | /attachments | authenticated | `?targetType,targetId` | `200 AttachmentDto[]` | `AttachmentsService.list()` | — |
| EP-096 | GET | /attachments/:id/download-url | authenticated | `param: id` | `200 PresignedDownloadDto` | `AttachmentsService.getDownloadUrl()` | — |
| EP-097 | DELETE | /attachments/:id | authenticated | `param: id` | `204` | `AttachmentsService.delete()` | — |
