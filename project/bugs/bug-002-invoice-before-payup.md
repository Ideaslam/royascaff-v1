# Bug #002 — PayUp called before invoice payment step

## Status
**DONE** — Fix confirmed by user

## Reported
- **Date**: 2026-06-23
- **Confirmed**: 2026-06-23
- **Severity**: high
- **Affected area**: backend/subscriptions, backend/payments, customer-portal/subscriptions

## Description
When a customer subscribes/upgrades/downgrades or an admin creates a subscription with `paid=false`, the backend immediately calls PayUp via `initiateSubscriptionCheckout()`. The correct flow is: create a pending invoice first, then start PayUp only when the customer clicks **Pay now** on the pending invoice.

## Expected Behavior
1. Subscribe/upgrade/downgrade/admin-unpaid → create pending invoice only (no PayUp call)
2. Customer sees invoice under Pending Invoices
3. Customer clicks Pay now → `resumePayment()` → PayUp checkout starts

## Root Cause
`PaymentCheckoutService.initiateSubscriptionCheckout()` combines invoice creation and PayUp session creation in one method. Both customer and admin unpaid paths call it immediately.

## Fix Applied
Split invoice creation from PayUp: add `createPendingInvoice()`, use it for subscribe/upgrade/downgrade/admin-unpaid; PayUp only in `resumePayment()`. Update customer portal to refresh pending invoices instead of redirecting on plan selection.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts`
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts`
- `roya-ai-dynamo-frontend/src/app/core/models/subscription.models.ts`
