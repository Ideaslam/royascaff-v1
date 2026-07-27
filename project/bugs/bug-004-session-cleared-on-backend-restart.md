# Bug #004 — Session cleared on backend restart

## Status
**DONE** — Confirmed 2026-07-27

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: frontend auth (`roya-sales-ai-frontend` — AuthService / auth interceptor)

## Description
After restarting the NestJS backend, the frontend JWT/session is cleared and the user must log in again — even though access/refresh tokens should still be valid.

## Expected Behavior
Restarting the backend should not force re-login while a valid refresh token (and non-expired access token) remains in `localStorage`. Transient API downtime or a single 401 should attempt refresh before clearing the session.

## Steps to Reproduce (if applicable)
1. Log in to the frontend (tokens stored in `localStorage` as `auth_session_v1`).
2. Restart the NestJS API (`roya-sales-ai-api-v2`).
3. Reload the frontend (or wait for an API call during downtime).
4. User is redirected to `/login`; tokens are gone.

## Root Cause
Backend auth is durable across restart:
- `JWT_SECRET` comes from env (not regenerated on boot).
- Refresh tokens live in Mongo (`auth_tokens`).
- Access JWTs are stateless and remain valid if the secret is unchanged.

The forced logout is frontend-only:
1. `AuthService.ensureSessionLoaded()` (APP_INITIALIZER) calls bootstrap/refresh; **any** failure (network while API is down, 401, etc.) runs `tokens.clear()` and wipes a still-valid refresh token.
2. `authInterceptor` clears tokens and redirects to login on **every** HTTP 401 with **no** refresh-and-retry.

So a brief backend restart that causes hydrate failure or a 401 permanently ends the session.

## Fix Applied
Frontend session handling (Path B):
1. `ensureSessionLoaded` retries hydrate/refresh on transient failures; clears local session only on 401/403 auth rejection.
2. `authInterceptor` single-flight refreshes on 401, retries the request once; logout only if refresh fails.
3. `authGuard` accepts cached user or a still-valid refresh session so brief API downtime does not force login.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/core/services/auth.service.ts`
- `roya-sales-ai-frontend/src/app/core/interceptors/auth.interceptor.ts`
- `roya-sales-ai-frontend/src/app/core/guards/auth.guard.ts`
