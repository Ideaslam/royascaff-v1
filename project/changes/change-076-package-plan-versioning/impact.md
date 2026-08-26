# Impact Analysis — Package and Plan Versioning

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Plan schema | partial | `roya-ai-dynamo-api/src/modules/subscriptions/schemas/subscription-plan.schema.ts` | Pricing, bilingual catalog text, tier, limits, included users, extra-user price, and billing interval are combined in one mutable document. There is no Package reference, lineage/version, publication state, retirement schedule, default-Free identity, or first-use immutability marker. |
| Package data | none | — | No Package/entitlement entity, repository, service, endpoints, snapshots, or migration exists. |
| Billing/access periods | partial | `subscription-period.schema.ts`, `subscription-period.repository.ts` | A period snapshots the Plan but also owns quota counters. Billing renewal always creates a new period and resets usage, so annual billing cannot reset usage monthly and billing boundaries cannot advance independently. |
| Usage periods | none | — | No separately anchored usage window, Package snapshot, current-usage reference, or exact-once quota rollover exists. |
| Workspace subscription | partial | `user-subscription.schema.ts`, `subscription.repository.ts` | Durable workspace subscription and current Plan/period references exist, but there is no current usage-period reference or retirement/replacement read model. Legacy mutable counters remain on the aggregate. |
| Catalog repository/service | partial | `subscription.repository.ts`, `subscriptions.service.ts` | Customer list uses `isActive` only. Admin can still edit referenced prices, limits, bilingual text, and included-user pricing. `isActive` conflates publication, archive, renewal eligibility, and fallback identity. The unique active-tier index prevents coexisting versions. |
| Limit enforcement | partial | `subscription-limit.service.ts` | Atomic reservations exist, but limits are read from the live current Plan and counters from the billing period. Editing a Plan therefore changes existing subscribers immediately—the confirmed reported defect. Limit names are hard-coded as “per month,” which is invalid for configurable quota cadence. |
| Billing calculation | partial | `billing-calculation.service.ts` | UTC paid/free billing interval and proration exist, but direction reads Plan tier and only distinguishes upgrade/downgrade. It cannot classify same-tier replacement versions or enforce publication/retirement. |
| Subscription lifecycle | partial | `subscription-lifecycle.service.ts`, `subscription-lifecycle.processor.ts` | Hardened upgrade/downgrade/renewal/grace flows exist. They reset counters when every billing period is appended, generate renewal invoices without retirement eligibility, and do not scan quota windows, Plan retirement, or notification deliveries. |
| Invoice snapshots | partial | `billing-invoice.schema.ts`, `billing-invoice.service.ts`, `workspace-invitation.service.ts` | Immutable Plan snapshots exist, but there is no explicit Package reference/snapshot. Extra-user limit/price are both read from mutable Plan fields. |
| Notification delivery | partial | `notifications/*` | Bilingual in-app records and optional email exist, but email failures are swallowed, no dedupe/delivery state exists, and subscription jobs do not trigger notifications. There is no Plan-retirement notification type. |
| Audit | partial | `audit-log.schema.ts`, `audit-log.service.ts` | Workspace/correlation fields exist, but Package/Plan publish/clone/retirement actions are absent. `log()` remains best-effort, so catalog commands need a guarded audit strategy. |
| Migration | partial | `subscription-billing-lifecycle.migrate.ts` | Change 075 normalizes Plans, periods, invoices, and counters. It does not create Packages, lineage, publication/retirement fields, or separate usage periods. |
| Customer models/service/page | partial | `subscription.models.ts`, `subscriptions.service.ts`, `subscriptions.page.ts`, `public/i18n/{en,ar}.json` | Current lifecycle UI is implemented, but Plan models still own limits and one period drives billing and usage. No Package/version/reset-cadence or retirement/replacement banner exists. |
| Admin models/service | partial | `admin.models.ts`, `subscriptions-admin.service.ts` | One CRUD service treats Plans as editable combined products. No Package or explicit publish/clone/retirement commands exist. |
| Admin Packages page | none | — | `/app/packages`, route, navigation entry, and page do not exist. |
| Admin Plans page | partial | `pages/admin/plans/plans.page.ts` | Combined pricing/limits editor with an `isActive` checkbox; referenced price/limits remain editable. No Package picker, lineage, publication, clone, or future retirement controls. |
| Admin Subscriptions/Payments | partial | `pages/admin/subscriptions`, `pages/admin/payments` | Displays one Plan/period only; no Package version, usage window, retirement/replacement state, or Package invoice snapshot. |
| Admin localization | partial/drift | `app.config.ts`, `app-shell.ts`, affected pages | `ngx-translate` packages are installed and RTL CSS exists, but the admin application does not configure translation providers/locales and affected pages are hard-coded English despite the planning/profile bilingual requirement. |
| Tests | partial | backend subscription/payment specs | Change 075 has 23 passing lifecycle/billing/auth/concurrency tests. There are no Package, version lineage, independent quota-window, retirement, or notification retry tests. |

**Feature state:** `partial`. The durable subscription and immutable invoice foundation from change 075 is reusable, but Package/version identity, independent usage windows, retirement, and administration are new.

## Confirmed Root Cause

`SubscriptionLimitService.context()` resolves the active Plan document and `planLimit()` reads its live limit fields. `SubscriptionsService.updatePlan()` prevents changes only to Plan type, tier, and billing interval after use; referenced price, limits, included users, extra-user price, and text remain mutable. Consequently, editing one Plan changes current subscribers instead of creating a new commercial/entitlement version.

## Target Domain Model

### Package

- New `SubscriptionPackage` is the immutable entitlement version.
- Authoritative fields: bilingual name/description, tier rank, limits/features, included users, quota reset interval count/unit, family key, version, replaced Package, archive/immutability metadata.
- Generalize windowed limits to Package snapshot fields such as `maxDataUploads`, `maxDataUpdates`, and `maxSyncedRows`; API compatibility aliases may be returned during rollout.
- A draft is editable/deletable only while unpublished and unreferenced. Published/referenced identity is immutable. Cloning creates the next family version.

### Plan

- `SubscriptionPlan` becomes the immutable commercial offer: `packageId`, type, amount/currency, billing interval, extra-user pricing, family/version/replacement lineage, `isPublished`, `isActive`, default-Free identity, publish/retirement timestamps, and retirement schedule/correlation.
- Bilingual display and tier/limits move to Package. Legacy Plan fields remain read-compatible only through migration; new writes do not make them authoritative.
- Price-only changes clone a Plan against the same Package. Entitlement changes clone the Package and create a new Plan.
- Replace the unique active-tier index with lineage/version and default-Free invariants; multiple active offers may use one Package/tier.

### Billing/access period versus quota period

- Keep `SubscriptionPeriod` as immutable billing/access history. Add explicit `packageId` and Package snapshot; stop using it as the quota source of truth.
- Add `SubscriptionUsagePeriod` with workspace/subscription/Package identity, immutable Package snapshot, sequence, anchored boundaries, source, atomic counters, daily sync state, and optional source billing period/invoice.
- Add `UserSubscription.currentUsagePeriodId`. Keep legacy subscription/period counter fields for migration/read compatibility but stop writing them after cutover.
- Billing period advancement never resets quota merely because an invoice renewed. Usage resets only through one compare-and-set usage-period advance.

### Direction and replacement behavior

- Tier rank comes from the Package, not price or Plan.
- Higher Package rank is an upgrade; lower rank is a downgrade.
- A different Plan at the same Package/tier is a `replacement`, scheduled for billing-period end. This avoids charging an immediate “upgrade” when the entitlement is unchanged and supports retired-price replacement safely.
- Paid-to-paid upgrade preserves current quota period/counters; the target Package cadence starts at the next quota boundary.
- Free-to-paid starts one new access period and one new usage period.
- Scheduled downgrade/replacement changes access at the billing boundary but preserves the current usage window unless that quota boundary is also due.

### Publication and retirement state

- `isPublished=true && isActive=true`: selectable and renewable.
- `isPublished=false && isActive=true`: hidden/grandfathered; existing subscribers may renew before retirement.
- Scheduling retirement requires at least 30 days, sets `isPublished=false` immediately, and stores an idempotent schedule ID and `retireAt`.
- At `retireAt`, the Plan becomes inactive for future periods; already-started periods remain valid.
- Renewals whose new period starts before `retireAt` are allowed. Starts on/after it are denied and fall back to the approved replacement/default-Free path.
- The fallback query uses explicit active + published + default-Free identity, not zero price inference.

### Retirement notifications

- Add durable `plan_retirement` notification type and email delivery/dedupe metadata.
- Scheduling queues/batches one owner notification per retirement schedule. The persistent customer banner is derived immediately from current Plan retirement state, so mail/job delay never hides the warning.
- Email attempts are retryable, idempotent, and audited. Cancellation removes the live banner by clearing the schedule; historical inbox/audit rows remain.

## Affected Modules

- **Subscriptions** — Package/Plan catalog, versioning, publication/retirement, access periods, usage periods, lifecycle selection, safe read models, migration, and tests.
- **Payments** — Package references/snapshots and same-tier replacement invoices.
- **Usage Limits / Data / Dashboards / Pipelines** — callers keep the same limit service API, but reservations move to `SubscriptionUsagePeriod` and generalized window labels.
- **Workspace** — included-user limit comes from Package; extra-user price comes from Plan; invoice snapshots include both.
- **Notifications/Mail** — durable retirement in-app/email notification and retries.
- **Audit** — explicit Package/Plan lifecycle actions with actor/reason/correlation.
- **Background Jobs** — reuse the lifecycle queue for due Plan retirements, usage rollovers, retirement fan-out, and notification retry.
- **Customer Portal** — Package-aware catalog/current subscription, quota window, retirement banner, replacement selection, EN/AR/RTL.
- **Admin Panel** — new Packages page; rewrite Plan commercial/version lifecycle; enrich subscription/payment views; configure affected-page i18n and navigation.

## Plan Documents to Update

- [x] `.ai-control/project/description.md` — immutable Packages/versioned Plans and separate billing/quota behavior.
- [x] `.ai-control/project/plan/modules.md` — Subscription catalog, quota windows, retirement/notifications, and admin Package management.
- [x] `.ai-control/project/plan/data-model.md` — add `subscriptionpackages` and `subscriptionusageperiods`; update Plans, subscriptions, periods, invoices, notifications, audit enums/indexes/relations.
- [x] `.ai-control/project/rules.md` — immutability, publication/retirement, default-Free, billing-versus-quota anchors, notification delivery, and Package-aware extra-user billing.
- [x] `.ai-control/project/actions/backend/services/_index.md` and `subscriptions.md` — Package catalog/versioning, usage periods, retirement, replacement direction.
- [x] Backend service specs `payments.md`, `notifications.md`, `background-jobs.md`, `workspace.md`, and `audit.md` — Package snapshots, retryable retirement notice, queue scans, extra-user pricing, audit actions.
- [x] `.ai-control/project/actions/backend/endpoints/_index.md` and `subscriptions.md` — Package CRUD/clone/archive and explicit Plan clone/publish/unpublish/retirement commands; enrich existing customer/admin contracts.
- [x] `.ai-control/project/actions/customer-portal/pages/subscriptions.md` — Package/reset/retirement/replacement states.
- [x] `.ai-control/project/actions/admin-panel/pages/_index.md` — register Packages page.
- [x] Admin page specs: new `packages.md`; update `plans.md`, `subscriptions.md`, and `payments.md`.

## Code Impact — Create

### Backend

- `src/modules/subscriptions/schemas/subscription-package.schema.ts`
- `src/modules/subscriptions/schemas/subscription-usage-period.schema.ts`
- `src/modules/subscriptions/repositories/subscription-package.repository.ts`
- `src/modules/subscriptions/repositories/subscription-usage-period.repository.ts`
- `src/modules/subscriptions/services/subscription-catalog.service.ts`
- `src/database/seeds/subscription-package-plan-versioning.migrate.ts`
- Focused specs for Package/Plan immutability/lineage, usage-period rollover/CAS, retirement/default-Free, durable notice retry, and migration compatibility.

### Admin Panel

- `src/app/pages/admin/packages/packages.page.ts`
- Affected-page translation resources and minimal admin i18n service/provider assets required by the existing profile contract.

## Code Impact — Modify / Complete in Place

### Backend

- `subscription-plan.schema.ts` — Package relation, commercial lineage, publication/default-Free, retirement; deprecate embedded entitlement authority.
- `subscription-period.schema.ts` — Package reference/snapshot and access-only semantics.
- `user-subscription.schema.ts` — current usage-period reference and retirement/replacement read state as required.
- `subscription.dto.ts` — Package draft/clone/archive DTOs and Plan commercial/version/publish/retirement DTOs with stable validation codes.
- `subscription.repository.ts` — published catalog, populated Package/version read models, explicit default-Free query, retirement scans, reference checks, and non-destructive catalog persistence.
- `subscription-period.repository.ts` — access-period snapshots only; remove counter reset authority.
- `subscription-lifecycle.service.ts` — Package-aware preview/application, same-tier replacement, retirement eligibility/fallback, independent access/usage transitions, notification fan-out.
- `billing-calculation.service.ts` — Package tier direction, replacement classification, separate Plan billing math and Package quota math.
- `subscription-limit.service.ts` and `usage-types.ts` — Package snapshot limits and current usage-period atomic reservations; compatible response aliases.
- `subscriptions.service.ts`, `subscriptions.controller.ts`, `subscriptions.module.ts` — catalog endpoints/service wiring and enriched read DTOs; remove/bypass legacy mutable Plan paths.
- `subscription-lifecycle.processor.ts` — process Plan retirement, usage rollover, retirement notification delivery/retry in bounded idempotent batches.
- `billing-invoice.schema.ts`, repository/service/checkout tests — explicit Package identity/snapshot and replacement action/metadata.
- `workspace-invitation.service.ts` — included users from Package and extra-user commercial price from Plan; dual snapshot invoice.
- `notification.schema.ts`, repository/service/module — retirement type, dedupe key, mail delivery state, retry methods.
- `audit-log.schema.ts`, audit repository/service as needed — explicit Package/Plan lifecycle actions and durable failure visibility.
- `admin-pages.service.ts` — Package/Plan version data in filters/read models.
- `package.json` — versioning migration and dry-run scripts.

### Customer Portal

- `src/app/core/models/subscription.models.ts`
- `src/app/core/services/subscriptions.service.ts`
- `src/app/pages/subscriptions/subscriptions.page.ts`
- `public/i18n/en.json`, `public/i18n/ar.json`

### Admin Panel

- `src/app/core/models/admin.models.ts`
- `src/app/core/services/subscriptions-admin.service.ts`
- `src/app/pages/admin/plans/plans.page.ts`
- `src/app/pages/admin/subscriptions/subscriptions.page.ts`
- `src/app/pages/admin/payments/payments.page.ts`
- `src/app/app.routes.ts`, `src/app/layouts/app-shell/app-shell.ts`, `src/app/app.config.ts`, global styles only as required for Packages route/navigation/i18n/RTL.

## Endpoint Direction

- Keep `GET /subscriptions/plans` but return only active published Plans with safe populated Package data.
- Keep existing customer preview/upgrade/downgrade/pay routes; make target validation Package/publication/retirement-aware and add explicit `replacement` preview direction.
- Keep `GET /subscriptions/me`; add current Package, current usage period, quota cadence/reset, Plan/Package versions, and retirement/replacement warning.
- Add admin Package list/detail/create/update/clone/archive operations under the subscriptions catalog namespace.
- Keep admin Plan list/create/update/archive; constrain update to drafts/safe status metadata and add explicit clone, publish, unpublish, schedule-retirement, cancel-retirement, and reschedule-retirement commands with `{ reason, idempotencyKey }`.
- Customer replacement uses existing lifecycle selection routes; no separate payment provider or browser-only transition is introduced.
- Exact route IDs and method names will be assigned in Step 5.3; controller → service → repository layering remains mandatory.

## Ripple Map

| Caller / dependency | Why affected | Action |
|---------------------|--------------|--------|
| `SubscriptionLimitService` callers in Data/Dashboards/Sync/Pipelines | They rely on current period counters and monthly-named keys. | Preserve call API while routing reservations to current usage period; update response labels, not every caller. |
| `WorkspaceInvitationService` | Reads `freeUsers` and extra-user price from Plan. | Read included users from current Package snapshot and commercial extra-user price from current Plan snapshot. |
| Billing invoice creation/application | Existing snapshots contain Plan+limits in one object. | Add Package ref/snapshot and lifecycle-version validation without weakening PayUp idempotency. |
| Renewal/downgrade jobs | Billing-period append currently resets all counters. | Split access and usage transition operations; process each due clock independently. |
| Free provisioning | Free identity is inferred from price and Plan interval forces 30 days. | Require explicit default-Free Plan with Package reset `30 day`; create both initial periods atomically/idempotently. |
| Upgrade/downgrade classification | Tier rank is on Plan and equal rank falls through as downgrade. | Move rank to Package and add explicit same-tier replacement behavior. |
| Admin subscription filters | Plan label/price only. | Include Plan and Package versions/publication/retirement while retaining ID filters. |
| Notification center | No retirement type/dedupe/mail retry. | Add durable owner retirement notification and retry scan; existing inbox routes remain compatible. |
| Admin navigation/routes | No Packages page. | Register `/app/packages` and navigation entry under subscriptions/plans. |
| Admin i18n | Dependencies installed but providers/locales absent. | Wire translation provider/local storage direction and translate affected pages/navigation; do not rewrite unrelated admin pages. |
| Existing change-075 working tree | Change 075 files are implemented and verified but still uncommitted. | Build change 076 on that verified baseline; preserve and extend those edits rather than reverting or duplicating them. |

## Migration and Compatibility

- New migration is idempotent and dry-run capable and runs after/absorbs the normalized assumptions of change 075.
- Group existing Plans by an exact canonical entitlement signature: bilingual display fields, tier, all limit values, included users, and reset cadence. Create one Package per distinct signature and link each Plan without changing its `_id`.
- Existing Plans receive deterministic Plan family/version lineage, `isPublished = isActive`, explicit default-Free identity, and no retirement.
- Existing free Package reset is `30 day`; existing paid Package reset derives from the current Plan billing interval so no workspace's previously approved reset date changes during migration. Admins create a new Package version to adopt a different cadence.
- Create one usage period for each current subscription from the current period bounds/counters and Package snapshot. Preserve its existing end anchor; do not reset counters.
- Set `currentUsagePeriodId` with compare-and-set. Retain historical `SubscriptionPeriod` documents/counters unchanged for audit, but new reservations use the usage period.
- Backfill Package references/snapshots into periods/invoices where safely derivable; preserve every invoice/payment/Plan/subscription ID and never replay settlement.
- Compatibility DTO aliases keep existing frontend/admin deployments functional during coordinated rollout.

## Verification Plan

- Backend build plus existing and new focused Jest suites.
- Clock-controlled tests for billing monthly/annual versus quota day/month/year, end-of-month/leap-year anchors, and exact 30-day Free.
- Concurrency/replay tests for usage rollover, Plan retirement, duplicate notifications, clone/version allocation, default-Free changes, and replacement selection/payment.
- Immutability tests across draft, published, subscription-referenced, period-referenced, and invoice-referenced records.
- Lifecycle tests for grandfathered renewal before `retireAt`, rejection at/after it, current access preservation, retired paid/free fallback, cancellation/rescheduling, and same-tier replacement.
- Notification tests for one in-app row/one email per schedule, retry after provider failure, cancellation banner behavior, and owner scoping.
- Authorization/audit tests for platform admin versus non-admin and workspace owner versus member.
- Migration fixture/dry-run tests for duplicate limit profiles, multiple Plan billing intervals sharing one Package, exhausted counters, annual paid access, free/paid legacy Plans, referenced invoices, and idempotent rerun.
- Customer/Admin Angular compiler checks, EN/AR JSON validation, affected-page state review, and RTL verification. Screenshot review skipped unless supplied.

## Baseline Verification

- Backend `npm run build`: **PASS**.
- Backend Jest: **PASS**, 6 suites / 23 tests.
- Customer direct Angular compiler: **PASS** with existing unrelated template warnings.
- Admin direct Angular compiler: **PASS**.
- Full Angular CLI production bundle remains locally blocked by Node `22.11.0` versus installed Angular CLI requirement `>=22.12`; direct `ngc` is the baseline code gate.
- The three application repositories contain the approved, verified change-075 edits and are not clean; no unrelated user changes were identified during change-076 recon.

## Plan-vs-Code Drift

| Drift | Resolution |
|-------|------------|
| Admin Plan spec promises bilingual/RTL validation, but the admin app has no configured translation provider/locales and the page is English-only. | Wire scoped admin i18n and update affected pages/navigation. |
| Notification planning describes best-effort email and partial processor wiring, while change 076 requires retryable/deduplicated retirement delivery. | Upgrade only retirement delivery to durable state/retry and consolidate the service spec. |
| Audit planning names explicit financial/lifecycle actions not fully represented by the current enum/service durability. | Add Package/Plan actions and verify catalog commands cannot silently lose their required audit evidence. |
| Current blueprint makes SubscriptionPeriod both access and usage authority. | Split into access `SubscriptionPeriod` and quota `SubscriptionUsagePeriod` throughout consolidated docs. |
| Admin Plan delete is documented as archive, but actual endpoint/service uses generic update and retains broad mutable DTOs. | Replace broad catalog mutation with draft/clone/publish/unpublish/retirement commands and reference-aware archive. |

## Risk

- **Complexity:** High
- **Cross-module:** Yes
- **Migration:** Yes
- **Financial correctness:** High impact
- **Quota correctness/concurrency:** High impact
- **Async notifications/retirement:** Medium-high impact
- **Frontend/API coordination:** Required

## Recommendation

- **Create:** immutable Package catalog, independent usage-period model/repository, catalog/version service, migration, Admin Packages page, and focused tests.
- **Complete in place:** current durable subscription/invoice lifecycle with Package snapshots, same-tier replacement, retirement, independent quota transitions, notification retry, and safe DTOs.
- **Modify ripple:** workspace extra-user pricing, admin filters/navigation/i18n, customer subscription display, invoice/admin payment display, audit actions, and background lifecycle scans.
- **Do not preserve:** live Plan-owned limits, mutable referenced prices, `isActive` as both publication and access, billing-renewal quota resets, price-based/tier-index version conflicts, or silent retirement-email failure.
