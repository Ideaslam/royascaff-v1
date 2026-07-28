# Impact Analysis — Per-template catalogs (not overrides on pitch)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Mega catalog | complete (wrong shape) | `src/pipeline-v3/templates/pitch-landscape.catalog.ts` | Owns pitch + formal + website builders; one section list |
| Disk assets | complete | `templates/pitch-landscape/v1`, `templates/website-template/v1` | HBS/CSS only — no TS catalog beside them (correct for Nest) |
| Validator | partial | `section-schema.ts` | `getSectionDef(key)` → pitch list only |
| Section / translate | partial | orchestrators | Ignore `templateKey` for schemas |
| Seed / bootstrap | partial | `seed-templates.js`, `pipeline-v3-bootstrap.service.ts` | Import mega-file only |

Feature state: **partial**

## Revised pack shape (per user review)
- **Split** mega-file into per-template catalogs under `src/pipeline-v3/templates/<templateKey>/`
- **Shared** helpers + registry only
- **Website** owns full section schemas (own lengths)
- Do **not** use a pitch-only override map as the primary design

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/per-template-catalogs.md`
- [ ] `blueprint/plan/rules-delta.md`
- [ ] `blueprint/_index.md` + pack `status.md`

## Code files expected
| Action | Path |
|--------|------|
| Add | `templates/shared/section-schema-helpers.ts` |
| Add | `templates/shared/catalog-registry.ts` |
| Move/split | `templates/pitch-landscape/pitch-landscape.catalog.ts` |
| Add | `templates/pitch-landscape-formal/pitch-landscape-formal.catalog.ts` |
| Add | `templates/website-template/website-template.catalog.ts` |
| Delete/shrink | old `pitch-landscape.catalog.ts` (re-export shim optional during migrate) |
| Modify | `section-schema.ts`, section + translate orchestrators |
| Modify | `seed-templates.js`, bootstrap, map imports |
| Modify | tests |

## Risk: complexity (M), cross-module (N), migration (Y — re-seed + update imports)

## Recommendation
- **Create** per-template catalogs + registry
- **Modify** resolve path by `templateKey`
- **Complete** seed/bootstrap wiring

## Dependencies
- depends-on: change-024 — **verified**
