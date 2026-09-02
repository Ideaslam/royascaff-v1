# Bug #043 — PayUp confirm fails after FX conversion (token missing on retry)

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-08-26
- **Severity**: high
- **Affected area**: backend/payments (`PaymentCheckoutService.confirm`, `PayUpProvider.getCheckoutSession`)

## Description
`GET /api/v1/payments/payup/confirm?ref=…` does not settle a paid invoice. The customer returns from PayUp hosted checkout and the portal/API ends in a failed/pending payment.

Reported error (retry of attempt `6a8eb860bed517f271c67f03`):

`PayUp verification failed for attempt 6a8eb860bed517f271c67f03: PayUp checkout token is missing for session verification`

The open invoice (`6a8eb35cd2cf97d32083a3b2`, `free_to_paid`, **$5 USD**) still has status `open`. Two PayUp attempts on that invoice already reached PayUp and were marked `failed` with `amount_mismatch`.

## Expected Behavior
After a successful PayUp payment, confirm should verify the session in the **invoice currency/amount** ($5 USD), mark the attempt `verified_paid`, settle the invoice, and redirect to `/subscriptions?payment=success`.

A later hit of the same confirm URL on an already-failed attempt should redirect to `payment=failed`, not re-call PayUp and log a missing-token error.

## Steps to Reproduce (if applicable)
1. Open an actionable invoice priced in USD (e.g. Basic Plan $5).
2. Click **Pay now** and complete PayUp checkout (gateway currency is SAR).
3. PayUp redirects to `GET /api/v1/payments/payup/confirm?ref=…`.
4. First return marks the attempt `failed` / `amount_mismatch` (invoice stays `open`).
5. Reload the same confirm URL → log: checkout token is missing.

## Root Cause
PayUp converts the session to the gateway currency before returning status. A $5 USD invoice becomes **18.52 SAR** (`exchangeRate` 3.7037). `GET /v1/checkout/session/{token}` returns:

- `totalAmount: 18.52`, `currency: SAR`
- `metadata.currencyConversion.originalAmount: 5`, `originalCurrency: USD`

`PayUpProvider.getCheckoutSession` maps `amount` from `totalAmount` and `currency` from the converted session. `confirmInvoiceAttempt` then fail-closes:

```
Math.abs(Number(status.amount) - invoice.amount) > 0.005  → amount_mismatch
```

`markAttemptTerminal` wipes `redirectUrl` / `providerSessionToken`. The confirm handler does **not** short-circuit on `failed`, so a repeat of the same `ref` extracts no `sdk_token` and `getCheckoutSession` throws *PayUp checkout token is missing for session verification*.

The missing-token message is the retry symptom. The first failure is the FX amount comparison.

Product `currency` is also omitted on `POST /checkout/backend/session` (PayUp still defaulted the diagnostic to USD, then converted to SAR).

## Fix Applied
Proposed (not applied yet):

1. In `PayUpProvider.getCheckoutSession`, when `metadata.currencyConversion` is present, settle against `originalAmount` / `originalCurrency` (the amount we charged), not the gateway-converted `totalAmount` / `currency`.
2. Send `currency` on the inline product in `createCheckoutSession`.
3. In `confirm` / `confirmInvoiceAttempt`, if the attempt is already `failed` / `cancelled` / `expired`, redirect to the matching portal result without calling PayUp.

Existing failed attempts cannot be auto-settled (tokens already wiped). Customer must **Pay now** again; PayUp may already have captured the earlier SAR charges and those should be checked/refunded in PayUp.

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/integrations/payment/payup.provider.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.spec.ts`
