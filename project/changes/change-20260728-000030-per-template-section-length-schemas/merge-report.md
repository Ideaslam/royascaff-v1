# Merge Report — change-20260728-000030-per-template-section-length-schemas

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ user PASS)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | §13 Templates: per-template catalogs + website owns lengths |
| `project/actions/api/services/templates.md` | SVC-TPL-04/06/08 after-state; add SVC-TPL-09 registry |
| `project/actions/api/services/pipeline-sections-engine.md` | SVC-PIPE-S3-01 template-scoped schemas + lengthBudgets |
| `project/actions/api/services/_index.md` | Templates 9/9 |
| `project/status.md` | Templates 9/9 |

## Skipped (unchanged)

- FE gallery (already picks templateKey)
- Disk HBS/CSS (length-only change)
- Formal lengths still match pitch (own file ready to diverge)

## Post-merge checks

- [x] Touched main files updated in-place
- [x] No leftover change-* sections appended
- [x] `change-log.md` row moved to Completed
- [x] Pack `status.md` + change-request metadata set to `merged`

## Ops note

- Re-run `npm run seed:templates` (or rely on bootstrap upsert) so Mongo `templates` docs include website schemas.
