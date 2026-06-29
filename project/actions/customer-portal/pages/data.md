## Module: Data (CSV Management)

### Data Files List Page
- Route: `/app/data`
- Components: FilesListPage (files table with name/rows/columns/status badge/actions, "Upload" button, delete confirm)
- Service: DataService.list() → `GET /api/v1/data/files`; DataService.delete() → `DELETE /api/v1/data/files/:id`
- Guard: authGuard + onboardingGuard
- Notes: Status reflects analyzing/analyzed/confirmed/error.

### Upload Wizard Page
- Route: `/app/data/upload`
- Components: UploadWizardPage (Step 1: dropzone; Step 2: analysis progress; Step 3: column review table with editable descriptions)
- Service: DataService.upload() → `POST /api/v1/data/upload/file`; DataService.getFile() → `GET /api/v1/data/files/:id` (polled during analysis); DataService.updateColumns() → `PATCH /api/v1/data/files/:fileId/columns`
- Guard: authGuard + onboardingGuard
- Notes: Max file size enforced by System Settings (`maxFileSizeMb`, default 50MB). Column review is inline in the wizard.
