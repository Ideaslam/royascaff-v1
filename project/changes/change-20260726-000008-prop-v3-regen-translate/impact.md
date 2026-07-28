# Impact Analysis — change-20260726-000008-prop-v3-regen-translate

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Regenerate DNA | complete | `projects.controller` + `enqueueRegenerateDna` | clears DNA + analyze; no proposal rebuild hook / dnaVersion pin |
| Proposal regenerate (from map) | none | — | no endpoint; no `revisions[]` |
| Translate | none | — | no translate jobs/prompts; no multi-lang assemble path beyond single `language` |
| Rerender (4→5) | none | — | assemble/export exist but no HTTP entry that skips AI |
| Sibling / template switch | partial | `createProposalFromProject` | always starts analyze or map; no “map-only sibling” with explicit DNA reuse contract; only `pitch-landscape` on disk |
| Formal template #2 | none | only `templates/pitch-landscape/v1/` | no `pitch-landscape-formal` assets/catalog |
| Pipeline engine | complete | section/assemble/export/queue | reusable entry points for regen/translate |
| Feature flag | complete | `pipelineV3Enabled` | must gate new mutation endpoints |
| FE | none | — | out of scope |

**Feature state:** none (Phase 4 product APIs) — engine ready to reuse.

## Affected Modules
- Proposals — regenerate, translate, rerender, revisions
- Projects — sibling create / map-only path; dnaVersion pin
- Templates — optional formal template (likely partial)
- Creative / Pipeline v3 — translate section variant + enqueue helpers

## Pack blueprint files to create
- [ ] `blueprint/plan/modules.md`
- [ ] `blueprint/plan/data-model.md` — revisions, dnaVersion, multi-lang
- [ ] `blueprint/actions/api/services/pipeline-regen-translate.md`
- [ ] `blueprint/actions/api/endpoints/proposals-pipeline.md` (delta)
- [ ] `blueprint/actions/api/services/templates.md` (delta — formal partial)
- [ ] `blueprint/_index.md` + pack `status.md`

## Code impact (implement later)

**Create**
- `pipeline-v3/regen/proposal-regenerate.service.ts`
- `pipeline-v3/translate/translate-orchestrator.service.ts` (+ prompt `section.translate.v1.md`)
- Controller routes on proposals: regenerate, translate, rerender
- Optional: thin formal template (theme tokens + reuse partials) **or** defer assets

**Modify**
- `createProposalFromProject` — support map-only when DNA present + sibling semantics; pin `dnaVersion`
- `AssembleService` — target language from job/proposal lang (already mostly)
- Queue payload if translate needs distinct step label
- Settings flag checks on new endpoints

## Ripple effects
- Status polling already covers assemble/export — FE later
- Revisions grow document size — cap e.g. last 5
- Translate concurrency same as section worker pool

## Risk
- **Complexity: M** (mostly orchestration on existing engine)
- **Cross-module: Y** (proposals, projects, templates)
- **Migration: N** (additive `revisions`, `dnaVersion`)

## Recommendation
- **Create**: regen/translate/rerender services + endpoints + revisions
- **Complete**: sibling create from DNA (map→…)
- **Defer/partial**: full designed `pitch-landscape-formal` if no design pack — API accepts any active template key

## Status target (after implement)
- Regen / translate / rerender / sibling → `done`
- Formal template → `partial` or `deferred` (document)
- Content carry-over across templates → `deferred` (v3.1)

## Dependencies
- **depends-on**: change-20260726-000007 — **merged** ✅
