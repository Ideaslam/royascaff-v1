# Change Request

## Metadata

- **date**: 2026-06-23
- **change-type**: new-feature
- **target-app**: customer-portal (+ admin-panel for tracking)
- **affected-repos**: backend+frontend+admin
- **priority**: high

---

## Scope

- Module(s): Admin — Subscriptions (Billing & Payment), Subscriptions
- Feature(s): PayUp payment provider (backend integration), Payment-gated self-subscribe, Payment log tracking, Event-driven subscription activation
- Endpoint(s):
  - `POST /api/v1/subscriptions/subscribe` (modify — now starts a real PayUp checkout)
  - `GET /api/v1/payments/payup/confirm` (new — public gateway return)
  - `GET /api/v1/payments/payup/cancel` (new — public gateway return)
- Page(s): admin-panel `payments` (extend to show gateway/session/plan); customer-portal `subscriptions` (no change — already redirects to `redirectUrl`)
- Service(s): `PayUpProvider` (external), `PaymentCheckoutService` (internal, payments module), `SubscriptionActivationProcessor` (BullMQ consumer)

---

## Description

Add **PayUp** as a real payment provider behind the existing `PaymentProvider` interface
(`src/integrations/payment/`), implementing the **backend integration** described in the PayUp API
docs (https://docs-payup.iilm.io/api/reference):

1. **Auth** — exchange API keys for a short-lived SDK token (`POST /v1/auth`): secret key as
   `Authorization: Bearer`, public key via `x-public-key`.
2. **Create session** — `POST /v1/checkout/session` with the selected plan as an inline product
   (`{ name, price, quantity }` — backend integration only), plus our `returnUrl` / `cancelUrl` and
   `metadata` (userId, planId). Returns the hosted-checkout `redirectUrl`.
3. **Verify** — `GET /v1/checkout/session/{token}` to read the authoritative session `status` on return.

The PayUp **API base URL is selected by environment**: `production` → prod host, otherwise sandbox.
A `PAYUP_API_BASE_URL` env var overrides the auto-selection.

**Flow:**

1. Customer clicks Upgrade → `POST /subscriptions/subscribe`.
2. Backend creates a **payment log** (`pending`, gateway `payup`, plan + user + amount) → gets our `paymentId`.
3. Backend builds **confirm/cancel return endpoints** carrying `?ref=<paymentId>` and passes them to PayUp
   in the create-session request.
4. PayUp returns the session token + hosted-checkout `redirectUrl`; backend **updates the payment log**
   with the session id/token and the confirm/cancel URLs, then returns `redirectUrl` to the frontend.
5. Customer pays off-site. PayUp redirects the browser back to our public **confirm** (or **cancel**) endpoint.
6. Confirm endpoint verifies the session with PayUp, updates the payment log (`paid` + `paidAt` + reference),
   and **enqueues a `subscription-activation` BullMQ job** (event-driven, durable/retryable). Cancel endpoint
   marks the log `failed`. Both then 302-redirect the browser back to the portal subscriptions page.
7. The **`SubscriptionActivationProcessor`** consumes the job and activates the user's subscription —
   decoupling payment confirmation from activation.

Self-subscribe **no longer activates instantly**: activation happens only after a confirmed payment.

The **admin payments page** is extended to display gateway, session reference, plan, and status so admins
can track payments and the resulting subscription.

---

## Acceptance Criteria

1. `POST /api/v1/subscriptions/subscribe` with `{ planId }` creates a `pending` payment log and returns
   `{ data: { redirectUrl } }` pointing at the PayUp hosted checkout.
2. The payment log stores gateway `payup`, the PayUp session id/token, the confirm + cancel return URLs,
   plan, user, and amount.
3. PayUp is called only through `src/integrations/payment/` — never from a controller or business service.
4. The PayUp API base URL is sandbox by default and prod when `NODE_ENV=production`, overridable by
   `PAYUP_API_BASE_URL`. API keys come from env vars only and never appear in any response.
5. `GET /payments/payup/confirm?ref=<paymentId>` is public, verifies the session with PayUp, sets the
   payment log to `paid`, enqueues subscription activation, and redirects to the portal.
6. `GET /payments/payup/cancel?ref=<paymentId>` is public, sets the payment log to `failed`, and redirects
   to the portal.
7. Subscription activation runs via a BullMQ job consumed by `SubscriptionActivationProcessor`; the
   subscription is activated only after the payment is confirmed.
8. Duplicate confirm callbacks do not double-activate (idempotent on payment-log status).
9. Audit log entries are written for payment create/confirm and subscription activation.
10. The admin payments page lists gateway, session reference, plan, amount, and status.

---

## Notes

- Builds directly on change-001, whose note said "a payment-gateway integration change should follow this one."
- Reuse the existing `Payment` schema as the payment log — extend it with gateway/session/return-URL fields.
- Keep the `PaymentProvider` interface webhook methods; add `createCheckoutSession` + `getCheckoutSession`.
- No card data, CVV, or raw payment tokens are stored. Frontend never calls PayUp directly.
- HTTP to PayUp uses the Node global `fetch` (no new dependency), isolated inside the provider.
