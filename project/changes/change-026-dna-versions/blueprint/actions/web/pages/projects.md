# Pages — Safqa Web · DNA versions (pack after-state)

### Project List `PG-PROJECTS-01`
- Status: planned (minor)
- Notes: optional show latest DNA status column; Create still → `/projects/new`

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: planned
- Components: same multi-step form **renamed conceptually to DNA** (title field for first DNA; auto `DNA v1`); creates shell + first DNA via EP-PROJECTS-01; optional template → create proposal with returned `dnaVersion.id`
- Service: EP-PROJECTS-01,20–22 (or create-then-upload on version), EP-PROJECTS-10, EP-TPL-02
- Notes: breadcrumb optional; card chrome unchanged

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: planned
- Components:
  - Breadcrumb: `Projects → {name}`
  - **Shell header**: display name/client/type; inline edit / small dialog → EP-PROJECTS-04 (`projects.edit`); Delete archive (`projects.delete`)
  - **DNA versions table**: title, status (empty/generating/ready/failed), updatedAt; row actions:
    - Open/Edit → `/projects/:id/dna/:vid`
    - Generate → confirm overwrite if ready → EP-PROJECTS-18
    - Rename → dialog → EP-PROJECTS-16
    - Delete → confirm hard delete → EP-PROJECTS-17 (`projects.delete`)
  - Toolbar: **Create DNA** → `/projects/:id/dna/new` (optional query `?copyFrom=vid`)
  - Proposals table; **New proposal** dialog: template + language + **DNA select** (title + status); default latest ready; disable generate if none ready
- Remove: full **Edit** → `/edit`; project-level **View DNA** / **Regenerate DNA**; project-scoped `dnaStale` badge (or replace with per-version hint)
- Service: EP-PROJECTS-03,04,05,12,16–18,10; proposals by projectId
- Guard: `projects.view`

### Project Edit `PG-PROJECTS-04` — RETIRED
- Route: `/projects/:id/edit` — remove; redirect to workspace
- Status: planned (retire)

### DNA Form / Edit `PG-PROJECTS-05` (replaces old DNA page + edit form)
- Routes:
  - `/projects/:id/dna/new` — create (blank or `?copyFrom=`)
  - `/projects/:id/dna/:dnaVersionId` — view/edit
- Status: planned
- Components:
  - Breadcrumb: `Projects → {name} → {title}`
  - Title field (required)
  - Same cards as former create/edit: info, services, branding palette, RFP, images
  - **Generated DNA** section: structured editable fields / sections; save → EP-PROJECTS-19 (AJV errors toast); show status
  - Actions: Save inputs (EP-PROJECTS-13 or 15); Generate (EP-PROJECTS-18 + confirm overwrite); Back
- Service: EP-PROJECTS-12–22 as needed
- Guard: view for read; edit for mutate
- Notes: reuse `CMP-PALETTE-01`, `CMP-PROJECT-IMAGES-01`; old `/projects/:id/dna` redirects to latest ready or workspace list

### Create / sibling proposal dialogs
- Status: planned
- Call sites: `project-detail`, `proposal-view` (+ create wizard after first DNA)
- Add DNA version `p-select` (title + status); default latest ready; pass `dnaVersionId` to EP-PROJECTS-10
- `useLatestDna` on proposal regen → resolve latest **ready** version id / refresh snapshot per BE contract

### FE ProjectsService
- Status: planned
- Methods: list/create/get/patch/rename/delete/generate/putContent DNA versions; shell patch; createProposal(+dnaVersionId); version-scoped rfp/images
- Models: `ProjectDnaVersion`, `Project` shell; proposal `dnaVersionId` / drop assumption of `project.dna` only

### i18n
- Add keys: DNA list, title, statuses, create blank/copy, overwrite confirm, delete confirm, picker label, shell edit
- Rename edit/create copy toward “DNA” where user-facing

## Delta

- Workspace = DNA list + shell header + proposal picker
- DNA form routes replace Edit Project + read-only DNA page
- Create proposal always chooses DNA version
- Retire `/projects/:id/edit` and project-level regenerate UX
