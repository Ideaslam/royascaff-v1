# Change Request — 010

## Metadata

| Field          | Value                                        |
|----------------|----------------------------------------------|
| change-number  | 010                                          |
| slug           | admin-panel-complete-modules                 |
| change-type    | general                                      |
| target-app     | admin-panel                                  |
| affected-repos | roya-ai-dynamo-frontend-admin, roya-ai-dynamo-api |
| priority       | quality-improvement                          |
| date           | 2026-06-24                                   |

---

## Scope

### Modules Affected
- Admin Panel → Clients Module (modify)
- Admin Panel → Subscriptions Module (modify)
- Admin Panel → Workspaces Module (new)
- Admin Panel → Users Module (new)
- Admin Panel → App Shell / Nav (modify)
- Admin Panel → Global Style (modify)

---

## Description

### Problem
The admin panel lacks complete management coverage for the multi-tenant platform:
1. **Workspaces module is entirely missing** — admins cannot list, view, suspend, or delete workspaces.
2. **Users module is missing** — there is no page for viewing all platform users (the `users` collection, distinct from workspace members/clients).
3. **Clients module is incomplete** — does not show subscription status or workspace memberships for each client.
4. **Subscriptions module has missing fields and poor design** — User Subscriptions tab is missing workspace info; Plans tab has missing fields; both have weak styling.
5. **Card and table styles are inconsistent** — cards lack the colored icon pattern established in the Overview page; table/tab styles vary across pages.

### Key Definitions
- **Client** = a workspace member (a user who belongs to at least one workspace, viewed from workspace-membership context).
- **User** = any record in the global `users` collection (platform-level account, regardless of workspace membership).
- **Workspace** = a multi-tenant workspace entity (`workspaces` collection); the admin can view its name, slug, status (active/suspended), owner, member count, and subscription plan.

### Desired Behavior (Happy Path)
1. Admin opens **Workspaces** page → sees paginated list with: name, slug, owner email, member count, status badge, plan, created date → can suspend, reactivate, or delete any workspace (with confirmation dialog).
2. Admin opens **Users** page → sees paginated list of ALL users with: name, email, role, status badge, last login, created date → can edit, suspend/reactivate, delete (with confirmation).
3. Admin opens **Clients** page → existing functionality retained + new columns: subscription status badge, workspace names the user belongs to.
4. Admin opens **Subscriptions** page → User Subscriptions tab shows workspace name alongside user info + more filters (plan, status) + cleaner design; Plans tab shows all fields including `freeUsers`, `pricePerExtraUserMonthlyUsd`, trial period, and active status.
5. All pages use consistent card/table styles: colored icon backgrounds on stat cards, sticky column headers on tables, uniform filter-bar layout, PrimeNG default tabs.

### Out of Scope
- Backend auth flow changes.
- Customer portal changes.
- Any non-admin-panel pages.

---

## Acceptance Criteria

1. A **Workspaces** page exists at `/app/workspaces` in the admin panel, registered in `app.routes.ts` and visible in the sidebar nav.
2. The Workspaces page lists all workspaces with: name, slug, owner email, member count, status badge, plan name (if linked), created date.
3. Admins can **suspend** a workspace (status → `suspended`), **reactivate** it (status → `active`), and **delete** it — all with confirmation dialogs.
4. A **Users** page exists at `/app/users` in the admin panel, registered in `app.routes.ts` and visible in the sidebar nav.
5. The Users page lists all platform users with: name, email, role badge, status badge, last login, created date — with search, role filter, and status filter.
6. Admins can edit, suspend/reactivate, and delete users from the Users page (with confirmation for destructive actions).
7. The **Clients** page shows two additional columns: subscription status badge and a workspace membership chip list.
8. The **Subscriptions → User Subscriptions** tab shows workspace name, has status + plan filters, and displays a clean design matching the style guide.
9. The **Subscriptions → Plans** tab shows all plan fields: name, description, price/mo, maxDashboards, maxUploads/mo, maxUpdates/mo, freeUsers, pricePerExtraUser, isActive — with a clean design.
10. All pages use consistent styling: colored icon backgrounds on stat/overview cards, uniform filter-bar layout, sticky table headers, PrimeNG default tabs.
11. All new/modified pages remain admin-only (protected by `authGuard` + `adminGuard`).
12. Empty states across all pages display "No records found."
13. The sidebar nav in `app-shell.ts` includes Workspaces and Users links with appropriate icons.
14. The frontend compiles with no TypeScript errors.

---

## Notes

- Backend endpoints for workspaces admin already exist: `GET /workspaces` (admin list), `PATCH /workspaces/:id/status`, `DELETE /workspaces/:id/admin`.
- Backend endpoints for users admin already exist: `GET /users` (admin list), `PUT /users/:id`, `PATCH /users/:id/suspend`, `PATCH /users/:id/reactivate`, `DELETE /users/:id`.
- The Clients page currently uses `GET /users` — after this change, Clients should be re-scoped to show workspace-aware user info. If no dedicated `/clients` endpoint exists, enrich the display from existing data.
- If a new backend endpoint is needed (e.g. to fetch subscription status per user in the clients list), it should be added to the API per `engine/rules/backend-rule.md`.
- New frontend service: `workspaces-admin.service.ts` (already scaffolded).
