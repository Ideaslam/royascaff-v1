# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: —
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Roles & Permissions
- Feature(s): Permission catalog is read-only in UI; users manage roles + assignments only
- Endpoint(s): — (API permission CRUD left for seed/dev; not exposed in web UI)
- Page(s)/View(s): `web` · `/roles-permissions`
- Service(s): —

## Description
Permissions are a static catalog maintained by developers in seed/DB. Workspace users must not create, edit, or delete permissions. They only manage **roles** and which catalog permissions each role has.

Remove from Roles & Permissions page:
- “+ Add permission”
- Per-permission edit / delete controls
- Permission create / edit / delete dialogs and related client handlers

Keep:
- Permission list (read-only matrix rows)
- Role add / edit / delete
- Checkbox assign/unassign + Save changes

## Acceptance Criteria
1. No UI control creates, updates, or deletes a permission.
2. Users can still add/edit/delete roles and toggle permission assignments.
3. Permission labels/keys remain visible in the matrix (read-only).
4. No API/seed changes in this pack (catalog still comes from DB).

## Notes
- Fast-Track (FE-only).
- Follows polish pack `change-20260805-130032` layout; does not re-open polish merge.
