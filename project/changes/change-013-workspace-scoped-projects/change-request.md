# Change Request — Workspace-scoped projects collection

## metadata
- **change-id**: change-013
- **change-type**: modify-data-model
- **target-app**: all-apps
- **priority**: high
- **status**: confirmed

## scope
- **affected-repos**: roya-ai-dynamo-api (primary), roya-ai-dynamo-frontend (no code changes — already uses JWT workspace context)

## description

### Problem
Change-006 moved dashboards, CSV files, and related entities to workspace-prefixed MongoDB collections (`ws_{slug}_*`), but **projects** remained in a global `projects` collection. This breaks multi-tenant isolation: projects from one workspace are visible when switching workspace context, and workspace deletion does not clean up project records.

### Desired behavior
Projects are stored per workspace in `ws_{workspaceSlug}_projects`, using the same dynamic collection pattern as dashboards and CSV files. All project CRUD operations resolve the collection from the authenticated user's JWT `workspaceSlug`. Workspace delete drops the projects collection along with other `ws_{slug}_*` collections.

### Who is affected
- **Editors/admins** in the Customer Portal — project list/create/detail scoped to active workspace
- **Platform admins** — overview stats count projects across all `ws_*_projects` collections

### User story (happy path)
1. User switches to workspace "Acme Corp" (slug `acme-corp`)
2. User creates a project → stored in `ws_acme-corp_projects`
3. User switches to another workspace → sees only that workspace's projects
4. Workspace owner deletes workspace → `ws_acme-corp_projects` is dropped

### Out of scope
- Automated data migration script (user performs manual migration)
- Frontend UI changes (API contract unchanged)
- Changing project ownership or permission model beyond existing owner-or-admin rules

### Constraints
- No migration code in the repository
- API routes remain `/api/v1/projects` — workspace context from JWT only

## acceptance-criteria
1. `ProjectRepository` resolves `ws_{workspaceSlug}_projects` via `getModel(workspaceSlug)` (same pattern as `DashboardRepository`).
2. All `ProjectsService` methods accept and pass `workspaceSlug` to the repository.
3. `ProjectsController` passes `user.workspaceSlug` from JWT on every endpoint.
4. `WORKSPACE_PREFIXED_COLLECTIONS` in `WorkspaceService` includes `'projects'` so workspace delete drops the collection.
5. `AdminService.getOverviewStats()` sums project counts from all `ws_*_projects` collections (not global `projects`).
6. Global Mongoose registration for `Project` is removed from `ProjectsModule` and `AdminModule`.
7. Manual migration note documented: copy documents from global `projects` to per-workspace collections; user performs migration outside the codebase.

## notes
- Triage (Phase 6 decision tree): **Escalated to Phase 5** — plan/data-model changes, multi-module impact (projects + workspace + admin), collection migration required.
- Frontend `ProjectsService` unchanged; JWT already carries `workspaceSlug` after workspace switch.
