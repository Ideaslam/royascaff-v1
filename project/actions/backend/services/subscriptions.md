## Module: Subscriptions

### SVC-SUB · SubscriptionsService [internal, domain, Subscriptions]
Subscription read models, provisioning, and admin-safe metadata.

**Methods:** `listPlans` returns active published commercial offers with populated safe Packages (including the Plan `display*` labels); `assignDefaultFreePlan(workspaceId)` idempotently creates the sole subscription plus initial access and exact `30 day` usage periods; `getMySubscription` returns Plan/Package versions, independent periods, retirement, limits, and usage; admin list/detail/recovery (create ignores/rejects `startDate`/`status`/`endDate`) and notes-only update *(change-080)*.

**Rules:** one subscription per workspace · exactly one active published explicit default Free Plan · no delete/recreate plan-change path · safe compatibility DTOs.

---

### SVC-SUB-CAT · SubscriptionCatalogService [internal, domain, Subscriptions]
Sole writer for immutable Package and versioned Plan catalog state.

**Methods:** Package `list/get/create/updateDraft/clone/archive` plus `createPackageVersion` (guided: clones the Package **and** its linked Plans into one editable draft set); Plan `list/get/create/updateDraft/clone/publish/setDefaultFreePlan/unpublish/scheduleRetirement/rescheduleRetirement/cancelRetirement/processDueRetirements`; reference/immutability validation, uniqueness guards, and default-Free switching.

**Deps:** Package/Plan repositories · SVC-SUB-LABEL · SVC-NOTIF · SVC-AUDIT · lifecycle queue
**Rules:** the default-Free role is transferable after publication via `setDefaultFreePlan` (`publish` only ever *grants* it, and no-ops on an already-live Plan), which is what lets a new Free version take over before the outgoing one is hidden or retired · Package owns tier/limits/features/included users/quota cadence · Plan owns pricing/billing/extra-user price/publication/retirement **and its own client-facing `display*` labels** · the Package→Plan compatibility mirror syncs `name*`/`description*`/limits on every write and must never overwrite `display*` · Package `name` and `tierRank` are unique among non-archived Packages · the resolved client-facing Plan label is unique among active+published Plans (retired/archived labels are reusable) · paid price ≥ 0.01 and free price = 0 · clone allocates next family version atomically · publish/reference freezes identity · retirement ≥30 days and unpublishes immediately · `cancelRetirement` restores the Plan's previous published state · a Package holding the default Free Plan cannot be archived *(change-080)* · every mutation requires admin actor, reason, idempotency/correlation.

---

### SVC-SUB-LABEL · plan-label util *(change-077)* [internal, pure, Subscriptions]
Single source of the client-facing label resolution order, so no surface re-implements it: `displayName` → `plan.name` (Package mirror) → `package.name`, with the `*Ar` chain when the locale is Arabic and its value is non-empty; same chain for descriptions. Snapshot-aware — readers of pre-change snapshots fall back to `snapshot.name`. Consumed by SVC-SUB-CAT, SVC-SUB-LIFE (retirement notices), SVC-PAY-CHKOUT (gateway product name), SVC-ADMIN (filter labels), and the period snapshot builder.

---

### SVC-SUB-SEED · SubscriptionCatalogSeeder *(change-077)* [internal, bootstrap, Subscriptions]
`OnModuleInit` seeder registered in `SubscriptionsModule.providers`, following the `WidgetDefinitionSeeder` pattern. Inserts the mandatory default Free Package + Plan **only** when no active published default-Free Plan exists, insert-if-missing by `familyKey`. Never updates, overwrites, archives or deletes an existing Package or Plan. Satisfies the default-Free invariants (`tierRank 0`, exact `30 day` reset, single active published `isDefaultFree`). Logs inserted/skipped counts; failures are logged without blocking boot. Safe under concurrent replicas via the `familyKey+version` and `isDefaultFree` unique indexes.

---

### SVC-MIGRATE · migration runner + ledger *(change-077)* [internal, infrastructure, Database]
Standalone runner (`src/database/migrations/run.ts`) executed by the `k8s.deploy` `initContainer` on the API image, gated by `MIGRATIONS_ENABLED` (default `true`; when `false` it logs and exits `0` without connecting). Discovers ordered migration modules, applies only those absent from the `schema_migrations` ledger, and serialises concurrent replicas through an atomic advisory lock on the unique `name` index with stale-lock reclaim. Each migration runs exactly once ever; failures are not recorded, release the lock, and exit non-zero so the app container never starts against an unmigrated database. Distinct from seeders: migrations are one-time and ledgered, seeds are idempotent and per-boot. Scripts: `migrate:run`, `migrate:run:dry-run`, `migrate:run:prod`.

Registered migrations: `001-package-tier-rank-repair` (distinct rank per Package family), `003-catalog-package-backfill` (legacy Plan→Package split for databases that never ran the standalone `migrate:subscription-catalog` script, then a repeat of the rank repair — `001` cannot retry itself once the ledger records it), and `004-subscription-period-backfill` (the access period, lifecycle field normalization, and legacy payment→invoice conversion that `migrate:subscription-billing` performed, without which every plan change fails with `SUBSCRIPTION_PERIOD_MISSING`), and `005-limit-unlimited-sentinel` *(change-080)* (idempotently converts every legacy Package/Plan/snapshot limit `0` to `-1` so the new `-1` unlimited / `0` blocked semantics preserve existing behaviour; id 005 avoids a ledger collision with `004`). The rank routine (`migrations/lib/tier-rank.ts`) and the Package/Plan shape helpers (`migrations/lib/catalog-shape.ts`) are shared so the ledgered migration and the standalone script derive identical Packages and snapshots. Because the initContainer and the app container must run the same build, `k8s.deploy` declares both images as an `__IMAGE__` placeholder that the pipeline substitutes — a per-container `kubectl set image` cannot keep them in step.

---

### SVC-SUB-LIFE · SubscriptionLifecycleService [internal, domain, Subscriptions]
Sole writer for Plan, access period, usage period, auto-renew, grace, scheduled-change, retirement fallback, and invoice-application state.

**Methods:**
- `requestUpgrade` — compare Package tier, version-lock, create/reuse Package-aware server invoice
- `applyPaidInvoice` — exactly-once free-to-paid/upgrade/replacement/renewal; paid upgrade preserves both existing ends and quota, free-to-paid starts both periods; after `markApplied` (including extra-user) sends one owner invoice-receipt via SVC-PAY-MAIL *(change-079)*
- `scheduleDowngradeOrReplacement` / `cancelScheduledChange` — lower tier or same-tier Plan version at access-period end
- `renewNow` *(change-080)* — `POST /subscriptions/renew`: returns/creates the payable `RENEWAL` invoice for the current Plan or its live same-family successor; allowed in the 24 h lead window, in grace, or ≤ 7 days after an auto-renew-off fallback to Free; period keeps the original billing anchor; otherwise `SUBSCRIPTION_RENEW_WINDOW_CLOSED`
- `setAutoRenew` — paid only; disabling preserves access; re-enabling inside the lead window or grace creates the renewal invoice immediately *(change-080)*
- `processDueTransitions` — retirement eligibility, free/paid access rollover, scheduled target, invoice/grace/fallback; applied `DOWNGRADE` boundary sends one owner plan-change email via SVC-PAY-MAIL *(change-079)*; a paid period ending unrenewed (auto-renew off) sends an expiry email; a void/refunded renewal invoice is replaced next tick by a new invoice (suffixed key); retired/replaced paid Plans renew onto the newest live version of the same `familyKey` at its price (owner notice 7 days before), else fall to Free with period source `PLAN_RETIRED` + email; logs one error per run when no default Free Plan exists *(change-080)*
- `processDueUsageTransitions` — anchored Package-window rollover with exact-once CAS and retirement Free fallback
- `processRetirementNotifications` — bounded owner fan-out and retryable mail delivery; each notice is written with the subscription's `workspaceId` *(change-078)*
- `adminChange`, `adminActivate`, `adminDeactivate` — reason-required overrides; deactivate stores `previousStatus`, bumps lifecycle version and supersedes open renewal invoices; activate only from `INACTIVE`, restoring `previousStatus` *(change-080)*
- invoice reversal handling *(change-080)* — invoked by SVC-PAY-INV on refund/chargeback of an applied invoice: keep access to period end, set `autoRenew=false`, set `reviewRequired`/`reviewReason`, audit
- `reconcileSubscription` — deterministic repair from periods/invoices/events

**Deps:** Plan/Package/subscription/access/usage repositories · SVC-SUB-CALC · SVC-PAY-INV · SVC-PAY-MAIL · UserRepository · SVC-NOTIF · SVC-AUDIT · lifecycle queue
**Rules:** access and quota clocks advance independently · current periods never use live catalog limits/prices · Plan cannot start on/after retirement · compare-and-set lifecycle/current IDs · invoice/notification/transition applied once · invoice/plan-change mail is best-effort after apply and never blocks entitlement *(change-079)*.

---

### SVC-SUB-CALC · SubscriptionBillingCalculator [internal, pure domain, Subscriptions]
Classifies Package-tier direction (`upgrade|downgrade|replacement`) and calculates Plan billing boundaries/proration plus Package quota boundaries in UTC. Paid upgrade charges the normalized positive difference and never extends access/quota. `addBillingInterval` reads Plan snapshot; `addQuotaInterval` reads Package snapshot. Free Package is exact `30 day`; month/year preserve UTC anchor/end-of-month behavior.

---

### SVC-SUB-LIM · SubscriptionLimitService [internal, domain, Subscriptions]
`check`, atomic `reserve(workspaceId, limitKey, amount, operationId)`, idempotent `release` (called by every protected caller when the operation fails after reservation) *(change-080)*, `buildUsageEnvelope`, and `assertResourceUnlocked`. Limit sentinel *(change-080)*: `-1` unlimited · `0` blocked · `>0` cap; the envelope exposes `unlimited: true` per limit and `maxDashboards` usage reflects the count of existing dashboards. Missing usage period throws `SUBSCRIPTION_USAGE_PERIOD_MISSING`; limit-exceeded errors are marked non-retryable. Resolves the current `SubscriptionUsagePeriod` and immutable Package snapshot. Generalized window limits plus daily sync count use conditional reservation; access/usage resolution failure denies mutation. Compatibility output aliases retain old `*PerMonth` names during rollout.

---

### SVC-SUB-ROLL · SubscriptionLifecycleProcessor [internal, application, Subscriptions]
Consumes invoice events and repeatable bounded scans for access transitions, usage transitions, Plan retirement, owner-notification fan-out/mail retry, and reconciliation. Deterministic jobs plus database guards make overlapping replicas safe; schedules are data/calendar-driven.
