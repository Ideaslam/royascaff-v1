# Bug #008 — Payment checkout resume throws User Not Found (404)

## Status
**DONE** — Confirmed by user 2026-06-24

## Reported
- **Date**: 2026-06-24
- **Severity**: high
- **Affected area**: backend/subscriptions, backend/payments

## Description
When calling the pay endpoint `POST /api/v1/subscriptions/payments/:paymentId/pay` to resume a pending subscription invoice, the backend returns a `404 Not Found` with message `User not found`.

## Expected Behavior
The endpoint should successfully initialize/resume the PayUp checkout session and return a redirect URL, rather than throwing a 404 error.

## Root Cause
In `SubscriptionsController.payPendingInvoice`, the controller passes `user.currentWorkspaceId ?? user.id` (which is the workspace ID) as the `userId` parameter to `SubscriptionsService.payPendingInvoice`. 
Then, `SubscriptionsService.payPendingInvoice` calls `PaymentCheckoutService.resumePayment` passing the workspace ID as the `userId`.
Inside `PaymentCheckoutService.resumePayment`, it calls `this.usersService.getUserById(userId)`. Since `userId` is actually the workspace ID, the database look up for user fails and throws a `NotFoundException('User not found')`, resulting in a `404 Not Found` response.

## Fix Applied
- Update `SubscriptionsController.payPendingInvoice` to pass both the workspace ID (`user.currentWorkspaceId ?? user.id`) and the actual user's ID (`user.id`) to `SubscriptionsService.payPendingInvoice`.
- Update `SubscriptionsService.payPendingInvoice` signature and implementation to receive both `workspaceId` and `userId` and forward them to `PaymentCheckoutService.resumePayment`.
- Update `PaymentCheckoutService.resumePayment` signature and implementation to receive `workspaceId` and `userId` separately. Verify `payment.userId.toString() === workspaceId` (since workspaceId is stored in `payment.userId`), and fetch the paying user with `usersService.getUserById(userId)`.

## Verification
- [x] Fix implemented in code
- [x] Backend compiles and tests pass
- [x] Invoice payment checkout resumes successfully without throwing 404
- [x] User confirmed

## Related Files
- `roya-ai-dynamo-api/src/modules/subscriptions/controllers/subscriptions.controller.ts`
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts`
- `roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts`
