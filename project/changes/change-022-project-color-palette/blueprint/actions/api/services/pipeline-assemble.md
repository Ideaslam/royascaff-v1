# Services — Pipeline v3 Assemble / Template theme (pack delta)

### SVC-PIPE-S3-05 · AssembleService [domain, PipelineV3]
- Status: planned
- Methods:
  - `runAssemble(job)` — after loading project + proposal, resolve theme colors for render:
    1. Read `project.dna.data.branding.colors` (string[] hex) when present
    2. Map to `themeOverrides` for `TemplateRenderService`:
       | Index | theme key | CSS var |
       |------:|-----------|---------|
       | 0 | `primary` | `--color-primary` |
       | 1 | `secondary` | `--color-secondary` |
       | 2 | `accent` | `--color-accent` |
       | 3+ | unused for role slots in v1 (still stored in DNA; optional future) |
    3. Missing slots → keep catalog / Roya fallbacks already in `template-render.service.ts`
    4. Precedence: **DNA branding colors** fill primary/secondary/accent when available; explicit `proposal.themeOverrides` for a key still wins if set (rare); surface/text stay catalog unless overridden
- Coordinate with change-021 assemble branding (workspace_*/client_* root vars) — same call path; do not conflict
- Deps: existing TemplateRenderService, project DNA
- Side effects: unchanged (HTML/PDF)
- Rules: no AI in assemble; empty branding.colors → catalog/Roya (should already be filled by Analyze)

### SVC-TPL-02 · TemplateRenderService
- Status: planned (light touch)
- Existing `:root { --color-*: {{theme.*}} }` + `theme.css` — **reuse**; ensure overrides from assemble reach `theme.primary|secondary|accent`
- No new CSS files required if vars already drive chrome

## Delta

- **Extend** Assemble to map `dna.branding.colors` → `themeOverrides`
- **Reuse** pitch-landscape CSS var plumbing
- **Out of pack**: formal/other templates beyond pitch-landscape v1
