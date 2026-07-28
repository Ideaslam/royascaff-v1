# Pages — Safqa Web · Proposals

### Proposals List `PG-PROPOSALS-01`
- Route: `/proposals`
- Status: done
- Components: table/filters; Technical / Financial + language dialog
- Service: AppDataService → EP-PROPOSALS-01/02/08
- Guard: MainLayout `authGuard`
- Notes:
  - Paginated list; rows include `pipelineVersion`, `projectId`, `language`
  - Pipeline v3 project proposals are `type: creative` with dual URL maps; list opens tech/fin per language via `getTechnicalUrl` / `getFinancialUrl` (technical may fall back to `renderedByLang`)
  - When financial URL missing → navigate `view?tab=financial`
  - Pending v2 (`pipelineVersion === "2"`, `generationStatus === "pending"`): poll proposal `generation` (not `jobId`); legacy `jobId` rows keep `subscribeToJob` until drained

### Proposal View `PG-PROPOSALS-02`
- Route: `/proposals/:id/view`
- Status: done
- Components: VisualEditor / HTML preview (legacy); **v3 branch** PipelineStepper + Technical/Financial doc tabs + server PDF/HTML + Retry/Translate/sibling/Regenerate + **Continue when stuck**
- Service: AppDataService → EP-PROPOSALS-05; v3 → EP-PROP-PIPE-01,03,04,05,06,08 + EP-PROJECTS-10
- Guard: layout
- Notes:
  - Branch on `pipelineVersion === "3"` / `generation` / `projectId`
  - Honors `?tab=technical|financial` (default technical); financial uses `getFinancialUrl`
  - Breadcrumb when `projectId` present: `Projects → {projectName} → {proposal title}` (links to `/projects` + `/projects/:id`); no project → keep header / optional `Proposals → {title}`; degrade labels if project fetch fails

### Proposal Edit `PG-PROPOSALS-03`
- Route: `/proposals/:id/edit`
- Status: done
- Components: forms, visual editor
- Service: AppDataService → EP-PROPOSALS-05/07/09/10/11/12/13/14
- Guard: layout
- Notes:
  - Load HTML via inline if present, else URL maps / `document-html` (do not seed empty lang bundles that block fetch)
  - Info services accept object `{ id }` line items (v3) as well as string IDs
  - Technical save stays coherent with v3 view via BE `renderedByLang` sync

### Proposal Wizard Entry `PG-PROPOSALS-04`
- Route: `/proposal`
- Status: done
- Components: proposal creation flow entry
- Service: AppDataService / creative services → EP-PROPOSALS-06, AI jobs
- Guard: layout

### Pipeline Stepper `PG-PROP-V3-01`
- Route: embedded on proposal view (v3)
- Status: done
- Components: `PipelineStepperComponent`
- Service: EP-PROP-PIPE-01 (poll 3–5s)
- Guard: layout
- Notes: real failed / partially_failed / ready

### Proposal View v3 actions `PG-PROP-V3-02`
- Route: `/proposals/:id/view` (v3 branch)
- Status: done
- Components: Technical/Financial select; lang tabs (from `renderedByLang`), Download PDF (technical), Open HTML, Retry, Translate, New template, Regenerate, **Continue** (`canResume`/`stuck`)
- Service: EP-PROP-PIPE-03..06,08; EP-PROJECTS-10
- Guard: projects.edit / projects.create as noted
- Notes: Continue when stuck (non-terminal + idle ≥60s + no BullMQ jobs) **or** recoverable terminal assemble/export fail; Retry with no failed sections re-runs assemble; auto-resume via reconciler preferred; translate adds a language without wiping source; refresh proposal URL maps when ready for financial tab

### Proposal Continue `PG-PROP-RESUME-01`
- Route: `/proposals/:id/view` (v3, stuck or recoverable failed)
- Status: done
- Components: Continue generation button
- Service: EP-PROP-PIPE-08
- Guard: `projects.edit`
- Notes: hidden while `hasQueueWork` (non-recoverable); shown when stuck or recoverable assemble/export failure
