## Module: Data (Multi-Source Data Management)

### Data Sources Home Page *(planned — change-022+)*
- Route: `/app/data`
- Components: tabs — "Connections" | "Datasets" | "Legacy Files"
- Service: DataConnectionService.list(), DatasetService.list()
- Guard: authGuard + onboardingGuard
- Notes: Landing page for the new multi-source data model; legacy CSV files accessible under the "Legacy Files" tab.

### Data Connections List Page *(planned — change-022+)*
- Route: `/app/data/connections`
- Components: ConnectionsListPage (table: name, sourceType, status, lastTestedAt, actions), "New Connection" button
- Service: `GET /api/v1/data/connections`; `DELETE /api/v1/data/connections/:id`; `POST /api/v1/data/connections/:id/test`
- Guard: authGuard
- Notes: Credentials are never shown in the UI.

### Create / Edit Connection Page *(planned — change-022+)*
- Route: `/app/data/connections/new`, `/app/data/connections/:id/edit`
- Components: ConnectionFormPage (sourceType selector, dynamic credential fields per source type, test-connection button with inline result)
- Service: `POST /api/v1/data/connections`; `PATCH /api/v1/data/connections/:id`; `POST /api/v1/data/connections/:id/test`
- Guard: authGuard

### Datasets List Page *(planned — change-022+)*
- Route: `/app/data/datasets`
- Components: DatasetsListPage (table: name, sourceType, semanticFlag, status, lastSyncAt, rowCount, actions)
- Service: `GET /api/v1/data/datasets`
- Guard: authGuard

### Dataset Detail + Sync History Page *(planned — change-022+)*
- Route: `/app/data/datasets/:id`
- Components: DatasetDetailPage (schema preview, columnMapping editor, last sync info, "Sync Now" button, SyncRun history table)
- Service: `GET /api/v1/data/datasets/:id`; `POST /api/v1/data/datasets/:id/sync`; `GET /api/v1/data/datasets/:id/sync-history`
- Guard: authGuard
- Notes: columnMapping editor lets users map source columns to canonical fields without re-syncing; semanticFlag shown read-only.

### Legacy CSV — Data Files List Page *(kept for backward compat)*
- Route: `/app/data/files`
- Components: FilesListPage (files table with name/rows/columns/status badge/actions, "Upload" button, delete confirm)
- Service: `GET /api/v1/data/files`; `DELETE /api/v1/data/files/:id`
- Guard: authGuard + onboardingGuard

### Legacy CSV — Upload Wizard Page *(kept for backward compat)*
- Route: `/app/data/upload`
- Components: UploadWizardPage (Step 1: dropzone; Step 2: analysis progress; Step 3: column review table with editable descriptions)
- Service: `POST /api/v1/data/upload/file`; `GET /api/v1/data/files/:id` (polled during analysis); `PATCH /api/v1/data/files/:fileId/columns`
- Guard: authGuard + onboardingGuard
- Notes: Max file size enforced by System Settings (`maxFileSizeMb`, default 50MB).
