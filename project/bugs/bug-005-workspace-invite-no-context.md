# Bug #005 — Workspace invite returns 403 / 500

## Status
**DONE** — Confirmed by user 2026-06-24

## Reported
- **Date**: 2026-06-24
- **Severity**: high
- **Affected area**: backend/workspace

## Description
When inviting a member via `POST /api/v1/workspaces/:workspaceId/invite`, the inviter (workspace owner) receives errors:
1. 403 "No workspace context" (original)
2. 403 "You are not a member of this workspace" (after guard v1)
3. 500 E11000 duplicate key (after guard v3 backfill)

## Expected Behavior
Workspace owner/admin invites a new member. Guard checks **inviter's** membership in the target workspace — not the invitee's.

## Steps to Reproduce
1. Login as workspace owner (system role `editor` is normal)
2. POST `/api/v1/workspaces/:workspaceId/invite` with email + role
3. Observe 403 or 500

---

## Root Cause (confirmed via runtime logs)

### Actual root cause — `userId` type mismatch in `workspace_memberships`

Membership row **exists** but `findOne` returned null because:
- DB stored `userId` as **string** (legacy from `userId as any` in `createWorkspace`)
- Repository queried with `new Types.ObjectId(userId)` only
- Guard v3 backfill tried `create()` → **E11000 duplicate key** (500)

Server evidence:
```
E11000 duplicate key ... userId: "6a3abc83a469be78b42820b4"
```

### Not the root cause — system role `editor`

JWT `role: editor` is `UserRole.EDITOR` (platform). Workspace ownership is `WorkspaceRole.OWNER` in `workspace_memberships`. See `.ai-control/project/plan/roles-and-authorization.md`.

### Earlier issues (partial fixes)
- v1: Guard read stale JWT `workspaceRole` instead of DB lookup for `:workspaceId`
- v2: `WorkspaceRoleGuard` not registered in `WorkspaceModule` providers
- v3: Owner backfill `create()` — wrong approach; hit duplicate key

---

## Fix Applied (v4 — current)

### 1. `WorkspaceMembershipRepository`
- `findOne` / `updateRole` / `deleteOne` / `findByUserId`: match `userId` as ObjectId **or** legacy string via `$in`
- `create`: normalize `workspaceId` and `userId` to ObjectId

### 2. `WorkspaceRoleGuard`
- DB lookup for inviter membership (not JWT)
- Owner fallback via `workspace.ownerId` (no backfill create)
- Debug instrumentation active until verified

### 3. `auth.service.ts`
- Use `WorkspaceRole.OWNER` enum at registration token issue

### 4. `workspace.service.ts`
- Remove `as any` casts on membership create IDs

---

## Verification
- [x] Fix implemented in code
- [x] Post-fix runtime logs confirm guard allows access
- [x] User confirmed invite succeeds and pending list shows invitations
- [x] Debug instrumentation removed

## Related Files
- `roya-ai-dynamo-api/src/modules/workspace/repositories/workspace-membership.repository.ts`
- `roya-ai-dynamo-api/src/common/guards/workspace-role.guard.ts`
- `roya-ai-dynamo-api/src/modules/workspace/workspace.module.ts`
- `roya-ai-dynamo-api/src/modules/auth/services/auth.service.ts`
- `.ai-control/project/plan/roles-and-authorization.md`
