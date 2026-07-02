# Recon — change-010-admin-panel-complete-modules

## Feature State

| Area | State | Notes |
|---|---|---|
| Workspaces page | `none` | No page, no route, service was scaffolded in previous session but the file doesn't exist (was never saved) |
| Users page | `none` | No page, no route |
| Clients page | `partial` | Exists but missing subscription status + workspace memberships |
| Subscriptions – User Subscriptions tab | `partial` | Missing workspace column, no planId filter, weak design |
| Subscriptions – Plans tab | `partial` | All fields present in form but poor visual design |
| App Shell nav | `partial` | Missing Workspaces + Users nav entries |
| Routes | `partial` | Missing `/app/workspaces` and `/app/users` |

## Critical Discovery: Subscription Schema

The `UserSubscription` schema is keyed by **`workspaceId`** (not `userId`).
- `usersubscriptions` collection: `workspaceId` (ref: Workspace), `planId`, `status`, `startDate`, `endDate`, usage fields
- The admin `GET /subscriptions` endpoint returns subscriptions populated with workspaceId (populated as workspace object? — need to verify with `listAllSubscriptions` service)
- **Impact**: The current frontend model `UserSubscription` has `userId` field which is WRONG — the schema uses `workspaceId`. This mismatch must be corrected.

## Backend Endpoints Available

| Endpoint | Guard | Use |
|---|---|---|
| `GET /workspaces` | ADMIN role | Admin list all workspaces (paginated, returns ownerEmail, memberCount) |
| `PATCH /workspaces/:id/status` | ADMIN role | Suspend / reactivate workspace |
| `DELETE /workspaces/:id/admin` | ADMIN role | Hard delete workspace + all its collections |
| `GET /users` | ADMIN role | List all platform users (paginated, search, role, isActive filters) |
| `PUT /users/:id` | ADMIN role | Update user |
| `PATCH /users/:id/suspend` | ADMIN role | Suspend user |
| `PATCH /users/:id/reactivate` | ADMIN role | Reactivate user |
| `DELETE /users/:id` | ADMIN role | Delete user |
| `GET /subscriptions` | ADMIN role | List all subscriptions (status filter, paginated) |
| `GET /subscriptions/plans/all` | ADMIN role | List all plans |

## Plan-vs-Code Drift

1. `admin.models.ts` → `UserSubscription` interface has `userId` field — WRONG, schema uses `workspaceId`
2. `subscriptions-admin.service.ts` → `listAllSubscriptions` sends `?status=` filter but no `planId` filter
3. Clients page confusingly calls `GET /users` but is labeled "workspace members" — needs clarification or rename

## Ripple / Impact Map

| File | Action | Reason |
|---|---|---|
| `core/models/admin.models.ts` | modify | Fix `UserSubscription` interface (workspaceId not userId); add `Workspace` interface |
| `core/services/workspaces-admin.service.ts` | create | Workspace CRUD service |
| `core/services/subscriptions-admin.service.ts` | modify | Add planId filter to listAllSubscriptions |
| `pages/admin/workspaces/workspaces.page.ts` | create | New page |
| `pages/admin/users/users.page.ts` | create | New page |
| `pages/admin/clients/clients.page.ts` | modify | Add subscription status column |
| `pages/admin/subscriptions/subscriptions.page.ts` | modify | Fix model binding (workspaceId), add workspace column, add plan filter, improve design |
| `layouts/app-shell/app-shell.ts` | modify | Add Workspaces + Users nav items |
| `app.routes.ts` | modify | Register /app/workspaces and /app/users |

## Reuse Opportunities

- `ClientsService` (GET /users) can be reused for the Users page — OR UsersService can be used directly (they call the same endpoint)
- `SubscriptionsAdminService.listAllSubscriptions()` can be pre-loaded in the Clients page for enrichment mapping

## Risks

- The `UserSubscription` model drift (userId vs workspaceId) could cause silent data display bugs in the existing Subscriptions page — must fix model
- Workspace delete is destructive (drops all workspace collections) — confirmation dialog is critical
- No backend endpoint for "get user's workspaces" — clients page workspace membership will show count only or be skipped

## Verdict for Step 5.1

| Item | Verdict |
|---|---|
| Workspaces page | Create new |
| Users page | Create new |
| Clients page | Modify (complete it) |
| Subscriptions page | Modify (fix model + design) |
| admin.models.ts | Modify (fix drift) |
| workspaces-admin.service.ts | Create |
| App Shell + Routes | Modify |
