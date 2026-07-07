## Module: Projects

### Projects List Page
- Route: `/app/projects`
- Components: ProjectsListPage (header + "New Project" button, search box, project cards/table with open + delete, pagination, empty state)
- Service: ProjectsService.list() → `GET /api/v1/projects`; ProjectsService.create() → `POST /api/v1/projects`; ProjectsService.delete() → `DELETE /api/v1/projects/:id`
- Guard: authGuard + onboardingGuard

### Project Detail Page
- Route: `/app/projects/:id`
- Components: ProjectDetailPage (project header with name/description, dashboards grid with name/status/purpose description/delete action, "New Dashboard" wizard). *(change-049)* The wizard opens with a **mode chooser**: "Describe it (AI)" — existing 2-step flow (name + purpose description → optional dataset picker) — or **"Start from a template"** — browse active industries → fields → template cards (bilingual name/description + required-model tags via `LocalizedPipe`), then per required canonical model select dataset(s) from the workspace's matching ready datasets (from EP-TPL-04); models with no matching dataset show "needs a dataset flagged X" with a link to `/app/data` and block submission; final step: name + create.
- Service: ProjectsService.get() → `GET /api/v1/projects/:id`; DashboardsService.list() → `GET /api/v1/dashboards?projectId=...`; DashboardsService.remove() → `DELETE /api/v1/dashboards/:id`; DataService.listDatasets() → `GET /api/v1/data/datasets`; DashboardsService.create() → `POST /api/v1/dashboards`; *(change-049)* TemplatesService.listIndustries() → `GET /api/v1/templates/industries`; TemplatesService.list(fieldId) → `GET /api/v1/templates?fieldId=...`; TemplatesService.matchingDatasets(id) → `GET /api/v1/templates/:id/matching-datasets`; DashboardsService.createFromTemplate() → `POST /api/v1/dashboards/from-template`
- Guard: authGuard + onboardingGuard
- Notes: Only ready datasets (`analyticsTable != null`) are selectable for generation. Both create paths navigate to `/app/dashboards/:id/generating` (same polling page). Delete dashboard uses confirm dialog; does not refresh subscription usage (quota is not restored on delete). i18n keys `PROJECTS.DETAIL.TEMPLATE_*` added to `public/i18n/en.json` + `ar.json` *(change-049)*.
