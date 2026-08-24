# Bug #003 — Sandbox gateway rejected on production API

## Status
**DONE** — Confirmed: 2026-08-24

## Reported
- **Date**: 2026-07-07
- **Severity**: high
- **Affected area**: payup-api-typescript payment flow / gateway selection / SDK sandbox tokens

## Description
After deploying the API to production (`NODE_ENV=production`), sandbox payments fail with "no gateway exists" / "No active gateways configured". User suspects production server does not accept sandbox tokens even when sandbox gateways are configured in the merchant panel.

## Expected Behavior
Sandbox client tokens (`tk_*` with `environment: sandbox`) should resolve **sandbox** gateway credentials regardless of server `NODE_ENV`. Live tokens should resolve live gateways. Session creation and payment processing must use the **token environment**, not the server's deployment environment.

## Steps to Reproduce (if applicable)
1. Deploy API with `NODE_ENV=production` (or run locally: `npm run api:prod` from repo root)
2. Configure sandbox gateway credentials for an app in the merchant panel
3. Initiate payment via SDK test page with a sandbox client token (`data-env` / sandbox token)
4. Complete checkout flow — error occurs at session creation or payment processing

## Root Cause
**Under investigation with runtime logs.** Primary suspect: `PaymentService.createPayment()` derives gateway environment from `config.nodeEnv` instead of the token/session environment:

```typescript
const environment = config.nodeEnv == 'production' ? EnvironmentType.LIVE : EnvironmentType.SANDBOX;
```

`PaymentSessionService.createPaymentSession()` correctly uses `input.tokenEnvironment`. This mismatch means session creation may succeed (sandbox gateways found) but payment processing on production API queries **live** gateways → empty list → "No active gateways configured".

Secondary suspects: no sandbox gateways in production DB; inactive catalog entries; `config.environment` field mismatch on gateway documents.

## Fix Applied
`PaymentService.createPayment()` uses `input.environment` / `metadata.tokenEnvironment` instead of `NODE_ENV`. Process controller passes `verificationData.environment`.

## Verification
- [x] Fix implemented in code
- [x] `npm run test:sdk` passes
- [x] Sandbox flow works with `npm run stack:prod-sim` locally
- [x] User confirmed fix resolves the issue

Runtime: `nodeEnv: production`, `tokenEnvironment: sandbox`, `resolvedEnvironment: sandbox`; Moyasar sandbox gateways returned.

## Related Files
- `payup-api-typescript/src/services/payment/payment-service.ts`
- `payup-api-typescript/src/routes/public-api/v1/payments/payments.process.controller.ts`
- `payup-api-typescript/tests/sdk-payment-environment.test.ts`
- `package.json` (root env runner scripts)
- `scripts/run-api.sh`
