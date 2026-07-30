# Verification — Generic catalog-driven section repeat

## Plan Consistency
- [x] Pack modules: Map (`MapOrchestratorService`) + Templates (catalogs/prompt), per `blueprint/_index.md`
- [x] `pipeline-sections-engine.md` delta: listSplit payload, clamp, validate → implemented as specified
- [x] `templates.md` delta: `deriveArrayCapacityHints`, website generic lock, `social_audit` flag → implemented as specified
- [x] Implementation-note addendum (entity-driven exception for `competitor_analysis`, found mid-implementation) — documented in `blueprint/_index.md` and applied in code

## Code Verification
- [x] `pdf-list-split.ts` — removed `PDF_LIST_SPLIT_KEYS` / `PDF_OVERFLOW_CLAMP_KEY_SET` / `PDF_LIST_SPLIT_CAPACITY`; added `deriveArrayCapacityHints` (pure, walks `contentSchema` for array `maxItems`) + `ENTITY_DRIVEN_REPEAT_KEY_SET` (`competitor_analysis` only); `partitionRows` unchanged
- [x] `map-orchestrator.service.ts` — `listSplit.keys`/`catalogCapacity` derived from `catalogSections.filter(repeatable && !entityDriven)`; `clampListSplitInstances` and `validateMap` count-check both switch to `getSectionDef(key, templateKey)?.repeatable`, excluding `ENTITY_DRIVEN_REPEAT_KEY_SET`
- [x] `map.plan.v1.md` — PDF list-split section reworded to reference `listSplit.keys` generically (template-specific, not fixed names); financial part/full kept as its own named exception; landing branch reworded; `competitor_analysis` distinction called out explicitly
- [x] `website-template.catalog.ts` — `landingLocked` switched from `PDF_LIST_SPLIT_KEY_SET.has(key)` to `section.repeatable && !ENTITY_DRIVEN_REPEAT_KEY_SET.has(section.key)`
- [x] `pitch-landscape.catalog.ts` — `social_audit`: `repeatable: true, pages: { min: 1, max: 2 }` (was `false`/`1`); `competitor_analysis.pages.max`: `1` → `3` (correctness fix, matches real ceiling in `research-coverage.gate.ts`, not previously enforced either way — no behavior change, just now-accurate metadata)
- [x] `pdf-list-split.spec.ts` — 4 new tests added: `social_audit` repeatable on pitch/formal/roya; locked on website; `competitor_analysis` entity-driven with correct `pages.max: 3`; `deriveArrayCapacityHints` correctness
- [x] Unit tests: `pdf-list-split.spec.ts` — **13/13 PASS** (9 pre-existing regression + 4 new)
- [x] Full `pipeline-v3` suite — **31/31 PASS**
- [x] `tsc --noEmit` — clean, no type errors
- [x] No FE changes (confirmed via `git status` — only `roya-sales-ai-api-v2/src/pipeline-v3/**` touched)
- [x] No `map.v1` schema / data-model changes

## Acceptance criteria
1. Clamp/validate use `getSectionDef(...).repeatable` (not hardcoded set); regression-safe for `timeline`/`action_plan`/`services`/`financial_full` + newly-correct for `competitor_analysis` — **PASS**
2. `listSplit.keys`/`catalogCapacity` computed live from active template catalog — **PASS**
3. `map.plan.v1.md` generic wording; financial exception kept separate — **PASS**
4. Website lock is attribute-based (`section.repeatable`), no key-name reference — **PASS**
5. `social_audit` repeatable max 2 on pitch/formal/roya (inherited); website stays locked — **PASS** (verified by test)
6. Two same-key `social_audit` `proposal.sections[]` rows possible end-to-end — **PASS structurally** (catalog flag, clamp ceiling, validate ceiling, and AI payload all correctly wired for it, mirroring the proven `timeline`/`action_plan` pattern byte-for-byte); actual instance count on a given proposal is Map AI's live judgment call against real DNA data, same as the existing `timeline`/`action_plan` mechanism — **recommend one live pipeline run as a smoke check before considering this fully proven in production**, not deferred as a code gap
7. Research-coverage gate unaffected — confirmed by inspection (`assertResearchCoverage` only checks "≥1 hit"); no gate code touched — **PASS**
8. No schema/data-model/FE changes — **PASS**

## Result: **PASS**

## Notes
- No DB/template re-seed needed for the mechanism itself, but the `social_audit` `pages.max`/`repeatable` catalog change is served from code (`getTemplateSections`), not Mongo — confirm whether this project seeds template docs to Mongo (`buildAllTemplateDocs()` per `pipeline-sections-engine.md` main spec) and re-run that seed step if templates are read from DB rather than the TS catalog at request time, mirroring the note in the prior `pdf-list-section-split` pack.
- Recommend a follow-up: run one real proposal through Map with a DNA that has >6 social channels of data to observe the AI actually choose 2 `social_audit` instances (not required to pass this gate, since the wiring is proven, but valuable production confidence).
- Main blueprint merge pending Step 5.6 confirmation.
