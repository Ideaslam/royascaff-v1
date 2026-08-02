# Merge Report — change-20260802-173135-financial-ratio-revenue-enum

- **Merged date**: 2026-08-02
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (user confirmed)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/actions/api/services/pipeline-sections-engine.md` | in-place: Assemble `buildFinancial` ratio `%` + `computeServicesFinancial`; FIN-DOC `N%` cell; new SVC-REV-TYPE-01 |
| `project/actions/api/services/pipeline-analyze-map.md` | in-place: DNA `services.financial` code-owned via `computeServicesFinancial` |
| `project/actions/api/services/projects.md` | in-place: project/DNA `computeFinancial` excludes ratio |
| `project/actions/api/services/_index.md` | rollup Done/Total + purpose for Sections + Engine |
| `project/actions/web/pages/services.md` | in-place: FE `RevenueType` enum; ratio price `N%` |
| `project/plan/data-model.md` | in-place: `revenueType` wire enum note |
| `project/status.md` | refreshed snapshot date + Pipeline Sections count |

## Skipped (unchanged)

- Endpoints (no new EP)
- Template `.hbs` partials (by design)

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
