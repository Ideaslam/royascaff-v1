## Module: In-Portal Admin (admin-guarded)

These pages live inside the Customer Portal and are gated by `adminGuard`. The full admin experience is the separate Admin Panel app.

### Admin Users Page
- Route: `/app/admin/users`
- Components: AdminUsersPage (users table with search, edit role/name, delete confirm)
- Service: UsersService.list() → `GET /api/v1/users`; UsersService.update() → `PUT /api/v1/users/:id`; UsersService.delete() → `DELETE /api/v1/users/:id`
- Guard: authGuard + adminGuard
- Notes: adminGuard redirects non-admins to `/app/projects`.

### Admin Settings Page
- Route: `/app/admin/settings`
- Components: AdminSettingsPage (placeholder)
- Service: None yet
- Guard: authGuard + adminGuard
- Notes: Currently a stub; system settings management is in the Admin Panel app. Known issue: AppShell sidebar links to `/app/dashboards` which has no route and falls through to `/app/projects`.
