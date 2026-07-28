# Pages — Safqa Web · Proposals (pack delta)

## Delta
Add project-aware breadcrumb on proposal view when the proposal has a `projectId`.

### Proposal View `PG-PROPOSALS-02` / `PG-PROP-V3-02` (modify)
- Route: `/proposals/:id/view`
- Status: planned
- After-state:
  - If `proposal.projectId` present: breadcrumb  
    `Projects → {projectName} → {proposal title}`  
    with links to `/projects` and `/projects/{projectId}`
  - If no project: keep existing header (no false project crumb); optional `Proposals → {title}`
  - Load project name from proposal.projectName / title fallback, or fetch project once if needed
- Notes: do not block proposal view if project fetch fails — degrade crumb labels
