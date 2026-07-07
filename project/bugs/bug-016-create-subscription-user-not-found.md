# Bug #016 — Create workspace subscription returns User not found (404)

## Status
**DONE** — Confirmed by user 2026-07-07

## Reported
- **Date**: 2026-07-07
- **Severity**: high
- **Affected area**: backend/subscriptions, admin-portal/subscriptions

## Description
When an admin creates a new workspace subscription via `POST /api/v1/subscriptions`, the backend returns `404 Not Found` with message `User not found`.

## Expected Behavior
The subscription should be created (or activated) for the selected workspace without error.

## Steps to Reproduce
1. Log in to the admin portal as an admin user.
2. Go to Workspace Subscriptions → New Subscription.
3. Select a workspace, plan, dates, and mark as paid.
4. Click Create Subscription.
5. API returns `404` with `"User not found"`.

## Root Cause
Admin frontend sends `workspaceId` in the `userId` field (legacy naming after workspace-scoped subscriptions migration). `SubscriptionsService.createSubscription` validated `dto.userId` against the **User** collection via `userRepo.findById()`, but subscriptions are keyed by `workspaceId`.

**Runtime evidence (2026-07-07):**
- `dtoUserId: 6a4d5b93b3910341491623a5` → `userFound: false`, `workspaceFound: true`, `workspaceName: "Hossam-Eldin Badry's Workspace"`

## Fix Applied
In `createSubscription`, replaced user lookup with workspace existence check (`workspaceModel.findById(dto.userId)`), throwing `Workspace not found` if missing. Matches how `assign`, `change`, and `cancel` already treat `userId` as workspace ID.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts`
