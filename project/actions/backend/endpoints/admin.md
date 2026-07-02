## Module: Admin

`@Controller('admin')` · class-level `@Roles(ADMIN)`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-ADMIN-01 | GET | /api/v1/admin/overview/stats | JWT+admin | none | 200 `{ clients, projects, dashboards, subscriptions, aiCost }` | SVC-ADMIN.getOverviewStats() | |
| EP-ADMIN-02 | GET | /api/v1/admin/workspaces | JWT+admin | query: paginated + search | 200 `Paginated<WorkspaceAdminDto>` | SVC-ADMIN.listWorkspaces() | Includes owner name, member count, plan |
| EP-ADMIN-03 | PATCH | /api/v1/admin/workspaces/:id/status | JWT+admin | `:id` · `{ status: 'active' ǀ 'suspended' }` | 200 `WorkspaceAdminDto` | SVC-ADMIN.updateWorkspaceStatus() | |
| EP-ADMIN-04 | DELETE | /api/v1/admin/workspaces/:id | JWT+admin | `:id` param | 204 | SVC-ADMIN.deleteWorkspace() | Admin-initiated workspace deletion |
| EP-ADMIN-SH-1 | GET | /api/v1/admin/data/sync-health | JWT+admin | query: `?limit=50` | 200 `{ sources: SourceHealthDto[] }` | AdminSyncHealthController | Per-workspace per-sourceType last-run summary; sorted by most-recent failure first *(change-029)* |
