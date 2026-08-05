# Pages — Safqa Web · Roles (delta)

### Roles & Permissions `PG-ROLES-01`
- Route: `/roles-permissions`
- Components: roles editor, **read-only** permission matrix checkboxes
- Service: AppDataService → EP-ROLES-* (mutate), EP-PERMS-* **list/get only from UI**
- Guard: layout; `roles.manage` for role mutate + assignment save

## Delta (after-state)

### User can
- Search / paginate permission catalog (read)
- Toggle role ↔ permission checkboxes; Save changes
- Add / edit / delete **roles**

### User cannot
- Add permission
- Edit permission (key/label/category)
- Delete permission

### UI removals
- Header: `+ Add permission` button
- Row: permission pencil / trash
- Dialogs: create/edit permission, confirm delete permission
- TS: `openAddPermission`, `openEditPermission`, `savePermission`, `openDeletePermission`, permission form/modal state, `categoryOptions` (only used by create/edit form)

### UI retained
- Permission column (label + key) — no row actions
- Role column headers with edit/delete role
- Matrix checkboxes + unsaved Save changes
