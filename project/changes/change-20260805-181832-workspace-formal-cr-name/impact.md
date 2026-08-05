# Impact Analysis — Workspace legal / CR party identity

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema (settings) | partial | `api: lib/settings-schema.ts`, `scripts/config-seed-data.js` (`settingsSchema`), `models/settings.model.ts` (index signature OK) | No formal name / CR / representative / city fields |
| DTO | partial | `api: dtos/data/settings.dto.ts` (`SETTINGS_PATCH_KEYS`) | New keys not allow-listed |
| Service(s) | partial | `api: contracts.data.service.ts` (`renderContractHtml` + `workspaceBranding`); `settings.data.service.ts` (`getPublicSettings` already returns merged storage keys) | Branding input + token map missing 4 legal fields |
| Template seed | partial | `api: scripts/contract-templates/roya-default.html` | Hardcoded formal name, CR #, representative, city |
| Endpoint(s) | complete | `api: settings.controller.ts` GET/PATCH | No new routes — schema/DTO drive fields |
| Page(s) | partial | `web: settings` (schema-driven Company tab); `settings-schema.util.ts`; `app.models.ts` `AppSettings`; i18n en/ar; contract-template-edit `TOKEN_GROUPS` | FE fallback schema + types + labels + token picker |

Feature state: partial (brand/contact settings exist; legal party block hardcoded in contract HTML)

## Affected Modules
- **Settings** — add 4 company fields to fallback + seeded schema, DTO allow-list, FE model/defaults/i18n
- **Contracts** — extend `workspaceBranding` + token vars; replace hardcodes in default Roya template; token picker
- **Config seed** — `settingsSchema` document must include new fields (DB seed / re-seed note)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model-delta.md` — settings fields + contract token catalog
- [ ] `blueprint/actions/api/services/settings.md` — schema/DTO after-state
- [ ] `blueprint/actions/api/services/contracts.md` — branding + tokens + template
- [ ] `blueprint/actions/web/pages/settings.md` — Company tab fields + i18n
- [ ] `blueprint/actions/web/pages/contract-templates.md` — token picker (or fold into contracts)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity L, cross-module Y (settings + contracts + FE), migration N (additive optional fields; re-seed/update default template content in DB)

## Recommendation
- **Create**: 4 settings fields + 4 tokens + i18n keys
- **Modify**: `renderContractHtml` branding map; `roya-default.html` party-1 + signature; FE schema/types/token picker; config seed
- **Ripple**: live Mongo `contract_templates` default row + `config.settingsSchema` need seed/update script run (same pattern as prior contract packs)

## Status target (per artifact in the pack after implement)
- data-model-delta → done
- settings service slice → done
- contracts service slice → done
- settings page → done
- contract-templates token picker → done

## Dependencies
- depends-on: `change-20260805-171001` — current pack-status: **verified** (OK to draft/implement; prefer merge that pack before merging this one)

## Code file list (implement)
**API**
- `src/lib/settings-schema.ts`
- `src/dtos/data/settings.dto.ts`
- `src/services/data/contracts.data.service.ts`
- `scripts/config-seed-data.js`
- `scripts/contract-templates/roya-default.html`
- (seed/upsert helper already used for contract templates — re-run as in prior packs)

**Web**
- `src/app/core/utils/settings-schema.util.ts`
- `src/app/core/models/app.models.ts`
- `src/app/core/services/state.service.ts`
- `src/app/pages/contract-templates/contract-template-edit/contract-template-edit.component.ts`
- `src/assets/i18n/en.json` / `ar.json`
