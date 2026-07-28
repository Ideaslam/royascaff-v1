# Merge Report — change-20260726-000011-prop-v3-cutover

- **Merged date**: 2026-07-26
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | in-place: v2 soft-retired; flag default true; backfill; primary FE path |
| `project/plan/data-model.md` | `pipelineV3Enabled` default true |
| `project/actions/api/services/settings.md` | SVC-SETTINGS-03 rules → default true |
| `project/actions/api/services/cutover-backfill.md` | created SVC-CUTOVER-01 done |
| `project/actions/api/endpoints/ai-jobs.md` | creative create soft-blocked when v3 on |
| `project/actions/web/pages/creative.md` | soft-retired UX |
| `project/actions/web/pages/projects.md` | primary create path |
| `project/actions/api/services/_index.md` | + Cutover Backfill 1/1 |
| `project/actions/web/pages/_index.md` | Creative notes |
| `project/status.md` | REQ-PROP-V3 complete; Next Up → REQ-R |

## Skipped (unchanged)

- Hard delete `poll-batch-jobs` / creative-pipeline (deferred)
- `project/description.md` / `project/rules.md` / `project/profile.md`

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
