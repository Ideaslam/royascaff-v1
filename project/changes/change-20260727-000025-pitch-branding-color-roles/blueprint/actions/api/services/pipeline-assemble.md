# Services — Assemble theme from color roles (pack after-state)

## SVC-PIPE-S3-05 · AssembleService

Theme resolution:

1. Read `dna.data.branding.colorRoles` when present → map 1:1 to `themeOverrides`:
   | Role | theme key | CSS var |
   |------|-----------|---------|
   | primary | `primary` | `--color-primary` |
   | secondary | `secondary` | `--color-secondary` |
   | accent | `accent` | `--color-accent` |
   | surface | `surface` | `--color-surface` |
   | text | `text` | `--color-text` |
2. Else if only `branding.colors[]` → `colorsToColorRoles(colors, branding.source)` then map
3. Merge proposal `themeOverrides` (non-empty string keys win)
4. Pass full overrides into `TemplateRenderService.renderProposalHtml`

Rules:
- No AI in assemble
- When palette/logo source produced roles, TemplateRender must not re-introduce Roya blue for missing keys (all five slots filled upstream)
- Empty branding → catalog defaults in TemplateRender (unchanged empty path)

## Delta

- **Modify** assemble to prefer `colorRoles` and always emit surface/text when DNA branding present
- **Modify** `colorsToThemeOverrides` to role-based (or wrap roles → overrides)
