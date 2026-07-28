# Roles & Authorization

## Auth strategy
- **Mechanism**: JWT Bearer access token (`Authorization: Bearer`) + refresh token
- **Issuance**: `POST /api/auth/login` / refresh / register flows
- **Storage (web)**: localStorage `auth_session_v1` {`idToken`, `refreshToken`, `expiresAtMs`}; user snapshot `currentUser`
- **Guards (API)**: `WorkspaceAuthGuard` (verify JWT, load user/workspace tenant context); `PermissionGuard('key')` mixin; `OwnershipGuard` where used
- **Guards (Web)**: `authGuard` on MainLayout (REQ-R change-001); `authInterceptor` clears session on 401 → `/login`; `maintenanceGuard` / `maintenancePageGuard`
- **Password**: bcrypt hashes
- **Multi-tenant**: `workspaceId` on JWT/user; Mongo tenant filter on isolated collections

## Seeded roles

| Role key | Name (AR) | Permission keys |
|----------|-----------|-----------------|
| `admin` | مدير النظام | all seeded permissions |
| `sales_manager` | مدير مبيعات | user.create/edit/resetPassword; proposal.create/edit/view; client.create/edit/delete; projects.*; pipeline-traces.read |
| `sales_user` | مستخدم مبيعات | proposal.view/create/edit; client.create/edit; projects.create/view/edit |

Also referenced in code: `workspace_owner` (roles repository default; includes projects.* + pipeline-traces.read).

## Permission catalog (seeded)

| Key | Category |
|-----|----------|
| user.create / user.edit / user.delete / user.resetPassword | user |
| proposal.create / proposal.edit / proposal.delete / proposal.view | proposal |
| client.create / client.edit / client.delete | client |
| projects.create / projects.view / projects.edit / projects.delete | projects |
| pipeline-traces.read | pipeline |
| settings.manage / roles.manage | settings |

## Endpoint access (summary)

| Area | Access |
|------|--------|
| `/api/auth/*` login/register/reset/verify/refresh/logout | public |
| `/api/auth/bootstrap|profile*` | authenticated |
| `/api/public/*` | public |
| Client mutations | permission:`client.create/edit/delete` (+ ownership on edit/delete/logo) |
| Proposal data mutations | permission:`proposal.create/edit/delete` (+ ownership on edit/delete) |
| Proposal ops (info/docs/s3/send) | permission:`proposal.edit` |
| Roles / permissions catalog mutations | permission:`roles.manage` |
| User mutate | permission:`user.create/edit/delete` |
| Settings PATCH | permission:`settings.manage` |
| Projects / pipeline v3 mutate | permission:`projects.*` |
| Pipeline traces GET | permission:`pipeline-traces.read` |
| Services / contracts / service-categories | authenticated (+ ownership where applied); **no** dedicated seed keys yet |
| Admin seed-config / admin users | matching PermissionGuard keys |
| Admin reset | admin role or settings.manage (service check) |

Unauthorized missing permission → **403**.

## Page access (summary)

| Pages | Access |
|-------|--------|
| login/register/verify/reset | public (+ maintenanceGuard) |
| `/client/proposals/:id` | public |
| `/maintenance` | maintenancePageGuard |
| All MainLayout children | `authGuard` (session required) |

## Ownership / scoping
- Workspace isolation enforced in Mongo generic repository for tenant collections
- OwnershipService / OwnershipGuard for resource-level checks where applied
- Dashboard may accept `viewerRole` query for filtered views [INFERRED]
