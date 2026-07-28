# Impact Analysis — change-20260726-000011-prop-v3-cutover

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Settings flag | partial | `pipeline-v3-flag.ts`, `settings-schema.ts`, FE `state.service.ts` | default **false**; seed schema missing field |
| Backfill | none | `scripts/` | no wrap-legacy-proposals script |
| Creative FE | complete | `/creative`, sidebar always visible | not demoted when v3 on |
| Creative API | complete | `ai-jobs.controller`, `creative-pipeline/**`, `poll-batch-jobs.ts` | no gate when v3 on |
| Projects FE | complete | `/projects` | already gated by flag |
| Proposals | partial | proposals may lack `projectId` | need backfill link |

Feature state: **partial** (dual-path live; cutover tooling + defaults missing)

## Affected Modules

- **Settings / Config** — default true; seed `settingsSchema`
- **Projects** — backfill creates wrapping projects
- **Proposals** — set `projectId` on legacy rows
- **Creative / AI Jobs** — soft-block new creative creates when flag on; keep poller
- **Layout (web)** — demote Creative nav when flag on

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — cutover after-state (v3 primary; v2 soft-retired)
- [ ] `blueprint/plan/data-model.md` — settings default true; proposals.projectId backfill note
- [ ] `blueprint/actions/api/services/settings.md` — default + seed
- [ ] `blueprint/actions/api/services/cutover-backfill.md` — script SVC
- [ ] `blueprint/actions/api/endpoints/ai-jobs.md` — soft gate on creative create
- [ ] `blueprint/actions/web/pages/creative.md` — demote / Legacy
- [ ] `blueprint/actions/web/pages/projects.md` — primary path notes
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

| Area | Create / Modify |
|------|-----------------|
| API `scripts/backfill-legacy-proposals-to-projects.js` (or `.ts`) | Create — dry-run + apply, idempotent |
| API `lib/settings-schema.ts` + seed | Modify — default `true`; seed field |
| API `ai-jobs` create path | Modify — reject new creative when `pipelineV3Enabled` |
| FE `state.service.ts` | Modify — default `pipelineV3Enabled: true` |
| FE sidebar + creative/projects copy | Modify — demote Creative when flag on |
| `poll-batch-jobs` / creative-pipeline delete | **Defer** — hard retire follow-up |

## Risk

- **Complexity**: Medium–High (migration script + dual-path UX + create gate)
- **Cross-module**: Yes (settings, projects, proposals, creative, layout)
- **Migration**: Yes (backfill script; additive `projectId` only)

## Recommendation

- **Create**: backfill script + cutover blueprint slices
- **Modify**: flag default, soft-block creative create, nav demotion
- **Defer**: hard delete of batch poller / creative modules

## Status target (pack artifacts after implement)

| ID / Name | Target |
|-----------|--------|
| Flag default true + seed | done |
| Backfill script | done |
| Soft-block creative create | done |
| FE nav demotion | done |
| Hard delete poller | deferred |

## Dependencies

- **depends-on**: change-20260726-000010 — pack-status: **merged**
