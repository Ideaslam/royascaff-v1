## Module: Projects

`@Controller('projects')` · **(change-013):** All endpoints resolve data from `ws_{user.workspaceSlug}_projects`. JWT must include `workspaceSlug` (set on login/workspace switch). API routes unchanged; no `workspaceId` in URL.

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PROJ-01 | POST | /api/v1/projects | JWT | `CreateProjectDto` { name (max 200), description? } | 201 `ProjectDto` | SVC-PROJ.create() | |
| EP-PROJ-02 | GET | /api/v1/projects | JWT | query: page, limit, search, isActive | 200 `Paginated<ProjectListItemDto>` | SVC-PROJ.list() | Admin sees all; others see owned only |
| EP-PROJ-03 | GET | /api/v1/projects/:id | JWT | `:id` param | 200 `ProjectDetailsDto` | SVC-PROJ.getById() | Owner-or-admin enforced |
| EP-PROJ-04 | PUT | /api/v1/projects/:id | JWT | `:id` · `UpdateProjectDto` { name?, description? } | 200 `ProjectDto` | SVC-PROJ.update() | Owner-or-admin enforced |
| EP-PROJ-05 | DELETE | /api/v1/projects/:id | JWT | `:id` param | 204 | SVC-PROJ.delete() | Cascades dashboards; owner-or-admin enforced |
