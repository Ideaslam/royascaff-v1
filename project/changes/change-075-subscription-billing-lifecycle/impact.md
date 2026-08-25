# Impact Analysis — Subscription and Billing Lifecycle Hardening

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Subscription plan schema | partial | `roya-ai-dynamo-api/src/modules/subscriptions/schemas/subscription-plan.schema.ts` | Monthly price only; no billing interval/count, tier rank, immutable billing price, or explicit free/default-plan identity. Free is inferred from `priceMonthlyUsd === 0`. |
| Current subscription schema | partial | `roya-ai-dynamo-api/src/modules/subscriptions/schemas/user-subscription.schema.ts` | One record per workspace exists, but status/date fields cannot represent auto-renew off, past-due/grace, scheduled downgrade, lifecycle version, or a durable current entitlement-period reference. |
| Entitlement-period data | none | — | Usage counters live on the mutable subscription record; there is no independently identified period or retained period history. |
| Invoice data | none | — | The `payments` document is used as both an invoice and a provider checkout attempt. It cannot safely model retries, due/grace dates, immutable snapshots, supersession, late callbacks, renewal state, refunds, or chargebacks. |
| Payment transaction schema | partial | `roya-ai-dynamo-api/src/modules/payments/schemas/payment.schema.ts` | `userId` is declared as a User ref but customer billing stores a workspace ID in it; `workspaceId` is usually unset. Provider tokens/URLs can leak through raw document responses. No invoice ref, idempotency key, verified amount/currency snapshot, attempt number, expiry, or applied/reconciled marker. |
| Subscription repository | partial | `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts` | `upsertUserSubscription()` always starts a new month and zeroes counters. Rollover uses `now + 1 month`, resets only two monthly counters, can drift period anchors, and is not guarded by a unique period transition. Plan deletion is destructive. |
| Subscription service | partial | `roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts` | Free plans activate immediately; every paid activation resets usage; downgrade to free is immediate; paid downgrade creates a full-price invoice; upgrade charges full target price; periods are hard-coded to one month; any active workspace member can trigger billing; no renewal, grace, scheduled-change, or stable transition errors. |
| Limit service | partial | `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts` | Lazy rollover independently resets counters; dashboard count always returns `0`; period resets omit synced-row counters; check-then-increment is race-prone; sync failures are sometimes fail-open; UTC is not consistently used. |
| Lifecycle jobs | partial | `subscription-activation.processor.ts`, `subscription-period-rollover.processor.ts`, `subscriptions.module.ts` | Activation is keyed to payment callbacks rather than invoice transition state. Paid status may be stored before queue enqueue; an enqueue failure leaves paid-but-unapplied state. Rollover runs every 24 hours relative to boot, so changes can apply up to a day late. No renewal invoice, grace expiry, downgrade, reconciliation, or deterministic job IDs. |
| Checkout integration | partial | `payment-checkout.service.ts`, `payup.provider.ts`, `payment.interface.ts` | Current provider abstraction supports user-present hosted checkout and status lookup only. Confirmation checks provider status but not expected amount/currency. A cancelled checkout marks the invoice-like record failed and cannot be retried. Duplicate/late/superseded sessions are not bound to a lifecycle version. No signed webhook is implemented. |
| Payment repository/service/endpoints | partial | `payments/repositories`, `payments/services`, `payments/controllers` | Starting any invoice fails every pending workspace record, including unrelated extra-user invoices. Admin can mutate or delete financial history. Customer pending-list responses expose full payment documents. No invoice history, reconciliation command, refund/chargeback transition, or workspace-centric filtering. |
| Owner authorization/rate limiting | partial | `subscriptions.controller.ts`, `workspace-role.guard.ts` | Customer billing endpoints have JWT only. `WorkspaceRoleGuard` cannot resolve the current JWT workspace when no route workspace ID is present. Billing endpoints use only the broad global throttle. |
| Audit | partial | `audit-log.schema.ts` | Generic actions exist, but there are no explicit events for renewal state, period rollover, auto-renew changes, scheduled/cancelled downgrade, invoice transitions, grace expiry, refund/chargeback, or reconciliation. |
| Workspace invitation billing | partial | `workspace-invitation.service.ts` | Extra-user invoice shares the same pending-payment namespace and can be superseded by a plan change. It must remain compatible with the new invoice/attempt split. |
| User suspension ripple | incorrect | `users.service.ts`, `users.module.ts`, `payment-checkout.service.ts` | Two cancelled/failed checkouts auto-suspend a User, but billing stores workspace IDs in `Payment.userId`; this can throw after a cancel return. It also conflicts with the approved grace-to-free policy. |
| Data/dashboard quota callers | partial | `data.service.ts`, `sync.service.ts`, `data-sync.processor.ts`, `dashboards.service.ts` | Quota checks and increments are separated, sync checks may fail open, sync counters increment only after completion on a best-effort basis, and dashboard max enforcement currently sees zero dashboards. |
| Customer API models/service | partial | `roya-ai-dynamo-frontend/src/app/core/models/subscription.models.ts`, `core/services/subscriptions.service.ts` | Models expose legacy status/cancel/pending-payment behavior only; no interval, period, invoice, proration, grace, auto-renew, pending change, or owner capability. |
| Customer subscriptions page | partial | `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts` | Offers cancel and free resubscribe, performs plan changes without preview/confirmation, has no scheduled-change cancellation or auto-renew controls, and uses hard-coded English checkout toasts. |
| Customer localization | partial | `roya-ai-dynamo-frontend/public/i18n/en.json`, `ar.json` | Current strings cover cancel/subscribe only; lifecycle, invoice, proration, grace, and scheduled-change states are absent. |
| Admin plan page | partial | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/plans/plans.page.ts` | Existing code is ahead of the page registry, but supports monthly price only and destructively deletes plans. |
| Admin subscriptions page | partial | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts` | Allows direct date/status edits and destructive cancel semantics; period display uses legacy start/end rather than entitlement and scheduled-change state. |
| Admin payments page | partial | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/payments/payments.page.ts` | Treats ledger records as mutable/deletable and cannot display invoice snapshots, attempts, due/grace state, reconciliation, refunds, or chargebacks. |
| Automated tests | none | affected backend/frontend modules | No subscription/payment lifecycle tests exist. Only application smoke specs are present. |

**Feature state:** `partial`. The exploit is confirmed by the actual code path: `selfCancel()` sets the workspace subscription to `cancelled`; `selfSubscribe()` then permits a free plan; `activateFromPayment()` calls `upsertUserSubscription()`, which resets the period and counters unconditionally.

## Root Cause and Confirmed Defects

1. **Subscription identity and entitlement period are conflated.** Re-activation rewrites the same mutable subscription and treats every plan activation as a new usage period.
2. **Invoice and payment attempt are conflated.** A cancelled provider session destroys the actionable invoice state, and retries cannot be modelled independently.
3. **Lifecycle actions have no expected-version guard.** A paid callback created under an old plan state can apply after a later downgrade or invoice supersession.
4. **The rollover process is neither anchor-preserving nor idempotently keyed.** It moves periods to `now`, can drift boundaries, and may disagree with lazy rollover in `SubscriptionLimitService`.
5. **Workspace billing ownership is not enforced.** Any authenticated member in the selected workspace can currently change or pay for its plan.
6. **Workspace and user identifiers are mixed in payment records.** This breaks population, payer identity, audit attribution, cancellation handling, and unpaid-account behavior.
7. **Quota enforcement is incomplete and race-prone.** Dashboard usage is always reported as zero by the limit service, and multiple requests can pass before counters increment.
8. **Financial history is mutable/deletable.** Admin payment CRUD conflicts with the approved immutable billing/audit history.
9. **The documented and actual UI registries drift.** `/app/plans` exists in code but is missing from the admin planning registry; the admin subscription spec still describes plans as a tab on `/app/subscriptions`.

## Target Lifecycle Model

### Entitlements

- Keep exactly one `UserSubscription` lifecycle aggregate per workspace.
- Add `SubscriptionPeriod` as the source of truth for one free/paid entitlement interval and its metered usage. `UserSubscription.currentPeriodId` points to the active/grace period.
- Free periods are exactly 30 days and advance from their existing anchor. No cancel/resubscribe operation exists.
- Paid periods use the selected plan's configured interval unit/count.
- Each period transition uses a unique deterministic key and expected subscription lifecycle version so it can apply once only.
- Usage is reset only by creating/activating the next legitimate period, never by recreating or editing a subscription.

### Plans and pricing

- Add explicit plan type (`free`/`paid`), tier rank, charge price/currency, and billing interval unit/count. Existing monthly plans migrate with `count=1`, `unit=month`, and price copied from `priceMonthlyUsd`.
- Exactly one active default free plan is selected deterministically; free-plan interval is enforced as 30 days.
- Plan deletion becomes guarded deactivation/archive behavior so referenced billing history is never orphaned.
- Upgrade/downgrade classification uses tier rank rather than raw price, which is invalid when plans have different intervals.

### Invoices and payment attempts

- Add immutable `BillingInvoice` records for subscription/renewal/upgrade/extra-user/admin charges. An invoice owns action, workspace, payer, due/grace times, target/current plan and period versions, monetary snapshots, proration inputs, status, supersession, and idempotency key.
- Keep `Payment` as a provider/manual payment-attempt ledger referencing an invoice. Multiple attempts may belong to one open invoice; cancelling one checkout does not invalidate the invoice.
- Only one actionable invoice per workspace and relevant action scope is allowed. Plan invoices do not supersede unrelated extra-user invoices.
- Provider confirmation verifies authoritative status, expected amount, and currency, then atomically/deterministically marks the invoice paid and ensures a lifecycle job exists. Paid-but-unapplied invoices are reconciled.
- Late callbacks for void/expired/superseded or lifecycle-version-mismatched invoices are recorded but cannot alter entitlements.
- Gateway financial records are append-only. Admin actions use explicit settle/reconcile/refund/chargeback transitions rather than generic edit/delete.

### Plan changes and renewal

- Free-to-paid: paid invoice starts a new full target-plan period and resets usage once.
- Paid-to-paid upgrade: preview and invoice the prorated positive price difference for the remaining current period; payment applies the higher tier immediately, retains the existing period end and counters, and cancels a scheduled downgrade.
- Downgrade: store a scheduled target plan and effective period end. It can be cancelled before application. A paid target requires its next-cycle invoice; a free target does not.
- Auto-renew off: no paid renewal invoice is created; the workspace moves to free at paid period end. Resuming before the boundary restores renewal eligibility.
- Auto-renew on: generate the next-cycle invoice before the boundary. Unpaid invoices enter `past_due` at the boundary, retain current-plan access for the validated environment-configured grace period (default seven days), then transition to free.
- Renewal payment during grace starts the paid renewal from the original boundary and resets usage once; grace days do not shift the billing anchor.
- The current PayUp adapter is treated as user-present hosted checkout. “Auto-renew” therefore means automatic invoice generation and lifecycle scheduling, not unattended card charging, unless the provider contract is separately extended and verified later.

## Affected Modules

- **Subscriptions** — lifecycle aggregate, plan intervals, entitlement periods, usage source of truth, proration, scheduled changes, auto-renew, grace, migration, and reconciliation.
- **Payments** — immutable invoices, retryable payment attempts, PayUp verification, safe DTOs, idempotency, refunds/chargebacks, and admin reconciliation.
- **Audit** — explicit financial/lifecycle events.
- **Workspace** — owner authorization support and extra-user invoice compatibility.
- **Users** — remove failed-checkout auto-suspension and the Payments circular dependency; unpaid renewal now degrades the workspace rather than suspending a person.
- **Data / Dashboards** — atomic, period-scoped quota consumption and fail-closed enforcement at existing mutation points.
- **Background Jobs / Config** — deterministic lifecycle/reconciliation scheduling and validated grace/renewal settings.
- **Customer Portal** — owner-only billing UI, lifecycle/invoice states, proration preview, scheduled-change cancellation, auto-renew controls, EN/AR/RTL.
- **Admin Panel** — interval-aware plans, non-destructive subscription controls, immutable invoice/payment history, reconciliation/refund/chargeback commands.

## Plan-vs-Code Drift

| Drift | Resolution |
|-------|------------|
| Admin `/app/plans` page and route exist but are absent from `pages/_index.md`; `subscriptions.md` incorrectly says plans are a tab. | Add a scoped Plans page entry/spec and correct Subscriptions page. |
| Blueprint `usersubscriptions` index still says unique `{ userId: 1 }`, while code correctly uses unique `workspaceId`. | Correct `data-model.md`. |
| Blueprint says free activation uses BullMQ, but the current free paths call `activateFromPayment()` inline; `enqueueFreeActivation()` is unused. | Replace both with the deterministic lifecycle transition design. |
| Blueprint describes checkout creation during subscribe; current code creates a pending record first and starts checkout only from Pay Now. | Document invoice-first, attempt-second behavior. |
| Blueprint says payment belongs to User, but current customer flow writes workspace IDs into `Payment.userId`. | Split workspace billing context from actual payer identity and migrate legacy data. |
| Blueprint says monthly rollover resets counters; code omits `syncedRowsThisMonth`, and lazy/background rollovers can disagree. | Move metered counters into one period source of truth. |
| Blueprint claims dashboard limits are enforced; `countDashboards()` currently always returns zero. | Repair resource usage enforcement and add regression tests. |
| Admin payment specs permit delete and unrestricted update, conflicting with immutable audit requirements. | Replace with append-only transitions. |

## Plan Documents to Update

- [x] `.ai-control/project/description.md` — subscription lifecycle and observable business rules.
- [x] `.ai-control/project/plan/modules.md` — replace legacy subscribe/cancel/full-price downgrade flow with entitlement periods, invoices, proration, scheduled changes, renewal/grace, and history.
- [x] `.ai-control/project/plan/data-model.md` — update SubscriptionPlan/UserSubscription/Payment/AuditLog; add SubscriptionPeriod and BillingInvoice; correct workspace indexes and relations.
- [x] `.ai-control/project/rules.md` — lifecycle invariants, owner authorization, invoice/payment immutability, idempotency, UTC/period anchoring, provider verification, grace behavior, and fail-closed metering.
- [x] `.ai-control/project/actions/backend/services/_index.md` and `subscriptions.md` — lifecycle, billing calculation, periods, usage, reconciliation, jobs.
- [x] `.ai-control/project/actions/backend/services/payments.md` — invoice service/repository and provider attempt lifecycle.
- [x] `.ai-control/project/actions/backend/services/background-jobs.md` — deterministic lifecycle/reconciliation queue.
- [x] `.ai-control/project/actions/backend/services/data.md`, `dashboards.md`, `workspace.md`, `users.md`, `audit.md` — ripple behavior only.
- [x] `.ai-control/project/actions/backend/endpoints/_index.md` and `subscriptions.md` — lifecycle/preview/auto-renew/scheduled-change/invoice endpoints; remove free resubscribe/destructive self-cancel semantics.
- [x] `.ai-control/project/actions/backend/endpoints/payments.md` — safe provider returns and admin reconciliation/refund/chargeback commands; remove destructive ledger operations.
- [x] `.ai-control/project/actions/customer-portal/pages/_index.md` and `subscriptions.md` — complete lifecycle UI and owner-only actions.
- [x] `.ai-control/project/actions/admin-panel/pages/_index.md`, `subscriptions.md`, `payments.md`, and new `plans.md` — correct registry drift and specify non-destructive lifecycle management.

## Code Impact — Create

### Backend

- `src/modules/subscriptions/schemas/subscription-period.schema.ts` — durable period snapshot and usage source of truth.
- `src/modules/subscriptions/repositories/subscription-period.repository.ts` — anchored/idempotent rollover and atomic usage operations.
- `src/modules/subscriptions/services/subscription-lifecycle.service.ts` — state machine for renewal, free fallback, scheduled downgrade, grace, and invoice application.
- `src/modules/subscriptions/services/billing-calculation.service.ts` — UTC interval math and deterministic proration snapshots.
- `src/modules/subscriptions/processors/subscription-lifecycle.processor.ts` — deterministic invoice/period transition and reconciliation consumer.
- `src/modules/payments/schemas/billing-invoice.schema.ts` — immutable invoice aggregate.
- `src/modules/payments/repositories/billing-invoice.repository.ts` — unique actionable-invoice/idempotency operations.
- `src/modules/payments/services/billing-invoice.service.ts` — invoice creation, supersession, paid/void/past-due/refund/chargeback/reconcile transitions and safe customer/admin DTOs.
- `src/database/seeds/subscription-billing-lifecycle.migrate.ts` — idempotent backfill/normalization for plans, subscriptions, periods, workspaces, and legacy payment records.
- Focused backend specs for billing math, lifecycle transitions, period rollover/usage, invoice idempotency, checkout verification, processors, controller authorization, and migration helpers.

### Frontends

- Customer/admin component specs for the approved lifecycle states and actions.
- `project/actions/admin-panel/pages/plans.md` is a new planning spec for an already-existing code page, not a new application route.

## Code Impact — Modify / Complete in Place

### Backend subscription and payment core

- `subscription-plan.schema.ts`, `user-subscription.schema.ts`, `subscription.dto.ts`, `usage-types.ts`
- `subscription.repository.ts`, `subscription-limit.service.ts`, `subscriptions.service.ts`, `subscriptions.controller.ts`, `subscriptions.module.ts`
- `subscription-activation.processor.ts` (replace/remove after compatibility transition), `subscription-period-rollover.processor.ts`
- `payment.schema.ts`, `payment.dto.ts`, `payment.repository.ts`, `payments.service.ts`, `payment-checkout.service.ts`, both payment controllers, `payments.module.ts`
- `background-jobs.module.ts`, `config.ts`, `env.validation.ts`, `audit-log.schema.ts`
- `payment.interface.ts` only as required for stricter verified amount/currency status; no unverified recurring-provider feature will be invented.

### Backend ripple files

- `common/guards/workspace-role.guard.ts` — safely resolve JWT current workspace for owner-only routes.
- `workspace/services/workspace-invitation.service.ts` and `workspace.module.ts` — invoice API compatibility; do not supersede extra-user invoices.
- `users/services/users.service.ts` and `users.module.ts` — remove failed-payment user suspension and Payments circular dependency.
- `data/services/data.service.ts`, `data/services/sync.service.ts`, `data/processors/data-sync.processor.ts`, `dashboards/services/dashboards.service.ts` — atomic/fail-closed period usage consumption at existing enforcement points.
- `admin/admin-pages.service.ts` and controller only where invoice/subscription filters and lifecycle commands require it.
- `package.json` — add migration scripts.

### Customer portal

- `core/models/subscription.models.ts`
- `core/services/subscriptions.service.ts`
- `pages/subscriptions/subscriptions.page.ts`
- `public/i18n/en.json`, `public/i18n/ar.json`

### Admin panel

- `core/models/admin.models.ts`
- `core/services/subscriptions-admin.service.ts`, `core/services/payments.service.ts`
- `pages/admin/plans/plans.page.ts`
- `pages/admin/subscriptions/subscriptions.page.ts`
- `pages/admin/payments/payments.page.ts`

## Endpoint Direction

- Keep plan-list/admin-plan endpoints, adding interval/tier fields and guarded deactivation semantics.
- Replace customer self-cancel with explicit auto-renew update (`enabled: boolean`).
- Add plan-change preview so proration is shown before invoice creation.
- Keep upgrade as payment-gated invoice creation; make downgrade schedule-only and add cancel-scheduled-change.
- Replace pending-payment-only list with safe workspace invoice history/actionable invoice DTOs; keep a temporary compatibility alias if needed during frontend rollout.
- Keep checkout-start endpoint but bind it to an invoice and create a fresh attempt when retrying.
- Keep PayUp confirm/cancel browser-return endpoints; confirm verifies provider status/amount/currency and both outcomes update attempts without trusting the browser.
- Add admin-only reconcile, settle, refund, and chargeback transitions. Remove generic financial-record deletion and constrain updates to safe append-only notes/commands.

Exact EP/SVC IDs will be assigned in-place in Step 5.3 after plan approval.

## Ripple Map

| Caller / dependency | Why affected | Action |
|---------------------|--------------|--------|
| `WorkspaceService.createWorkspace()` | Auto free assignment must create the first 30-day period exactly once. | Keep call; route through idempotent lifecycle initialization. |
| `WorkspaceInvitationService.invite()` | Creates extra-user invoices through checkout service. | Move to invoice service and preserve independent invoice scope. |
| `UsersService.autoSuspendForUnpaidInvoices()` | Conflicts with grace-to-free and receives workspace IDs. | Remove billing call and dead dependency; account suspension remains admin-only. |
| `DataService` upload paths | Monthly usage is currently check-then-increment. | Reserve/consume atomically against current period; release on failed operation where applicable. |
| `DashboardsService` create/refresh | Dashboard count is not actually enforced; refresh is race-prone. | Repair current-resource count/atomic guard and period update consumption. |
| `SyncService` / `DataSyncProcessor` | Sync check can fail open and usage increments best-effort after completion. | Fail closed; reserve trigger quota and commit row usage idempotently. |
| Admin overview/pages | Read legacy counters/payment user fields. | Read normalized period/invoice aggregates; keep compatibility fields during migration. |
| PayUp return URLs | Can arrive late or repeatedly. | Bind attempts to invoice/version; verify amount/currency; always ensure reconciliation job for paid-unapplied invoice. |
| Existing payment activation jobs | Payload is user/workspace ambiguous. | Accept legacy payload temporarily or drain/migrate; new jobs carry invoice ID and deterministic job ID. |

## Migration and Compatibility

- Migration is idempotent, dry-run capable, and records a version marker.
- Existing `priceMonthlyUsd` plans become one-month paid/free plan snapshots without changing displayed price. New interval-aware fields become authoritative; a compatibility response may retain `priceMonthlyUsd` during rollout.
- Existing workspace subscriptions retain their current counters and valid period boundaries. Missing/invalid free periods are derived deterministically without granting an extra reset. Historical cancelled/expired free records become the same workspace's continuous free lifecycle rather than a new subscription.
- Existing payment records are preserved. Workspace IDs incorrectly stored in `Payment.userId` are detected using the workspace collection, copied to `workspaceId`, and payer/owner identity is populated where safely derivable. Corresponding legacy invoices are created without replaying activation.
- Existing paid access is never shortened by migration. Paid-but-unapplied records are reported for reconciliation rather than blindly replayed.
- Compatibility reads remain until backend, customer, and admin deployments are aligned; destructive legacy customer actions are not retained.

## Verification Plan

- Backend build and focused Jest tests.
- Customer and admin Angular builds plus focused component/service tests.
- Migration dry run against fixtures for: active free, exhausted free, cancelled/recreated free, active paid, paid near expiry, pending/paid legacy payment, extra-user invoice, missing period dates, and duplicate legacy subscriptions.
- Concurrency tests for duplicate upgrade clicks, concurrent PayUp returns, paid-before/after scheduled downgrade, rollover job replay, grace expiry replay, and simultaneous usage consumption at the last available unit.
- Authorization tests for owner, workspace admin/member, platform admin, wrong workspace, and unauthenticated caller.
- Contract tests that customer invoice responses never expose provider tokens, checkout auth tokens, secret URLs, or raw gateway payloads.
- Clock-controlled UTC tests for 30-day free periods, month/year intervals, leap years, end-of-month anchors, proration rounding, paid renewal during grace, and exact-once resets.

## Baseline Verification

- Backend `npm run build`: **PASS** before implementation.
- Customer `npm run build`: **BLOCKED by local runtime**, not code — Node `22.11.0`; Angular CLI requires `22.12+` or `20.19+`.
- Admin `npm run build:dev`: **BLOCKED by the same local Node version**.
- No affected subscription/payment tests currently exist.
- All three affected repositories were clean before recon/build; build generated no tracked changes.

## Security / Operational Finding

Ignored local `.env*` files contain PayUp credentials, including production-looking credentials. They are not tracked in Git and no history entry was found, but the credentials should be rotated before deployment because they were exposed during this audit. Rotation is an external provider action and is not performed automatically by this code change.

Official current PayUp documentation for the configured `payupconnect.com` API could not be reliably retrieved during recon. The implementation plan therefore relies only on the provider operations present in the repository (hosted checkout creation and authoritative session lookup) and will not assume unattended recurring charging or signed webhooks without separately verified provider documentation.

## Risk

- **Complexity:** High
- **Cross-module:** Yes
- **Migration:** Yes
- **Financial correctness:** High impact
- **Concurrency/idempotency:** High impact
- **Frontend/API coordination:** Required
- **External provider uncertainty:** Medium; contained behind the existing provider adapter

## Recommendation

- **Create:** `SubscriptionPeriod`, `BillingInvoice`, their repositories/services, billing calculation, lifecycle processor/reconciliation, migration, and focused tests.
- **Complete in place:** existing subscription, usage-limit, payment checkout, PayUp verification, customer billing, admin lifecycle, and plan interval implementations.
- **Modify ripple:** Workspace extra-user billing, Users unpaid behavior, Data/Dashboard/Sync quota callers, audit actions, background queue/config, and planning registries.
- **Do not preserve:** free resubscribe, immediate destructive cancellation, immediate downgrade, full-price mid-period upgrade, mutable/deletable gateway financial records, failed-payment user suspension, or fail-open quota behavior.
