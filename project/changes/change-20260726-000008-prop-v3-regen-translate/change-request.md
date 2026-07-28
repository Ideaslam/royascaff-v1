# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 5/8
- **depends-on**: change-20260726-000007
- **blocks**: change-20260726-000009 (planned — FE create/stepper)
- **pack-status**: merged

## Scope
- Module(s): Projects (regenerate-dna already exists — extend rebuild hooks), Proposals (regenerate / translate / sibling-from-template), Templates (optional `pitch-landscape-formal` if in Phase 4 doc), Creative / AI Generation (pipeline entry points from step 2+)
- Feature(s): Phase 4 — regenerate from step 2, translate contentByLang, template-switch via sibling proposal; revisions archive
- Endpoint(s): `POST …/proposals/:id/regenerate`, `POST …/proposals/:id/translate`, sibling create (or extend create-from-project); DNA regenerate already shipped
- Page(s)/View(s): none (FE later)
- Service(s): ProposalRegenerateService, TranslateOrchestrator, sibling proposal factory; wire assemble/export after translate/regen

## Description

Implement **Phase 4 — Regeneration / Translation / Template switching** per `docs/refactor-proposal-generator.md` §12 and §15 Phase 4.

**Depends on** merged `change-20260726-000007` (sections → assemble → export engine).

**This pack delivers:**

1. **Regenerate proposal from step 2** — `POST /api/data/proposals/:id/regenerate`:
   - Archive current `sections` + `renderedByLang` (+ optional sectionMap) into `revisions[]` (cheap undo).
   - New `runId`; clear section content / rendered; re-run map → sections → assemble → export against **current** project DNA (pinned `dnaVersion` behavior: keep proposal’s DNA pin unless body asks rebuild-with-latest).
   - Does **not** re-run analyze unless explicitly requested (`from: "dna"` optional later; default from step 2).
2. **Translate** — `POST /api/data/proposals/:id/translate { lang: "en"|"ar" }`:
   - Requires source language content ready (e.g. `contentByLang.ar`).
   - Parallel per-section translate jobs (fast model); glossary: brand/service names stay; schema-validated.
   - Then assemble + export for target lang into `renderedByLang[lang]`.
3. **Template switch via sibling** — create a **new** proposal on the same project with a different `templateKey` (doc: `pitch-landscape-formal`), steps 2–5 only (reuse project DNA; no overwrite of original).
   - Prefer extend `POST …/projects/:id/proposals` with `templateKey` + optional `sourceProposalId` / `fromStep: "map"`.
4. **Template #2 (doc Phase 4)** — if timeboxed: ship `pitch-landscape-formal` as catalog+disk assets **or** document as `partial`/`deferred` if design assets missing; sibling API must still work for any **active** template key.
5. **Rebuild with new DNA** — after `regenerate-dna`, API/UX hook: optional `POST …/proposals/:id/regenerate { useLatestDna: true }` bumps pin and remaps.

**Out of scope:**
- Frontend translate/regenerate UI — change-20260726-000009
- AI Requests / cost dashboard UI — change-20260726-000010
- Cutover / retire v2 — change-20260726-000011
- Carry-over of compatible section content across templates (doc v3.1)
- Structured section editor

**Locked decisions (carry forward):** BullMQ + Mongo truth; workspace feature flag required for v3 ops; fail-closed; Ready with gaps; no FE; leave v2 creative path when flag off; competitors ≤3; research subset unchanged.

## Acceptance Criteria

1. `POST …/proposals/:id/regenerate` archives prior sections/rendered into `revisions[]`, starts a new run from map (or map→…), and status progresses to `ready`/`partially_failed`/`failed` without blocking HTTP.
2. Translate fills `contentByLang[targetLang]` for all ready sections (failed sections skippable), then produces `renderedByLang[targetLang]`.
3. Creating a sibling proposal with another `templateKey` on the same project leaves the original proposal intact and runs steps 2–5 on the sibling using project DNA.
4. Regenerating DNA does not mutate existing proposals’ content until an explicit regenerate-with-latest-DNA (or sibling rebuild) is requested.
5. All new AI calls are traced; ModelResolver used (translate prefers fast model).
6. Feature flag still gates v3 mutation endpoints; `npm run build` succeeds; no FE changes.

## Notes

- Source: `docs/refactor-proposal-generator.md` §12, §13 API table, §15 Phase 4.
- Doc lists template #2 `pitch-landscape-formal` in Phase 4 — treat as **best-effort**: API sibling path required; formal template assets may be `partial` if design not ready.
- `regenerate-dna` endpoint already exists from change-20260726-000006; this pack adds proposal-level regen/translate/sibling.
