# Blueprint Index — change-20260726-000011-prop-v3-cutover

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: `docs/refactor-proposal-generator.md` §15 Phase 6; REQ-PROP-V3 part 8/8.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Creative + Settings + Projects cutover | done | 1/1 | v3 primary after-state |
| plan | `plan/data-model.md` | settings default; proposals.projectId | done | 1/1 | flag + backfill notes |
| service | `actions/api/services/settings.md` | SVC-SETTINGS-03 | done | 1/1 | default true + seed |
| service | `actions/api/services/cutover-backfill.md` | SVC-CUTOVER-01 | done | 1/1 | backfill script |
| endpoint | `actions/api/endpoints/ai-jobs.md` | EP-AIJOBS soft gate | done | 1/1 | soft-block creative |
| page | `actions/web/pages/creative.md` | PG-CREATIVE demote | done | 1/1 | Legacy when flag on |
| page | `actions/web/pages/projects.md` | PG-PROJECTS primary | done | 1/1 | primary create path |

**Pack Done/Total**: 7/7

## Deferred

- Hard delete `poll-batch-jobs` + creative-pipeline modules (after quiet period)
- Remove Creative routes entirely
