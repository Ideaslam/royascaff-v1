# Pre-Build Plan Verification — Change #005

**Change title**: Subscription billing upgrade/downgrade + admin paid flag
**Date**: 2026-06-23
**Change type**: general
**Affected repos**: backend, frontend, admin
**Planning docs updated**: `features.md`, `endpoints.md`, `customer-portal/pages.md`, `admin-panel/pages.md`

---

## Status: PASS

---

## Check 0: Reconnaissance Coverage ✓

| Recon finding | Reflected in plan? |
|---------------|:------------------:|
| Payment action fields | yes |
| Upgrade/downgrade endpoints | yes |
| Pending invoice list/pay | yes |
| Admin paid flag | yes |
| Inactive billing lock | yes |
| Portal + admin UI | yes |

---

## Check 1: Feature Coverage ✓

| Feature | Backend? | Endpoint? | Frontend? | Page? |
|---------|:--------:|:---------:|:---------:|:-----:|
| Customer upgrade | yes | POST /upgrade | yes | yes |
| Customer downgrade | yes | POST /downgrade | yes | yes |
| Pending invoices + pay | yes | GET pending + POST pay | yes | yes |
| Admin paid flag | yes | create/assign/change | yes | yes |
| Inactive blocks self-service | yes | all self-service | yes | yes |

---

## Check 2: Service Coverage ✓

| Endpoint | Service | Documented? |
|----------|---------|:-----------:|
| POST /subscriptions/upgrade | SubscriptionsService.selfUpgrade | yes |
| POST /subscriptions/downgrade | SubscriptionsService.selfDowngrade | yes |
| GET /subscriptions/me/pending-payments | SubscriptionsService.listPendingPayments | yes |
| POST /subscriptions/payments/:id/pay | SubscriptionsService.payPendingInvoice | yes |
| POST /subscriptions (paid) | adminPlanChange / settleByAdmin | yes |

---

## Check 3: Data Model Consistency ✓

| Field / enum | Defined? |
|-------------|:--------:|
| PaymentAction (subscribe/upgrade/downgrade/admin_assign) | yes |
| previousPlanId, settledByAdminId on Payment | yes |
| paid on Create/Change DTOs | yes |

---

## Check 4: Endpoint-Page Linking ✓

| Page | Endpoints | Match? |
|------|-----------|:------:|
| customer-portal subscriptions | subscribe, upgrade, downgrade, pending, pay | ✓ |
| admin subscriptions | create/change with paid | ✓ |

---

## Overall: PASS
