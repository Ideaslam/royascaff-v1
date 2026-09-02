# Bug #044 — PayUp request contract is stale vs current Public API

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-09-02
- **Severity**: high
- **Affected area**: backend/payments (`PayUpProvider`)

## Description
PayUp Public API requests in Dynamo do not match the current collection (`PayUp222 SaaS API.postman_collection.json`). Create/confirm can fail or settle against the wrong currency after PayUp FX.

Related: [bug-043](./bug-043-payup-confirm-fx-amount-mismatch.md) (confirm `amount_mismatch` / missing checkout token on retry).

## Expected Behavior
Dynamo should call PayUp with the current Public-API contract:

- `POST /v1/auth` — API keys → backend SDK token
- `POST /v1/checkout/session` (BE) — inline product including `currency`
- `GET /v1/checkout/session/{ps-token}` — authoritative status
- Confirm compares **invoice amount/currency** to PayUp **original** amount/currency (exact cents), not the converted SAR total

## Steps to Reproduce (if applicable)
1. Compare `PayUpProvider` to collection folder **Public-API → Checkout → BE Payment Session**.
2. Pay a USD invoice (gateway settles in SAR).
3. Confirm fails `amount_mismatch` or later retries log a missing checkout token.

## Root Cause
`PayUpProvider` still implements the older backend-only surface:

| Call | Dynamo today | Collection (current) |
|------|----------------|----------------------|
| Create | `POST /checkout/backend/session` | `POST /v1/checkout/session` with `be_sdkToken` |
| Product | `{ name, price, quantity }` | `{ name, price, quantity, currency, saveToCatalog }` |
| Headers | no `Origin` | `Origin: {{domain}}` |
| Confirm amount | `totalAmount` / converted `currency` (SAR) | session also has `metadata.currencyConversion.originalAmount` / `originalCurrency` |

Live probe against `PAYUP_API_BASE_URL` (`api.payupconnect.com`) on 2026-09-02:

- `POST /auth` works with current keys (body optional).
- `POST /checkout/backend/session` still **200** (creates session; amount returned as **18.52 SAR** for a $5 product).
- `POST /checkout/session` **404** `Cannot POST /api/v1/checkout/session` on that host.

So the collection is the intended/new contract; this host has not dropped `/checkout/backend/session` yet. The request **body** is wrong on both hosts (no product `currency`). Confirm still compares 18.52 SAR to invoice $5.

Auth path `/auth` matches the collection (`Customer-Backend → auth`).

## Fix Applied
1. Create sends OpenAPI `priceMinor` + `currency` on `POST /checkout/backend/session`, then `/checkout/session`, then legacy `price` if the host still expects decimals.
2. Confirm reads PayUp Money: `currencyConversion.original.minor` + `original.currency` (+ `exponent`). Compares invoice major→minor. No ±0.1 band.
3. Already `failed` / `cancelled` / `expired` attempts redirect without calling PayUp.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/integrations/payment/payup.provider.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.spec.ts`
- `roya-ai-dynamo-api/src/integrations/payment/payup.provider.spec.ts`
