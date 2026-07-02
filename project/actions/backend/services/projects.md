# Services — Projects

## Module: Projects

### SVC-018 · ProjectsService [domain, internal, Projects]

- Status: done

- Methods:
  - `create(userId, dto): ProjectDto` — create project + project wallet
  - `listForUser(userId, query): PaginatedResponse` — filter by membership/role
  - `findOne(userId, projectId): ProjectDetailDto`
  - `update(userId, projectId, dto): ProjectDto`
  - `archive(userId, projectId): ProjectDto`
  - `addCollaborator(userId, projectId, collaboratorId): ProjectDto`
  - `removeCollaborator(userId, projectId, collaboratorId): ProjectDto`
  - `setSalesAssignee(adminId, projectId, salesUserId, commissionPercent): ProjectDto`
- Deps: `ProjectsRepository`, `WalletsService`, `RolesService`, `ActivityLogService`
- Side effects: wallet creation; activity log
- Rules: RULE-003 project wallet on create; RULE-017 commission admin-only

### SVC-019 · ProjectsRepository [domain, internal, Projects]

- Status: planned

- Methods: standard CRUD + membership queries
- Deps: MongoDB `projects`
- Side effects: persistence

### SVC-020 · ProjectSummaryService [application, internal, Projects]

- Status: planned

- Methods:
  - `getSummary(userId, projectId): ProjectSummaryDto` — tasks counts, wallet balance, GitHub links
- Deps: `ProjectsService`, `TasksRepository`, `WalletsService`, `ProjectGitHubLinksRepository`
- Side effects: none
