# Change Request

## Metadata
- **date**: 2026-09-03
- **change-type**: bug-fix
- **target-app**: admin-panel + customer-portal + backend
- **affected-repos**: backend + admin + frontend
- **priority**: high

## Scope
- Module(s): Subscriptions (catalog: Packages + Plans)
- Feature(s): Package catalog admin, Plan catalog admin, plan presentation to customers, catalog bootstrap seed
- Endpoint(s): EP-SUB-01, EP-SUB-03, EP-SUB-04, EP-SUB-23, EP-SUB-24, EP-SUB-25, EP-SUB-27, EP-SUB-28
- Page(s)/View(s): `admin-panel: packages`, `admin-panel: plans`, `customer-portal: subscriptions`
- Service(s): SVC-SUB-CAT (`SubscriptionCatalogService`), new `SubscriptionCatalogSeeder`, new
  migration runner + `schema_migrations` ledger, `SubscriptionPackageRepository`, `SubscriptionRepository`
- Deploy artifacts: `Dockerfile.build`, `k8s.deploy` (new `initContainer` gated by
  `MIGRATIONS_ENABLED`), `package.json` scripts, `deploy.md` runbook in this change folder

## Description

### Problem

The Packages and Plans admin catalog is unusable in its current state. Defects 1–6 were reproduced
live against the running API on 2026-09-03 (all probe data created during investigation was deleted;
the database was verified back at its original 3 packages / 3 plans). Defects 7–8 were confirmed by
reading the admin page sources and the deployment manifests. Defects 9–10 surfaced while verifying this
change and were reproduced and fixed within it.

1. **Plan create always fails on first attempt.** The admin plan form defaults to
   `planType: paid` + `priceAmount: 0`. Angular's `Validators.min(0)` accepts this and enables Save,
   but `SubscriptionCatalogService.validatePlan()` rejects any paid plan under `0.01`. Reproduced:
   `POST /subscriptions/plans` → `400 "Paid Plans must cost at least 0.01"`.

2. **Four plan form fields are silently discarded.** The admin plan form collects
   `name`, `nameAr`, `description`, `descriptionAr`, but `createPlan()` and `updatePlanDraft()`
   spread `packageCompatibility(pkg)` *after* the submitted values, unconditionally overwriting all
   four from the linked Package. Reproduced: submitted `name: "My Public Plan Name"`,
   `nameAr: "اسم للعرض"`, `description: "client facing text"` → persisted as `name: "Basic Plan"`,
   `nameAr: ""`, `description: ""`. There is currently **no** plan-level, client-facing label
   anywhere in the data model.

3. **Duplicate client-facing names are possible and invisible.** There is no uniqueness guard on any
   display name (the legacy `name_1` index was dropped by the change-076 migration, verified absent).
   Reproduced: created a second Package named "Basic Plan"; the admin plan list then showed two rows
   both labelled "Basic Plan", separable only by `familyKey`. Once the second is published,
   `GET /subscriptions/plans` returns two identically-labelled cards to customers.

4. **Live packages and plans cannot be edited, and the UI presents no way forward.** All 3 packages
   and all 3 plans carry `immutableAt`, so `assertPlanDraft` / `assertPackageDraft` reject edits.
   Reproduced: `PUT /subscriptions/plans/:id` → `409 "Plan is published or referenced; clone it to
   make changes"`; same for the package. The admin UI hides the Edit button entirely in that state
   (`@if (!plan.immutableAt && plan.isActive)`) and offers only a bare Clone action with no guidance,
   so the operator perceives a hard dead end. Creating *new* packages/plans is not actually blocked
   by existing subscribers — the real blockers are defects 1, 2 and this missing versioning path.

5. **Existing tier ranks collide.** The "Basic Plan" and "Premium Plan" packages both have
   `tierRank: 1` (only Free is `0`). `BillingCalculationService` derives upgrade/downgrade direction
   from tier rank, so Basic↔Premium currently resolves as `replacement` instead of an
   upgrade/downgrade, and `findActivePlanByTierRank()` is ambiguous.

6. **No packages/plans seed exists.** The only subscription scripts are two one-off migrations
   (`subscription-billing-lifecycle`, `subscription-package-plan-versioning`), neither of which seeds
   a catalog. The current catalog exists only because the versioning migration converted legacy rows.
   A fresh environment boots with an empty catalog, and `SubscriptionLifecycleService` requires an
   active published default Free plan to provision a workspace — so signup breaks on a clean database.

7. **The admin catalog UI does not tell the operator what to do.** Every row action is an icon-only
   button whose meaning lives in a `title` tooltip — the plans table renders up to **eight** bare
   icons per row (pencil, send, archive, copy, eye-slash, calendar-times, calendar, times). The
   vocabulary is internal engineering language rather than operator language: `Immutable`,
   `Clone`, `Tier rank`, `Entitlement Packages`, and the raw `familyKey` shown under each name. No row
   communicates its lifecycle stage or the next valid step, so the operator cannot tell that "Clone"
   is in fact the supported way to change a live plan's price.

8. **There is no way to apply a data migration in production.** Migrations exist only as
   `ts-node` developer scripts run manually against the database. The operator has no direct database
   access — only the backend does — so a migration cannot currently be applied at all. The deployment
   also runs `replicas: 2`, meaning anything wired naively into container startup executes twice
   concurrently on every rollout.

9. **Every partial catalog update is rejected.** `updatePlanDraft()` and `updatePackageDraft()` validate
   `{ ...existing.toObject(), ...dto }`, but a validated DTO instance owns a key for *every* optional
   field it declares (class fields are defined under `target: ES2023`), so absent fields arrive as
   `undefined` and blank out the stored values before validation runs. Reproduced after the display
   fields landed: `PUT /subscriptions/plans/:id` with only `{ displayName, reason, idempotencyKey }`
   → `400 "Billing interval must be a positive integer"` on a field the admin never touched. The admin
   form happens to post every field, which is why this was invisible until a display-name-only edit
   became a legitimate operation.

10. **A new Free version can never take over, so the old one can never be retired.** Exactly one active
    published Plan carries `isDefaultFree`, and `publishPlan()` is the only writer of that flag — but it
    early-returns on an already published Plan (`if (existing.isPublished) return existing`). So once a
    new Free version is published (which is what "Create new version" produces), nothing can move the
    role onto it: the admin publish action is disabled as "already live". Meanwhile both
    `unpublishPlan()` and `scheduleRetirement()` refuse to touch the Plan that holds the role. Reproduced
    live with Free v1 + Free v2 both published: `POST /plans/<v1>/retirement` →
    `409 "Choose another default Free Plan before retirement"`, with no available action to change that.
    Secondary finding: `switchDefaultFree()` runs inside a transaction, which standalone MongoDB rejects
    (`Transaction numbers are only allowed on a replica set member or mongos`), so publishing a Free Plan
    with `makeDefaultFree` also fails outright on single-node deployments.

### Desired behavior

**Plan-level client-facing display fields.** `SubscriptionPlan` gains `displayName`, `displayNameAr`,
`displayDescription`, `displayDescriptionAr`. These are admin-owned and never overwritten by
`packageCompatibility()`. Customer-facing surfaces prefer the plan's display field and fall back to
the Package name/description when it is empty, preserving today's behavior for existing rows. The
Package keeps `name`/`nameAr` as its internal entitlement label, and the Plan's compatibility `name`
mirror keeps syncing from the Package so no existing consumer breaks.

**Active-scope display-name uniqueness.** Creating or publishing is rejected when another
**active + published** plan already presents the same resolved client-facing name (case-insensitive,
trimmed), and when another **non-archived** package already uses the same name. Archived, retired and
superseded older versions keep their historical names untouched — a retired name may be reused.

**Guided versioning instead of a dead end.** Immutability is preserved (existing subscribers stay
grandfathered). The admin gains an explicit "Create new version" action that clones the Package and
its Plan into a linked editable draft in one step, and the immutable state is explained inline on the
row instead of silently hiding Edit.

**Form/API contract alignment.** The plan form cross-validates `planType` against `priceAmount`
(paid ≥ 0.01, free = 0), validates the 3-letter currency pattern, and warns when a free-tier package
does not use the exact 30-day reset cadence required for a default free plan.

**Startup catalog seed.** A new `SubscriptionCatalogSeeder` runs on API startup following the
existing `WidgetDefinitionSeeder` / `AiModelPricingSeeder` pattern. It seeds **only** the mandatory
default Free package + plan, **only** when no active published default-free plan exists. It is
insert-if-missing keyed on `familyKey`, and never updates, overwrites, archives or deletes any
existing package or plan — matching the documented `datasource-type-meta.seed.ts` guarantee.

**Tier-rank repair.** An idempotent migration re-ranks the three existing packages (Free 0, Basic 1,
Premium 2), and a guard rejects a new non-archived package that reuses an active tier rank.

**Admin catalog UX and vocabulary.** Both admin pages are reworked so the next action is obvious:

- **Labelled actions, not icon soup.** Each row gets one labelled primary button for its current
  stage, with the remaining actions in a labelled overflow menu (PrimeNG `p-menu`). No action is
  reachable by tooltip alone.
- **Operator vocabulary.** `Clone` → **"New version"**; `Immutable` → **"Live"**; `Archive` on an
  unpublished draft → **"Delete draft"**; `Publish` → **"Publish to customers"**; `Unpublish
  immediately` → **"Hide from new customers"**; `Tier rank` → **"Tier (upgrade order)"**. `familyKey`
  moves behind a subtle "internal ID" affordance instead of sitting under every name.
- **Lifecycle stage + next step.** Every row states its stage (Draft → Live → Hidden → Retiring →
  Retired) and the next valid step, e.g. a draft reads "Next: publish to customers", and a live plan
  reads "Live — in use by existing subscribers. Create a new version to change pricing or limits."
- **Explain, don't hide.** Where Edit is currently hidden outright, the row now shows the reason plus
  the "New version" action, so the 409 path is never reached by surprise.
- **Guided package versioning.** "New version" on a package clones the package *and* its linked plan
  into one editable draft pair, with a confirmation dialog that states exactly what will be created
  and that existing subscribers are unaffected.
- **Form guidance.** Both dialogs group fields (Identity / Client-facing / Limits / Billing), mark
  required fields, explain the free-plan 30-day cadence requirement inline, and show why Save is
  disabled instead of leaving a dead button.

All new copy ships in EN and AR, and the pages keep the existing PrimeNG design system and brand
tokens — this is clarity and hierarchy work, not a new visual language.

**Production migration delivery.** Migrations become deployable by the backend alone:

- A single **migration runner** (`node dist/database/migrations/run.js`, plus a `ts-node` script for
  local use) discovers ordered migration modules and applies only those not yet recorded.
- A **`schema_migrations` ledger collection** records each applied migration by name with its
  timestamp, so every migration runs **exactly once ever** and repeat deploys are no-ops.
- An **atomic advisory lock** (unique-index-guarded `findOneAndUpdate` upsert with a stale-lock
  timeout) makes concurrent execution safe under `replicas: 2` — one replica applies, the other
  observes and exits cleanly.
- The runner is wired as an **`initContainer` in `k8s.deploy`** using the same image and `envFrom`
  secret as the app container. The app container starts only after migrations succeed; a failed
  migration exits non-zero so the pod never serves code against an unmigrated database.
- The step is **gated by `MIGRATIONS_ENABLED`** (read from the `roya-dynamo-api-env` secret,
  defaulting to `true` when unset). When `false` the runner logs that it is disabled and exits `0`
  without connecting to the database. This is the intended off-switch after this rollout: it needs no
  code change and no image rebuild, and it is flipped back to `true` for the next migration. The
  migration code itself stays in the repo so fresh, staging and restored databases still converge.
- `Dockerfile.build` is **not touched at all**: the existing `datasource-type-meta.seed.js` step in
  the `CMD` chain stays exactly as-is, and the new subscription catalog seed needs no entry there
  because it runs in-process via `OnModuleInit` (the `WidgetDefinitionSeeder` pattern). Seeds stay
  idempotent and per-boot inside the app; migrations run in the ledger-backed initContainer.

### Who is affected

- **Platform admins** — can finally create, name, version and publish packages/plans without hitting
  silent field loss, misleading validation, or an unexplained 409, and can read the catalog pages
  without knowing the internal versioning model.
- **Whoever deploys the API** — can apply data migrations through a normal rollout without any
  database access.
- **Customers** — see distinct, admin-controlled plan names on the subscriptions page; never two
  identically-labelled cards; correct upgrade/downgrade direction between Basic and Premium.
- **New environments** — boot with a valid default Free plan so workspace provisioning and signup work.

### User story

**Happy path** — Admin opens Packages, creates "Growth" (tier rank 3, limits, 30-day cadence). Opens
Plans, picks the Growth package, sets a client-facing display name "Growth — Monthly", price 29 USD,
saves; the form blocks save until the price is valid, and the display name persists exactly as typed.
Admin publishes it. A customer opens Subscriptions and sees a "Growth — Monthly" card at $29.

**Edge — change the price of a live plan** — Admin clicks "Create new version" on the published
Basic plan. The system clones Package v2 + Plan v2 as a linked draft, admin edits the price, publishes
it, and schedules retirement of v1 with the standard 30-day notice. Existing Basic subscribers stay on
v1 until they move.

**Edge — duplicate name** — Admin tries to publish a second plan whose resolved display name is
already used by an active published plan. The API rejects with a distinct conflict code and the admin
form shows the message inline.

**Edge — clean database** — API boots against an empty catalog; the seeder inserts the default Free
package + plan and logs the result. On the next boot it detects the existing default free plan and
does nothing.

**Edge — production rollout** — A new image is rolled out. Both replicas start their initContainer;
one acquires the migration lock and applies the pending tier-rank migration, the other finds the
ledger already satisfied and exits 0. Both app containers then start. The next rollout applies
nothing and logs "0 pending".

### Permissions

Unchanged. All catalog mutations remain `JWT + admin` and continue to require `reason` +
`idempotencyKey`, and continue to write an audit entry via `AuditLogService.logRequired`. The seeder
runs as `actorSource: 'system'`.

### Data changes

- `SubscriptionPlan`: add `displayName`, `displayNameAr`, `displayDescription`, `displayDescriptionAr`
  (all optional, default `''`).
- New `schema_migrations` collection: `{ name (unique), appliedAt, durationMs, lockedAt, lockedBy }`.
- No field removals, no renames, no changes to existing collections beyond the four new plan fields.
- Migration: re-rank the 3 existing packages' `tierRank` (idempotent, value-checked).
- No backfill needed for the display fields — empty means "fall back to package", which reproduces
  current behavior exactly.

### Out of scope

- Relaxing immutability or mutating entitlements for existing subscribers.
- Changing pricing, proration, invoicing or the retirement schedule mechanics.
- Landing-site pricing content.
- The `GET /subscriptions/plans` auth level (it requires JWT today; unchanged).
- Reworking the `features` JSON editor into a structured editor.
- Retrofitting the two existing one-off migration scripts (`subscription-billing-lifecycle`,
  `subscription-package-plan-versioning`) into the ledger — they stay as manual scripts, already
  applied.
- Changing the `Dockerfile.build` datasource-type seed step, the CI/CD pipeline, replica count, or
  probe configuration.
- A new admin visual language — the existing PrimeNG theme and brand tokens are kept.

## Acceptance Criteria

1. `SubscriptionPlan` persists `displayName`, `displayNameAr`, `displayDescription`,
   `displayDescriptionAr` exactly as submitted; `packageCompatibility()` no longer overwrites them.
2. `POST /subscriptions/plans` with a display name returns a plan whose `displayName` equals the
   submitted value (verified by re-reading via `GET /subscriptions/plans/all`).
3. The admin plan form cannot be submitted with `planType: paid` and `priceAmount < 0.01`, nor with
   `planType: free` and `priceAmount > 0`; the disabled state is explained inline, not silent.
4. The admin plan form rejects a `currency` that is not exactly 3 letters before calling the API.
5. Creating or publishing a plan whose resolved client-facing name matches another active+published
   plan returns a `409` with a dedicated error code, surfaced inline in the admin form.
6. Creating a package whose name matches another non-archived package returns a `409` with a
   dedicated error code, surfaced inline in the admin form.
7. Creating a package whose `tierRank` matches another non-archived package returns a `409` with a
   dedicated error code.
8. The customer subscriptions page shows the plan's `displayName` when set, and the package name when
   it is empty; Arabic uses `displayNameAr` with the same fallback chain.
9. Admin package and plan rows with `immutableAt` show an inline explanation plus a "Create new
   version" action; invoking it produces an editable draft Package + linked draft Plan in one step.
10. `SubscriptionCatalogSeeder` runs on API startup, inserts the default Free package + plan only when
    no active published default-free plan exists, and logs inserted/skipped counts.
11. Re-running the seeder against the current database leaves all 3 existing packages and all 3
    existing plans byte-identical (verified by comparing `updatedAt` before and after).
12. The tier-rank migration is idempotent: after two consecutive runs the packages read Free 0,
    Basic 1, Premium 2, and re-running reports zero changes.
13. `GET /subscriptions/plans` continues to return the same shape, and existing subscribers'
    `planId` / `currentPlanId` references and period snapshots are unchanged.
14. Backend `npm run build` and both Angular `ng build` runs succeed; EN and AR i18n keys exist for
    every new admin and customer string.
14b. A partial `PUT` on a Plan or Package draft validates and writes only the submitted fields:
    `{ displayName, reason, idempotencyKey }` succeeds and leaves price, currency, and both intervals
    at their stored values.
14c. After publishing a new Free version, `POST /plans/:id/default-free` moves the default-Free role onto
    it and the previous holder can then be hidden or retired. The admin plans page exposes this as a
    labelled **Make default free plan** action, and the blocked "Hide"/"Retire" reasons on the current
    holder point at it. The swap works on standalone MongoDB as well as a replica set.

**Admin UX**

15. No row action on either admin catalog page is icon-only: every action is reachable via a visible
    text label, either as the row's primary button or as a labelled overflow-menu item.
16. Every package and plan row displays its lifecycle stage and a next-step hint; a live/immutable row
    states why it cannot be edited and offers "New version" in the same place.
17. The strings `Clone`, `Immutable`, and `Tier rank` no longer appear in the admin packages or plans
    UI, replaced by "New version", "Live", and "Tier (upgrade order)" respectively (EN and AR).
18. "New version" on a package produces an editable draft package **and** a linked draft plan in one
    action, after a dialog stating what will be created and that existing subscribers are unaffected.
19. Both dialogs group fields into labelled sections, mark required fields, and display the reason the
    Save button is disabled.

**Migration delivery**

20. `node dist/database/migrations/run.js` applies pending migrations, records each in
    `schema_migrations`, and on a second consecutive run reports zero pending and changes nothing.
21. Two runners started concurrently result in each migration being applied exactly once; the loser
    exits `0` without applying, and a stale lock older than the timeout is reclaimed.
22. A failing migration exits non-zero, is not recorded in the ledger, and the runner surfaces the
    error.
23. `k8s.deploy` declares an `initContainer` on the same image and `envFrom` secret that runs the
    runner, so the app container starts only after it succeeds.
24. `Dockerfile.build`'s existing `datasource-type-meta.seed.js` step is unchanged and still runs
    before `dist/main`.
25. `package.json` exposes both a local (`ts-node`) and a production (`node dist/...`) migration
    script, following the naming convention of the existing seed/migrate scripts.
26. With `MIGRATIONS_ENABLED=false` the runner logs that it is disabled, exits `0`, and opens no
    database connection; with the variable unset or `true` it runs normally.
27. `project/changes/change-077-bug-fix-subscription-catalog/deploy.md` documents the rollout order,
    the ledger + `tierRank` verification queries, how to flip `MIGRATIONS_ENABLED`, and the rollback
    procedure.

## Notes

- Reproduction evidence gathered 2026-09-03 against `http://localhost:3000/api/v1` with a minted
  admin token, on the shared dev database. All probe rows (`probe-*` idempotency keys) were deleted
  and the catalog was verified restored to `legacy-8137123ac8c70d8e`, `legacy-81ccfc721bdf3e91`,
  `legacy-bf3ffea528241e0a` / `basic-plan`, `free-plan`, `premium-plan`.
- Seeder pattern to follow: `src/modules/dashboards/seeders/widget-definition.seeder.ts` and
  `src/integrations/ai/seeders/ai-model-pricing.seeder.ts` (startup, insert-if-missing).
  Safety contract to mirror: header comment of `src/database/seeds/datasource-type-meta.seed.ts`.
- Default-free invariants that the seeder must satisfy: package `tierRank: 0`,
  `quotaResetIntervalUnit: 'day'`, `quotaResetIntervalCount: 30` (`isExactFreePackage`), and exactly
  one active published `isDefaultFree` plan (partial unique index).
- Deploy facts confirmed 2026-09-03: `k8s.deploy` runs `replicas: 2` in namespace `production`, image
  `ghcr.io/roya-tech-team/roya-dynamo-api-prod:latest`, config via `envFrom` secret
  `roya-dynamo-api-env`. Current `Dockerfile.build` `CMD` is
  `sh -c "node dist/database/seeds/datasource-type-meta.seed.js && node dist/main"`. The `initContainer`
  must reuse the same image and `envFrom` secret so it reads the same `MONGODB_URI` the backend uses.
- The `startupProbe` allows `failureThreshold: 24 × periodSeconds: 5` = 120s, which the initContainer
  does not consume (init runs before the app container and its probes) — no probe tuning needed.
- Admin UI baseline for the redesign: `packages.page.ts` rows currently expose 3 icon-only actions and
  `plans.page.ts` up to 8; existing i18n keys live under `PACKAGES.*` / `PLANS.*` in
  `roya-ai-dynamo-frontend-admin/public/i18n/{en,ar}.json`.
- **Operator intent**: the migration step will be switched off after this rollout succeeds. That is
  handled by setting `MIGRATIONS_ENABLED=false` in the `roya-dynamo-api-env` secret — not by deleting
  the migration code, so staging / fresh / restored databases still converge, and the runner is
  reusable for the next migration by flipping the flag back. Independently of the flag, the
  `schema_migrations` ledger already makes every subsequent rollout a no-op.
- This supersedes nothing in change-076; it corrects and completes it.
