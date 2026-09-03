# Impact Analysis — 077 Subscription Catalog Forms, Naming, UX & Migration Delivery

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Plan schema | partial | `subscriptions/schemas/subscription-plan.schema.ts` | no client-facing display fields; `name*` documented as a Package mirror |
| Package schema | complete | `subscriptions/schemas/subscription-package.schema.ts` | no name/tier uniqueness guard (only `familyKey+version`) |
| Catalog DTOs | partial | `subscriptions/dto/subscription.dto.ts` | no display fields; no cross-field price/type rule |
| Catalog service | partial | `subscriptions/services/subscription-catalog.service.ts` | `packageCompatibility()` clobbers plan identity; no uniqueness guards; no combined package+plan versioning command |
| Catalog repositories | partial | `subscriptions/repositories/subscription{,-package}.repository.ts` | no name/tier lookup helpers |
| Period snapshots | partial | `subscriptions/repositories/subscription-period.repository.ts` | `snapshot(plan)` captures `name`/`nameAr` only — no display fields, no descriptions |
| Catalog endpoints | complete | `subscriptions/controllers/subscriptions.controller.ts` | no "new version" (package + linked plan) route |
| Catalog seed | **none** | — | no packages/plans seeder anywhere |
| Migration runner | **none** | — | no `src/database/migrations/`, no ledger, no lock |
| Admin packages page | partial | `admin/packages/packages.page.ts` | 3 icon-only actions, engineer vocabulary, no stage/next-step |
| Admin plans page | partial | `admin/plans/plans.page.ts` | 8 icon-only actions, dead name fields, no cross-validation |
| Customer subs page | partial | `frontend/pages/subscriptions/subscriptions.page.ts` | resolves label from Package only |

**Feature state: partial** — the versioned catalog from change-076 exists end-to-end; this change corrects
its write path, adds the missing client-facing naming layer, makes the admin UI operable, and adds the
missing seed + migration-delivery infrastructure.

---

## Plan-vs-code drift found

1. `EP-SUB-01` in `actions/backend/endpoints/subscriptions.md` documents `SVC-SUB.listPublishedPlans()`;
   the code method is `SubscriptionsService.listPlans()` → `SubscriptionRepository.listPlans()`.
2. `EP-SUB-03`/`EP-SUB-04` document `CreatePlanDraftDto`/`UpdatePlanDraftDto`; the code classes are
   `CreatePlanDto`/`UpdatePlanDto`.
3. `plans.page.ts` collects plan `name`/`description` that the API silently discards — the admin page
   spec does not record that the fields are inert.
4. Orphaned, unused, pre-versioning `admin-panel/src/app/core/models/subscription.models.ts` exists and
   is imported nowhere. **Noted, not touched** (deleting it is unrelated cleanup).

---

## Ripple / Impact Map

Every consumer of a plan's or package's human label, and what it needs.

| # | Consumer | File : line | Today | Action |
|---|----------|-------------|-------|--------|
| R1 | Write-path clobber | `subscription-catalog.service.ts:630-644` | `packageCompatibility()` overwrites plan `name/nameAr/description/descriptionAr` | **Modify** — keep the mirror, exclude the new `display*` fields |
| R2 | **PayUp checkout product name** | `payments/services/payment-checkout.service.ts:135` | `productName: String(invoice.planSnapshot?.name \|\| 'Subscription invoice')` — the customer reads this on the hosted checkout page | **Modify** — prefer `planSnapshot.displayName` |
| R3 | Access-period plan snapshot | `subscription-period.repository.ts:249-267` | captures `name`, `nameAr` only | **Modify** — also capture `displayName`, `displayNameAr` so historical labels are durable |
| R4 | Plan retirement notice (durable + email) | `subscription-lifecycle.service.ts:725-732` → `notifications.service.ts:75-81` | embeds `plan.name` / `plan.nameAr` into stored EN/AR message | **Modify** — pass the resolved display label |
| R5 | Admin subscription filter labels | `admin/admin-pages.service.ts:43-57` | `name: p.name`, `packageName: packageId.name` | **Modify** — add `displayName` so admin dropdowns match what customers see |
| R6 | Customer plan catalog | `subscriptions.service.ts:67` → `subscription.repository.ts:36-41` | returns raw docs + populated `packageId` | **No change** — shape already carries the new fields once added to the schema |
| R7 | `GET /subscriptions/me` | `subscriptions.service.ts:81-120` | `currentPlan` / `currentPackage` fully populated | **No change** — same reason as R6 |
| R8 | Customer subscriptions page | `frontend/pages/subscriptions/subscriptions.page.ts:563-589` | `packageName()`/`packageDescription()`/`currentName()` read Package only | **Modify** — display-name-first fallback chain |
| R9 | Admin plans table label | `admin/plans/plans.page.ts:95` | `plan.name` | **Modify** — show display name, keep internal name secondary |
| R10 | Package usage snapshot | `subscription-usage-period.repository.ts:249-268` | captures package identity fields | **No change** — package naming is unchanged by this change |
| R11 | Invoice snapshots → customer/admin invoice APIs | `billing-invoice.service.ts:253-300`, `billing-invoice.repository.ts:68-69` | returns `planSnapshot`/`packageSnapshot` verbatim + populates `name nameAr` | **No change** — inherits R3 automatically for new invoices |
| R12 | Extra-user ad-hoc plan snapshot | `workspace-invitation.service.ts:138-147` | minimal snapshot, `name` only | **Modify (small)** — add `displayName` for R2 consistency on extra-user invoices |
| R13 | Audit log details | `subscriptions.service.ts:326,609` | `planName: plan.name` | **No change** — internal name is the correct audit value |
| R14 | Dead parameter | `payment-checkout.service.ts:42` `InitiateCheckoutInput.planName` | passed but never used | **No change** — out of scope |
| R15 | Tier-rank direction logic | `billing-calculation.service.ts:93-103` | reads `package.tierRank ?? plan.tierRank` | **No code change** — fixed by the data migration + new uniqueness guard |
| R16 | `findActivePlanByTierRank` | `subscription.repository.ts:79-83` | ambiguous while ranks collide | **No code change** — resolved by the migration |

**Fallback contract (single shared rule, implemented once per app):**
`displayName` → `plan.name` (the Package mirror) → `package.name`, with the `*Ar` chain used when the
locale is Arabic and the Arabic value is non-empty. Empty display fields therefore reproduce today's
behavior exactly, which is what makes this safe for the 3 existing plans and 15 existing subscriptions.

**Historical-data note:** snapshots already written contain no `displayName`, so every snapshot reader
must fall back to `snapshot.name`. No snapshot backfill is performed (they are intentionally immutable).

---

## Files to Create / Modify

### Backend — `roya-ai-dynamo-api`

**Create**

| File | Purpose |
|------|---------|
| `src/modules/subscriptions/utils/plan-label.util.ts` | single `resolvePlanLabel()` / `resolvePlanDescription()` fallback chain used by R2, R4, R5 |
| `src/modules/subscriptions/seeders/subscription-catalog.seeder.ts` | `OnModuleInit` seeder — default Free package + plan, only when no active published default-free plan exists |
| `src/database/migrations/migration-ledger.ts` | `schema_migrations` access + atomic advisory lock with stale-lock reclaim |
| `src/database/migrations/migration.types.ts` | `Migration` + `MigrationContext` contract shared by runner and migration modules |
| `src/database/migrations/migration-runner.ts` | testable orchestration: `migrationsEnabled(env)` gate + `applyMigrations(db, …)` apply-once/lock/dry-run, returning `{applied, skipped}` |
| `src/database/migrations/run.ts` | thin entry point: dotenv, connection, delegate to the runner, non-zero exit on failure |
| `src/database/migrations/001-package-tier-rank-repair.ts` | idempotent Free 0 / Basic 1 / Premium 2 re-rank |
| `src/modules/subscriptions/seeders/subscription-catalog.seeder.spec.ts` | proves no-op against an existing default-free catalog (AC 11) |
| `src/database/migrations/migration-runner.spec.ts` | proves apply-once, concurrency safety, failure handling, dry-run, disabled-flag behavior, and tier-rank idempotency (AC 12, 20–22, 26) |

**Modify**

| File | Change |
|------|--------|
| `schemas/subscription-plan.schema.ts` | add `displayName`, `displayNameAr`, `displayDescription`, `displayDescriptionAr` (optional, default `''`) |
| `dto/subscription.dto.ts` | add the 4 display fields to `CreatePlanDto` + `UpdatePlanDto` (`@IsOptional() @IsString()`) |
| `services/subscription-catalog.service.ts` | R1; add package-name + tier-rank + plan-display-name uniqueness guards with dedicated codes; add `createPackageVersion()` (clone package **and** its linked plan atomically) |
| `repositories/subscription-package.repository.ts` | add `findNonArchivedByName()`, `findNonArchivedByTierRank()` |
| `repositories/subscription.repository.ts` | add `findActivePublishedByDisplayName()` |
| `repositories/subscription-period.repository.ts` | R3 |
| `controllers/subscriptions.controller.ts` | add `POST /subscriptions/packages/:id/new-version` (admin) |
| `services/subscription-lifecycle.service.ts` | R4 |
| `modules/payments/services/payment-checkout.service.ts` | R2 |
| `modules/workspace/services/workspace-invitation.service.ts` | R12 |
| `modules/admin/admin-pages.service.ts` | R5 |
| `subscriptions.module.ts` | register `SubscriptionCatalogSeeder` in `providers` |
| `src/config/env.validation.ts` | add `MIGRATIONS_ENABLED: Joi.boolean().default(true)` |
| `src/config/config.ts` | expose `migrations.enabled` |
| `package.json` | `migrate:run`, `migrate:run:dry-run` (ts-node) + `migrate:run:prod` (`node dist/...`) |
| `k8s.deploy` | add `initContainer` on the same image + `envFrom: roya-dynamo-api-env` |
| `services/subscription-catalog.service.spec.ts` | extend for the new guards + display-field preservation |

**Explicitly NOT modified:** `Dockerfile.build` (AC 24), the two existing `*.migrate.ts` scripts,
`subscription-usage-period.repository.ts`, `billing-calculation.service.ts`, replica count, probes.

### Admin panel — `roya-ai-dynamo-frontend-admin`

| File | Change |
|------|--------|
| `pages/admin/plans/plans.page.ts` | display-field inputs; `planType`↔`priceAmount` + currency cross-validation; labelled primary action + `p-menu` overflow; stage + next-step column; disabled-reason text; grouped dialog sections |
| `pages/admin/packages/packages.page.ts` | labelled actions + overflow menu; stage + next-step; "New version" (package + linked plan) dialog; grouped dialog sections; free-cadence hint |
| `core/models/admin.models.ts` | add the 4 display fields to `SubscriptionPlan` |
| `core/services/subscriptions-admin.service.ts` | add `createPackageVersion()` |
| `public/i18n/en.json`, `public/i18n/ar.json` | new/renamed `PACKAGES.*` + `PLANS.*` keys (AC 17) |

### Customer portal — `roya-ai-dynamo-frontend`

| File | Change |
|------|--------|
| `pages/subscriptions/subscriptions.page.ts` | R8 — display-name-first resolution in `currentName`/`planName`/`packageName`/`packageDescription` |
| `core/models/subscription.models.ts` | add the 4 display fields to `SubscriptionPlan` |
| `public/i18n/{en,ar}.json` | only if new strings are required (expected: none) |

### Change folder

| File | Change |
|------|--------|
| `deploy.md` | **Create** — rollout order, verification queries, flag flip, rollback (AC 27) |

---

## Plan Docs to Update (Step 5.3)

- [x] `project/plan/data-model.md` — 4 new plan fields + label-resolution rule + uniqueness scope; new `schema_migrations` collection
- [x] `project/plan/modules.md` — Subscriptions features 2A/2B/2C; Admin — Subscriptions & Plans feature 2A; new `S14. Database Migrations`
- [x] `project/actions/backend/endpoints/subscriptions.md` — new EP-SUB-33 `POST /packages/:id/new-version`; display fields on EP-SUB-03/04; uniqueness notes on EP-SUB-23/24; stable conflict-code list; **both drift items fixed** (`listPlans`, `CreatePlanDto`/`UpdatePlanDto`)
- [x] `project/actions/backend/services/subscriptions.md` — SVC-SUB-CAT `createPackageVersion` + guards; new SVC-SUB-LABEL, SVC-SUB-SEED, SVC-MIGRATE
- [x] `project/actions/admin-panel/pages/packages.md` + `plans.md` — reworked actions, vocabulary, stage column, display-label section
- [x] `project/actions/customer-portal/pages/subscriptions.md` — label resolution order
- [x] `project/rules.md` — new `RULE-SUB-007` (catalog naming/uniqueness) + `RULE-GLOBAL-013` (migrations vs seeds)
- [x] `project/profile.md` — backend-only database access + `MIGRATIONS_ENABLED` in Environments
- [x] Also updated: `services/payments.md` (SVC-PAY-CHKOUT product name), `services/_index.md`, `endpoints/_index.md` counts
- [x] `changes/change-077-…/deploy.md` — created (rollout order, initContainer, verification, flag flip, rollback)

---

## Risk

**Complexity: High.** **Cross-module: Yes** (subscriptions, payments, workspace, admin, 2 frontends).
**Migration: Yes** (idempotent tier-rank re-rank, delivered via initContainer).

| Risk | Mitigation |
|------|-----------|
| Display fields empty on all 3 existing plans | Fallback chain makes empty ≡ current behavior; AC 13 verifies response shape |
| Snapshots written before this change lack `displayName` | Every snapshot reader falls back to `snapshot.name`; no backfill |
| PayUp `productName` change is customer-visible at checkout | Falls back to `planSnapshot.name`, then `'Subscription invoice'` — unchanged until an admin sets a display name |
| Uniqueness guard could block a legitimate publish | Scoped to active+published only; retired/archived names reusable |
| Two replicas running the migration | Ledger + atomic lock with stale reclaim (AC 21) |
| Tier-rank migration touching live packages | Value-checked and idempotent; only writes `tierRank`; verified by AC 12 + `deploy.md` queries |
| `forbidNonWhitelisted: true` rejects new fields if DTO lags schema | DTO and schema changed in the same commit; covered by AC 2 |
| Admin UX rewrite regressing existing actions | Every existing action preserved, only relabelled/regrouped; AC 15–19 |

---

## Recommendation

- **Create** — `plan-label.util.ts`, `subscription-catalog.seeder.ts`, `migration-ledger.ts`, `run.ts`,
  `001-package-tier-rank-repair.ts`, `deploy.md`, 2 spec files, `POST /packages/:id/new-version`,
  `initContainer` in `k8s.deploy`.
- **Complete** — plan schema + DTOs (display fields), catalog service (uniqueness + versioning
  command), admin packages/plans pages (labelled actions, stage, next step, grouped forms).
- **Modify (ripple)** — R2 checkout product name, R3 period snapshot, R4 retirement notice,
  R5 admin filters, R8 customer page resolution, R9 admin table label, R12 extra-user snapshot,
  config/env + npm scripts.

### Suggested implementation order

1. Migration infrastructure (ledger, runner, tier-rank migration, env, scripts, `k8s.deploy`) — independently verifiable.
2. Plan schema + DTOs + `plan-label.util.ts`.
3. Catalog service: R1, uniqueness guards, `createPackageVersion()`, controller route.
4. Backend ripple: R2, R3, R4, R5, R12.
5. Catalog seeder + module registration.
6. Admin panel: models, service, both pages, i18n.
7. Customer portal: models + label resolution.
8. Specs, builds, `deploy.md`.
