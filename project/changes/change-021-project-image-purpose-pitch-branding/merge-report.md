# Merge Report — change-021-project-image-purpose-pitch-branding

- **Merged date**: 2026-07-27
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: `projects.images[]` + purpose |
| `project/plan/modules.md` | in-place: Image upload, Assemble branding, pitch-landscape branding, Create/Edit images FE |
| `project/actions/api/endpoints/projects.md` | EP-PROJECTS-07 clarified; **EP-PROJECTS-11** added |
| `project/actions/api/endpoints/_index.md` | Projects 11/11 |
| `project/actions/api/services/projects.md` | uploadImages + patchImages + DNA purpose |
| `project/actions/api/services/pipeline-sections-engine.md` | Assemble Settings + client_logo branding |
| `project/actions/api/services/templates.md` | TemplateRender root branding + no Safqa hardcodes |
| `project/actions/api/services/_index.md` | Projects/Templates/Assemble purpose notes |
| `project/actions/web/pages/projects.md` | Create/Edit images UX + shared field + FE service methods |
| `project/actions/web/pages/_index.md` | Projects note |
| `project/status.md` | snapshot + Projects endpoints 11/11 |

## Skipped (unchanged)

- Auth / roles (reuse `projects.edit`)
- Settings logo upload UI (change-020)
- Image delete endpoint (not in pack)
- Non–pitch-landscape templates

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
