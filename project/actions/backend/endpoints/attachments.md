# Endpoints — Attachments

## Module: Attachments

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-093 | POST | /attachments/upload-url | authenticated | `body: RequestUploadDto` | `200 PresignedUploadDto` | `AttachmentsService.requestUploadUrl()` | done | — |
| EP-094 | POST | /attachments/confirm | authenticated | `body: ConfirmUploadDto` | `201 AttachmentDto` | `AttachmentsService.confirmUpload()` | done | — |
| EP-095 | GET | /attachments | authenticated | `?targetType,targetId` | `200 AttachmentDto[]` | `AttachmentsService.list()` | done | — |
| EP-096 | GET | /attachments/:id/download-url | authenticated | `param: id` | `200 PresignedDownloadDto` | `AttachmentsService.getDownloadUrl()` | done | — |
| EP-097 | DELETE | /attachments/:id | authenticated | `param: id` | `204` | `AttachmentsService.delete()` | done | — |
