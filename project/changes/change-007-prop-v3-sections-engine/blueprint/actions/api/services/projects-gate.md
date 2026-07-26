# Services — Projects enqueue gate (Phase 3)

## Delta

- **Modify** `ProjectsDataService.createProposalFromProject` — if `!pipelineV3Enabled` → throw 403/409 with clear message; do not create/enqueue
- Optional: allow create with `pipelineVersion: "3"` only when flag on (current path is already v3-only)

### SVC-PROJECTS-GATE-01 · V3 create gate [domain, Projects]
- Status: planned
- Methods: check flag before proposal create + queue enqueue
- Deps: getSettingsFromDb / Feature flag helper
- Side effects: none
- Rules: legacy `/ai-jobs` creative path never checks this flag (stays available)
