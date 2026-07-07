# Bug #015 — Zid OAuth authorize URL empty client_id / redirect_uri

## Status
**DONE** — **Confirmed**: 2026-07-07

## Reported
- **Date**: 2026-07-06
- **Severity**: high
- **Affected area**: backend/integrations/connectors/zid, dev API env config

## Description
Zid OAuth failed after login on `/app/zid-install` with Zid error "لم يتم إيجاد التطبيق" (application not found).

## Expected Behavior
OAuth authorize URL includes valid `client_id` and `redirect_uri`; merchant completes Zid consent and returns to Dynamo setup wizard.

## Root Cause
Dev API server (`dynamo-api-dev.iilm.io`) was missing `ZID_APP_ID` and `ZID_CALLBACK_URL` env vars. OAuth URL was built as `client_id=&redirect_uri=` (empty), causing Zid to reject the request.

## Fix Applied
1. **Ops**: Set `ZID_APP_ID`, `ZID_APP_SECRET`, `ZID_CALLBACK_URL`, and `FRONTEND_URL` on dev API deployment to match Partner Dashboard.
2. **Code**: Added fail-fast guard in `ZidOAuthService.buildAuthUrl()` when Zid env vars are missing (returns clear 503 instead of broken OAuth redirect).

## Verification
- [x] Dev env vars match Partner Dashboard URLs
- [x] OAuth authorize URL includes populated `client_id` and `redirect_uri`
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/integrations/connectors/zid/zid-oauth.service.ts`
