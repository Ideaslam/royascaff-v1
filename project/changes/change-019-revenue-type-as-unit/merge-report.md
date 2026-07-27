# Merge Report — change-019-revenue-type-as-unit

- **Merged date**: 2026-07-27
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ services `[[]]` persistence bug fix)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/actions/web/pages/services.md` | in-place: PG-SERVICES-01/02 — Unit removed; unit derived from revenueType |
| `project/actions/web/pages/projects.md` | in-place: PG-PROJECTS-02 overrides + PG-PROJECTS-04 edit overrides |
| `project/actions/web/pages/_index.md` | Projects 4/4; Services note |
| `project/actions/api/endpoints/projects.md` | EP-PROJECTS-01/04 nested ProjectServiceLineDto notes |
| `project/actions/api/services/projects.md` | normalizeServiceLines + DTO typing |
| `project/status.md` | Snapshot / Projects pages 4/4 |

## Skipped (unchanged)

- Main data-model (no schema drop of `unit`)
- Creative legacy wizard pages

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
