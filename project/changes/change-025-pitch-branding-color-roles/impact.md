# Impact Analysis — DNA branding color roles + pitch-landscape theme rearrange

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Data model (DNA) | partial | `dna.data.branding.colors: string[]` + `source` | No role object; incomplete slots leave catalog navy in render |
| Branding resolve | partial | `pipeline-v3/analyze/branding-colors.ts` | `colorsToThemeOverrides` maps only index 0–2; no derive; no surface/text |
| DNA passthrough | partial | `pipeline-v3/analyze/dna-passthrough.ts` | Injects `colors[]` + `source` only |
| Assemble | partial | `pipeline-v3/assemble/assemble.service.ts` | Calls `colorsToThemeOverrides(colors[])` |
| Template render | partial | `pipeline-v3/templates/template-render.service.ts` | Accepts themeOverrides; catalog fallbacks still Roya blue |
| pitch theme CSS | partial | `templates/pitch-landscape/v1/theme.css` | Headings/brand → `--color-secondary`; hard-coded sky-blue fills; cover/footer hard-coded navy gradients |
| Divider partial | partial | `templates/pitch-landscape/v1/partials/insights_divider.hbs` | Inline `#114261` / `#47b5e6` gradients |
| Catalog tokens | partial | `pitch-landscape.catalog.ts` theme tokens | Roya blue defaults OK for empty-palette case |
| FE palette | complete | `color-palette.component.ts` | Ordered list OK; no role UI needed this pack |
| Endpoints | complete | projects create/patch | No route changes |

Feature state: **partial** (palette → DNA → themeOverrides wired; roles + template assignment wrong)

## Affected Modules
- Pipeline v3 DNA / branding — categorize colors + derive missing roles
- Assemble theme map — consume role object (or derived full overrides)
- Template render / `pitch-landscape` — rearrange CSS vars + replace hard-coded blue gaps

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — `dna.branding.colorRoles` (or equivalent) + colors[] compat
- [ ] `blueprint/plan/modules.md` — branding roles + pitch theme rearrange
- [ ] `blueprint/actions/api/services/projects.md` — DNA resolve/reconcile roles
- [ ] `blueprint/actions/api/services/pipeline-assemble.md` — role → themeOverrides (+ derive)
- [ ] `blueprint/actions/api/services/templates.md` — pitch-landscape CSS role usage
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk
- **Complexity**: M (CSS + DNA shape; many theme.css selectors)
- **Cross-module**: Y (DNA + assemble + template assets)
- **Migration**: N (no DB migration; next DNA regen / assemble picks up roles; old DNA without roles → assemble derives from `colors[]`)

## Recommendation
- **Modify**: `branding-colors.ts` (roles + derive), `dna-passthrough.ts`, `assemble.service.ts`, `theme.css`, `insights_divider.hbs`, optionally cover/footer gradients via CSS vars
- **Complete**: themeOverrides always fill all five slots when palette/logo/defaults resolve
- **Create**: DNA `branding.colorRoles` object (keep `colors[]` as ordered source of truth for FE)

## Status target (per artifact in the pack after implement)
- data-model branding roles → done
- SVC DNA resolve / reconcile → done
- SVC assemble theme map → done
- pitch-landscape theme rearrange → done

## Dependencies
- depends-on: change-022 — **merged**
- Code files (implement later):
  - `roya-sales-ai-api-v2/src/pipeline-v3/analyze/branding-colors.ts`
  - `roya-sales-ai-api-v2/src/pipeline-v3/analyze/dna-passthrough.ts`
  - `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts`
  - `roya-sales-ai-api-v2/templates/pitch-landscape/v1/theme.css`
  - `roya-sales-ai-api-v2/templates/pitch-landscape/v1/partials/insights_divider.hbs`
  - (read) `template-render.service.ts` / `layout.hbs` — already injects surface/text
