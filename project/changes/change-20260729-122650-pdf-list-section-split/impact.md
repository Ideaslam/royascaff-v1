# Impact Analysis — PDF List Section Split

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Catalog flags | partial | `pitch-landscape.catalog.ts` (+ formal/roya clone) | `timeline` / `action_plan` / `services` / `financial` are `repeatable: false`, `pages.max: 1` |
| Website catalog | complete (for exclude) | `website-template.catalog.ts` | Clones pitch base — **must reset** split keys to non-repeatable after pitch gains flags |
| Landing detect | complete | `shared/is-landing-template.ts` | Reuse for map split gate (presentation only) |
| Map orchestrator | partial | `map/map-orchestrator.service.ts` | Passes `repeatable` in abstract catalog; **no** `pages.max` enforcement; no presentation-only split hints / capacity payload |
| Map prompt | partial | `prompts/map.plan.v1.md` | Competitor N× pattern exists; no list-split rules |
| Section prompts | partial | `section.generic.v1.md` / research | No “honor partition brief / (i/N) title” rule |
| Assemble financial | partial | `assemble.service.ts` | Injects **full** `rows` + totals into **every** financial section content; root `financial` also full |
| Template render | partial | `template-render.service.ts` | Every partial gets the **same** root `financial` — multi-instance would show full table + totals on each slide |
| Financial HBS | partial | `templates/*/partials/financial.hbs` | Uses `financial.rows` + always renders totals block (pitch + roya; website too but out of split scope) |
| Map validation | partial | `validateMap` | Requires ≥1 financial; does not cap instances by `pages.max` |
| Endpoints / FE | complete | — | No change needed |

Feature state: **none** (competitor multi-instance is the only analogous complete pattern)

## Affected Modules
- **Templates** — presentation catalogs `repeatable` + `pages.max: 4` for four keys; website reset after clone
- **Pipeline Map** — presentation gate; capacity hints; split prompt rules; optional enforce `pages.max`
- **Pipeline Sections** — light prompt: honor partition + `(i/N)` titles
- **Assemble + Template render** — per-financial-instance row chunks; totals on last only; per-section `financial` context for HBS

## Critical finding — financial render path

Today:
1. Assemble assigns full `rows` + totals onto each financial section’s `content`
2. `TemplateRenderService` passes **global** `input.financial` into every partial
3. HBS binds `{{#each financial.rows}}` and always shows totals

Without changing (2)+(3), Map multi-instance **cannot** produce chunked PDF slides.

**Required approach:**
- Assemble: partition rows across ordered financial instances; last gets totals fields; earlier get rows only (`showTotals: false` or omit totals)
- Render: for each section, `financial` context = **section slice** when key is `financial` and content carries rows (fallback to root for single-instance / fixtures)
- HBS (pitch + roya): wrap totals in `{{#if financial.showTotals}}` (default true when undefined for backward compat with fixtures)

## Pack blueprint files to create
- [ ] `blueprint/plan/modules.md` — Map / Templates / Assemble after-state
- [ ] `blueprint/actions/api/services/templates.md` — catalog flags + financial HBS + render per-section financial
- [ ] `blueprint/actions/api/services/pipeline-analyze-map.md` — prompt + capacity + pages.max gate
- [ ] `blueprint/actions/api/services/pipeline-assemble.md` — row chunking + totals on last
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — section prompt partition rule (thin)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: **H**, cross-module **Y**, migration **N**

- High: wrong assemble/render wiring reintroduces overflow or duplicates totals on every financial slide
- Map over-splitting burns `maxSections` 32 budget — mitigate with soft “prefer fewer” + `pages.max: 4`
- Website must not inherit presentation repeatable flags from pitch clone source
- Schema `maxItems` on timeline (5) / action_plan (6) still per-instance — Map must partition so each instance stays within capacity

## Recommendation
- **Modify**: pitch (+formal/roya) catalog flags; website reset; map prompt + orchestrator payload/gate; assemble financial partition; template-render per-section financial; pitch+roya `financial.hbs` totals conditional
- **Complete**: soft AI split via capacity hints (servicesCount, catalog maxItems)
- **Create**: small helper e.g. `partitionFinancialRows(rows, n)` + `isPresentationTemplate` alias (`!isLandingTemplate`) if useful
- **Do not**: FE; website split; post-render auto-split; hard “always 2”

## Status target (per artifact after implement)
- plan/modules → planned → done  
- SVC templates → planned → done  
- SVC map → planned → done  
- SVC assemble → planned → done  
- SVC sections (prompt) → planned → done  

## Dependencies
- depends-on: —  
- Builds on competitor N× map pattern + `isLandingTemplate` + prior `maxSections: 32`

## Code files likely touched

**Modify**
- `src/pipeline-v3/templates/pitch-landscape/pitch-landscape.catalog.ts` — four keys repeatable + pages.max 4
- `src/pipeline-v3/templates/website-template/website-template.catalog.ts` — force those keys non-repeatable / pages.max 1
- `src/pipeline-v3/templates/roya-presentation/roya-presentation.catalog.ts` — if team/risks path clones after pitch change, verify four keys inherit or set explicitly
- `src/pipeline-v3/prompts/map.plan.v1.md`
- `src/pipeline-v3/map/map-orchestrator.service.ts`
- `src/pipeline-v3/prompts/section.generic.v1.md` (+ research if action_plan uses it)
- `src/pipeline-v3/assemble/assemble.service.ts`
- `src/pipeline-v3/templates/template-render.service.ts`
- `templates/pitch-landscape/v1/partials/financial.hbs`
- `templates/roya-presentation/v1/partials/financial.hbs`

**Tests (recommended)**
- Unit: `partitionFinancialRows` / assemble slice behavior
- Map: pages.max reject or strip excess instances (if implemented)
