# Bug #004 — Checkout OTP rate limit blocks shoppers mid-purchase

## Status
**DONE** — Confirmed: 2026-08-24

## Reported
- **Date**: 2026-08-24
- **Severity**: high
- **Affected area**: payup-api-typescript checkout verification / public rate limiting

## Description
Shoppers cannot finish checkout. After sending an email OTP and entering the code, `POST /api/v1/checkout/verification/verify` returns the message **Rate limit exceeded. Please try again later.** Network headers: `RateLimit-Limit: 5`, `RateLimit-Remaining: 0`, reset ~60s. This is a security control that is blocking legitimate purchases, including retries on the same merchant and later purchases from other merchants.

## Expected Behavior
- Merchant dashboard limits stay separate from shopper checkout.
- A shopper can complete a purchase (send code + verify + pay) without hitting a 5-request cap.
- The same shopper can buy again from the same merchant, and from other merchants.
- OTP send/verify remain limited enough to stop flooding and code guessing.

## Steps to Reproduce (if applicable)
1. Run `npm run stack:prod-sim`.
2. Start an SDK purchase on https://127.0.0.1/.
3. On checkout (localhost:5600), enter email and send code, then verify (retry once if needed).
4. Verify fails with rate-limit message before Next is enabled.

## Root Cause
`CHECKOUT_HIGH_SENSITIVE` was **5 requests / 5 minutes**, then **15-minute block**, shared by tokenize, OTP request, OTP verify, and process. `rateLimiter` ran before token auth, so the key collapsed to `ip` only.

## Fix Applied
1. Auth runs before rate limit on OTP request/verify and payment process so `appId` is present.
2. High-sensitive key is `ip + appId + hashed identifier + route` (not merchant id).
3. `CHECKOUT_HIGH_SENSITIVE` is **30 / 15 min**, `blockDuration: 0`. Prefix `rl:checkout:sensitive:v2`.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

Runtime: `/request` and `/verify` used compound keys with `hasAppId`/`hasIdentifier`, `limit: 30`, `isBlocked: false`. Process then ran with sandbox gateways.

## Related Files
- `payup-api-typescript/src/middleware/rate-limit.ts`
- `payup-api-typescript/src/config/rate-limit.config.ts`
- `payup-api-typescript/src/routes/public-api/v1/checkout/verification/verification.controller.ts`
- `payup-api-typescript/src/routes/public-api/v1/payments/payments.process.controller.ts`

## Notes
Path B. Merchant `MERCHANT_*` tiers unchanged.
