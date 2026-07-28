# Blueprint Index — change-20260727-000015-pipeline-durable-resume

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Bug: `bug-20260727-000002-pipeline-resume-after-restart.md`

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | AI Jobs · Orchestration engine (resume) | done | 1/1 | Mongo-checkpoint resume semantics |
| service | `actions/api/services/pipeline-resume.md` | SVC-PIPE-RESUME-01..04 | done | 4/4 | resume helper, incomplete sections, reconciler, fan-in |
| endpoint | `actions/api/endpoints/proposals-pipeline-resume.md` | EP-PROP-PIPE-08 | done | 1/1 | POST proposals/:id/resume |
| page | `actions/web/pages/proposal-view-resume.md` | PG-PROP-RESUME-01 | done | 1/1 | Continue only when stuck |

**Pack Done/Total**: 7/7
