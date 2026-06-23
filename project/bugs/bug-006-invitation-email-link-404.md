# Bug #006 — Invitation email link returns 404

## Status
**DONE** — Confirmed by user 2026-06-24

## Reported
- **Date**: 2026-06-24
- **Severity**: high
- **Affected area**: backend/workspace, customer-portal

## Description
Clicking the invitation link in the email returns 404:
`Cannot GET /workspaces/invitation/accept?token=...`

## Expected Behavior
Link opens the frontend accept-invite page, which calls the API after auth.

## Steps to Reproduce
1. Send workspace invitation email
2. Click "Accept Invitation" in email
3. Browser hits API URL without `/api/v1` → 404 JSON error

## Root Cause
Invitation emails used `app.apiBaseUrl/workspaces/invitation/accept?token=...`:
- Missing Nest global prefix `/api/v1`
- Raw API endpoint returns JSON, not a user-facing page
- Frontend route is `/workspace/accept-invite/:token` on `app.frontendUrl`

## Fix Applied
- Added `buildAcceptInviteUrl()` using `app.frontendUrl/workspace/accept-invite/:token`
- Updated `invite()` and `resendInvite()` email links

## Verification
- [x] Fix implemented in code
- [x] New/resend email link opens frontend accept page (not 404)
- [x] User confirmed
- [x] Debug instrumentation removed

## Related Files
- `roya-ai-dynamo-api/src/modules/workspace/services/workspace-invitation.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/workspace/accept-invite/accept-invite.page.ts`
- `roya-ai-dynamo-api/src/main.ts` (global prefix `api/v1`)
