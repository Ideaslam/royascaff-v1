# Impact Analysis — Financial ratio display + RevenueType enum

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `revenueType` string on services / project services (data-model) | No new DB fields; enum is code-level only |
| Service(s) | partial | `assemble.service.ts` `buildFinancial`; `financial-html.builder.ts`; `financial-document.renderer.ts`; FE `financial-template.service.ts` | Assemble ignores `revenueType`; totals may include ratio; standalone shows “% of campaign value”; no shared enum |
| Endpoint(s) | complete | existing assemble/export | No new routes |
| Page(s) | partial | FE `creative-form-options.ts` + callers comparing `'ratio'` | Options use static string values; UI already shows `%` for ratio in places |

Feature state: **partial** (standalone + FE UI partly correct; proposal template assign path broken)

## Affected Modules
- **Pipeline v3 assemble** — `buildFinancial` must set `revenueType`, format ratio prices as `N%`, exclude ratio from derived totals
- **Pipeline v3 template render** — `money` helper (and/or row typing) must pass through `%` display strings without editing `.hbs`
- **Pipeline v3 export financial** — totals derivation + ratio cell → `N%` only; use enum
- **Shared RevenueType enum** — API (`common` or pipeline shared) + FE (`creative-form-options` / dedicated enum file); replace `'ratio'` string checks on touched paths
- **FE financial-template.service** — align ratio cell with `N%` (parity with API standalone)

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/pipeline-assemble-financial.md` — assign rows + totals
- [ ] `blueprint/actions/api/services/pipeline-export-financial.md` — standalone totals + `formatPriceCell`
- [ ] `blueprint/actions/api/services/revenue-type-enum.md` — enum + helpers
- [ ] `blueprint/actions/web/pages/services-revenue-type.md` — FE enum + options + ratio checks on financial display helpers
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.
> Do **not** edit `.hbs` financial partials.

## Code impact (implement targets)

| Repo | File | Change |
|------|------|--------|
| api | `src/common/types/revenue-type.ts` (new) or equivalent | `RevenueType` enum + `isRatioRevenueType` / format helper |
| api | `src/pipeline-v3/assemble/assemble.service.ts` | `buildFinancial`: attach revenueType; ratio → `N%` display amounts; exclude ratio from derived subtotal |
| api | `src/pipeline-v3/templates/template-render.service.ts` | `money` helper: pass through strings that already end with `%`; widen row types if needed |
| api | `src/pipeline-v3/export/financial-html.builder.ts` | Exclude ratio from derived subtotal; use enum |
| api | `src/pipeline-v3/export/financial-template/financial-document.renderer.ts` | `formatPriceCell` → `${n}%`; use enum |
| api | related callers (`normalizeSource`, `creative-prompt`) | Prefer enum for ratio checks (light touch) |
| web | `src/app/core/constants/revenue-type.ts` (new) or extend `creative-form-options.ts` | `RevenueType` enum; options `value` from enum |
| web | `financial-template.service.ts` + project/creative/services ratio checks | Use enum; ratio display `N%` where this pack touches financial formatting |

## Ripple effects
- Stored `fin.subtotal` / tax / grand on project: when present, still preferred; derived fallback must skip ratio
- Handlebars `money(10)` stays SAR; `money("10%")` must render `10%` unchanged
- Legacy rows with missing `revenueType` behave as non-ratio (money), same as today

## Risk: complexity **M**, cross-module **Y** (assemble + export + FE constants), migration **N**

## Recommendation
- **Create**: `RevenueType` enum (API + FE) + small format/isRatio helpers
- **Modify**: assemble `buildFinancial`, `money` helper, financial-html totals, financial-document + FE financial-template ratio cell
- **Do not**: edit template section `.hbs` files

## Status target (per artifact in the pack after implement)
- pipeline-assemble-financial → done
- pipeline-export-financial → done
- revenue-type-enum (api) → done
- services-revenue-type (web) → done

## Dependencies
- depends-on: — (prior `change-20260727-000019-revenue-type-as-unit` already merged)
