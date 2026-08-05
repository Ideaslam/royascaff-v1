# Pages — Safqa Web · Roles (polish delta — matrix style)

### Roles & Permissions `PG-ROLES-01`

## Delta (after-state UI)

### Logic (unchanged)
- Rows = permissions; columns = roles; category grouping; assignment toggles; role CRUD; no permission CRUD.

### Visual
- White/content surface table; hairline row dividers; airy padding.
- **Category row**: bold module title (start) + role names as small muted column headers (center).
- **Permission row**: monochrome line icon + permission label; key under label in muted mono.
- **Cell**: custom toggle — on: solid primary square + check + `common.yes`; off: outlined square + muted `common.no`.
- Top toolbar: search + Add role + Save when dirty; role edit/delete under each role name in sticky thead.
- Paginator remains (default 15).

### Copy
- Prefer existing `common.yes` / `common.no` if present; else add under `rolesPermissions.yes` / `.no`.
