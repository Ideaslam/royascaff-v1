# Merge Report — change-20260727-000026-dna-versions

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ user confirm)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: `project_dna_versions`; proposal `dnaVersionId`/`dnaSnapshot`; projects DNA ownership notes |
| `project/plan/modules.md` | in-place: Projects DNA versions features |
| `project/actions/api/endpoints/projects.md` | after-state EP-PROJECTS-01..22 |
| `project/actions/api/endpoints/_index.md` | Projects 22/22 |
| `project/actions/api/services/projects.md` | DNA versions + proposal pin |
| `project/actions/api/services/pipeline-analyze-map.md` | analyze writes version + snapshot |
| `project/actions/api/services/_index.md` | Projects note |
| `project/actions/web/pages/projects.md` | workspace DNA list/picker + DNA form |
| `project/actions/web/pages/_index.md` | Projects note |
| `project/status.md` | snapshot + deferred follow-ups |

## Skipped (unchanged)

- Auth / new permission keys (reuse `projects.*`)
- Creative pipeline legacy
- Full formal disk theme / other template packs

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for Projects endpoints
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
