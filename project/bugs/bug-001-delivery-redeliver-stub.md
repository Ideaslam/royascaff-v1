# Bug #001 — Delivery Redeliver Endpoint Stub

## Status
**DONE** — **Confirmed**: 2026-06-30

## Reported
- **Date**: 2026-06-30
- **Severity**: medium
- **Affected area**: backend / notifications / `POST /notifications/deliveries/:id/redeliver`

## Description
The redeliver endpoint existed and returned `{ success: true }`, but never queued a delivery job. Merchants could not manually retry failed webhook/email notifications.

## Expected Behavior
Calling `POST /api/merchant/v1/notifications/deliveries/:id/redeliver` should:
1. Verify the delivery belongs to the merchant's app
2. Re-resolve the channel target (e.g. active webhook endpoint)
3. Reset delivery status to `pending`
4. Enqueue a job on `notif-deliveries` for the delivery worker to send again

## Root Cause
`NotificationDeliveryService.redeliver()` was a placeholder that only checked delivery existence and returned `"Redelivery not yet implemented"`.

## Fix Applied
- Implemented full `redeliver(id, userId)` in `NotificationDeliveryService`:
  - App ownership check via `AppService.getApp`
  - Rule + channel validation
  - Rebuild `EventContext` from stored `payloadSnapshot` + merchant contacts
  - Re-resolve target via channel registry
  - Reset status to `pending` and enqueue BullMQ job with unique job ID
- Controller passes `req.user.id` for ownership validation

## Verification
- [x] Fix implemented in code
- [x] `npm run type-check` passes
- [x] User confirmed fix resolves the issue

## Related Files
- `payup-api-typescript/src/services/notifications/notification-delivery-service.ts`
- `payup-api-typescript/src/routes/merchant-panel/v1/notifications/notifications.controller.ts`
- `.ai-control/project/actions/backend/services/notifications.md`
- `.ai-control/project/actions/backend/endpoints/gateways.md`
- `.ai-control/project/verify/blueprint-review.md`
