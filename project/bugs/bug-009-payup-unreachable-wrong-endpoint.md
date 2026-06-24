# Bug #009 — Pay invoice fails with PayUp unreachable / route not found

## Status
**DONE** — Confirmed by user 2026-06-25

## Reported
- **Date**: 2026-06-25
- **Severity**: high
- **Affected area**: backend/payments, backend/subscriptions

## Description
When paying a pending invoice, the backend returns a PayUp error (reported as "PayUp unreachable" / route not found) even though PayUp auth succeeds against `https://api.payupconnect.com/api/v1`.

## Expected Behavior
Pay invoice should create a PayUp hosted checkout session and return `{ redirectUrl }` for browser redirect.

## Root Cause
`PayUpProvider.createCheckoutSession` called `POST /checkout/session`, which does not exist on PayUp Connect. Backend integrations must use `POST /checkout/backend/session`. Auth at `/auth` worked (200), but session creation returned 404 (`Cannot POST /api/v1/checkout/session`).

Additionally, session verification on confirm must use the checkout `sdk_token` from the redirect URL and the path token (`ps-…`), not the backend SDK token or internal `sessionId`.

## Fix Applied
- Use `POST /checkout/backend/session` for backend checkout creation.
- Parse the hosted-checkout path token from `redirectUrl` and store it as `providerSessionToken`.
- On confirm, pass the checkout `sdk_token` from `redirectUrl` into `getCheckoutSession`.

## Verification
- [x] Fix implemented in code
- [x] Backend compiles
- [x] Pay invoice returns redirect URL without PayUp error
- [x] User confirmed

## Related Files
- `roya-ai-dynamo-api/src/integrations/payment/payup.provider.ts`
- `roya-ai-dynamo-api/src/integrations/payment/payment.interface.ts`
- `roya-ai-dynamo-api/src/integrations/payment/payment.module.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts`
