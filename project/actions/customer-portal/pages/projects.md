## Module: Projects

### Projects List Page
- Route: `/app/projects`
- Components: ProjectsListPage (header + "New Project" button, search box, project cards/table with open + delete, pagination, empty state)
- Service: ProjectsService.list() → `GET /api/v1/projects`; ProjectsService.create() → `POST /api/v1/projects`; ProjectsService.delete() → `DELETE /api/v1/projects/:id`
- Guard: authGuard + onboardingGuard

### Project Detail Page
- Route: `/app/projects/:id`
- Components: ProjectDetailPage (project header with name/description/edit, dashboards grid/list, "New Dashboard" wizard with name + purpose description + file picker)
- Service: ProjectsService.get() → `GET /api/v1/projects/:id`; DashboardsService.list() → `GET /api/v1/dashboards?projectId=...`; DataService.listFiles() → `GET /api/v1/data/files`; DashboardsService.create() → `POST /api/v1/dashboards`
- Guard: authGuard + onboardingGuard
- Notes: Only `analyzed`/`confirmed` CSV files are selectable for generation. After create, navigates to generating page.
