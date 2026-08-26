## Module: Subscriptions

### SVC-SUB · SubscriptionsService [internal, domain, Subscriptions]
Subscription read models, provisioning, and admin-safe metadata.

**Methods:** `listPublishedPlans` returns active published commercial offers with populated safe Packages; `assignDefaultFreePlan(workspaceId)` idempotently creates the sole subscription plus initial access and exact `30 day` usage periods; `getMySubscription` returns Plan/Package versions, independent periods, retirement, limits, and usage; admin list/detail/recovery/update-notes.

**Rules:** one subscription per workspace · exactly one active published explicit default Free Plan · no delete/recreate plan-change path · safe compatibility DTOs.

---

### SVC-SUB-CAT · SubscriptionCatalogService [internal, domain, Subscriptions]
Sole writer for immutable Package and versioned Plan catalog state.

**Methods:** Package `list/get/create/updateDraft/clone/archive`; Plan `list/get/create/updateDraft/clone/publish/unpublish/scheduleRetirement/rescheduleRetirement/cancelRetirement/processDueRetirements`; reference/immutability validation and default-Free switching.

**Deps:** Package/Plan repositories · SVC-NOTIF · SVC-AUDIT · lifecycle queue
**Rules:** Package owns tier/limits/features/included users/quota cadence · Plan owns pricing/billing/extra-user price/publication/retirement · clone allocates next family version atomically · publish/reference freezes identity · retirement ≥30 days and unpublishes immediately · every mutation requires admin actor, reason, idempotency/correlation.

---

### SVC-SUB-LIFE · SubscriptionLifecycleService [internal, domain, Subscriptions]
Sole writer for Plan, access period, usage period, auto-renew, grace, scheduled-change, retirement fallback, and invoice-application state.

**Methods:**
- `requestUpgrade` — compare Package tier, version-lock, create/reuse Package-aware server invoice
- `applyPaidInvoice` — exactly-once free-to-paid/upgrade/replacement/renewal; paid upgrade preserves both existing ends and quota, free-to-paid starts both periods
- `scheduleDowngradeOrReplacement` / `cancelScheduledChange` — lower tier or same-tier Plan version at access-period end
- `setAutoRenew` — paid only; disabling preserves access
- `processDueTransitions` — retirement eligibility, free/paid access rollover, scheduled target, invoice/grace/fallback
- `processDueUsageTransitions` — anchored Package-window rollover with exact-once CAS and retirement Free fallback
- `processRetirementNotifications` — bounded owner fan-out and retryable mail delivery
- `adminChange`, `adminActivate`, `adminDeactivate` — reason-required overrides
- `reconcileSubscription` — deterministic repair from periods/invoices/events

**Deps:** Plan/Package/subscription/access/usage repositories · SVC-SUB-CALC · SVC-PAY-INV · SVC-NOTIF · SVC-AUDIT · lifecycle queue
**Rules:** access and quota clocks advance independently · current periods never use live catalog limits/prices · Plan cannot start on/after retirement · compare-and-set lifecycle/current IDs · invoice/notification/transition applied once.

---

### SVC-SUB-CALC · SubscriptionBillingCalculator [internal, pure domain, Subscriptions]
Classifies Package-tier direction (`upgrade|downgrade|replacement`) and calculates Plan billing boundaries/proration plus Package quota boundaries in UTC. Paid upgrade charges the normalized positive difference and never extends access/quota. `addBillingInterval` reads Plan snapshot; `addQuotaInterval` reads Package snapshot. Free Package is exact `30 day`; month/year preserve UTC anchor/end-of-month behavior.

---

### SVC-SUB-LIM · SubscriptionLimitService [internal, domain, Subscriptions]
`check`, atomic `reserve(workspaceId, limitKey, amount, operationId)`, idempotent `release`, `buildUsageEnvelope`, and `assertResourceUnlocked`. Resolves the current `SubscriptionUsagePeriod` and immutable Package snapshot. Generalized window limits plus daily sync count use conditional reservation; access/usage resolution failure denies mutation. Compatibility output aliases retain old `*PerMonth` names during rollout.

---

### SVC-SUB-ROLL · SubscriptionLifecycleProcessor [internal, application, Subscriptions]
Consumes invoice events and repeatable bounded scans for access transitions, usage transitions, Plan retirement, owner-notification fan-out/mail retry, and reconciliation. Deterministic jobs plus database guards make overlapping replicas safe; schedules are data/calendar-driven.
