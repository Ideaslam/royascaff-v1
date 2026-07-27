# Pages — Safqa Web · Proposals

### Proposals List `PG-PROPOSALS-01`
- Route: `/proposals`
- Status: done
- Components: table/filters; Technical / Financial + language dialog
- Service: AppDataService → EP-PROPOSALS-01/02/08
- Guard: layout (authGuard commented)
- Notes:
  - Paginated list
  - Pipeline v3 project proposals are `type: creative` with dual URL maps; list opens tech/fin per language via `getTechnicalUrl` / `getFinancialUrl` (technical may fall back to `renderedByLang`)

### Proposal View `PG-PROPOSALS-02`
- Route: `/proposals/:id/view`
- Status: done
- Components: VisualEditor / HTML preview (legacy); **v3 branch** PipelineStepper + server PDF/HTML + Retry/Translate/sibling/Regenerate
- Service: AppDataService → EP-PROPOSALS-05; v3 → EP-PROP-PIPE-01,03,04,05,06 + EP-PROJECTS-10
- Guard: layout
- Notes: branch on `pipelineVersion === "3"` / `generation` / `projectId`

### Proposal Edit `PG-PROPOSALS-03`
- Route: `/proposals/:id/edit`
- Status: done
- Components: forms, visual editor
- Service: AppDataService → EP-PROPOSALS-05/07/09/10/11/13/14
- Guard: layout

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
- Components: lang tabs (from `renderedByLang`), Download PDF, Open HTML, Retry, Translate, New template, Regenerate
- Service: EP-PROP-PIPE-03..06; EP-PROJECTS-10
- Guard: projects.edit / projects.create as noted
- Notes: translate adds a language without wiping source; list still opens standalone financial per lang after export
