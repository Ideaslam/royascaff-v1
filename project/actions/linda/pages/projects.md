# Pages — Projects

## Module: Projects

### Projects List Page

- Route: `/projects`
- Components: `ProjectsTableComponent`, `ProjectsFilterBarComponent`, `CreateProjectDialogComponent`
- Service: `ProjectsApiService` → EP-039 (GET), EP-040 (POST)
- Guard: `AuthGuard`
- UI states: paginated table; empty + create CTA; loading skeleton
- Notes: sales can register projects; row links to detail

### Project Detail Page

- Route: `/projects/:id`
- Components: `ProjectHeaderComponent`, `ProjectSummaryCardsComponent`, `CollaboratorsListComponent`, `ProjectTasksPreviewComponent`, `ProjectWalletCardComponent`, `GitHubLinksSummaryComponent`
- Service: `ProjectsApiService` → EP-041, EP-044, EP-045, EP-046; `WalletsApiService` → EP-075
- Guard: `AuthGuard`
- UI states: tabs — Overview, Tasks, Board, Mind Map, Wallet, Activity
- Notes: admin sets sales assignee via EP-047 on admin sub-route or inline if admin

### Edit Project Page

- Route: `/projects/:id/edit`
- Components: `ProjectFormComponent`
- Service: `ProjectsApiService` → EP-042, EP-043
- Guard: `AuthGuard` + project owner/PM check
- UI states: archive confirmation dialog
- Notes: combined create uses dialog on list page
