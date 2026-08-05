# Merge Report — change-20260805-171001-contract-template-cover-watermark-font

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (user-confirmed, after 3 post-verify fix rounds)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: `contract_templates` §10a token catalog +8 Design/Branding tokens + `contract_total` + short `contract_number` display-code note; `settings` §11 `defaultFont` enum +`Amiri` + dynamic-validation note |
| `project/actions/api/services/settings.md` | in-place: schema-driven `validateSelectFieldValues` in `patchSettings`, `PatchSettingsDto` hardcoded `@IsIn` removed |
| `project/actions/api/services/contracts.md` | in-place: new Design/Branding tokens + `contract_total` + `generateContractNumber` short display code (SVC-CONTRACTS-01); two-pass render + `pdf-lib` merge for true cover bleed + branded footer page-number accent (SVC-CONTRACTS-02) |
| `project/actions/api/services/contract-templates.md` | in-place: `roya-default.html` redesign — solid-color true-bleed cover, at-a-glance strip, split watermark, numbered clause badges/callouts, workspace font |
| `project/actions/web/pages/contract-templates.md` | in-place: token palette gains Design & Branding category + `contract_total` in Content |
| `project/profile.md` | in-place: backend deps list +`pdf-lib` |
| `project/status.md` | refreshed "Last updated" line (6th pack in this batch) |

## Skipped (unchanged)

- Main `_index.md` rollups for Services/Pages (module status already `done`; no new IDs — this pack only changed content/behavior of existing artifacts, not their count)
- `project/rules.md` / `project/description.md` (no rule or product-description changes)
- Endpoint specs (`project/actions/api/endpoints/{settings,contracts,contract-templates}.md`) — no new/changed endpoint contracts, reused as-is

## Post-merge checks

- [x] Main `_index.md` Done/Total confirmed unchanged (no new artifacts, only content deltas on already-`done` IDs)
- [x] No leftover change-* sections appended to main files (all edits in-place)
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
