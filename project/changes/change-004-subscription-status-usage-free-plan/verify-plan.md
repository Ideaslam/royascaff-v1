# Pre-Build Plan Verification — Change #004

**Change title**: Subscription status, usage limits, and free plan
**Date**: 2026-06-23
**Change type**: general
**Affected repos**: backend, frontend, admin
**Planning docs updated**: `features.md`, `data-model.md`, `endpoints.md`, `services.md`, `customer-portal/pages.md`, `admin-panel/pages.md`, `rules.md`

---

## Status: PASS

---

## Check 0: Reconnaissance Coverage ✓

| Recon finding | Type | Reflected in plan? |
|---------------|------|:------------------:|
| `incrementUsage` unwired | complete-in-place | yes |
| No limit service/registry | create new | yes |
| No resource lock guards | create new | yes |
| Free plan always PayUp | modify | yes |
| Suspend lacks token revoke | complete-in-place | yes |
| JWT 401 vs 403 for suspended | modify | yes |
| Admin activate/deactivate missing | create new | yes |
| Portal model drift | modify | yes |
| Period rollover job missing | create new | yes |
| Auto-suspend on unpaid | create new | yes |

**Issues found**: none
**Fixes applied**: none

---

## Check 1: Feature Coverage ✓

| Feature | Backend? | Endpoint? | Frontend? | Page? |
|---------|:--------:|:---------:|:---------:|:-----:|
| Account suspension | yes | yes (PATCH suspend/reactivate) | yes | yes (clients page) |
| Subscription activate/deactivate | yes | yes (POST :id/activate\|deactivate) | yes | yes (admin subscriptions) |
| Subscription resource lock | yes | n/a (service guards) | yes | yes (portal UX) |
| Usage limits (extensible) | yes | n/a + enriched GET /me | yes | yes (portal + admin) |
| Free plan subscribe | yes | yes (POST subscribe branch) | yes | yes (portal) |

**Issues found**: none

---

## Check 2: Service Coverage ✓

| Endpoint | Service Called | Exists in services.md? |
|----------|---------------|:---------------------:|
| POST /subscriptions/:id/activate | SubscriptionsService.activateSubscription | yes |
| POST /subscriptions/:id/deactivate | SubscriptionsService.deactivateSubscription | yes |
| GET /subscriptions/me | SubscriptionsService.getMySubscription + SubscriptionLimitService | yes |
| POST /subscriptions/subscribe | SubscriptionsService.selfSubscribe | yes |
| PATCH /users/:id/suspend | UsersService.suspendUser | yes |
| Dashboard create / upload / refresh | SubscriptionLimitService.assertAllowed + assertResourceUnlocked | yes |

**Issues found**: none

---

## Check 3: Data Model Consistency ✓

| DTO / Entity | Defined? |
|-------------|:--------:|
| SubscriptionStatus (+ inactive) | yes |
| MySubscriptionResponseDto | yes (endpoints.md) |
| subscription_period_rollover job type | yes |
| AuditAction (+ auto_suspend, activate, deactivate) | yes |

**Issues found**: none

---

## Check 4: Endpoint-Page Linking ✓

| Page | Endpoint Referenced | Match? |
|------|--------------------|:------:|
| customer-portal subscriptions | GET /subscriptions/me | ✓ |
| customer-portal subscriptions | POST /subscriptions/subscribe | ✓ |
| admin subscriptions | POST /subscriptions/:id/activate | ✓ |
| admin subscriptions | POST /subscriptions/:id/deactivate | ✓ |
| admin clients | PATCH /users/:id/suspend | ✓ |

**Issues found**: none

---

## Check 5: Auth Declarations ✓

| Item | Auth declared? |
|------|:--------------:|
| POST /subscriptions/:id/activate | JWT + admin |
| POST /subscriptions/:id/deactivate | JWT + admin |
| GET /subscriptions/me | JWT |
| customer-portal /app/subscriptions | authGuard |
| admin /app/subscriptions | authGuard + adminGuard |

**Issues found**: none

---

## Check 6: Custom Rules Coverage ✓

| New behavior | Rule exists? |
|-------------|:------------:|
| Account suspension + resource lock | yes (Subscriptions — Account & Status Enforcement) |
| Free plan skip PayUp | yes (Payments rule + Subscriptions rule) |
| Extensible limit registry | yes (global rule 7) |
| Period rollover job | yes (services.md processor) |
| Auto-suspend | yes (Subscriptions rule) |

**Issues found**: none

---

## Pre-Build Summary

| Check | Result |
|-------|--------|
| 0. Reconnaissance Coverage | ✓ PASS |
| 1. Feature Coverage | ✓ PASS |
| 2. Service Coverage | ✓ PASS |
| 3. Data Model Consistency | ✓ PASS |
| 4. Endpoint-Page Linking | ✓ PASS |
| 5. Auth Declarations | ✓ PASS |
| 6. Custom Rules Coverage | ✓ PASS |

**Overall: PASS — planning docs are consistent and complete. Proceed to Step 5.4 (Implement Code).**
