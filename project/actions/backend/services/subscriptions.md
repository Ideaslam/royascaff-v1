## Module: Subscriptions

### SVC-SUB · SubscriptionsService [internal, domain, Subscriptions]
Catalog, read models, provisioning, and admin-safe metadata.

**Methods:** `listPlans`, `listAllPlans`, `createPlan`, `updatePlan`, `archivePlan`; `assignDefaultFreePlan(workspaceId)` idempotently creates the sole subscription and first exact 30-day free period; `getMySubscription`; admin `listSubscriptions`, `getSubscription`, recovery-only `createSubscription`, and `updateNotes`.

**Rules:** one subscription per workspace · exactly one active free plan · plan identity fields lock after first use · no delete/recreate plan-change path · safe DTOs.

---

### SVC-SUB-LIFE · SubscriptionLifecycleService [internal, domain, Subscriptions]
Sole writer for plan, period, auto-renew, grace, and scheduled-change state.

**Methods:**
- `requestUpgrade` — version-lock, validate higher tier, create/reuse server-priced invoice, start checkout
- `applyPaidInvoice` — exactly-once free-to-paid/upgrade/renewal; paid upgrade preserves current period/usage, free-to-paid starts a new period
- `scheduleDowngrade` / `cancelDowngrade` — target current period end, no invoice
- `setAutoRenew` — paid only; disabling preserves access
- `processDueTransitions` — free rollover; scheduled free downgrade; paid-target downgrade/renewal invoice generation before the boundary; verified target transition; grace on an unpaid boundary invoice; non-payment fallback to free
- `adminChange`, `adminActivate`, `adminDeactivate` — reason-required overrides
- `reconcileSubscription` — deterministic repair from periods/invoices/events

**Deps:** repositories · Mongo transaction/outbox · SVC-SUB-CALC · SVC-PAY-INV · SVC-AUDIT · lifecycle queue
**Rules:** compare-and-set lifecycle version · workspace idempotency · invoice applied once · financial audit/outbox atomic with state · `SUBSCRIPTION_PAYMENT_GRACE_DAYS` defaults to 7 and is startup-validated.

---

### SVC-SUB-CALC · SubscriptionBillingCalculator [internal, pure domain, Subscriptions]
Classifies changes and calculates interval boundaries/proration in integer minor units/Decimal128. Tier rank determines direction. Paid-to-paid upgrade charges the positive difference between each plan's normalized value for the remaining current period, with explicit UTC interval basis and rounding snapshot; it never extends the period. Free is exactly 30 days; paid intervals come from the target plan snapshot.

---

### SVC-SUB-LIM · SubscriptionLimitService [internal, domain, Subscriptions]
`check`, atomic `reserve(workspaceId, limitKey, amount, operationId)`, idempotent `release`, `buildUsageEnvelope`, and `assertResourceUnlocked`. All limit keys—including monthly synced rows and daily sync count—use the same conditional period reservation. Entitlement failure denies mutation; there is no check-then-increment race; downgrade never deletes existing resources.

---

### SVC-SUB-ROLL · SubscriptionLifecycleProcessor [internal, application, Subscriptions]
Consumes invoice events and repeatable due-transition/reconciliation batches. Unique jobs and database guards make overlapping replicas safe. It re-enqueues paid invoices with missing `appliedAt`; schedules are data/calendar-driven, not boot-relative.
