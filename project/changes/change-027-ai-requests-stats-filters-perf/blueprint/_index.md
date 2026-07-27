# Blueprint Index — change-027-ai-requests-stats-filters-perf

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (AI Requests stats, call-type/step filters, fast pagination).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/data-model.md` | pipelineTraces indexes + query contract | done | 1/1 | workspace-scoped indexes; no schema fields |
| service | `actions/api/services/pipeline-traces.md` | SVC-TRACES-00..03 | done | 1/1 | list+stats; Mongo aggregates |
| endpoint | `actions/api/endpoints/pipeline-traces.md` | EP-TRACES-01,03,04 | done | 1/1 | callType + stats; aggregate summaries |
| page | `actions/web/pages/ai-requests.md` | PG-AIREQ-01,03 | done | 1/1 | stats strip; call-type Select |

**Pack Done/Total**: 4/4
**Pack status**: merged (2026-07-28)

## Out of pack

- Cross-workspace admin traces
- Changing AI write path / document payload shape
- Chart redesign
- New permissions
