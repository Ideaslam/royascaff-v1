# Bug #042 — Invoice Pay Now blocked by CORS on `idempotency-key`

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-08-26
- **Severity**: high
- **Affected area**: backend/cors (`main.ts`), customer-portal/subscriptions Pay now

## Description
Clicking **Pay now** on an open invoice from `https://dash.vnod.net` fails before the API runs. The browser blocks `POST /api/v1/subscriptions/invoices/:id/pay` because the preflight response does not allow the `idempotency-key` request header.

Error:
`Request header field idempotency-key is not allowed by Access-Control-Allow-Headers in preflight response.`

Switching workspaces is not the cause. The same CORS failure happens on any Pay now from the dashboard origin.

## Expected Behavior
Pay now should pass CORS preflight, reach `POST /subscriptions/invoices/:invoiceId/pay`, and return a PayUp `redirectUrl`.

## Steps to Reproduce (if applicable)
1. Open Subscriptions on `https://dash.vnod.net`.
2. Find an open invoice (e.g. `Free_to_paid`).
3. Click **Pay now**.
4. Browser console shows CORS + `net::ERR_FAILED`.

## Root Cause
`payInvoice` is the only customer-portal call that sends idempotency as a **custom request header**. Other subscription commands put `idempotencyKey` in the JSON body, so they never trigger this preflight check.

- Frontend (`subscriptions.service.ts`): `headers: { 'idempotency-key': this.key() }`
- Backend (`subscriptions.controller.ts`): `req.header('idempotency-key')` — matches EP-SUB-20
- CORS (`main.ts`): `allowedHeaders: ['Content-Type', 'Authorization']` — omits `Idempotency-Key`

The browser therefore sends OPTIONS with `Access-Control-Request-Headers: idempotency-key`. The API replies without that header in `Access-Control-Allow-Headers`, and Chrome blocks the POST. A curl from the terminal has no CORS, so it can succeed.

Workspace switch is unrelated to this error. After CORS is fixed, paying an invoice that belongs to another workspace would be a separate `403` from `startAttempt` ownership check — that is not what the console shows.

## Fix Applied
Added `Idempotency-Key` to Nest CORS `allowedHeaders` in `roya-ai-dynamo-api/src/main.ts` so browser preflight for Pay now can proceed. No frontend or plan change — EP-SUB-20 already specifies the header.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/main.ts`
