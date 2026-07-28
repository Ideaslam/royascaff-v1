# Pages — Safqa Web · Projects (pack delta)

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: done
- Components (files step delta):
  - Separate cards: **RFP** + **Project images**
  - Images use shared `app-project-images-field` (row layout: preview | purpose | note)
  - On submit upload: `ProjectsService.uploadImages(projectId, items)` sends files + parallel `purposes` / `notes`
- Service: EP-PROJECTS-07 (extended)
- Guard: unchanged (`projects.create` + flag)
- i18n: `projects.imagePurpose.*`, `projects.imagesField.*`, `projects.filesCard.*`

### Project Edit `PG-PROJECTS-04`
- Route: `/projects/:id/edit`
- Status: done
- Components delta:
  - **Project images** card with shared `app-project-images-field`
  - Load existing images (purpose/note); dirty meta → `patchImages`; new files → `uploadImages`
  - Server images cannot be deleted from UI yet (no delete endpoint)
- Guard: unchanged (`projects.edit`)

### Shared · ProjectImagesField `CMP-PROJECT-IMAGES-01`
- Status: done
- Location: `shared/project-images-field/`
- Empty drop zone + list rows + compact “add more” drop zone
- Roya blue chrome; client_logo rows highlighted with hint

### FE ProjectsService
- Status: done
- Methods:
  - `uploadImages(projectId, items: { file, purpose?, userNote? }[] | File[])` — FormData `files` + `purposes` + `notes`
  - `patchImages(projectId, images: { id, purpose?, userNote? }[])` → EP-PROJECTS-11
- Rules: FE permission gates unchanged; server enforces `projects.edit`

## Delta

- **Modify** PG-PROJECTS-02 files step UX (separate cards + shared field)
- **Modify** PG-PROJECTS-04 with images card (un-deferred)
- **Create** shared ProjectImagesField
- **Extend** ProjectsService upload/patch helpers
