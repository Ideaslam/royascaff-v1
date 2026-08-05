# Blueprint Index — change-20260805-130757-ai-job-to-traces-enrich-ai-requests

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (Proposals→AI Requests; retire AI Jobs UI/admin; enrich projects overview).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Creative Job Monitoring; Admin AI Job Diagnostics; AI Requests | done | 1/1 | Observability via AI Requests; retire FE/admin job monitors |
| service | `actions/api/services/pipeline-traces.md` | SVC-TRACES-02 | done | 1/1 | Enrich byProject + sort createdAt desc |
| endpoint | `actions/api/endpoints/pipeline-traces.md` | EP-TRACES-04 | done | 1/1 | byProject response fields |
| endpoint | `actions/api/endpoints/admin.md` | EP-ADMIN-02, EP-ADMIN-03 | done | 1/1 | Remove admin ai-jobs list/detail |
| page | `actions/web/pages/proposals.md` | PG-PROPOSALS-01 | done | 1/1 | Open → AI Requests query |
| page | `actions/web/pages/ai-requests.md` | PG-AIREQ-01, PG-AIREQ-03 | done | 1/1 | Deep-link + projects columns/sort |
| page | `actions/web/pages/ai-jobs.md` | PG-AIJOBS-01, PG-AIJOBS-02 | done | 1/1 | Remove FE pages + nav |

**Pack Done/Total**: 7/7
**Pack status**: merged (2026-08-05)

## Out of pack

- Hard-delete `aiJobs` / chat create-get-stream / dual poller
- Traces list default sort changes
- Cost charts redesign
- New permissions
