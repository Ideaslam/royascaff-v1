# Bug #045 — Invoice paid but subscription not activated

## Status
**DONE**
**Confirmed**: 2026-09-03

## Reported
- **Date**: 2026-09-03
- **Severity**: high
- **Affected area**: backend/payments (`BillingInvoiceService.ensureLifecycleDelivery`)

## Description
After PayUp checkout, Invoice History shows **Free_to_paid $5.00 paid**, but Current Plan stays **Free Plan**. Log:

`PayUp verification failed for attempt 6a9941db47c9bc7d344a9585: Custom Id cannot contain :`

## Expected Behavior
A paid `free_to_paid` invoice must enqueue `apply-paid-invoice` and switch the workspace to the paid plan immediately. PayUp confirm only verifies settlement; activation is the lifecycle job, not the PayUp callback.

## Steps to Reproduce (if applicable)
1. From Free, upgrade to Basic and complete PayUp.
2. Return to Subscriptions: invoice paid, plan still Free.

## Root Cause
Runtime state for attempt `6a9941db47c9bc7d344a9585` / invoice `6a99303a47c9bc7d344a9533`:

- attempt `verified_paid` at 09:47:00.227Z
- invoice `paid`, `appliedAt: null`
- subscription still on Free plan `6a3b1ab6940c46a82857f483`

Confirm **did** verify PayUp and mark the invoice paid. Then `ensureLifecycleDelivery` used BullMQ `jobId: invoice:${invoiceId}`. BullMQ throws `Custom Id cannot contain :`. The confirm `catch` logged that as a PayUp failure, so the apply job never ran.

Invoice can be paid without activation because `markPaidIfOpen` runs **before** the queue add.

## Fix Applied
Changed BullMQ `jobId` from `invoice:${invoiceId}` to `invoice-${invoiceId}`. Confirming the same paid invoice re-enqueues `apply-paid-invoice` and applies the plan.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/payments/services/billing-invoice.service.ts`
