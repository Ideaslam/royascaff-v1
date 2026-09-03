## Module: Subscriptions

### SVC-SUB · SubscriptionsService [internal, domain, Subscriptions]
Subscription read models, provisioning, and admin-safe metadata.

**Methods:** `listPlans` returns active published commercial offers with populated safe Packages (including the Plan `display*` labels); `assignDefaultFreePlan(workspaceId)` idempotently creates the sole subscription plus initial access and exact `30 day` usage periods; `getMySubscription` returns Plan/Package versions, independent periods, retirement, limits, and usage; admin list/detail/recovery/update-notes.

**Rules:** one subscription per workspace · exactly one active published explicit default Free Plan · no delete/recreate plan-change path · safe compatibility DTOs.

---

### SVC-SUB-CAT · SubscriptionCatalogService [internal, domain, Subscriptions]
Sole writer for immutable Package and versioned Plan catalog state.

**Methods:** Package `list/get/create/updateDraft/clone/archive` plus `createPackageVersion` (guided: clones the Package **and** its linked Plans into one editable draft set); Plan `list/get/create/updateDraft/clone/publish/setDefaultFreePlan/unpublish/scheduleRetirement/rescheduleRetirement/cancelRetirement/processDueRetirements`; reference/immutability validation, uniqueness guards, and default-Free switching.

**Deps:** Package/Plan repositories · SVC-SUB-LABEL · SVC-NOTIF · SVC-AUDIT · lifecycle queue
**Rules:** the default-Free role is transferable after publication via `setDefaultFreePlan` (`publish` only ever *grants* it, and no-ops on an already-live Plan), which is what lets a new Free version take over before the outgoing one is hidden or retired · Package owns tier/limits/features/included users/quota cadence · Plan owns pricing/billing/extra-user price/publication/retirement **and its own client-facing `display*` labels** · the Package→Plan compatibility mirror syncs `name*`/`description*`/limits on every write and must never overwrite `display*` · Package `name` and `tierRank` are unique among non-archived Packages · the resolved client-facing Plan label is unique among active+published Plans (retired/archived labels are reusable) · paid price ≥ 0.01 and free price = 0 · clone allocates next family version atomically · publish/reference freezes identity · retirement ≥30 days and unpublishes immediately · every mutation requires admin actor, reason, idempotency/correlation.

---

### SVC-SUB-LABEL · plan-label util *(change-077)* [internal, pure, Subscriptions]
Single source of the client-facing label resolution order, so no surface re-implements it: `displayName` → `plan.name` (Package mirror) → `package.name`, with the `*Ar` chain when the locale is Arabic and its value is non-empty; same chain for descriptions. Snapshot-aware — readers of pre-change snapshots fall back to `snapshot.name`. Consumed by SVC-SUB-CAT, SVC-SUB-LIFE (retirement notices), SVC-PAY-CHKOUT (gateway product name), SVC-ADMIN (filter labels), and the period snapshot builder.

---

### SVC-SUB-SEED · SubscriptionCatalogSeeder *(change-077)* [internal, bootstrap, Subscriptions]
`OnModuleInit` seeder registered in `SubscriptionsModule.providers`, following the `WidgetDefinitionSeeder` pattern. Inserts the mandatory default Free Package + Plan **only** when no active published default-Free Plan exists, insert-if-missing by `familyKey`. Never updates, overwrites, archives or deletes an existing Package or Plan. Satisfies the default-Free invariants (`tierRank 0`, exact `30 day` reset, single active published `isDefaultFree`). Logs inserted/skipped counts; failures are logged without blocking boot. Safe under concurrent replicas via the `familyKey+version` and `isDefaultFree` unique indexes.

---

### SVC-MIGRATE · migration runner + ledger *(change-077)* [internal, infrastructure, Database]
Standalone runner (`src/database/migrations/run.ts`) executed by the `k8s.deploy` `initContainer` on the API image, gated by `MIGRATIONS_ENABLED` (default `true`; when `false` it logs and exits `0` without connecting). Discovers ordered migration modules, applies only those absent from the `schema_migrations` ledger, and serialises concurrent replicas through an atomic advisory lock on the unique `name` index with stale-lock reclaim. Each migration runs exactly once ever; failures are not recorded, release the lock, and exit non-zero so the app container never starts against an unmigrated database. Distinct from seeders: migrations are one-time and ledgered, seeds are idempotent and per-boot. Scripts: `migrate:run`, `migrate:run:dry-run`, `migrate:run:prod`.

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
