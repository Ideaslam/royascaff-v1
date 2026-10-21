# Bug #060 — Invoice endpoints authorize one workspace but act on another

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/subscriptions controller, common/guards (security)
- **Triage path**: B — Direct fix (controller handlers only)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
`WorkspaceRoleGuard` resolves the workspace from `request.body.workspaceId` before `user.currentWorkspaceId`, but `GET me/invoices` and `POST invoices/:invoiceId/pay` use `user.currentWorkspaceId`. A non-owner member of workspace A who owns workspace B can list A's invoices and start payment attempts on them.

## Expected Behavior
Handlers act on exactly the workspace the guard authorized.

## Steps to Reproduce (if applicable)
1. User is member of A (current) and owner of B.
2. `GET /subscriptions/me/invoices` with body `{"workspaceId":"B"}` → guard passes on B, returns A's invoices.

## Root Cause
`roya-ai-dynamo-api/src/common/guards/workspace-role.guard.ts:37-41` vs `roya-ai-dynamo-api/src/modules/subscriptions/controllers/subscriptions.controller.ts:293-325`; these routes have no body DTO so `forbidNonWhitelisted` doesn't reject the extra field.

## Fix Applied
_Applied 2026-10-21:_
- `subscriptions/controllers/subscriptions.controller.ts`: new private `assertGuardedWorkspace(req, user)` — throws `403 Workspace does not match the current workspace` when `body.workspaceId` is present and differs from `user.currentWorkspaceId`. Called in `GET me/invoices` and `POST invoices/:invoiceId/pay` (the two routes without a whitelisting body DTO). Upgrade/downgrade/auto-renew are already protected by `forbidNonWhitelisted` DTOs.
- Shared `WorkspaceRoleGuard` left unchanged (avoids touching every workspace-scoped route).

**Verification:** new unit spec `subscriptions.controller.spec.ts` (3 tests): mismatched body workspace rejected for list + pay; no body / same workspace allowed and scoped to `currentWorkspaceId`. Unit suites subscriptions+payments 51/51 pass.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/controllers/subscriptions.controller.ts
- roya-ai-dynamo-api/src/modules/subscriptions/controllers/subscriptions.controller.spec.ts
