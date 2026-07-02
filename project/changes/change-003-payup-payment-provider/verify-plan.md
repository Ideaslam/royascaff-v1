# Pre-Build Plan Verification — change-003-payup-payment-provider

## Overall: PASS

---

## 1. Feature Coverage

- ✓ "PayUp Gateway Checkout (backend integration)" added under `features.md` → Admin — Payments (Feature 2)
- ✓ Self-subscribe upgraded (Subscriptions Feature 3) → Endpoint 80 modified
- ✓ Confirm/cancel returns → Endpoints 82, 83 (new)
- ✓ Event-driven activation → `subscription-activation` queue + `SubscriptionActivationProcessor` documented in `services.md` and `data-model.md`

## 2. Service Coverage

- ✓ Endpoint 80 → `SubscriptionsService.selfSubscribe` → `PaymentCheckoutService.initiateSubscriptionCheckout` (both in `services.md`)
- ✓ Endpoints 82/83 → `PaymentCheckoutService.confirm` / `.cancel` (in `services.md`)
- ✓ `PayUpProvider` (external) documented and bound to `PAYMENT_PROVIDER`
- ✓ `SubscriptionsService.activateFromPayment` added for the processor to call
- ✓ No service referenced that does not exist in `services.md`

## 3. Data Model Consistency

- ✓ `Payment` entity extended with `gateway`, `providerSessionId`, `providerSessionToken`, `confirmUrl`, `cancelUrl`, `redirectUrl` in `data-model.md`
- ✓ `subscription-activation` queue documented in `data-model.md`
- ✓ `PaymentStatus` enum unchanged (`paid`/`pending`/`refunded`/`failed`) — cancel maps to `failed`
- ✓ All referenced entities (`Payment`, `UserSubscription`, `SubscriptionPlan`, `User`) exist

## 4. Endpoint-Page Linking

- ✓ Customer-portal subscriptions page already consumes `POST /subscriptions/subscribe` returning `{ redirectUrl }` — unchanged contract
- ✓ Confirm/cancel are browser-redirect targets (not called by an Angular service) — no page binding needed
- ✓ Admin payments page endpoints unchanged (list/create/update/delete); only display fields extended

## 5. Auth Declarations

- ✓ Endpoint 80: `JWT` (any authenticated user)
- ✓ Endpoints 82/83: `Public` (`@Public()`) — required for browser redirect from PayUp; correlated by our `paymentId`
- ✓ Admin payments endpoints remain `JWT + admin`

## 6. Custom Rules Coverage

- ✓ New external integration (PayUp) covered by an updated rule in `project/rules.md` (Billing & Payment) — provider isolation, env-only secrets, public-but-correlated returns, idempotency, no activation before confirm
- ✓ New async/event mechanism (`subscription-activation` BullMQ) covered — durable, retryable, decoupled
- ✓ Frontend-isolation rule respected — frontend never calls PayUp; only `environment.apiUrl`
- ✓ `profile.md` Integrations updated to name PayUp + env vars

## Summary

All scoped checks pass. The plan is internally consistent: the new provider, orchestration service,
public return endpoints, payment-log fields, and the event-driven activation queue are all specified and
cross-referenced. Ready to proceed to Step 5.4 — Implement Code Changes.
