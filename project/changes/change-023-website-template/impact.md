# Impact Analysis — Website Template (`website-template`)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Catalog / schema | partial | `pitch-landscape.catalog.ts`; `section-schema.ts` AJV from shared `PITCH_LANDSCAPE_SECTIONS` | no `website-template` builder; no `testimonial` section; comments say 19 keys |
| Disk assets | partial | `templates/pitch-landscape/v1/` (layout + theme + 19 partials) | no `templates/website-template/v1/`; no `testimonial.hbs` on pitch disk |
| Bootstrap / seed | partial | `pipeline-v3-bootstrap.service.ts`; `scripts/seed-templates.js` | `CANONICAL_TEMPLATES` only modern+formal — new key would be **deactivated** if not added |
| Render | complete | `template-render.service.ts` + `TemplateAssetResolver` | already resolves by `assets.basePath` / `templateKey`; themeOverrides + branding ready |
| Map / section AI | partial | `map-orchestrator.service.ts` hardcodes `PITCH_LANDSCAPE_SECTIONS`; `dna-slice.ts` research map | map OK if shared catalog gains `testimonial`; no research module for testimonial (commercial optional) |
| Coverage gate | partial | `research-coverage.gate.ts` | `testimonial` already in `alsoGood` for `case-studies` — unused until catalog ships |
| Fixture | partial | `fixtures/fixture-content.ts`; `POST …/pitch-landscape/fixture-render` | no testimonial content; fixture helpers hardcode `pitch-landscape` key |
| Endpoint(s) | complete | `GET /api/data/templates` slim gallery | no new EP required; optional fixture route for website |
| Page(s) FE | complete | create/detail/proposal-view `listTemplates()` | auto-lists active keys; default remains `pitch-landscape` |

Feature state: **partial** (template engine + dual catalogs exist; third design + new section greenfield)

## Affected Modules

- **Templates** — new catalog builder, disk pack, bootstrap/seed canonical list, fixture content, pitch `testimonial` partial
- **Pipeline map/section (light)** — shared section array grows by one key; AJV/map catalog auto-pick up; no new research option
- **Projects FE** — none (gallery already dynamic)

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Templates slice: website-template + testimonial
- [ ] `blueprint/plan/data-model.md` — Template keys + section key list 20
- [ ] `blueprint/actions/api/services/templates.md` — SVC-TPL-04/05/06 deltas + SVC-TPL-08 website
- [ ] `blueprint/actions/api/endpoints/templates.md` — optional fixture for website / templateKey param
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

**Create**
- `templates/website-template/v1/` — `layout.hbs`, `theme.css`, `README.md`, `partials/*.hbs` for all **20** keys (smart-watch visual language)
- `buildWebsiteTemplateDoc()` in catalog (or sibling file re-exporting shared sections)
- Pitch disk: `partials/testimonial.hbs`

**Modify**
- `pitch-landscape.catalog.ts` — add `testimonial` to `PITCH_LANDSCAPE_SECTION_KEYS` / `PITCH_LANDSCAPE_SECTIONS`; website builder + tokens
- `pipeline-v3-bootstrap.service.ts` — register builder + canonical `{ key: website-template, version: 1 }`
- `scripts/seed-templates.js` — same; expect 20 keys; keep 3 active
- `fixtures/fixture-content.ts` — testimonial section content AR/EN; allow `templateKey` override for website fixture
- `template-render.service.ts` — `renderFixtureHtml/Pdf(language, templateKey?)`
- Optionally `templates.controller.ts` — fixture body `templateKey` or dedicated route (verify path)

**Do not change (unless verify forces)**
- Map orchestrator structure (keeps shared catalog — intentional while all templates share section set)
- FE create/gallery components
- Research options / DNA modules

## Ripple effects

| Risk | Level | Notes |
|------|:-----:|-------|
| Canonical deactivate | **H** | Forgetting `website-template` in `CANONICAL_TEMPLATES` / seed `keep` wipes it on boot |
| Shared catalog vs per-template | M | Map/AJV still hardcode pitch sections — OK only while website stays schema-identical |
| Disk copy drift | M | 20 partials × new CSS — must bind same content fields; miss a partial → render fail loud |
| Fixture endpoint pitch-only | L | Extend fixture helper so website can be verified without new FE |
| maxSections 28 | L | 20 defs still under cap; map may optionally insert testimonial |
| Formal shares pitch disk | L | One `testimonial.hbs` serves modern + formal |

## Reuse

- `buildPitchBaseDoc()` pattern for website (same page/rules/sections, different key/name/tokens/basePath)
- Existing layout CSS-var injection (`theme.primary`…`text`)
- Workspace/client branding context on every partial
- Project palette → `themeOverrides` (already maps primary/secondary/accent)
- Research coverage `alsoGood: ["testimonial"]` already wired

## Risk: complexity **M**, cross-module **Y** (Templates + light map/AJV), migration **N** (upsert seed)

## Recommendation

- **Create**: `website-template` disk + catalog seed; shared `testimonial` section (schema + pitch + website partials); fixture content
- **Complete**: coverage-gate alsoGood for testimonial (was dead); section count 19→20 everywhere
- **Modify**: bootstrap/seed canonical lists; fixture render to accept `templateKey`

## Status target (per artifact in the pack after implement)

- Shared `testimonial` contentSchema + keys → planned → done
- `buildWebsiteTemplateDoc` + bootstrap/seed canonical → planned → done
- Disk `templates/website-template/v1/` (20 partials + theme) → planned → done
- Pitch `testimonial.hbs` → planned → done
- Fixture AR/EN + render by templateKey → planned → done
- Optional fixture endpoint param → planned → done
- FE pages → deferred (not needed)

## Dependencies

- **depends-on**: — (change-005/018/022 already merged; palette/branding reuse optional)
- Current pack-status of deps: N/A
