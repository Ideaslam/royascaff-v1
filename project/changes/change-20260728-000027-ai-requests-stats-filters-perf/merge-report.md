# Merge Report — change-20260728-000027-ai-requests-stats-filters-perf

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ user confirm merge)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: pipelineTraces indexes + query rules |
| `project/plan/modules.md` | in-place: Pipeline Traces features (stats/callType/aggregates/UI) |
| `project/actions/api/endpoints/pipeline-traces.md` | after-state EP-TRACES-01..04 |
| `project/actions/api/endpoints/_index.md` | Pipeline Traces note |
| `project/actions/api/services/pipeline-traces.md` | SVC-TRACES-00..03 done |
| `project/actions/api/services/_index.md` | 4/4 rollup |
| `project/actions/web/pages/ai-requests.md` | PG-AIREQ after-state (KPIs, names, no charts) |
| `project/actions/web/pages/_index.md` | AI Requests purpose note |

## Skipped (unchanged)

- Auth / new permissions (`pipeline-traces.read` unchanged)
- Admin cross-workspace traces
- Trace write-path document shape

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for Pipeline Traces services (4/4)
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
