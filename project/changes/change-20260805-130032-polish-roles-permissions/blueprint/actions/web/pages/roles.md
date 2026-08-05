# Pages — Safqa Web · Roles (polish delta)

### Roles & Permissions `PG-ROLES-01`
- Route: `/roles-permissions`
- Status: done (polish target)

## Delta (after-state UI)

### Layout
- Matrix reads as: **permission identity** (sticky first column) × **role columns** (compact, centered checkboxes).
- First column header: `rolesPermissions.permissionColumn` (“Permission” / “الصلاحية”) — not `common.actions`.
- Permission cell stack: label (primary) → key (muted mono) → edit/delete icons (subtle, end-aligned).
- Role header: name on top, edit/delete icons under — no floating orphan “Actions” label.
- Category band: full-width row with icon + translated module title; clear section separator.
- Reduce mid-table whitespace: role columns fixed/narrow; table `width: max-content` or similar so checkboxes sit near labels when few roles.
- Sticky first column while scrolling horizontally (shadow edge).

### Module / category names
- Always resolve via `rolesPermissions.categories.<key>`.
- Keys covered: `user`, `team`, `proposal`, `client`, `projects`, `pipeline`, `settings`.
- `categoryTitle()` must return a string only (never stringify an i18n object → `[object Object]`).
- Category select options match the same set.

### Pagination (this page only)
- Default `permRows = 15` (`ROLES_PERMISSIONS_PAGE_SIZE`).
- `rowsPerPageOptions`: `[15, 25, 50]` (or include 10 if useful); do **not** change global `DEFAULT_PAGE_SIZE`.

### Copy / i18n
| Key | en | ar |
|-----|----|----|
| `rolesPermissions.permissionColumn` | Permission | الصلاحية |
| `rolesPermissions.categories.projects` | Projects | المشاريع |
| `rolesPermissions.categories.pipeline` | AI requests | طلبات الذكاء الاصطناعي |

### Out of scope
- API seeds, endpoints, role/permission business rules, other pages’ page size.
