# Pages — Projects (polish delta)

### Project Workspace `PG-PROJECTS-03` — proposals Status column

## Delta
- Proposal generation status `<p-tag>` uses `[severity]` from a generation-status helper (not DNA `statusSeverity` alone).
- Color mapping (PrimeNG severity):
  - `ready` → `success`
  - `partially_failed` → `warn`
  - `failed` → `danger`
  - in-progress: `queued`, `analyzing`, `mapping`, `generating_sections`, `assembling`, `exporting` → `info`
  - unknown / empty → `secondary`
