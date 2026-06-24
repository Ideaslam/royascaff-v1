# Change Request

## Metadata

- **date**: 2026-06-22
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

---

## Scope

- Module(s): Subscriptions
- Feature(s): Subscribe to a Plan, Cancel My Subscription
- Endpoint(s): POST /api/v1/subscriptions/subscribe, POST /api/v1/subscriptions/cancel
- Page(s): subscriptions (existing — no change needed)
- Service(s): SubscriptionsService

---

## Description

Two customer self-service subscription endpoints are planned in the backend but were never implemented.
The Customer Portal already calls `POST /api/v1/subscriptions/subscribe` (expecting `{ data: { redirectUrl } }`)
and `POST /api/v1/subscriptions/cancel` (expecting `{ data: { message } }`), but both return 404.

This change implements both missing backend endpoints so the subscription page works end-to-end:

1. **Subscribe** (`POST /subscriptions/subscribe`): an authenticated user selects a plan; the backend
   assigns the subscription (using the existing `upsertUserSubscription` repository method) and returns
   a redirect URL pointing to the subscriptions billing page. The payment gateway interface will be
   extended with `createCheckoutSession` in a future change; for now the default provider skips payment
   and returns the in-app URL so the flow is unblocked.

2. **Cancel** (`POST /subscriptions/cancel`): an authenticated user cancels their own active subscription;
   the backend calls the existing `cancelUserSubscription` repository method and returns a success message.

No frontend changes are required — the Angular service and page already implement these calls correctly.

---

## Acceptance Criteria

1. `POST /api/v1/subscriptions/subscribe` with `{ planId }` assigns the plan to the requesting user and returns `{ data: { redirectUrl: "/subscriptions" } }`.
2. If the plan does not exist, the endpoint returns `404`.
3. `POST /api/v1/subscriptions/cancel` cancels the requesting user's active subscription and returns `{ data: { message: "Subscription cancelled." } }`.
4. If the user has no subscription, the cancel endpoint returns `404`.
5. Both endpoints require JWT authentication (no admin role required).
6. Audit log entries are written for both actions.
7. The Customer Portal subscriptions page can subscribe to a plan and cancel without receiving a 404 error.

---

## Notes

- The PaymentProvider interface currently has no `createCheckoutSession` method. This change does NOT
  add real payment-gateway billing — it unblocks the frontend flow by assigning subscriptions directly.
  A payment-gateway integration change should follow this one.
- Do not add `@Roles(UserRole.ADMIN)` to these endpoints — they are user-facing, not admin-only.
- Reuse the existing `cancelUserSubscription` repository method (already correct logic).
- Follow the same audit log pattern used in `assignSubscription`.
