# Merge Report — change-20260805-130757-ai-job-to-traces-enrich-ai-requests

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | in-place: Job Monitoring, Primary FE paths, Admin diagnostics removed, AI Requests enrich/sort |
| `project/actions/api/services/pipeline-traces.md` | SVC-TRACES-02 enrich + createdAt sort |
| `project/actions/api/services/proposals.md` | toSummary must return projectId/pipelineVersion/language |
| `project/actions/api/endpoints/pipeline-traces.md` | EP-TRACES-04 byProject after-state |
| `project/actions/api/endpoints/admin.md` | drop EP-ADMIN-02/03 |
| `project/actions/api/endpoints/_index.md` | Admin 9/9; traces note |
| `project/actions/web/pages/proposals.md` | Open → AI Requests |
| `project/actions/web/pages/ai-requests.md` | deep-link + projects columns/sort |
| `project/actions/web/pages/ai-jobs.md` | FE removed |
| `project/actions/web/pages/_index.md` | AI Jobs cancelled; AI Requests note |
| `project/status.md` | snapshot + module rollups |
| `project/changes/change-log.md` | row → Completed merged |

## Skipped (unchanged)

- `project/profile.md`, `project/description.md`, `project/rules.md`
- Core `/api/ai-jobs` endpoint/service specs (kept)

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
