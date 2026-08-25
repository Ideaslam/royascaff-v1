# Change Request

## Metadata
- **date**: 2026-08-25
- **change-type**: general (modify-feature + modify-service + modify-data-model + modify-endpoint + modify-page)
- **target-app**: customer-portal + admin-panel + backend
- **affected-repos**: backend + frontend + admin
- **priority**: high

## Scope
- Module(s): Subscriptions, Payments, Usage Limits, Audit Logs
- Feature(s): subscription lifecycle, free and paid entitlement periods, usage reset, upgrade proration, scheduled downgrade, auto-renewal, renewal invoices, unpaid grace handling, billing history, administrative overrides
- Endpoint(s): existing customer and admin subscription/payment endpoints; exact routes and any required additions will be resolved during code reconnaissance
- Page(s)/View(s): customer-portal subscription/billing page; admin subscriptions and payments pages where lifecycle management requires changes
- Service(s): subscription, plan, payment/checkout, invoice/billing, usage-limit, audit, and background lifecycle processing services; exact service IDs will be resolved during code reconnaissance

## Description

### Problem and motivation

A workspace can currently consume all free-plan limits, cancel its subscription, subscribe to the free plan again, and receive fresh limits. Repeating this bypasses monetization and makes subscription entitlements unreliable. The wider upgrade, downgrade, renewal, invoice, payment, usage-limit, and administrative flows must be reviewed and hardened as one coherent lifecycle.

### Desired behavior

Each workspace has one continuous entitlement timeline. A free plan runs in rolling 30-day periods and resets usage only when a genuine new free period begins. Creating, cancelling, deleting, or recreating subscription records must never reset usage. A paid plan follows its configured billing interval.

The free plan cannot be cancelled and resubscribed to. Paid cancellation is represented as turning off auto-renewal: current paid access remains available through the period and can be resumed before expiry. If renewal is not paid, the workspace retains current-plan access for an environment-configured grace period (default seven days) and then moves automatically to the free plan.

Free-to-paid upgrades take effect only after confirmed payment, start a new paid period, and reset usage for that new period. Paid-to-paid upgrades are immediate after payment of an invoice for the prorated price difference over the remaining current period. The existing period end and usage counters do not reset; the higher limits become available. Payment success cancels any pending downgrade.

Downgrades are scheduled for the current period end. Until then, the current plan and limits remain active. The customer UI must show the target plan and effective time and allow the workspace owner to cancel the scheduled downgrade. At the boundary, the target plan begins a new entitlement period and usage resets. When the target plan is free or has lower limits, existing data is never deleted; over-limit resources remain accessible, while new limited resources and metered operations are blocked until permitted.

Subscription, entitlement-period, usage, plan-change, invoice, payment, refund/chargeback, and administrative-override history must be preserved. Invoices snapshot all billing inputs and calculations. Transitions and provider callbacks must be atomic, durable, idempotent, auditable, and safe under concurrent requests, retries, delayed callbacks, browser refreshes, and background-job replay.

### Users, permissions, and security

The change primarily affects customer-portal workspace owners. Only the workspace owner may upgrade, schedule or cancel a downgrade, turn auto-renewal off or on, or pay invoices. Platform admins may manage any workspace through the admin panel. Customer operations require authenticated workspace ownership; admin operations require the admin role.

No card details are stored. Only provider references and billing records are retained. PayUp callbacks must be verified server-side; browser redirects alone never grant entitlements. Checkout and subscription-change operations are rate-limited. Every lifecycle transition, period reset, invoice/payment event, scheduled-change action, and admin override is audited.

### Failure and concurrency behavior

The system rejects invalid, inactive, deleted, or same-plan transitions with stable error codes. It permits at most one pending plan change and one actionable invoice of the relevant type, resolving conflicts deterministically. Failed or cancelled checkout leaves the current plan unchanged. Provider outages surface retryable errors and preserve current entitlements. Expired or superseded invoices cannot apply a plan change, including through late callbacks; exceptional cases require reconciliation or admin review. All timestamps and billing calculations use UTC.

Refunds and chargebacks are recorded and flagged for admin review without silently deleting workspace data or rewinding usage. Durable invoice/payment state must allow failed transitions to be replayed without duplicate billing, duplicate plan changes, or duplicate usage resets.

### Frontend behavior

The customer subscription/billing page must display the current plan, entitlement/billing period, usage, renewal and grace state, unpaid invoices, auto-renew state, and pending changes. It replaces ambiguous cancellation actions with `Turn off auto-renewal` and `Resume auto-renewal`; the free plan exposes neither cancel nor resubscribe actions. Upgrade dialogs display proration details before checkout. Scheduled downgrades display the target plan, effective time, continued current-plan access, and a `Cancel downgrade` action.

The customer and affected admin pages must cover loading, empty, pending-payment, failed-payment, past-due/grace, scheduled-change, and success states. They follow the existing Angular, PrimeNG, and Roya design system and preserve English/Arabic localization and RTL behavior. Admin pages expose lifecycle state and audited overrides without destructive subscription deletion.

### Compatibility, migration, and boundaries

Existing paid subscriptions, PayUp checkout, invoices, admin-assigned plans, and legacy users must continue working. Existing workspaces that previously recreated the free subscription must be normalized to their current 30-day entitlement period without receiving another reset. Required fields, indexes, migration/backfill logic, lifecycle jobs, and API changes will be selected after reconciling the blueprint with the actual implementation.

No product area is explicitly out of scope where it is necessary to make the subscription and billing lifecycle internally consistent. No new payment provider or AI integration is introduced.

## Acceptance Criteria

1. A workspace cannot reset free-plan usage by cancelling, deleting, recreating, or resubscribing to a free subscription.
2. Every workspace on the free plan has a continuous rolling 30-day entitlement period, and usage resets exactly once when that period advances.
3. Paid subscription periods and usage resets follow each plan's configured billing interval.
4. The free plan exposes no cancellation or resubscription operation in customer APIs or UI.
5. Turning off paid auto-renewal preserves current access until period expiry; resuming auto-renewal before expiry is supported.
6. A renewal invoice left unpaid at period end places the workspace in a grace state for the environment-configured duration (default seven days), after which it moves idempotently to free.
7. Free-to-paid upgrade activates only after verified payment, starts a new paid period, and resets usage once.
8. Paid-to-paid upgrade creates an invoice for the prorated price difference over the remaining period and activates immediately after verified payment without changing the period end or resetting usage.
9. A downgrade is scheduled for the current period end, keeps current-plan access until then, and can be cancelled before it becomes effective.
10. An upgrade completed while a downgrade is pending cancels the pending downgrade.
11. Applying a scheduled downgrade starts one target-plan entitlement period and resets usage exactly once.
12. Downgrading never deletes existing data; over-limit existing resources remain accessible while disallowed creation and metered actions are blocked with clear errors.
13. Duplicate requests, queue retries, callbacks, or browser redirects cannot create duplicate actionable invoices, duplicate charges, duplicate plan changes, or duplicate usage resets.
14. Late callbacks for expired or superseded invoices cannot alter the active subscription.
15. Invoices persist immutable snapshots of plan, price, interval, currency/tax inputs, proration inputs, due time, and lifecycle status.
16. Subscription, entitlement-period, usage, scheduled-change, invoice, payment, refund/chargeback, period-reset, and admin-override events are historically retained and audited.
17. Only workspace owners can perform customer billing actions; only platform admins can override other workspaces; PayUp callbacks are verified server-side.
18. Checkout and subscription-change endpoints are rate-limited and return stable error codes for invalid or conflicting transitions.
19. The customer subscription page shows current plan and period, usage, auto-renew state, grace/past-due state, actionable invoices, and pending plan changes in English and Arabic with RTL support.
20. A scheduled downgrade is visibly labelled with its target plan and effective time and offers a working `Cancel downgrade` action.
21. Upgrade checkout shows the proration calculation, and failed/cancelled payment leaves the current entitlement unchanged with a retryable UI state.
22. Admin subscription and payment pages expose the hardened lifecycle and audited overrides without destructive subscription deletion.
23. A migration/backfill normalizes existing workspaces, including prior free-plan resubscriptions, without granting an extra usage reset or breaking valid paid access.
24. Automated tests cover period rollover, free-plan abuse prevention, upgrade proration, payment idempotency, scheduled/cancelled downgrade, auto-renew off/on, grace expiry, concurrency, late callbacks, authorization, and migration compatibility.
25. Existing PayUp checkout, valid paid subscriptions, invoices, admin-assigned subscriptions, and legacy workspaces continue to function after migration.

## Notes

- Unpaid grace duration must be configurable through validated environment configuration and default to seven days.
- Use UTC for entitlement boundaries, invoice due times, proration, and background processing.
- PayUp remains behind the existing provider abstraction.
- Exact schema, endpoint, service, job, page, and migration changes are deliberately deferred to Step 5.1 code reconnaissance.
