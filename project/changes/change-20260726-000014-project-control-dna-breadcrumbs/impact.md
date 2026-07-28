# Impact Analysis — change-20260726-000014-project-control-dna-breadcrumbs

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Endpoint(s) | complete | `projects.controller.ts` PATCH / DELETE(archive) / GET `:id/dna` | None for core CRUD/DNA |
| Service(s) BE | complete | `ProjectsDataService.update` / `archive` / `getDna` | Create normalize already on update for competitors |
| Service(s) FE | none | `projects.service.ts` | No `patch` / `delete` / `getDna` |
| Page workspace | partial | `project-detail.component.ts` | DNA summary line only; no Edit/Delete; back button only |
| Page edit | none | — | Need `/projects/:id/edit` |
| Page DNA | none | — | Need `/projects/:id/dna` |
| Breadcrumb | none | — | No shared component; proposal-view has no project crumb |
| Routes | partial | `app.routes.ts` | Only list / new / `:id` |

Feature state: **partial** (API ready; FE missing)

## Affected Modules
- **Projects (web)** — edit page, DNA page, workspace actions, list delete optional
- **Proposals (web)** — breadcrumb when `projectId` present
- **Shared** — breadcrumb component
- **Projects FE service** — patch / archive / getDna

## Pack blueprint files to create
- [ ] `blueprint/actions/web/pages/projects.md` — PG edit, DNA, workspace actions
- [ ] `blueprint/actions/web/pages/proposals.md` — breadcrumb on view
- [ ] `blueprint/actions/api/services/projects.md` — FE wiring notes (BE after-state already)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk
- **Complexity:** M (large edit form reuse from create)
- **Cross-module:** Y (proposal view crumbs)
- **Migration:** N

## Recommendation
- **Create**: `ProjectEditComponent`, `ProjectDnaComponent`, `AppBreadcrumbComponent` (or projects-local crumbs)
- **Modify**: `ProjectsService` (+patch/delete/getDna); `ProjectDetailComponent` actions; `ProjectsComponent` optional archive; `ProposalViewComponent` crumbs; `app.routes.ts`
- **Reuse**: Create Project field patterns / i18n / Shopify card styles; ConfirmDialog for archive
- **Complete**: workspace becomes hub with Edit / Delete / View DNA CTAs

## Status target (per artifact after implement)
- PG-PROJECTS-03 workspace actions → done
- PG-PROJECTS-04 edit → done
- PG-PROJECTS-05 DNA view → done
- PG crumbs + proposal view → done
- FE ProjectsService methods → done

## Code files likely touched
| Area | Files |
|------|--------|
| FE service | `projects.service.ts` |
| FE pages | `project-detail`, new `project-edit`, new `project-dna`, `projects.component` |
| FE shared | new breadcrumb component |
| FE routes | `app.routes.ts` |
| FE proposal | `proposal-view.component.ts` |
| i18n | `en.json` / `ar.json` |
| BE | none expected (unless patch body gaps found) |

## Dependencies
- depends-on: — (create-form parity merged in change-20260726-000012; reuse patterns)
