# Bug #020 — Zid app activation fails after integration

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-08
- **Severity**: high
- **Affected area**: backend/integrations/zid, customer-portal/zid-install

## Description
After integrating with Zid (either from Zid App Market → Dynamo or from Dynamo → Zid OAuth), clicking **Activate** on the Zid app in the Zid merchant/partner dashboard shows an error.

## Expected Behavior
Zid activation should complete the OAuth authorization cycle: Redirection URL → Zid consent → Callback URL → app activated on the store.

## Steps to Reproduce (if applicable)
1. Connect Zid from Dynamo (Data → Connect Zid) OR install from Zid App Market
2. Go to Zid merchant dashboard
3. Click **Activate** on the Roya Dynamo app
4. Error appears (OAuth / authorization server error)

## Root Cause
Two issues combined:

1. **Install redirect (fixed earlier):** `/data/zid/install` redirected to frontend instead of `oauth.zid.sa`.
2. **Callback URL misconfiguration (still blocking):** `ZID_CALLBACK_URL` pointed to the **frontend** Pinggy tunnel (`dash.vnod.net` → port 4200). Zid OAuth callback returned Angular HTML (200) instead of hitting the NestJS API (302). Also `FRONTEND_URL` was `localhost:4200`, breaking post-OAuth redirects via Pinggy.

Runtime proof:
- `tpjryrdqgj.../callback` → HTTP 200 `text/html` (wrong)
- `dapi.vnod.net/callback` → HTTP 302 from NestJS (correct)

## Fix Applied
1. `buildInstallAuthUrl()` + install redirect to `oauth.zid.sa` (previous fix).
2. App Market pending OAuth flow (previous fix).
3. **`.env`:** `ZID_CALLBACK_URL=https://dapi.vnod.net/api/v1/data/zid/callback`, `FRONTEND_URL=https://dash.vnod.net`.
4. **`zid-api.client.ts`:** token exchange uses `application/x-www-form-urlencoded` (Zid standard).
5. **`environment.ts`:** `apiUrl` → `https://dapi.vnod.net/api/v1` for Pinggy HTTPS testing.

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/data/controllers/zid.controller.ts`
- `roya-ai-dynamo-api/src/integrations/connectors/zid/zid-oauth.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/zid-install/zid-install.page.ts`
