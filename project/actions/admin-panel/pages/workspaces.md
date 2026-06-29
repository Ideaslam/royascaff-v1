## Module: Workspaces & Color Templates

### Workspaces Page
- Route: `/app/workspaces`
- Components: WorkspacesPage (paginated table with Name/Slug/Owner Email/Members Count/Plan/Status/Created Date, search by name or slug, row actions: View expand to members list/Suspend/Unsuspend/Delete with confirmation)
- Service: WorkspacesAdminService.list() → `GET /api/v1/admin/workspaces`; WorkspacesAdminService.updateStatus() → `PATCH /api/v1/admin/workspaces/:id/status`; WorkspacesAdminService.delete() → `DELETE /api/v1/admin/workspaces/:id`
- Guard: authGuard + adminGuard

### Color Templates Page
- Route: `/app/color-templates`
- Components: ColorTemplatesPage (table with Name/Color swatches (primary + 5 chart)/Active toggle/Actions, "New Template" button → dialog with Name/Primary/Secondary/Accent/Chart Color 1–5 hex pickers + Active toggle + live preview, Edit dialog pre-filled, Delete confirm, Active toggle)
- Service: ColorTemplatesService.list() → `GET /api/v1/color-templates`; ColorTemplatesService.create() → `POST /api/v1/color-templates`; ColorTemplatesService.update() → `PATCH /api/v1/color-templates/:id`; ColorTemplatesService.delete() → `DELETE /api/v1/color-templates/:id`
- Guard: authGuard + adminGuard
