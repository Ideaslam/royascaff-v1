# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: polish
- **target-app**: web
- **affected-repos**: frontend
- **priority**: medium
- **request-id**: —
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Roles & Permissions
- Feature(s): Matrix layout clarity + category labels + page size default
- Endpoint(s): —
- Page(s)/View(s): `web` · `/roles-permissions` (`RolesPermissionsComponent`)
- Service(s): —

## Description
Roles & Permissions matrix is hard to scan: wide empty space, “Actions” column header is misleading, role headers feel floating, and module (category) rows show `[object Object]` for `projects` / `pipeline` because missing category i18n keys collide with top-level translation objects.

Polish this page only:
1. **Clearer matrix layout** — sticky permission column, tighter role columns, permission label stack (title + key + row actions), category bands that read as module sections.
2. **Fix module names** — map all seed categories (`user`, `proposal`, `client`, `projects`, `pipeline`, `settings`) to `rolesPermissions.categories.*`; never render a non-string translate result.
3. **Default page size = 15** on this page only (`permRows` + paginator options); leave global `DEFAULT_PAGE_SIZE` alone.
4. **Seeds** — not required for the name bug (seed already stores string categories). No API/seed edits in this pack.

## Acceptance Criteria
1. Module/category headers show human labels (e.g. Projects, AI Requests / Pipeline) — never `[object Object]`.
2. Matrix is easy to scan: permission names left (RTL-aware), role checkboxes aligned under role names; less empty mid-table whitespace.
3. First column header reads as permissions (not generic “Actions”).
4. Default rows-per-page on Roles page is **15**; other pages keep existing defaults.
5. Category dropdown includes all seed categories used by permissions.
6. No API, data-model, auth, or business-rule changes.

## Notes
- Screenshot: Roles matrix with `[object Object]` module bands and page size 5.
- Root cause of `[object Object]`: `categoryTitle` falls back to `translate.instant('projects'|'pipeline')`, which returns nested i18n objects.
- Files: `roles-permissions.component.{ts,html,css}`, `assets/i18n/{en,ar}.json`, optional `pagination.constants.ts` page-local constant.
