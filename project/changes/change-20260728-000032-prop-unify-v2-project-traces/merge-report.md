# Merge Report — change-20260728-000032-prop-unify-v2-project-traces

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ user confirm)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: v2 `generation`, jobId null on new creates, aiJobs no-new-creative rule, pipelineTraces v2 labels |
| `project/plan/modules.md` | Creative features: unified v2 + dual poller + FE primary paths |
| `project/actions/api/services/creative-v2.md` | **new** SVC-CREATIVE-V2-01..04 |
| `project/actions/api/services/_index.md` | registry row |
| `project/actions/api/services/ai-jobs.md` | dual poller + shared orchestrator notes |
| `project/actions/api/endpoints/projects.md` | EP-CREATIVE-V2-01 |
| `project/actions/api/endpoints/_index.md` | Projects 23/23 |
| `project/actions/api/endpoints/ai-jobs.md` | pointer to unified create |
| `project/actions/web/pages/creative.md` | PG-CREATIVE-01 unified path |
| `project/actions/web/pages/_index.md` | Creative purpose |
| `project/actions/web/pages/proposals.md` | archive v2 proposal poll |
| `project/status.md` | last-updated + Next Up part 3 |

## Skipped (unchanged)

- Contracts services ID normalization → Part 3 (change-20260728-000033)
- Hard-delete aiJobs / forever remove poller

## Post-merge checks

- [x] Touched main files updated in-place
- [x] No leftover change-* sections appended
- [x] `change-log.md` row moved to Completed
- [x] Pack `status.md` + change-request metadata set to `merged`
