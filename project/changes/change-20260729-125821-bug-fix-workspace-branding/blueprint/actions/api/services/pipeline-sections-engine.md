# Services — Pipeline Sections + Engine (workspace seller grounding) — pack delta

### SVC-PIPE-S3-01 · SectionOrchestrator [domain, internal, PipelineV3]
- Status: planned
- Deps (after-state addition): **SettingsDataService** (or equivalent public-settings loader)
- Rules (after-state additions):
  - Before each section AI call, load workspace public Settings for `job.workspaceId`
  - Include a **`workspace` (seller)** object on the user JSON payload alongside `dnaSlice` / `mapEntry`:
    | Field | Source |
    |-------|--------|
    | `name` | settings.companyName |
    | `logoUrl` | settings.logoUrl |
    | `email` | settings.email |
    | `phone` | settings.phone |
    | `address` | settings.address |
  - Omit empty strings (do not invent values)
  - For section key `about_workspace`: treat `workspace` as authoritative seller identity — copy must name/describe that company; **never** invent Roya / Safqa / product brand as the agency
  - Settings load failure → warn + empty `workspace` object; section may still run (no hard fail)

### SVC-PIPE-S3-02 · DnaSliceBuilder
- Status: done (unchanged)
- Notes: seller Settings stay **out of DNA** (DNA = client/project); seller is section-payload only

### Prompts (files under `src/pipeline-v3/prompts/`)

| File | After-state |
|------|-------------|
| `dna.core.v1.md` | Role: KSA/GCC B2B proposals / agency pitch decks — **remove** “Roya /” product seller framing |
| `section.generic.v1.md` | Grounding: use `workspace` seller fields when present; for `about_workspace` use `workspace.name` (and contacts) as the selling company — never invent a different agency brand |

## Delta

- **Modify** SectionOrchestrator — inject Settings-backed `workspace` into section AI payload
- **Modify** DNA + section prompts — neutralize Roya seller identity; ground about copy in Settings
- Assemble branding table unchanged (already Settings → `workspace_*`)
