## Module: Projects

### SVC-PROJ · ProjectsService [internal, domain, Projects]
CRUD for projects (dashboard containers) with owner-or-admin access enforcement, scoped to JWT workspace via dynamic collection ws_{slug}_projects.

**Methods:**
- `create(dto: CreateProjectDto, userId: string, workspaceSlug: string, ip?)` — creates project in ws_{slug}_projects, audits PROJECT_CREATE
- `list(userId: string, userRole: string, workspaceSlug: string, filters): Promise<PaginatedResponseDto>` — paginated within workspace; non-admins scoped to ownerId
- `getById(id: string, userId: string, userRole: string, workspaceSlug: string)` — fetch one with owner-or-admin guard
- `update(id, dto: UpdateProjectDto, userId, userRole, workspaceSlug, ip?)` — guarded update, audits PROJECT_UPDATE
- `delete(id, userId, userRole, workspaceSlug, ip?)` — guarded delete, audits PROJECT_DELETE

**Deps:** ProjectRepository (dynamic ws_{slug}_projects via getModel) · AuditLogService
**Side effects:** audit writes
**Rules:** Admins bypass ownership checks; everyone else must own the project (enforceOwnerOrAdmin) · Missing projects throw 404; ownership violations throw 403
