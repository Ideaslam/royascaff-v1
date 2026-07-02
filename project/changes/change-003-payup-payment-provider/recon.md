# Reconnaissance Report — change-003-payup-payment-provider

## 1. Scope Searched

Affected modules: **Admin — Subscriptions (Billing & Payment)**, **Subscriptions**, payment integration.
Repos searched: `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`, `roya-ai-dynamo-frontend-admin`.

---

## 2. Feature State

### Feature: PayUp payment provider (backend integration)
**State: `none`** — no real provider exists. `src/integrations/payment/` has only an interface stub and a
no-op `DefaultPaymentProvider`.

### Feature: Payment-gated self-subscribe
**State: `partial`** — `SubscriptionsService.selfSubscribe` exists (change-001) but **activates the plan
instantly** and returns the in-app `/subscriptions` URL as a placeholder. No payment is taken.

### Feature: Payment log
**State: `partial`** — A `payments` module with a `Payment` schema, repository, admin CRUD service,
controller, and admin page already exist. The schema lacks gateway/session/return-URL fields needed for
a real gateway flow.

### Feature: Event-driven subscription activation
**State: `none`** — no queue/event exists for activation. BullMQ is configured globally
(`background-jobs.module.ts`), queues are registered there, and processors extend `WorkerHost`.

---

## 3. Existing Code Inventory

### Backend — `roya-ai-dynamo-api/src`

| Layer | File | State |
|-------|------|-------|
| Integration interface | `integrations/payment/payment.interface.ts` | Stub — webhook methods only; add checkout methods |
| Integration module | `integrations/payment/payment.module.ts` | `@Global`, provides `PAYMENT_PROVIDER`; add `PayUpProvider` |
| Payment schema | `modules/payments/schemas/payment.schema.ts` | Exists; add gateway/session/return-URL fields |
| Payment repo | `modules/payments/repositories/payment.repository.ts` | Exists; add `findByGatewaySession` / `findById` reuse |
| Payment service | `modules/payments/services/payments.service.ts` | Admin CRUD; add `PaymentCheckoutService` (new file) |
| Payment controller | `modules/payments/controllers/payments.controller.ts` | Admin CRUD; add public `PaymentCheckoutController` (new file) |
| Payments module | `modules/payments/payments.module.ts` | Wire new service/controller/queue |
| Subscriptions service | `modules/subscriptions/services/subscriptions.service.ts` | `selfSubscribe` → delegate to checkout |
| Subscriptions module | `modules/subscriptions/subscriptions.module.ts` | Import payments + register activation queue + processor |
| Subscriptions repo | `modules/subscriptions/repositories/subscription.repository.ts` | `upsertUserSubscription` reused by processor |
| Config | `config/config.ts`, `config/env.validation.ts` | Add `payup.*` block + env vars |
| BG jobs module | `modules/background-jobs/background-jobs.module.ts` | Add + register `subscription-activation` queue |
| Public decorator | `common/decorators/public.decorator.ts` | Reuse for confirm/cancel endpoints |

### Frontend — customer portal `roya-ai-dynamo-frontend/src/app`

| Layer | File | State |
|-------|------|-------|
| Service | `core/services/subscriptions.service.ts` | **Complete** — `subscribe()` returns `{ redirectUrl }` |
| Page | `pages/subscriptions/subscriptions.page.ts` | **Complete** — already `window.location.href = redirectUrl` |

### Frontend — admin panel `roya-ai-dynamo-frontend-admin/src/app`

| Layer | File | State |
|-------|------|-------|
| Service | `core/services/payments.service.ts` | Complete for CRUD/list |
| Model | `core/models/admin.models.ts` | `Payment` interface — add gateway/session fields |
| Page | `pages/admin/payments/payments.page.ts` | Exists; add gateway/session/plan columns |

---

## 4. Plan-vs-Code Drift

| Plan entry | Code state |
|-----------|------------|
| `rules.md` — Billing & Payment: "Must implement payment via `IPaymentProvider`… `PAYMENT_PROVIDER` env var" | Interface exists but no real provider; this change adds PayUp |
| `services.md` — payment external service (provider-agnostic) | Only stub default provider in code |
| change-001 note: "a payment-gateway integration change should follow this one" | This is that change |

No code-without-plan drift found.

---

## 5. Ripple / Impact Map

| Item | Impact | Action |
|------|--------|--------|
| `PaymentProvider` interface | Add `createCheckoutSession` + `getCheckoutSession` | **Modify** |
| `DefaultPaymentProvider` | Must implement new methods (throw "not configured") | **Modify** |
| `PayUpProvider` | New external provider: auth, create session, get session (global `fetch`) | **Create** |
| `payment.module.ts` | Select provider by `PAYMENT_PROVIDER`; provide `PayUpProvider` | **Modify** |
| `Payment` schema | Add `gateway`, `providerSessionId`, `providerSessionToken`, `confirmUrl`, `cancelUrl`, `redirectUrl` | **Modify** |
| `PaymentRepository` | Add lookup used by confirm/cancel | **Modify** |
| `PaymentCheckoutService` | Orchestrates init/confirm/cancel + payment log + enqueue activation | **Create** |
| `PaymentCheckoutController` | Public `GET /payments/payup/confirm|cancel` (302 redirect) | **Create** |
| `SubscriptionsService.selfSubscribe` | Delegate to checkout; stop instant activation | **Modify** |
| `subscription-activation` queue + `SubscriptionActivationProcessor` | Event-driven activation consumer | **Create** |
| `config.ts` / `env.validation.ts` | `payup.*` config + env vars | **Modify** |
| Admin `Payment` model + payments page | Show gateway/session/plan | **Modify** |
| `data-model.md`, `services.md`, `endpoints.md`, `rules.md`, `features.md`, `profile.md`, admin `pages.md` | Sync | **Modify** |

---

## 6. Step 5.1 Direction

| Item | Action |
|------|--------|
| `PayUpProvider` (auth + create session + get session) | **create** |
| `PaymentProvider` interface checkout methods | **modify** |
| `PaymentCheckoutService` (init/confirm/cancel) | **create** |
| Public `PaymentCheckoutController` (confirm/cancel) | **create** |
| `Payment` schema gateway/session/return-URL fields | **modify** |
| `subscription-activation` queue + processor | **create** |
| `SubscriptionsService.selfSubscribe` (gate behind payment) | **modify** |
| PayUp config + env validation | **create/modify** |
| Admin payments page + model (display fields) | **modify** |
| `profile.md` (PayUp integration), `rules.md` (PayUp rule), `services.md`, `endpoints.md`, `data-model.md`, `features.md`, admin `pages.md` | **modify** |
| Customer-portal service/page | **no change** (already correct) |
