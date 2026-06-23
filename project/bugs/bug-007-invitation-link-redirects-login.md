# Bug #007 — Invitation link redirects to login without context

## Status
**DONE** — Confirmed by user 2026-06-24

## Reported
- **Date**: 2026-06-24
- **Severity**: high
- **Affected area**: customer-portal/workspace, backend/workspace

## Description
Clicking the invitation link in the email (via Mailjet tracking redirect) lands on the login page instead of an invitation acceptance flow. The user never sees which workspace they were invited to or gets returned to the accept page after signing in.

Decoded target URL: `http://localhost:4200/workspace/accept-invite/{token}`

## Expected Behavior
1. Invitation link opens a public landing page showing workspace name and invited email
2. Existing users sign in and are returned to accept the invitation
3. New users create an account with the invited email and join the workspace

## Steps to Reproduce
1. Send workspace invitation email
2. Click "Accept Invitation" in email (unauthenticated browser session)
3. Observe redirect to `/auth/login` with no invitation context

## Root Cause
- `/workspace/accept-invite/:token` route had `authGuard`, blocking unauthenticated users before the page could render
- `authGuard` redirected to login without `returnUrl`
- Login always navigated to `/app/projects` after success, ignoring return URL
- Accept API was public GET with side effects; no read-only preview endpoint

## Fix Applied
- Removed `authGuard` from accept-invite route (public landing like `/shared/:token`)
- Added `GET /workspaces/invitation/preview?token=` (public, read-only)
- Changed accept to authenticated `POST /workspaces/invitation/accept` with email match check
- Rewrote accept-invite page: preview → sign in / create account → accept when authenticated
- `authGuard` passes `returnUrl`; login honors it after successful auth
- Register reads `invitationToken`, prefills email, redirects to accept page after signup

## Verification
- [x] Fix implemented in code
- [x] Unauthenticated invite link shows invitation landing (not bare login)
- [x] Sign in returns to accept page and completes join
- [x] New user registration flow joins workspace
- [x] User confirmed

## Related Files
- `roya-ai-dynamo-frontend/src/app/app.routes.ts`
- `roya-ai-dynamo-frontend/src/app/core/guards/auth.guard.ts`
- `roya-ai-dynamo-frontend/src/app/pages/workspace/accept-invite/accept-invite.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/auth/login/login.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/auth/register/register.page.ts`
- `roya-ai-dynamo-api/src/modules/workspace/controllers/workspace-invitation-accept.controller.ts`
- `roya-ai-dynamo-api/src/modules/workspace/services/workspace-invitation.service.ts`
