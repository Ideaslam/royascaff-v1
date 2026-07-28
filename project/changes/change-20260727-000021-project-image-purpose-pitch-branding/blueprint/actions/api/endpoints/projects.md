# Endpoints — Safqa API · Projects (pack delta)

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-07 | POST | /api/data/projects/:id/images | permission:`projects.edit` | multipart: `files` (required); optional `purposes` / `notes` (parallel arrays or repeated fields, same order as files) | `images[]` | uploadImages | planned | purpose default `other`; invalid purpose → 400 |
| EP-PROJECTS-11 | PATCH | /api/data/projects/:id/images | permission:`projects.edit` | body: `{ images: { id, purpose?, userNote? }[] }` | `images[]` | patchImages | planned | update metadata only; unknown id → 400/404 |

## Delta

- **Clarify** EP-PROJECTS-07 accepts purpose/note alongside files
- **Add** EP-PROJECTS-11 for metadata updates without re-upload
