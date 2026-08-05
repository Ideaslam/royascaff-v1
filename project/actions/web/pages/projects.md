# Pages — Safqa Web · Projects

> Pipeline v3 FE — **primary** create path post-cutover. Gated by `projects.*` + `settings.pipelineV3Enabled` (default true).

### Project List `PG-PROJECTS-01`
- Route: `/projects`
- Status: done
- Components: table; Create CTA when flag on; optional row Archive with confirm (`projects.delete`)
- Service: ProjectsService → EP-PROJECTS-02,05
- Guard: layout; `projects.view`

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: done
- Components: Multi-step info → services → files → template gallery → generate; Branding + Project images cards
- Service: EP-PROJECTS-01 (+ version RFP/images when `dnaVersion.id` returned), EP-PROJECTS-10 with `dnaVersionId`, EP-TPL-02
- Notes: create returns first DNA; proposal pins that version

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: done
- Components:
  - Breadcrumb: `Projects → {name}`
  - Header: Delete archive; New proposal
  - **DNA versions table**: title, status, updatedAt; Edit → `/dna/:vid`; Generate (confirm overwrite); Rename; Delete hard; Create DNA (blank|copy-from dialog)
  - Proposals table; New proposal dialog: **DNA select** + template + language (`appendTo="body"`); default latest ready
- Service: EP-PROJECTS-03,05,12,13,16–18,10
- Guard: `projects.view`
- Notes: Proposal generation status `<p-tag>` uses `[severity]` from a generation-status helper (not DNA `statusSeverity` alone). Mapping: `ready`→success; in-progress stages (`queued`/`analyzing`/`mapping`/`generating_sections`/`assembling`/`exporting`)→info; `partially_failed`→warn; `failed`→danger; unknown/empty→secondary.

### Project Edit `PG-PROJECTS-04` (legacy)
- Route: `/projects/:id/edit`
- Status: partial — still wired; primary edit path is DNA form (`PG-PROJECTS-05`)
- Notes: deferred full retirement + workspace shell dialog

### DNA Form `PG-PROJECTS-05`
- Routes: `/projects/:id/dna/new`, `/projects/:id/dna/:vid` (reuses ProjectEditComponent)
- Status: done (inputs); structured generated-content editor **deferred** (API PUT content ready)
- Components: same create/edit cards (info, services, branding, RFP, images); save → version patch + media; Generate from workspace row
- Service: EP-PROJECTS-14,15,20–22; create-on-new via EP-PROJECTS-13
- Guard: `projects.edit` for mutate
- Notes: old `/projects/:id/dna` read-only page still routed (legacy)

### Shared · ProjectImagesField `CMP-PROJECT-IMAGES-01`
- Status: done — Create + DNA/Edit form

### Shared · ColorPaletteChooser `CMP-PALETTE-01`
- Status: done — Branding card

### Shared breadcrumb
- Used on workspace, DNA form, proposal view

### FE ProjectsService
- Status: done
- Methods: DNA versions list/create/get/patch/rename/delete/generate/putContent; version RFP/images; createProposal(+dnaVersionId); legacy getDna/regenerateDna/patch
- Models: `ProjectDnaVersion`; `Project.dnaVersion?`; `Proposal.dnaVersionId?`
