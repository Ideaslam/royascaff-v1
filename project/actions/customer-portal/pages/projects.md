## Module: Projects

### Projects List Page
- Route: `/app/projects`
- Components: ProjectsListPage (header + "New Project" button, search box, project cards/table with open + delete, pagination, empty state). **"New Project"** opens a shared **side drawer** (`SideDrawerComponent` / PrimeNG `p-drawer`) — not a centered dialog *(change-057)*. Form: name + description; footer Cancel / Create. Desktop: end-edge (right LTR / left RTL); mobile: full-width; backdrop dismiss.
- Service: ProjectsService.list() → `GET /api/v1/projects`; ProjectsService.create() → `POST /api/v1/projects`; ProjectsService.delete() → `DELETE /api/v1/projects/:id`
- Guard: authGuard + onboardingGuard

### Project Detail Page
- Route: `/app/projects/:id`
- Components: ProjectDetailPage (project header with name/description, dashboards grid with name/status/purpose description/delete action, **"New Dashboard"** create flow). *(change-057)* Create Dashboard opens in a **single continuous-scroll side drawer** (no step wizard): dashboard name + purpose, then synced dataset picker (lite list via `GET /data/datasets/lite`, type filter chips, grouped cards, selected tray with clear/remove, server-side search/pagination). Generate requires ≥1 dataset. Desktop: end-edge drawer; mobile: full-width; backdrop dismiss. *(change-049)* Optional **"Start from a template"** path remains specified: industries → fields → template cards → matching datasets → create from template (when present in UI).
- Service: ProjectsService.get() → `GET /api/v1/projects/:id`; DashboardsService.list() → `GET /api/v1/dashboards?projectId=...`; DashboardsService.remove() → `DELETE /api/v1/dashboards/:id`; DataService.listDatasetsLite() → `GET /api/v1/data/datasets/lite`; DashboardsService.create() → `POST /api/v1/dashboards`; *(change-049)* TemplatesService.listIndustries() → `GET /api/v1/templates/industries`; TemplatesService.list(fieldId) → `GET /api/v1/templates?fieldId=...`; TemplatesService.matchingDatasets(id) → `GET /api/v1/templates/:id/matching-datasets`; DashboardsService.createFromTemplate() → `POST /api/v1/dashboards/from-template`
- Guard: authGuard + onboardingGuard
- Notes: Only ready/synced datasets are selectable for generation. Create navigates to `/app/dashboards/:id/generating`. Delete dashboard uses confirm dialog (not a drawer). i18n keys `PROJECTS.DETAIL.TEMPLATE_*` *(change-049)*; dataset-picker keys + drawer flows *(change-032/057)*.
