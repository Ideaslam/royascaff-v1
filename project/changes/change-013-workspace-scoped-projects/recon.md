# Recon — change-013: Workspace-scoped projects collection

## Feature state: **partial** (change-006 gap)

| Layer | Before | After |
|-------|--------|-------|
| `ProjectRepository` | Global `@InjectModel(Project)` → `projects` collection | Dynamic `ws_{slug}_projects` via `@InjectConnection` |
| `Project` schema | `collection: 'projects'` fixed | No fixed collection name (dynamic) |
| `ProjectsService` | No `workspaceSlug` param | All methods take `workspaceSlug` |
| `ProjectsController` | Passes `user.id`, `user.role` only | Passes `user.workspaceSlug` |
| `WORKSPACE_PREFIXED_COLLECTIONS` | 6 suffixes (no `projects`) | Includes `projects` |
| `AdminService` | `projectModel.countDocuments()` on global collection | Sum across `ws_*_projects` |
| `ProjectsModule` | `MongooseModule.forFeature([Project])` | Connection-only repository |
| `AdminModule` | Registers `Project` schema | Removed |
| Customer Portal frontend | Calls `/projects` with JWT | **No change** — JWT provides workspace context |

## Plan vs code drift (pre-fix)

- `data-model.md` workspace-prefixed table (change-006) listed csvfiles, dashboards, etc. but **not projects**
- Global `projects` still listed in Collection Overview as a static Phase 1 collection

## Ripple / impact map

| Item | Action |
|------|--------|
| `project.repository.ts` | **Modify** — dynamic collection pattern |
| `projects.service.ts` | **Modify** — add workspaceSlug to all methods |
| `projects.controller.ts` | **Modify** — pass user.workspaceSlug |
| `project.schema.ts` | **Modify** — remove fixed collection name |
| `projects.module.ts` | **Modify** — remove forFeature registration |
| `workspace.service.ts` | **Modify** — add `projects` to drop list |
| `admin.service.ts` / `admin.module.ts` | **Modify** — dynamic project count |
| `data-model.md` | **Update** — projects → workspace-prefixed |
| `services.md` | **Update** — ProjectsService + AdminService |
| `features.md` | **Update** — workspace scope note on project features |
| `endpoints.md` | **Update** — workspace context note on Projects module |
| Dashboards module | **No change** — already workspace-scoped; `projectId` refs stay within same workspace collection |

## Reuse opportunities

- Copy `DashboardRepository.getModel()` pattern exactly
- Reuse JWT `workspaceSlug` from change-006 — no new middleware

## Risks

| Risk | Mitigation |
|------|------------|
| Existing data in global `projects` | User manual migration; documented in change-request |
| Missing `workspaceSlug` on JWT | Same as dashboards — user must switch/select workspace |
| Project IDs in dashboards after migration | Migrate projects and dashboards to same workspace together |
