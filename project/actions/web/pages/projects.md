# Pages — Safqa Web · Projects

> Pipeline v3 FE — **primary** create path post-cutover. Gated by `projects.*` + `settings.pipelineV3Enabled` (default true).

### Project List `PG-PROJECTS-01`
- Route: `/projects`
- Status: done
- Components: table; Create CTA when flag on; optional row Archive with confirm (`projects.delete`)
- Service: ProjectsService → EP-PROJECTS-02,05
- Guard: layout; `projects.view`
- Notes: flag-off banner → Creative fallback (escape hatch)

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: done
- Components:
  - Multi-step info → services → files → template gallery → generate
  - Creative-parity step cards: client select + Add client dialog; digital presence (6); 3 competitor URL fields; project details (name*, type, description*, KPIs, budget/duration selects); research checkboxes; catalog services
  - Files step: **separate cards** — RFP upload; **Project images** via shared `app-project-images-field` (row: preview · purpose · note; drop zones)
  - Selected-service overrides: **name | revenue type `p-select` | price | qty | delete** + totals
- Service: EP-PROJECTS-01,06,07,10; EP-TPL-02; AppDataService clients/services catalog
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes:
  - Reuse Creative constants/i18n (`REVENUE_TYPE_OPTIONS`); competitors payload `[{ url }]`; description required
  - On catalog select: seed `revenueType` + derived `unit` (label); override re-derives `unit`
  - Submit payload: `name`, `price`, `qty`, `revenueType`, `unit` (derived)
  - Images upload sends parallel `purposes` / `notes` (purpose enum; default `other`)
  - Price display: `SAR / {unit or revenueType label}`; `ratio` → `(n%)`
  - Navigates to `/proposals/:id/view` with stepper; primary AI proposal creation path
  - Card chrome is global (`styles.css` / `PG-UI-CARD-01`); full-width responsive grids

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: done
- Components:
  - Breadcrumb: `Projects → {name}`
  - Header actions (permission-gated): **Edit** → `/projects/:id/edit` (`projects.edit`); **View DNA** → `/projects/:id/dna` (`projects.view`); **Delete** → confirm → soft archive (`projects.delete`) → `/projects`
  - DNA summary card (links to DNA page); proposals table; New proposal (sibling); Regenerate DNA; optional facts strip
- Service: EP-PROJECTS-03,05,09,10; proposals search filter by projectId
- Guard: `projects.view`
- Notes: ConfirmDialog for delete; soft archive only

### Project Edit `PG-PROJECTS-04`
- Route: `/projects/:id/edit`
- Status: done
- Components:
  - Breadcrumb: `Projects → {name} → Edit`
  - Same info/services fields as create (no generate/template step); selected overrides **name | revenue type | price | qty**
  - **Project images** card (`app-project-images-field`): load purpose/note; dirty meta → EP-PROJECTS-11; new files → EP-PROJECTS-07
- Service: ProjectsService.patch → EP-PROJECTS-03,04; uploadImages / patchImages → EP-PROJECTS-07,11
- Guard: `projects.edit`
- Notes:
  - Load binds revenue-type select; skips invalid/empty service rows (legacy `[[]]` corruption)
  - Save payload mirrors Create service fields; Cancel → workspace; does not start proposal generation
  - Server images not deletable from UI yet (no delete endpoint); trash only for newly added locals

### Project DNA / Facts `PG-PROJECTS-05`
- Route: `/projects/:id/dna`
- Status: done
- Components:
  - Breadcrumb: `Projects → {name} → DNA`
  - Read-only project values cards + structured DNA sections; empty state when no `dna.data`; optional collapsible raw DNA
  - Actions: Regenerate DNA (`projects.edit`); Back to workspace
- Service: ProjectsService.get + getDna → EP-PROJECTS-03,08,09
- Guard: `projects.view`

### Shared · ProjectImagesField `CMP-PROJECT-IMAGES-01`
- Status: done
- Location: `shared/project-images-field/`
- Used by: Create + Edit Project
- Behavior: empty drop zone; list rows (preview | purpose | note); compact add-more drop; client_logo hint; en/ar + RTL-safe

### Shared breadcrumb (projects + proposal view)
- Lightweight trail: `{ label, routerLink? }`; current page not a link; muted separators; RTL-safe
- Used on workspace, edit, DNA, and proposal view (when `projectId` present)

### FE ProjectsService (web)
- Status: done
- Methods: `patch` → EP-PROJECTS-04; `delete`/`archive` → EP-PROJECTS-05; `getDna` → EP-PROJECTS-08; `uploadImages` (files + purposes/notes); `patchImages` → EP-PROJECTS-11; `regenerateDna` → EP-PROJECTS-09
- Rules: FE gates with `*appHasPermission`; server enforces `projects.*`
