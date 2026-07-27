# Impact Analysis — Full research types (pipeline + pitch-landscape)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| DNA schema | complete | `pipeline-v3/schemas/dna.v2.schema.json` | Enum already lists all 8 options |
| Analyze 1d runner | partial | `analyze/research-module.runner.ts` | Only `market` / `competitor` / `audience`; others throw `Unsupported research module` |
| Research prompts | partial | `prompts/research.*.v1.md` | Missing trends, benchmarks, case-studies, social-analysis, action-plan |
| ModelResolver | partial | `model/model-resolver.ts` | Has market/competitor/audience + `research.other`; prefer dedicated request types for the five new keys (tracing/cost) |
| Coverage gate | partial | `map/research-coverage.gate.ts` | `COVERAGE` only launch subset — new options skipped (`if (!rule) continue`) |
| Map prompt | partial | `prompts/map.plan.v1.md` + `map-orchestrator.service.ts` | Generic research rule OK; `max 22` too tight for full set + competitor×N |
| DNA slice / section research | partial | `section/dna-slice.ts` | `RESEARCH_SECTION_KEYS` only 3 keys — new sections get headlines-only |
| Template catalog | partial | `templates/pitch-landscape.catalog.ts` | 14 keys; missing 5 research primaries; `maxSections: 22` |
| HBS partials | partial | `templates/pitch-landscape/v1/partials/` | Has market/competitor/audience only |
| Fixture content | partial | `templates/fixtures/fixture-content.ts` | No sample content for new keys |
| Bootstrap / render | complete | `bootstrap/…`, `template-render.service.ts` | Partials loaded by section `key` from disk — no registry change once files exist |
| FE research toggles | complete | Creative / project create-edit / proposal-edit | All 8 options already selectable |
| Endpoints | complete | existing pipeline | No new routes needed |

**Feature state:** `partial`

## Affected Modules

- **Pipeline Analyze** — extend MODULE_META + 5 prompts; optionally add request types
- **Pipeline Map** — extend COVERAGE + raise maxSections + map prompt copy
- **Pipeline Sections** — extend dna-slice research keys + moduleKey mapping
- **Templates** — catalog section defs/schemas, 5 HBS partials, fixture samples, bump maxSections; formal sibling inherits via shared catalog builder

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — delta: research full set + catalog 19 keys / maxSections
- [ ] `blueprint/plan/data-model.md` — delta: researchOptions + template sections after-state
- [ ] `blueprint/actions/api/services/pipeline-analyze-map.md` — 1d + coverage full set
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — dna-slice research keys
- [ ] `blueprint/actions/api/services/templates.md` — new sections + partials + maxSections
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files to create / modify (implement step)

| Action | Path |
|--------|------|
| Modify | `src/pipeline-v3/analyze/research-module.runner.ts` |
| Create | `src/pipeline-v3/prompts/research.trends.v1.md` |
| Create | `src/pipeline-v3/prompts/research.benchmarks.v1.md` |
| Create | `src/pipeline-v3/prompts/research.case-studies.v1.md` |
| Create | `src/pipeline-v3/prompts/research.social-analysis.v1.md` |
| Create | `src/pipeline-v3/prompts/research.action-plan.v1.md` |
| Modify | `src/pipeline-v3/model/model-resolver.ts` |
| Modify | `src/pipeline-v3/map/research-coverage.gate.ts` |
| Modify | `src/pipeline-v3/prompts/map.plan.v1.md` |
| Modify | `src/pipeline-v3/map/map-orchestrator.service.ts` (max sections hint) |
| Modify | `src/pipeline-v3/section/dna-slice.ts` |
| Modify | `src/pipeline-v3/templates/pitch-landscape.catalog.ts` |
| Create | `templates/pitch-landscape/v1/partials/market_trends.hbs` |
| Create | `templates/pitch-landscape/v1/partials/benchmarks.hbs` |
| Create | `templates/pitch-landscape/v1/partials/case_studies.hbs` |
| Create | `templates/pitch-landscape/v1/partials/social_audit.hbs` |
| Create | `templates/pitch-landscape/v1/partials/action_plan.hbs` |
| Modify | `src/pipeline-v3/templates/fixtures/fixture-content.ts` |

## Ripple effects

- Template bootstrap re-upserts catalog on app start → Mongo `templates` doc picks up new sections after deploy/restart.
- Cost / AI Requests UI will show more 1d calls when users select more options (expected).
- Longer decks / higher token spend when all 8 selected — raise `maxSections` to **28**.
- `pitch-landscape-formal` shares section list via catalog builder — gets new keys automatically if it clones `PITCH_LANDSCAPE_SECTIONS`.

## Risk

| Factor | Level | Notes |
|--------|:-----:|-------|
| Complexity | M | Multiple layers but pattern already proven for 3 modules |
| Cross-module | Y | Analyze + Map + Sections + Templates |
| Migration | N | Additive catalog/prompts; existing DNA with subset options unchanged |
| AI cost | M | Up to 5 extra strong-model 1d calls per analyze |

## Recommendation

- **Complete in place**: research runner, coverage gate, dna-slice, catalog (launch subset → full 8)
- **Create**: 5 prompts, 5 HBS partials, 5 catalog section defs (+ fixture blocks)
- **Modify**: ModelResolver request types, map maxSections (22 → 28), map prompt

## Status target (per artifact after implement)

| Artifact | Target |
|----------|--------|
| pipeline-analyze-map (full research) | done |
| pipeline-sections-engine (dna-slice) | done |
| templates (5 sections + partials) | done |
| plan modules / data-model deltas | done (pack only until merge) |

## Dependencies

- depends-on: — (change-005/006 already merged)
- Soft: runtime Redis/Mongo for verify; FE already complete
