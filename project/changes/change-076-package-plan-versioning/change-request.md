# Change Request

## Metadata
- **date**: 2026-08-25
- **change-type**: general (new-feature + modify-feature + modify-data-model + modify-service + modify-endpoint + modify-page)
- **target-app**: customer-portal + admin-panel + backend
- **affected-repos**: backend + frontend + admin
- **priority**: high

## Scope
- Module(s): Subscriptions, Plans, Packages, Billing, Usage Limits, Notifications, Audit Logs
- Feature(s): immutable entitlement Packages, versioned pricing Plans, independent quota-reset windows, plan publication and scheduled retirement, grandfathered renewal, replacement-plan selection, migration, and catalog administration
- Endpoint(s): existing customer/admin subscription and plan endpoints plus scoped Package catalog/versioning and Plan retirement operations; exact routes and IDs will be resolved during code reconnaissance
- Page(s)/View(s): customer-portal subscription/billing page; admin Packages, Plans, Subscriptions, and affected billing views
- Service(s): package catalog, plan catalog, subscription lifecycle, billing calculation, usage-period/limit, notification/mail, audit, migration, and lifecycle background processing services; exact service IDs will be resolved during code reconnaissance

## Description

### Problem and motivation

Subscription Plans currently combine commercial pricing with entitlement limits. Once users subscribe, changing a Plan price or limits would mutate the meaning of an already-purchased product and can break historical billing, renewals, and usage enforcement. Administrators need to introduce new prices and benefits for future customers while every existing workspace remains bound to the exact Plan and limits version it purchased.

### Package and Plan model

Introduce an immutable `Package` catalog for entitlements. A Package contains bilingual name and description, tier rank, included users, all limits/features, and a configurable quota-reset interval expressed as a positive count and `day | month | year` unit. Package lineage is retained through a stable family key, monotonically increasing version, and optional replaced-Package reference.

A `Plan` becomes an immutable commercial offer linked to one Package. It contains free/paid type, price, currency, billing interval, version lineage, publication state, active/renewal state, and optional scheduled retirement. Multiple monthly, annual, or otherwise intervalled Plans may reference the same Package when they offer identical entitlements and reset cadence. A price-only change clones/creates a new Plan against the same Package. A limits or quota-cadence change clones/creates a new Package and then creates a Plan against that Package.

Draft Packages and Plans may be edited or deleted while unreferenced. Once published or referenced by a subscription, period, invoice, or other historical record, their commercial/entitlement identity becomes immutable. Referenced records are archived rather than deleted. Admin clone actions make new versions without rewriting old subscriber history.

Each workspace subscription remains connected to a specific Plan version, not directly to a user. Billing invoices and periods snapshot the Plan and Package inputs used at that time.

### Publication, grandfathering, and retirement

`isPublished=true` means the Plan appears for new subscriptions and plan changes. `isPublished=false, isActive=true` hides it from new selection while existing subscribers may continue renewing at their historical price. `isActive=false` means no future period may renew or select the Plan, but it never revokes an already-started entitlement period.

Admins may schedule Plan retirement at least 30 days in the future. Scheduling immediately unpublishes the Plan, records `retireAt`, and creates customer notification state. It may be cancelled or rescheduled before the effective time. Existing renewals may begin only when the new billing period begins before `retireAt`; a period beginning on or after retirement cannot renew the old Plan. At retirement the Plan becomes inactive.

Affected workspaces receive a persistent in-app warning and one localized email at least 30 days before the affected renewal/expiry. Email failures are retried and audited but do not block retirement. A workspace retains its current paid access through the current billing period even if `retireAt` occurs earlier. At period end it moves to the active default Free Plan unless it already selected and paid for another published Plan. Retirement does not add a grace period for the retired Plan. A retired Free Plan transitions its workspaces to the current active published default Free Plan at the next quota boundary.

The catalog must maintain exactly one active, published default Free Plan. Operations that would violate this invariant are rejected.

### Billing periods and quota-reset periods

Billing and quota reset are separate clocks. A Plan billing interval controls invoices and paid access. Its Package quota interval controls usage reset. An annual Plan may therefore charge yearly while resetting limits monthly or yearly. A Package is reusable and is not recreated for each reset.

Add a durable usage-period model separate from the subscription billing/access period. It snapshots the Package version, preserves its own UTC anchor and boundaries, and owns the quota counters. A reset creates exactly one next usage period through an idempotent, concurrency-safe transition. The Free Package remains an exact rolling 30-day reset configuration (`30 day`).

Paid-to-paid upgrades retain used quota and the current quota-window end; the new Package limits apply immediately, and its reset cadence begins with the next quota window. Free-to-paid starts a new billing period and quota period. Scheduled downgrade and replacement behavior continue following the hardened lifecycle rules, while billing-boundary transitions no longer reset usage unless a real quota boundary or explicitly approved free-to-paid transition occurs.

### Admin and customer behavior

Only platform admins may create, edit drafts, clone, publish, unpublish, archive, cancel/reschedule retirement, or schedule retirement for Packages and Plans. All actions require an audit record with actor and reason. Published/referenced immutable fields cannot be bypassed through generic admin update operations.

The Admin Panel gains `/app/packages` for Package drafts, cloning, version history, limits, quota cadence, archive state, and linked Plans. `/app/plans` becomes the pricing-offer catalog with Package selection, Plan lineage, published/active state, and scheduled retirement. Admin subscriptions display the workspace's Plan version, Package version, billing period, quota period, and retirement/replacement state.

Workspace owners remain the only customer actors who may select a replacement Plan or initiate its payment. The customer subscription page displays current Plan and Package versions, benefits, quota reset cadence/window, retirement deadline, persistent warning, and only active published replacement Plans. Normal upgrade and scheduled-downgrade rules apply when a replacement is selected.

Both frontends use the existing Angular, PrimeNG, and Roya design system, with complete loading, empty, immutable/read-only, scheduled-retirement, validation, notification-failure, payment-pending/failed, and success states. English, Arabic, and RTL behavior are required.

### Migration, compatibility, and boundaries

Migration creates Packages from distinct existing limits profiles, links each existing Plan to its Package, initializes lineage, and backfills usage periods from the current period/counters. Existing subscription IDs, Plan IDs, invoices, access dates, usage counters, and reset anchors are preserved without granting a reset or shortening access. Existing PayUp, upgrade, downgrade, renewal, grace, extra-user billing, and audit history must continue working.

Automatic migration from a retired paid Plan to a different paid Plan and retirement-triggered refunds are explicitly out of scope. Workspaces that do not select a replacement move to the default Free Plan according to the approved rule.

No new external provider or AI feature is introduced. Retirement and notification work reuse the existing lifecycle jobs and mail provider.

### Failure, concurrency, and validation behavior

Publishing is rejected for incomplete pricing, invalid intervals, invalid lineage, inactive/invalid Packages, conflicting family versions, or a broken default-Free invariant. Duplicate publication, retirement, notification, reset, callback, and customer replacement actions are idempotent and concurrency-safe. All boundaries and calculations use UTC and preserve their original anchors. Stable error codes are returned for immutable-record edits, invalid transitions, conflicts, and unavailable replacement Plans.

## Acceptance Criteria

1. Package is a distinct persisted entity containing bilingual metadata, tier rank, included users, limits/features, quota interval count/unit, lineage, archive state, and immutable lifecycle metadata.
2. Plan contains commercial pricing/billing data, `packageId`, lineage, `isPublished`, `isActive`, and scheduled-retirement state rather than owning mutable entitlement limits.
3. Multiple Plans with different billing intervals can reference the same Package and use its independent quota-reset interval.
4. A price-only catalog change can create a new Plan version against the same Package without changing existing subscribers.
5. A limits or reset-cadence change creates a new Package version and Plan without changing existing subscribers.
6. Draft, unreferenced Packages and Plans may be edited/deleted; published or referenced identity fields are immutable and referenced records can only be archived.
7. Package and Plan clone operations create deterministic next lineage versions with stable family keys and replacement references.
8. Every workspace subscription and historical invoice/period remains attributable to the exact Plan and Package versions used.
9. `isPublished=false, isActive=true` hides a Plan from new selection while existing subscribers can renew it at the historical price.
10. Scheduling retirement at least 30 days ahead immediately unpublishes the Plan and may be cancelled or rescheduled before `retireAt`.
11. A renewal period beginning before `retireAt` may renew; one beginning on or after it cannot renew the retiring Plan.
12. Retirement never revokes a current entitlement period; affected paid workspaces retain access through their existing billing-period end.
13. A retired paid workspace without a paid replacement moves idempotently to the active default Free Plan at period end without an additional retired-plan grace period.
14. A retired Free Plan moves its workspaces to the active published default Free Plan at their next quota boundary.
15. The system prevents catalog operations from leaving anything other than exactly one active, published default Free Plan.
16. Affected workspace owners receive a persistent localized in-app retirement warning and one localized email at least 30 days before affected expiry/renewal.
17. Failed retirement email delivery is retried and audited without blocking retirement or hiding the in-app warning.
18. A separate durable usage period owns quota counters and snapshots the Package; billing/access periods and quota-reset periods can advance independently.
19. Free usage periods remain exact rolling 30-day windows, and any Package can configure a positive `day`, `month`, or `year` reset interval.
20. Each quota boundary creates at most one next usage period and resets counters exactly once under retries and concurrency.
21. Paid-to-paid upgrade applies new Package limits immediately while retaining current usage and quota-window end; the new cadence begins at the next quota window.
22. Free-to-paid creates one new billing period and one new quota period; billing renewal alone does not reset quota unless the quota boundary also occurs.
23. Only platform admins can manage Package/Plan lifecycle, and every admin catalog action records actor, reason, before/after identity, and correlation data.
24. Only workspace owners can select/pay for replacements; customer catalog responses expose only active published offers and safe retirement/package data.
25. Admin Packages, Plans, and Subscriptions pages expose version lineage, immutable states, quota cadence, billing/quota periods, and retirement controls without destructive history edits.
26. The customer subscription page exposes Plan/Package version, limits, current quota window, next reset, retirement deadline, replacement catalog, and payment state in English and Arabic with RTL support.
27. Migration groups distinct existing limits into Packages and preserves all current subscriptions, Plan IDs, paid access, counters, anchors, invoices, and history without granting an extra reset.
28. Existing PayUp checkout, upgrade/downgrade, auto-renew, grace-to-free, extra-user billing, plan snapshots, and audit flows continue working with Package/version identity.
29. Automated tests cover immutability, clone/version lineage, publication/grandfathering, retirement timing/cancellation, default-Free invariants, notifications, independent billing/quota intervals, exact-once resets, upgrade counter preservation, authorization, concurrency, and migration compatibility.
30. Invalid catalog/lifecycle operations return stable validation/conflict codes, and all interval calculations and transitions are UTC and anchor-preserving.

## Notes

- Strict retirement notice: `retireAt` must be at least 30 days after scheduling; no emergency shorter retirement is included.
- The persistent in-app warning and one email are required; screenshot review is optional because no screenshot/Figma reference was supplied.
- Automatic paid-to-paid retirement migration and refunds are out of scope.
- Exact schemas, endpoints, service methods, job reuse, and migration mechanics will be finalized after Step 5.1 code reconnaissance.
