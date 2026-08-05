# Pages — Safqa Web · Roles

### Roles & Permissions `PG-ROLES-01`
- Route: `/roles-permissions`
- Status: done
- Components: roles editor; **read-only** permission catalog matrix with Yes/No assignment toggles
- Service: AppDataService → EP-ROLES-* (mutate roles/assignments); EP-PERMS-* **list/get only from UI**
- Guard: layout; `roles.manage` for role mutate + assignment save

#### UI notes
- Permission catalog is developer/seed owned — no Add/Edit/Delete permission in the web UI.
- Users manage **roles** (CRUD) and toggle which catalog permissions each role has; Save persists role assignments.
- Matrix logic: **rows = permissions**, **columns = roles**, grouped by module category.
- Visual style: clean white matrix; category bands with bold module title + muted role sub-headers; permission rows with line icon + label + key; cells are Yes/No toggles (primary filled check + Yes / outlined + muted No).
- Sticky permission column (wide); roomy role columns; hairline row dividers; search + Add role in header.
- Module/category headers resolve via `rolesPermissions.categories.*` (never bare keys that collide with top-level i18n objects).
- Default permission page size on this page: **15** (`ROLES_PERMISSIONS_PAGE_SIZE`); global `DEFAULT_PAGE_SIZE` unchanged.
