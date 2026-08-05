# Merge Report — change-20260728-000028-pipeline-model-routing-config

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: config known key `pipelineModelRouting` + document shape + seed table |
| `project/plan/modules.md` | in-place: AI §6 foundations DB-config resolver; §15 translate model from routing config |
| `project/actions/api/services/pipeline-v3-foundations.md` | in-place: SVC-PIPEV3-04b pricing; SVC-PIPEV3-06 async config `resolveModel` |
| `project/actions/api/services/pipeline-model-routing.md` | created: SVC-PIPEV3-08 cached loader + seed contract |
| `project/actions/api/services/_index.md` | added Pipeline Model Routing row |
| `project/status.md` | Foundations services 8/8 → 9/9 |

## Skipped (unchanged)

- `project/profile.md` / `project/rules.md`
- Endpoints / FE pages (backend-only pack)

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
