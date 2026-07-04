# Roles & Authorization — Two-Layer Model

> **Do not unify into a single role field.** This app intentionally uses two independent role systems. Bug fixes and guards must use the correct layer for each check.

---

## Layer 1 — System Role (`UserRole`)

| Property | Value |
|---|---|
| **Stored on** | `users.role` |
| **Enum** | `UserRole` in `auth/schemas/user.schema.ts` |
| **Values** | `admin`, `editor`, `viewer` |
| **JWT claim** | `role` |
| **Guard** | `RolesGuard` + `@Roles()` decorator |

**Purpose:** Platform-wide permissions.

| Value | Meaning |
|---|---|
| `admin` | Platform super-admin. Bypasses workspace role checks in `WorkspaceRoleGuard`. |
| `editor` | Default for registered customers at signup. **Not** a workspace permission. |
| `viewer` | Read-only system role (if used). |

**Important:** A workspace owner normally has `users.role = editor`. That is correct. Ownership is **not** expressed here.

---

## Layer 2 — Workspace Role (`WorkspaceRole`)

| Property | Value |
|---|---|
| **Stored on** | `workspace_memberships.role` |
| **Enum** | `WorkspaceRole` in `workspace/schemas/workspace-membership.schema.ts` |
| **Values** | `workspace-owner`, `workspace-admin`, `workspace-member` |
| **JWT claim** | `workspaceRole` (current workspace at token issue time only — may be stale) |
| **Guard** | `WorkspaceRoleGuard` + `@WorkspaceRoles()` decorator |

**Purpose:** Permissions within a **specific workspace**. A user can hold different workspace roles in different workspaces.

| Value | Typical capabilities |
|---|---|
| `workspace-owner` | Full control, invite/remove members, delete workspace |
| `workspace-admin` | Manage members, settings (not delete workspace) |
| `workspace-member` | Use workspace resources |

---

## Authorization Rules for Developers & AI

1. **Workspace-scoped endpoints** (path includes `:workspaceId`):
   - Always resolve permission via `WorkspaceMembershipRepository.findOne(workspaceId, userId)`.
   - **Never** use `user.role` (system) or JWT `workspaceRole` alone — load from DB for the target workspace.

2. **Platform-scoped endpoints** (admin panel, global settings):
   - Use `RolesGuard` with `@Roles(UserRole.ADMIN)`.

3. **JWT payload fields:**
   - `role` → system role (`editor` for customers is expected).
   - `workspaceRole` → snapshot at login; informational only for guards.

4. **Registration flow:**
   - Creates `users.role = editor` (system).
   - Creates `workspace_memberships.role = workspace-owner` (workspace).
   - Both are created; they answer different questions.

5. **Data integrity — `workspace_memberships.userId`:**
   - Must be stored as `ObjectId`. Legacy rows may have string `userId`.
   - Repository queries must match both ObjectId and string until data is migrated.
   - Always pass IDs through repository helpers that normalize types.

6. **Same pattern applies to `workspace_invitations.workspaceId`:**
   - Legacy invites may have string `workspaceId`; list/create queries must use `$in: [ObjectId, string]`.
   - `WorkspaceInvitationRepository` normalizes on create and flexible match on read.

---

## Common Mistakes (avoid in bug fixes)

| Mistake | Why it fails |
|---|---|
| Changing `users.role` to `workspace-owner` | Wrong collection; breaks system role semantics |
| Comparing JWT `role: editor` to `WorkspaceRole` | Different enums, different purpose |
| Using JWT `workspaceRole` without DB lookup | Stale if user switched workspace or token is old |
| Querying membership with ObjectId only | Misses legacy string `userId` rows → false "not a member" |

---

## Related Code

- `src/common/guards/roles.guard.ts` — system role
- `src/common/guards/workspace-role.guard.ts` — workspace role (DB lookup)
- `src/modules/workspace/repositories/workspace-membership.repository.ts` — membership queries
- `src/modules/auth/strategies/jwt.strategy.ts` — attaches both roles to `request.user`

## Related Bugs

- Bug #005 — invite 403 caused by ObjectId vs string `userId` mismatch in membership lookup (not by `editor` system role)