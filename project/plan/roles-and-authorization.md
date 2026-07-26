# Roles & Authorization

## Auth strategy
- **Mechanism**: JWT Bearer access token (`Authorization: Bearer`) + refresh token
- **Issuance**: `POST /api/auth/login` / refresh / register flows
- **Storage (web)**: localStorage `auth_session_v1` {`idToken`, `refreshToken`, `expiresAtMs`}; user snapshot `currentUser`
- **Guards (API)**: `WorkspaceAuthGuard` (verify JWT, load user/workspace tenant context); `PermissionGuard('key')` mixin; `OwnershipGuard` where used
- **Guards (Web)**: `authGuard` exists but **commented out** on MainLayout; `authInterceptor` clears session on 401 → `/login`; `maintenanceGuard` / `maintenancePageGuard`
- **Password**: bcrypt hashes
- **Multi-tenant**: `workspaceId` on JWT/user; Mongo tenant filter on isolated collections

## Seeded roles

| Role key | Name (AR) | Permission keys |
|----------|-----------|-----------------|
| `admin` | مدير النظام | all seeded permissions |
| `sales_manager` | مدير مبيعات | user.create/edit/resetPassword; proposal.create/edit/view; client.create/edit/delete |
| `sales_user` | مستخدم مبيعات | proposal.view/create/edit; client.create/edit |

Also referenced in code: `workspace_owner` (roles repository default).

## Permission catalog (seeded)

| Key | Category |
|-----|----------|
| user.create / user.edit / user.delete / user.resetPassword | user |
| proposal.create / proposal.edit / proposal.delete / proposal.view | proposal |
| client.create / client.edit / client.delete | client |
| settings.manage / roles.manage | settings |

## Endpoint access (summary)

| Area | Access |
|------|--------|
| `/api/auth/*` login/register/reset/verify/refresh/logout | public |
| `/api/auth/bootstrap|profile*` | authenticated |
| `/api/public/*` | public |
| Most `/api/data/*` and `/api/proposals/*`, `/api/ai*` | authenticated (WorkspaceAuthGuard) |
| User mutate | permission:user.create/edit/delete |
| Settings PATCH | permission:settings.manage |
| Admin seed-config / admin users | matching PermissionGuard keys |
| Admin reset | admin role or settings.manage (service check) |

Note: many data CRUD routes are only `authenticated` at controller level; finer permission checks may be FE-only or OwnershipGuard — **drift risk**.

## Page access (summary)

| Pages | Access |
|-------|--------|
| login/register/verify/reset | public (+ maintenanceGuard) |
| `/client/proposals/:id` | public |
| `/maintenance` | maintenancePageGuard |
| All MainLayout children | intended authenticated; **authGuard currently disabled** |

## Ownership / scoping
- Workspace isolation enforced in Mongo generic repository for tenant collections
- OwnershipService / OwnershipGuard for resource-level checks where applied
- Dashboard may accept `viewerRole` query for filtered views [INFERRED]
