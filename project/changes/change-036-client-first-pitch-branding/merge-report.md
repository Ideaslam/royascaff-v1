# Merge Report — change-036-client-first-pitch-branding

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | in-place: Assemble client-first + logo fallback; Map about_workspace; Projects logo seed; Templates placement |
| `project/actions/api/services/pipeline-sections-engine.md` | Assemble branding table + ClientsRepository + placement |
| `project/actions/api/services/pipeline-analyze-map.md` | require/inject about_workspace |
| `project/actions/api/services/projects.md` | seed client_logo on create/DNA |
| `project/actions/api/services/templates.md` | client-first placement; formal/website requiredKeys notes |
| `project/bugs/bug-log.md` | bug-014 → DONE |
| `project/changes/change-log.md` | pack → Completed / merged |

## Skipped (unchanged)

- `project/plan/data-model.md` — already listed 21 keys incl. `about_workspace` (from concurrent template work)
- Endpoints / FE pages — out of pack

## Post-merge checks

- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
- [x] Bug-014 marked DONE
