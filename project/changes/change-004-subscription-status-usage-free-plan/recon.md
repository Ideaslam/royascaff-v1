# Code Reconnaissance — Change #004 Subscription Status, Usage Limits & Free Plan

**Date**: 2026-06-23
**Target app(s)**: backend (`roya-ai-dynamo-api`), customer-portal (`roya-ai-dynamo-frontend`), admin-panel (`roya-ai-dynamo-frontend-admin`)
**Scope under review**: Subscriptions, Auth, Users, Dashboards, Data — account/subscription status, usage limits, free plan
**Repos scanned**: `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`, `roya-ai-dynamo-frontend-admin`

## 1. Existing Implementation Found

| Layer | State | Location (path) | Notes / gaps |
|-------|:-----:|-----------------|--------------|
| Schema / data model | partial | `roya-ai-dynamo-api/src/modules/subscriptions/schemas/` | Plan limit fields + usage counters exist; `SubscriptionStatus` lacks `inactive`; period dates not set on activation |
| Repository | partial | `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts` | `incrementUsage` implemented, **zero callers**; no `countDashboardsByUser` |
| Service(s) | partial | `subscriptions.service.ts`, `payment-checkout.service.ts`, `users.service.ts`, `auth.service.ts` | PayUp subscribe + activation exist; no limit service, no resource lock, no free-plan branch, suspend lacks token revoke |
| Endpoint(s) / controller | partial | `subscriptions.controller.ts`, `users.controller.ts` | Admin CRUD + self-subscribe/cancel live; **no** activate/deactivate subscription endpoints |
| Frontend service | partial | `frontend/.../subscriptions.service.ts`, `admin/.../subscriptions-admin.service.ts` | Admin aligned; portal models **stale** vs API |
| Page(s) / component(s) | partial | `frontend/.../subscriptions.page.ts`, `admin/.../subscriptions.page.ts`, `admin/.../clients.page.ts` | Admin plan limits + suspend UI exist; no activate/deactivate buttons; portal lacks status/usage UX |
| Route registration | complete | Both Angular apps | Routes registered |

## 2. Feature State Verdict

**State**: partial — exists but incomplete

- **Implemented**: subscription module scaffolding; plan CRUD with limit fields; PayUp checkout + BullMQ activation (change-003); admin suspend/reactivate UI + `PATCH /users/:id/suspend|reactivate`; password login blocks `!isActive`; JWT validates `isActive` (401); admin subscriptions page with plan limit form.
- **Missing**: `inactive` status; admin activate/deactivate subscription endpoints; account 403 semantics + token revocation; OAuth `isActive` check; auto-suspend on 2 consecutive unpaid; subscription resource lock guards; `SubscriptionLimitService` + registry; wiring `incrementUsage`; free-plan subscribe branch; enriched `GET /me`; period rollover/expiry jobs; portal model alignment + blocked-action UX.

## 3. Plan vs. Code Drift

- **Code not fully in plan**: `incrementUsage` on repository; JWT 401 (not 403) for inactive users; suspend uses `PATCH` not `POST`.
- **Plan not in code**: limit enforcement (global rule 7); `inactive` status; auto-suspend; free plan; resource lock; enriched `/me` usage envelope.
- **Stale dist artifacts**: `dist/` contains `usage-types.js` / `subscription-usage.types.js` absent from `src/` — ignore dist; recreate registry in `src/`.

## 4. Ripple / Impact Map

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| `AuthService.login` | service | account gate | no | modify message to "Account suspended" |
| `JwtStrategy.validate` | strategy | all JWT routes | yes | modify → 403 + `ACCOUNT_SUSPENDED` code |
| `AuthService.oauthLogin` | service | OAuth entry | yes | modify → check `isActive` |
| `UsersService.suspendUser` | service | admin + auto-suspend | no | modify → revoke refresh tokens |
| `PaymentCheckoutService.confirm/cancel` | service | payment failure | no | modify → consecutive-unpaid → auto-suspend |
| `SubscriptionsService.selfSubscribe` | service | subscribe entry | yes | modify → free-plan branch |
| `SubscriptionActivationProcessor` | processor | activation | no | modify → optional `paymentId` |
| `SubscriptionsService.activateFromPayment` | service | activation | no | complete → set period dates, generalize |
| `DashboardsService.createDashboard` | service | write path | no | modify → resource lock + limit check |
| `DashboardsService.refreshDashboard` | service | write path | no | modify → resource lock + update limit |
| `DataService` upload paths | service | write path | no | modify → resource lock + upload limit |
| `GET /subscriptions/me` | endpoint | portal UI | yes | modify → limits + usage envelope |
| `subscriptions.page.ts` (portal) | page | customer UX | yes | modify → models, free subscribe, status display |
| `subscriptions.page.ts` (admin) | page | admin UX | no | modify → activate/deactivate buttons |
| `SubscriptionStatus` enum | schema | data model | yes | modify → add `inactive` |
| `BackgroundJobType` | enum | jobs | no | modify → add `subscription_period_rollover` (optional) |

- **Shared DTOs touched**: `SubscriptionDto`, `MySubscriptionResponseDto` (new), portal `subscription.models.ts`
- **Auth implications**: suspended account = no login + 403 on API; expired/inactive subscription = login OK, mutate endpoints 403
- **Async jobs**: reuse `subscription-activation` queue for free plan; new repeatable job for period rollover + expiry
- **Data migration required?** no — add enum value `inactive`; existing records unchanged

## 5. Reuse Opportunities

- `SubscriptionRepository.incrementUsage` — wire from limit registry
- `SubscriptionActivationProcessor` + BullMQ queue — free-plan activation
- `activateFromPayment` — generalize to `activateSubscription(userId, planId, opts?)`
- Admin plan form — already has all limit fields
- Admin clients suspend UI — complete; backend needs token revoke only
- `PaymentCheckoutService.confirm` enqueue pattern — mirror for free subscribe

## 6. Recommendation for Impact Analysis (Step 5.1)

- **Create new**: `SubscriptionLimitService`, `SubscriptionLimitRegistry`, `AccountSuspendedGuard` (or enhanced JWT), `SubscriptionResourceGuard`, `POST /subscriptions/:id/activate|deactivate`, period rollover job, auto-suspend helper, `MySubscriptionResponseDto`, portal model alignment
- **Complete in place**: suspend (token revoke + OAuth check), `incrementUsage` wiring, `GET /me` enrichment, activation period dates, free-plan subscribe branch
- **Modify (ripple)**: `DashboardsService`, `DataService`, `JwtStrategy`, `PaymentCheckoutService`, portal subscriptions page, admin subscriptions page, `rules.md`, planning docs
- **Out of scope / deferred**: automated recurring billing/invoicing; customer self-unsuspend

## Open Questions

- Resolved by user confirmation: consecutive unpaid = 2 consecutive failed payments; auto-suspend requires admin reactivation.
