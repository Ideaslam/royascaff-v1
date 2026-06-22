# Reconnaissance Report — change-001-subscription-self-service

## 1. Scope Searched

Affected module: **Subscriptions** (`src/modules/subscriptions/`)
Repos searched: `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`

---

## 2. Feature State

### Feature: Subscribe to a Plan
**State: `partial`**
- Implemented: Frontend Angular service (`subscriptions.service.ts`) calls `POST /subscriptions/subscribe` with `{ planId }` and expects `{ data: { redirectUrl } }`. The page (`subscriptions.page.ts`) redirects to `res.data.redirectUrl` on success.
- Missing: Backend endpoint `POST /api/v1/subscriptions/subscribe`. No controller action, no service method, no DTO for self-subscribe.
- Partial backend foundation: `SubscriptionRepository.upsertUserSubscription(userId, planId)` exists and is already used by admin `assignSubscription` — reusable directly.

### Feature: Cancel My Subscription
**State: `partial`**
- Implemented: Frontend Angular service calls `POST /subscriptions/cancel` with `{}` and expects `{ data: { message } }`. The page calls `cancelSub()` after which it refreshes `getMyCurrent()`.
- Missing: Backend endpoint `POST /api/v1/subscriptions/cancel`. The existing `PATCH /:userId/cancel` is admin-only.
- Partial backend foundation: `SubscriptionRepository.cancelUserSubscription(userId)` exists and is correct — sets `status: cancelled` and `endDate: new Date()`. `SubscriptionsService.cancelSubscription(userId, actorId, ip)` also exists but is called only from the admin PATCH endpoint.

---

## 3. Existing Code Inventory

### Backend — `src/modules/subscriptions/`

| Layer | File | State |
|-------|------|-------|
| Controller | `controllers/subscriptions.controller.ts` | Exists; needs 2 new endpoints |
| Service | `services/subscriptions.service.ts` | Exists; needs 2 new methods |
| DTO | `dto/subscription.dto.ts` | Exists; needs `SelfSubscribeDto` |
| Repository | `repositories/subscription.repository.ts` | Exists; complete — no changes needed |
| Schema | `schemas/user-subscription.schema.ts` | Exists; no changes needed |
| Schema | `schemas/subscription-plan.schema.ts` | Exists; no changes needed |
| Module | `subscriptions.module.ts` | Exists; no changes needed |

### Frontend — `roya-ai-dynamo-frontend/src/app/`

| Layer | File | State |
|-------|------|-------|
| Service | `core/services/subscriptions.service.ts` | **Complete** — `subscribe(planId)` and `cancel()` already implemented |
| Page | `pages/subscriptions/subscriptions.page.ts` | **Complete** — UI and logic already correct |

### Integration — `src/integrations/payment/`

| File | State |
|------|-------|
| `payment.interface.ts` | Stub — only `validateWebhookSignature` and `processWebhookEvent` |
| `payment.module.ts` | Stub — `DefaultPaymentProvider` with no-op implementations |

---

## 4. Plan-vs-Code Drift

| Plan entry | Code state |
|-----------|------------|
| `features.md` — Subscriptions / Feature 3: Subscribe to a Plan — "Planned — backend not implemented" | Confirmed: endpoint missing |
| `features.md` — Subscriptions / Feature 4: Cancel My Subscription — "Planned — backend not implemented" | Confirmed: endpoint missing |

No drift in the other direction (no code without a plan entry).

---

## 5. Ripple / Impact Map

| Item | Impact | Action |
|------|--------|--------|
| `SubscriptionsController` | Needs `POST /subscribe` and `POST /cancel` endpoints | **Add** |
| `SubscriptionsService` | Needs `selfSubscribe(userId, planId)` and `selfCancel(userId)` | **Add** |
| `subscription.dto.ts` | Needs `SelfSubscribeDto { planId: string }` | **Add** |
| `SubscriptionRepository` | `upsertUserSubscription` + `cancelUserSubscription` already exist | **Reuse — no change** |
| `AuditLogService` | Already injected in service; add audit calls for both new methods | **Use existing** |
| `features.md` | Update Feature 3 and Feature 4 status from "planned" to "implemented" | **Update** |
| Frontend service / page | No changes needed — already correct | **None** |

---

## 6. Step 5.1 Direction

| Item | Action |
|------|--------|
| `POST /subscriptions/subscribe` endpoint | **create** |
| `POST /subscriptions/cancel` endpoint | **create** |
| `SubscriptionsService.selfSubscribe` method | **create** |
| `SubscriptionsService.selfCancel` method | **create** |
| `SelfSubscribeDto` | **create** |
| `features.md` Feature 3 + 4 | **modify** (mark as implemented) |
| `endpoints.md` | **complete** (add Endpoints 80 + 81 to Subscriptions section) |
| `services.md` SubscriptionsService entry | **modify** (add two new public methods + SelfSubscribeDto) |
| `pages.md` Page 21 | **modify** (add two new backend endpoints, correct route, expand UI description) |
| `description.md` | no change — subscription self-service was already described in the product spec |
