# Pages — Safqa Web · Proposals v3 (Phase 5)

## Delta

- **Create** PG-PROP-V3-01 (shared stepper), PG-PROP-V3-02 (view branch)
- **Modify** existing `PG-PROPOSALS-02` view — branch on `pipelineVersion === "3"` / `generation`
- Legacy list/edit/wizard unchanged for non-v3 rows

---

### Pipeline Stepper `PG-PROP-V3-01`
- Route: embedded on proposal view (and optionally create success page)
- Status: planned
- Components: shared `PipelineStepperComponent` (PrimeNG Steps or custom progress)
  - Map `generation.status` + `steps`:
    | UI label | When |
    |----------|------|
    | Analyzing | dna running / analyzing |
    | Planning sections | mapping |
    | Writing {completed}/{total} | generating_sections |
    | Designing | assembling |
    | Uploading | exporting |
    | Ready | ready |
    | Ready with gaps | partially_failed |
    | Failed | failed |
  - Poll `GET /api/data/proposals/:id/status` every **3–5s** while non-terminal; stop on ready|partially_failed|failed
- Service: ProjectsService / AppDataService → EP-PROP-PIPE-01
- Guard: proposal view / projects.view
- Notes: never mask failed as completed; show `generation.error.message` on failed

### Proposal View v3 `PG-PROP-V3-02`
- Route: `/proposals/:id/view` (same route; v3 branch)
- Status: planned
- Components:
  - Stepper while non-terminal
  - When ready/partially_failed: language tabs (`ar`/`en` if present in `renderedByLang`); iframe `htmlUrl` (or fetch HTML); **Download PDF** → open/download `pdfUrl` (server artifact — not window.print)
  - Actions (`projects.edit` / proposal.create as appropriate):
    - **Retry failed sections** → EP-PROP-PIPE-03
    - **Translate** → EP-PROP-PIPE-06 `{ lang }` then resume stepper
    - **New template** → dialog pick template → EP-PROJECTS-10 sibling (`sourceProposalId`, `fromStep: "map"`) → navigate to new proposal
    - **Regenerate** → EP-PROP-PIPE-05 (optional confirm; `useLatestDna` checkbox if DNA version diverge)
- Service: EP-PROP-PIPE-01,03,04,05,06,07; EP-PROJECTS-10
- Guard: layout + proposal.view
- Notes: if `pipelineVersion !== "3"`, keep existing VisualEditor / print path

## List hint (optional)

- On `/proposals` list: tag v3 rows (`pipelineVersion` / project-linked); status from `generation.status` when pending
