# Merge Report — change-20260727-000020-workspace-logo-upload

- **Merged date**: 2026-07-27
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: settings.`logoUrl` |
| `project/plan/modules.md` | in-place: Workspace Logo feature + Settings note |
| `project/actions/api/services/settings.md` | after-state: logo upload/remove + S3 |
| `project/actions/api/endpoints/settings.md` | EP-SETTINGS-03/04 added |
| `project/actions/api/endpoints/_index.md` | Settings 4/4 |
| `project/actions/api/services/_index.md` | Settings purpose note |
| `project/actions/web/pages/settings.md` | Company logo panel |
| `project/actions/web/pages/layout.md` | **created** sidebar logo binding |
| `project/actions/web/pages/_index.md` | Layout row + Settings note |
| `project/status.md` | snapshot + Settings/Layout rollups |

## Skipped (unchanged)

- Auth / roles (reuse `settings.manage`)
- Clients logo specs (unchanged)
- Proposal/PDF templates (out of pack; see change-20260727-000021)

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
