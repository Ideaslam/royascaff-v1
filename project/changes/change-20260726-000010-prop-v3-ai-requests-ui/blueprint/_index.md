# Blueprint Index — change-20260726-000010-prop-v3-ai-requests-ui

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: `docs/refactor-proposal-generator.md` §14.6, §7.4, §13 traces API.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Pipeline Traces FE + API | done | 1/1 | feature after-state |
| page | `actions/web/pages/ai-requests.md` | PG-AIREQ-01..03 | done | 3/3 | list / detail / cost |
| endpoint | `actions/api/endpoints/pipeline-traces.md` | EP-TRACES-03..04 | done | 2/2 | summary + cost-summary |
| service | `actions/api/services/pipeline-traces.md` | SVC-TRACES-01..02 | done | 2/2 | aggregate helpers |

**Pack Done/Total**: 8/8

## Deferred

- Admin cross-workspace traces (`/api/data/admin/pipeline-traces*`)
- Cutover / retire v2 — change-20260726-000011
- SSE live refresh (poll or manual refresh OK for v1)
