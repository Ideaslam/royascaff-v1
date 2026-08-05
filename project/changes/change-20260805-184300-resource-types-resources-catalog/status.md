# Pack Status — change-20260805-184300-resource-types-resources-catalog

- **pack-status**: merged
- **request-id**: REQ-CATALOG
- **depends-on**: —
- **Artifacts done**: 10/10

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| resource_types entity | data-model | done | collection + tenant isolation |
| resources entity | data-model | done | collection + tenant isolation |
| ResourceTypesDataService | service | done | CRUD + seed (with fields, desc) + unique key; list returns fields array |
| ResourcesDataService | service | done | CRUD + lite + photo S3 |
| /api/data/resource-types | endpoint | done | CRUD + GET /:id + WorkspaceAuthGuard |
| /api/data/resources | endpoint | done | CRUD + lite + photo + OwnershipGuard |
| Resource Types List Page | page | done | list table + nav to edit page |
| Resource Type Edit Page | page | done | separate full-page form with fields builder |
| Resources Catalog Page | page | done | SelectModule filter dropdowns (type, name, key) + dynamic edit form |
| Infrastructure wiring | infra | done | tokens, modules, ownership, routes, i18n |

## Blockers

- None

## Changes applied (post-verify)
1. API: `toResourceTypeListItem` now returns `fields` array instead of `fieldsCount`
2. API: Default seed types enriched with `description`/`descriptionEn` + more fields (bio, socialLinks, specialization, followers)
3. Frontend: Resource Type form moved from dialog to separate edit page (`/resource-types/new`, `/resource-types/:id/edit`)
4. Frontend: Added `getResourceTypeById(id)` to AppDataService
5. Frontend: Resources list page — replaced type tabs with SelectModule filter bar (type, name, key)
6. i18n: Added `resources.filters.*` keys for filter labels
7. Frontend: Added `photo-list` dataType support (multi-photo upload + URL input)
8. Frontend: Added placeholders + photo preview for dynamic `photo` and `photo-list` fields
9. Frontend: **Resource Edit page redesigned** — two-column layout (core data left, per-field accordion right), styled field renderers (icon-prefixed inputs, gradient chips, photo zone, gallery grid, social-links zone), sticky right column, responsive
10. Frontend: **Resource Type Edit page redesigned** — two-column layout (type info left, per-field accordion right), each field definition is collapsible with key/label/type preview, sticky right column, responsive
11. Frontend: Fixed CSS class collision with Font Awesome (`fa-*` custom classes renamed to `fd-*`)
12. Frontend: Fixed accordion chevron icons — swapped CSS rotation for direct `pi-chevron-right` / `pi-chevron-down` class swap

## Next action

- ~~Merge into main blueprint~~ Done — merged 2026-08-05
