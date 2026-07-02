# Code Reconnaissance — Change #005 Subscription Billing Upgrade/Downgrade

**Date**: 2026-06-23
**Target app(s)**: backend (`roya-ai-dynamo-api`), customer-portal (`roya-ai-dynamo-frontend`), admin-panel (`roya-ai-dynamo-frontend-admin`)
**Scope under review**: Subscriptions, Payments — upgrade/downgrade, admin `paid` flag, pending invoices, inactive billing lock
**Repos scanned**: `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`, `roya-ai-dynamo-frontend-admin`

## 1. Existing Implementation Found

| Layer | State | Location (path) | Notes / gaps |
|-------|:-----:|-----------------|--------------|
| Payment schema | partial | `payment.schema.ts` | Had status/amount; lacked `action`, `previousPlanId`, `settledByAdminId` |
| Payment checkout | partial | `payment-checkout.service.ts` | PayUp subscribe only; no resume pending, no admin settle |
| Subscriptions service | partial | `subscriptions.service.ts` | Self-subscribe + free branch (004); no upgrade/downgrade; admin assign/change immediate |
| Subscriptions controller | partial | `subscriptions.controller.ts` | subscribe/cancel live; no upgrade/downgrade/pending-pay endpoints |
| Customer portal page | partial | `subscriptions.page.ts` | Subscribe/cancel/status (004); no upgrade/downgrade UI, no pending invoices |
| Admin subscriptions page | partial | `admin/.../subscriptions.page.ts` | Create/change dialogs; no `paid` checkbox |
| Admin service | partial | `subscriptions-admin.service.ts` | create/change without `paid` param |

## 2. Feature State Verdict

**State**: partial — PayUp + activation from change-003/004; billing plan-change flows missing

- **Implemented (prior changes)**: PayUp checkout; BullMQ activation; free-plan branch; `inactive` status + resource lock; admin activate/deactivate.
- **Missing (005)**: `PaymentAction` enum + invoice fields; upgrade/downgrade endpoints; pending-invoice list/pay; admin `paid` flag; supersede pending invoices; `SUBSCRIPTION_ADMIN_LOCKED` on self-service when `inactive`; portal upgrade/downgrade + pending UI; admin `paid` UI.

## 3. Plan vs. Code Drift

- **Code ahead of plan**: none (plan docs not yet updated for 005).
- **Plan not in code (004)**: deactivated users could still self-subscribe — **removed in 005**.

## 4. Ripple / Impact Map

| Affected item | Type | Relationship | Action needed |
|---------------|------|--------------|---------------|
| `Payment` schema | schema | invoice model | modify → add action fields |
| `PaymentCheckoutService` | service | checkout/settle | modify → initiate, resume, settleByAdmin |
| `PaymentRepository` | repository | pending lookup | modify → findPending, failPending |
| `SubscriptionsService` | service | billing flows | modify → upgrade/downgrade, adminPlanChange, assertBillingAllowed |
| `subscriptions.controller.ts` | controller | new routes | modify |
| `subscription.dto.ts` | DTO | paid flag | modify |
| `SubscriptionActivationProcessor` | processor | plan change | verify → handles action in payload |
| Customer `subscriptions.page.ts` | page | UX | modify |
| Customer `subscriptions.service.ts` | service | API calls | modify |
| Admin `subscriptions.page.ts` | page | paid checkbox | modify |
| Admin `subscriptions-admin.service.ts` | service | paid param | modify |
| `endpoints.md`, `features.md`, `pages.md` | docs | planning | modify |

## 5. Reuse Opportunities

- `initiateSubscriptionCheckout` + activation queue from change-003
- `assertBillingAllowed` / `SUBSCRIPTION_ADMIN_LOCKED_CODE` pattern from change-004
- `enqueueFreeActivation` for free downgrade target
- Admin create/change dialogs — extend with checkbox only

## 6. Recommendation for Impact Analysis (Step 5.1)

- **Create new**: endpoints `upgrade`, `downgrade`, `me/pending-payments`, `payments/:id/pay`; `PaymentAction` enum; admin settle path
- **Complete in place**: self-subscribe blocks active + inactive; admin assign/change/create with `paid`
- **Modify (ripple)**: payment schema/repo, checkout service, both frontends, planning docs

## Open Questions

- Resolved by user confirmation: no proration; one pending invoice per user (supersede old); expired treated like cancelled for re-subscribe; admin `paid: true` uses admin actor id.
