# Services — Pipeline Assemble (change-20260728-000037 after-state)

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts` (+ render call site).
> Related: `template-render.service.ts` theme CSS-var injection.

## Delta

- **Modify** assemble theme merge: honor `theme.lockPalette` on template doc
- Other templates unchanged (DNA + proposal overrides still apply)

---

### Assemble theme merge (after-state)

Today:

1. Resolve DNA branding → `colorsToThemeOverrides`
2. Merge `proposal.themeOverrides` (non-empty strings win)
3. Pass `themeOverrides` into `TemplateRenderService.renderProposalHtml`

After-state for **locked** templates:

1. Load `tplDoc` by `proposal.templateKey` / version (already done before render)
2. If `tplDoc.theme?.lockPalette === true` (or `theme.lockPalette === true`):
   - **Do not** build / pass DNA theme overrides
   - **Do not** merge `proposal.themeOverrides`
   - Call render with `themeOverrides: undefined` so catalog `theme.tokens` + disk CSS win
3. Else: keep existing merge behavior

### Rules

- Palette lock is **temporary product decision** for `roya-presentation`; comment in code that a future pack may selectively inject DNA colors into specific surfaces
- Flag lives on catalog seed doc (`buildRoyaPresentationTemplateDoc`); no Proposal schema change
- Fixture render path should also skip overrides for locked templates (or never pass them) so smoke matches production
- Financial standalone export is **out of scope** (may still use DNA colors)

### Status

- Assemble palette-lock branch → planned
