# Impact Analysis — Workspace Settings Color Palette

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / model | partial | `settings.model.ts` (open index); data-model `defaultColor` only | No `colorPalette` / `colorRoles` on settings |
| DTO whitelist | partial | `dtos/data/settings.dto.ts` | Only `defaultColor`; rejects new keys |
| Settings schema | partial | `lib/settings-schema.ts` + FE `settings-schema.util.ts` | `theme.defaultColor` type `color` → native `<input type="color">` |
| Service | partial | `settings.data.service.ts` | Patch via `mapPatchToStorage`; no palette normalize / role derive |
| Branding resolve | partial | `pipeline-v3/analyze/branding-colors.ts` | `resolveBrandingColors(project)` → project palette → client_logo → Roya; **no workspace fallback** |
| Endpoint(s) | complete | `settings.controller.ts` GET/PATCH | Same routes; body shape must expand |
| Shared FE component | complete | `shared/color-palette/color-palette.component.ts` | Max 5 already (`slice(0,5)` + add guard) |
| Page(s) | partial | `pages/settings/settings.component.ts` + `settings-field.component.ts` | Schema-driven color bar only; no palette binding |

Feature state: **partial** (project palette + DNA roles exist; workspace theme still single hex)

## Affected Modules
- **Settings (API)** — accept/persist `colorPalette` + `colorRoles`; sync `defaultColor` = primary; hydrate on GET for legacy rows
- **Settings (Web)** — Theme tab uses `app-color-palette`; AppSettings/state/i18n
- **Pipeline branding (API)** — `resolveBrandingColors` falls back to workspace palette/roles before Roya defaults (assumption confirmed via proceed)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model-delta.md` — settings: `colorPalette`, `colorRoles`; DNA resolve precedence note
- [ ] `blueprint/actions/api/services/settings.md` — patch/get normalize + derive
- [ ] `blueprint/actions/api/services/projects.md` (or branding slice) — workspace fallback in `resolveBrandingColors`
- [ ] `blueprint/actions/api/endpoints/settings.md` — PATCH/GET payload delta
- [ ] `blueprint/actions/web/pages/settings.md` — Theme palette UX
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely touched (implement preview)

**API**
- `src/dtos/data/settings.dto.ts`
- `src/lib/settings-schema.ts` (`EXTRA_PATCH_KEYS` or schema field; defaults)
- `src/services/data/settings.data.service.ts`
- `src/pipeline-v3/analyze/branding-colors.ts` (+ call sites if signature needs workspace settings)
- `src/pipeline-v3/analyze/dna-passthrough.ts` (pass workspace settings into resolve if needed)

**Web**
- `src/app/pages/settings/settings.component.ts` (theme palette panel)
- `src/app/core/models/app.models.ts`
- `src/app/core/services/state.service.ts`
- `src/app/core/utils/settings-schema.util.ts` (remove/hide single color field)
- `src/assets/i18n/en.json` / `ar.json`
- Optionally `settings-field.component.ts` only if adding a `colorPalette` type (prefer theme-tab special panel like logo)

## Risk
- **Complexity:** M (DTO + hydrate + DNA fallback wiring)
- **Cross-module:** Y (Settings ↔ pipeline branding)
- **Migration:** Y (soft — derive from existing `defaultColor` on read/save; no batch job)

## Recommendation
- **Modify**: settings GET/PATCH + Theme page + branding resolve precedence
- **Create**: pack data-model delta for settings `colorPalette` / `colorRoles`
- **Reuse**: `normalizeColorPalette`, `colorsToColorRoles`, `app-color-palette`
- **Avoid**: new endpoints; stuffing palette into schema-driven `SettingsFieldComponent` color input

## Status target (per artifact after implement)
- settings data-model slice → done
- SVC-SETTINGS patch/get → done
- EP-SETTINGS payload → done
- resolveBrandingColors workspace fallback → done
- PG-SETTINGS Theme palette → done

## Dependencies
- depends-on: — (prior REQ-PALETTE packs already merged)
