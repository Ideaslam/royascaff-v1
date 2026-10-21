# Bug #051 — Captured payments can be lost: late/superseded payments, no webhook/poller, duplicate sessions

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/payments (checkout, settlement)
- **Triage path**: A — Change request (adds a scheduled re-verification job / webhook endpoint)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Money captured by the gateway can end up with no entitlement and no admin signal: payment confirmed after invoice expiry/supersede/void, tab closed before redirect, or two checkout sessions both paid.

## Expected Behavior
Every captured payment is either applied or surfaced for refund/review.

## Steps to Reproduce (if applicable)
1. Start checkout before invoice expiry; redirect arrives after `expireDue` → settle throws Conflict, user sees `payment=pending/review`, nothing applies.
2. Pay and close the tab → attempt PENDING forever.
3. Two tabs without the same Idempotency-Key → two PayUp sessions, both charged; second marked VERIFIED_PAID silently.

## Root Cause
- `roya-ai-dynamo-api/src/modules/payments/repositories/billing-invoice.repository.ts:79-97` `markPaidIfOpen` requires OPEN and `expiresAt > now`; `billing-invoice.service.ts:118-131`; `payment-checkout.service.ts:477-506`.
- `payment-checkout.controller.ts`: only browser `confirm`/`cancel`; no job re-checks PENDING attempts.
- `payment-checkout.service.ts:86-118`: new attempt per key; no reuse of existing PENDING attempt.
- `:91-127`: reused key with cancelled/failed attempt → duplicate-key 11000 rethrown as 500.
- `payments.service.ts:71-102` manual settlement creates VERIFIED_PAID attempt before checking invoice is payable; `reason` not enforced.
- Legacy `confirm?ref=<Payment _id>` (`:316-374`) has no amount/currency check.

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts
- roya-ai-dynamo-api/src/modules/payments/services/billing-invoice.service.ts
- roya-ai-dynamo-api/src/modules/payments/repositories/billing-invoice.repository.ts
- roya-ai-dynamo-api/src/modules/payments/services/payments.service.ts
- roya-ai-dynamo-api/src/modules/payments/controllers/payment-checkout.controller.ts
