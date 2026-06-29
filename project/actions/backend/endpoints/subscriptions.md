## Module: Subscriptions

`@Controller('subscriptions')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-SUB-01 | GET | /api/v1/subscriptions/plans | JWT | none | 200 `PlanDto[]` | SVC-SUB.listPlans() | Active plans only |
| EP-SUB-02 | GET | /api/v1/subscriptions/plans/all | JWT+admin | none | 200 `PlanDto[]` | SVC-SUB.listAllPlans() | Includes inactive |
| EP-SUB-03 | POST | /api/v1/subscriptions/plans | JWT+admin | `CreatePlanDto` { name, description?, priceMonthlyUsd, maxDashboards, maxDataUploadsPerMonth, maxDataUpdatesPerMonth, isActive? } | 201 `PlanDto` | SVC-SUB.createPlan() | |
| EP-SUB-04 | PUT | /api/v1/subscriptions/plans/:id | JWT+admin | `:id` · `UpdatePlanDto` | 200 `PlanDto` | SVC-SUB.updatePlan() | |
| EP-SUB-05 | DELETE | /api/v1/subscriptions/plans/:id | JWT+admin | `:id` param | 204 | SVC-SUB.deletePlan() | |
| EP-SUB-06 | GET | /api/v1/subscriptions/me | JWT | none | 200 `MySubscriptionResponseDto` | SVC-SUB.getMySubscription() | (change-004) |
| EP-SUB-07 | GET | /api/v1/subscriptions | JWT+admin | query: status?, page?, limit? | 200 `Paginated<SubscriptionListItemDto>` | SVC-SUB.listSubscriptions() | |
| EP-SUB-08 | GET | /api/v1/subscriptions/:id | JWT+admin | `:id` param | 200 `SubscriptionDto` | SVC-SUB.getSubscription() | |
| EP-SUB-09 | POST | /api/v1/subscriptions | JWT+admin | `CreateSubscriptionDto` { userId, planId, startDate, endDate?, status?, notes? } | 201 `SubscriptionDto` | SVC-SUB.createSubscription() | |
| EP-SUB-10 | PUT | /api/v1/subscriptions/:id | JWT+admin | `:id` · `UpdateSubscriptionDto` | 200 `SubscriptionDto` | SVC-SUB.updateSubscription() | |
| EP-SUB-11 | POST | /api/v1/subscriptions/assign | JWT+admin | `AssignSubscriptionDto` { userId, planId, paid? } | 201 varies | SVC-SUB.assignSubscription() | (change-005) |
| EP-SUB-12 | POST | /api/v1/subscriptions/change | JWT+admin | `ChangeSubscriptionDto` { userId, planId, paid? } | 201 varies | SVC-SUB.changeSubscription() | (change-005) |
| EP-SUB-13 | PATCH | /api/v1/subscriptions/:userId/cancel | JWT+admin | `:userId` param | 200 `SubscriptionDto` | SVC-SUB.cancelSubscription() | Admin-only cancel |
| EP-SUB-14 | POST | /api/v1/subscriptions/subscribe | JWT | `SelfSubscribeDto` { planId } | 201 varies | SVC-SUB.selfSubscribe() | (change-003/004/005) |
| EP-SUB-15 | POST | /api/v1/subscriptions/cancel | JWT | none | 200 `{ message }` | SVC-SUB.selfCancel() | |
| EP-SUB-16 | POST | /api/v1/subscriptions/:id/activate | JWT+admin | `:id` param | 200 `SubscriptionDto` | SVC-SUB.activateSubscription() | |
| EP-SUB-17 | POST | /api/v1/subscriptions/:id/deactivate | JWT+admin | `:id` param | 200 `SubscriptionDto` | SVC-SUB.deactivateSubscription() | (change-005) |
| EP-SUB-18 | POST | /api/v1/subscriptions/upgrade | JWT | `SelfSubscribeDto` { planId } | 201 `{ redirectUrl }` or `{ activated }` | SVC-SUB.selfUpgrade() | (change-005) |
| EP-SUB-19 | POST | /api/v1/subscriptions/downgrade | JWT | `SelfSubscribeDto` { planId } | 201 `{ redirectUrl }` or `{ activated }` | SVC-SUB.selfDowngrade() | (change-005) |
| EP-SUB-20 | GET | /api/v1/subscriptions/me/pending-payments | JWT | none | 200 `PendingPaymentDto[]` | SVC-SUB.listPendingPayments() | (change-005) |
| EP-SUB-21 | POST | /api/v1/subscriptions/payments/:paymentId/pay | JWT | `:paymentId` param | 201 `{ redirectUrl }` | SVC-SUB.payPendingInvoice() | (change-005) |

**Notes:**
- [EP-SUB-06] **(change-004):** Returns structured usage vs limits. Shape: `{ subscription, accountStatus: { isActive }, limits: { maxDashboards, maxDataUploadsPerMonth, maxDataUpdatesPerMonth }, usage: { dashboards, uploadsUsedThisMonth, updatesUsedThisMonth } }`. Uses SVC-SUB + SubscriptionLimitService.
- [EP-SUB-11] **(change-005):** `paid: false` (default) creates pending invoice — customer pays via PayUp → returns `{ message, userId, planId }`. `paid: true` settles immediately via admin actor → returns `SubscriptionDto`. Service signature: `assignSubscription(userId, planId, actorId, ip, paid)`.
- [EP-SUB-12] **(change-005):** Infers upgrade/downgrade from price comparison. `paid` flag has same semantics as EP-SUB-11. Service signature: `changeSubscription(userId, planId, actorId, ip, paid)`.
- [EP-SUB-13] Admin-only endpoint. For customer self-service cancellation use EP-SUB-15 instead.
- [EP-SUB-14] **(change-003):** Paid plans start PayUp checkout → `{ redirectUrl }`. **(change-004):** Free plans skip PayUp; enqueue `subscription-activation` BullMQ job → `{ activated: true }`. **(change-005):** Blocks if user has active subscription (use upgrade/downgrade); blocks if inactive (`403 SUBSCRIPTION_ADMIN_LOCKED`); paid subscribe always creates pending invoice. Returns 404 if plan not found. Audit: `PAYMENT_CREATE` for paid; `SUBSCRIPTION_ASSIGN` on activation. Paid path: SVC-SUB.selfSubscribe → SVC-CHECKOUT.initiateSubscriptionCheckout. Free path: SVC-SUB.selfSubscribe → enqueue subscription-activation job.
- [EP-SUB-15] Returns 404 if user has no subscription. Sets `status: cancelled`, `endDate: now`. Audits `SUBSCRIPTION_CHANGE` with `status: cancelled`.
- [EP-SUB-16] Sets status active, period dates, audits `SUBSCRIPTION_ACTIVATE`. Service: `activateSubscription(id, actorId?, ip?)`.
- [EP-SUB-17] **(change-005):** Sets status inactive, audits `SUBSCRIPTION_DEACTIVATE`. User retains login; mutating actions blocked by subscription resource lock. Self-service subscribe/upgrade/downgrade also blocked while inactive. Service: `deactivateSubscription(id, actorId?, ip?)`.
