# Verification — 077 Subscription Catalog Forms, Naming, UX & Migration Delivery

## Plan Consistency

- [x] The four `display*` Plan fields, the label-resolution chain, and the uniqueness scopes match `plan/data-model.md` and `rules.md` (`RULE-SUB-007`).
- [x] `schema_migrations` (name unique, `appliedAt`, `durationMs`, `lockedAt`, `lockedBy`) matches the collection documented in `plan/data-model.md`.
- [x] `POST /subscriptions/packages/:id/new-version` matches `EP-SUB-33`; display fields on `EP-SUB-03/04` and the uniqueness notes on `EP-SUB-23/24/28` match the code.
- [x] `SVC-SUB-LABEL`, `SVC-SUB-SEED`, `SVC-MIGRATE` and the extended `SVC-SUB-CAT` match the implemented services.
- [x] Admin packages/plans page specs and the customer subscriptions page spec match the shipped UI.
- [x] Every ripple item R1–R16 in `impact.md` is reflected in code (R6, R7, R10, R11, R13, R14, R15, R16 were correctly no-ops).
- [x] Permissions unchanged: all catalog mutations remain admin-only with `reason` + `idempotencyKey` + audit; the seeder runs as `actorSource: 'system'`.

### Deviations from the plan, and why

1. **Runner split.** `impact.md` planned one `run.ts` plus `run.spec.ts`. Orchestration is instead in `migration-runner.ts` (`migrationsEnabled(env)`, `applyMigrations(db, …)`) with `run.ts` reduced to a process entry point, because `run.ts` calls `process.exit` and cannot be unit-tested directly. `impact.md` was updated to record the split.
2. **Plan-label uniqueness is checked at publish only, and exempts the same `familyKey`.** AC 5 says "creating or publishing". A v2 draft necessarily inherits v1's label, so enforcing it on draft writes or across a family would make versioning — the central fix of this change — impossible. A draft is not customer-visible, so publish is the correct boundary. `RULE-SUB-007` and `EP-SUB-28` were updated to state this explicitly, and both behaviours are verified live below.
3. **Defect 9 added mid-verification.** A display-name-only `PUT` returned `400` on an untouched field. Root cause: a validated DTO instance owns a key for every optional field it declares under `target: ES2023`, so `{ ...existing.toObject(), ...dto }` blanked stored values before validation. Fixed with `definedOnly()` in both `updatePlanDraft` and `updatePackageDraft`; recorded as defect 9 + AC 14b in `change-request.md`.
4. **Defect 10 added after the operator hit it.** With Free v1 and a newly published Free v2 both live, v1 could not be retired: `publishPlan` is the only writer of `isDefaultFree` and no-ops on an already published Plan, while `unpublishPlan`/`scheduleRetirement` both refuse the role holder — a closed loop with no available action. Fixed with a dedicated `setDefaultFreePlan` command (`EP-SUB-34`, `RULE-SUB-008`) plus a labelled **Make default free plan** admin action. `switchDefaultFree` also required a non-transactional fallback, because standalone MongoDB rejects transactions and was failing the swap with a `500`; the release-then-claim order keeps the partial unique index intact either way. Recorded as defect 10 + AC 14c.

## Code Verification

### Architecture and security

- [x] The controller delegates to `SubscriptionCatalogService`; all persistence stays in the three repositories.
- [x] Label resolution has exactly one backend implementation (`utils/plan-label.util.ts`), consumed by checkout, retirement notices, admin filters, and the versioning command.
- [x] `createPackageVersion` is admin-only, idempotent via derived `creationIdempotencyKey`s, and audited.
- [x] The migration `initContainer` reuses the app image and the `roya-dynamo-api-env` secret, so it reads the same `MONGODB_URI` — no new credential path and no database access outside the backend.
- [x] `MIGRATIONS_ENABLED=false` returns before any connection is opened.
- [x] The seeder only ever inserts; it never updates, archives or deletes an existing package or plan.

### Acceptance criteria

| # | Result | Evidence |
|---:|:---:|---|
| 1 | PASS | `packageCompatibility()` returns only the mirror fields (`name*`, `description*`, limits) and is documented as excluding `display*`; unit test "keeps admin-entered display labels instead of overwriting them from the Package". |
| 2 | PASS | Live `POST /subscriptions/plans` with `displayName: "Probe Growth — Monthly"` + `name: "SHOULD BE IGNORED"` → `201` with all four `display*` values verbatim and `name` mirrored to `"Probe 077 Package"`. |
| 3 | PASS | `applyPlanTypeRules()` on `planType.valueChanges`: `free` sets price `0`, applies `max(0)`, and disables the input; `paid` applies `min(0.01)`. The reason is stated inline via `priceHint()` and `saveBlockedReason()`. |
| 4 | PASS | `currency` carries `Validators.pattern(/^[A-Za-z]{3}$/)`, `maxlength="3"`, and a `CURRENCY_HELP` hint; `save()` upper-cases before the call. |
| 5 | PASS | Live: publishing a different family whose resolved label was already live returned `409 SUBSCRIPTION_PLAN_DISPLAY_NAME_TAKEN`. Same-family v2 publish succeeded, which is the documented exemption (deviation 2). |
| 6 | PASS | Live `POST /subscriptions/packages` with `name: "Basic Plan"` → `409 SUBSCRIPTION_PACKAGE_NAME_TAKEN`. |
| 7 | PASS | Live `POST /subscriptions/packages` with `tierRank: 1` → `409 SUBSCRIPTION_PACKAGE_TIER_TAKEN` naming the holder ("Basic Plan"). |
| 8 | PASS | `subscriptions.page.ts` resolves `displayName*` → `name*` → `package.name*` through one `label()` helper; the three live plans have empty display fields and still render their package names. |
| 9 | PASS | Live `POST /packages/:id/new-version` on the immutable "Basic Plan" package produced package `v2` (`immutableAt: null`) plus plan `v2` (`isPublished: false`, `replacesPlanId` → v1) in one call. Rows carry a lifecycle stage, a next-step hint, and the reason Edit is unavailable. |
| 10 | PASS | `SubscriptionCatalogSeeder` (`OnModuleInit`) logged `"Subscription catalog seed skipped: a default Free plan already exists"` on dev boot; unit spec covers insert, skip, concurrent-loser, and failure logging. |
| 11 | PASS | After many dev boots the three plans still read `updatedAt` `2026-06-18`, `2026-06-23`, `2026-06-23` and the three packages `2026-08-26` — untouched. |
| 12 | PASS | Two consecutive runs: first applied `001-package-tier-rank-repair` (`updated: 1`), second reported zero pending. Live packages now read Free 0 / Basic 1 / Premium 2. Unit spec asserts second-run `updated: 0` with no writes issued. |
| 13 | PASS | Live `GET /subscriptions/plans` returns the same 3 plans with the same names and populated `packageId`, plus the four new fields; no subscription, period, or invoice reference changed. |
| 14 | PASS | Backend `npm run build`, admin `npm run build:prod`, portal `npm run build` all succeeded; EN/AR both hold 240 keys with zero asymmetry. |
| 14b | PASS | Live `PUT /subscriptions/plans/:id` with only `{ displayName, reason, idempotencyKey }` → `200`, price `5`, currency `USD`, and both intervals unchanged (was `400` before the fix). Unit test asserts the untouched fields are not even sent to the repository. |
| 14c | PASS | Live, against the operator's own Free v1 + Free v2: retiring v1 → `409 "Choose another default Free Plan before retirement"`; `POST /plans/<v2>/default-free` → `201` with `isDefaultFree: true`; retiring v1 → `201` with `retireAt` set and `isPublished: false`. The customer catalog then returns one Free Plan (v2) instead of two. Four unit tests cover the happy path, the no-op, the paid/unpublished/retiring refusals, and the wrong-cadence refusal. |

**Admin UX**

| # | Result | Evidence |
|---:|:---:|---|
| 15 | PASS | Only two `icon=` usages remain per page: the "New Package/Plan" button (labelled) and the overflow toggle (labelled `COMMON.MORE`). Every row action is a labelled primary button or a labelled `p-menu` item. |
| 16 | PASS | Both tables render a stage `p-tag` (`STAGE_DRAFT/LIVE/HIDDEN/RETIRING/RETIRED`) and a `nextStep()` column; a live row states `BLOCKED_EDIT_LIVE` / `BLOCKED_EDIT_LOCKED` and offers "New version" in the same menu. |
| 17 | PASS | No key under `PACKAGES.*`, `PLANS.*` or `COMMON.*` resolves to `Clone`, `Immutable`, or `Tier rank` in either locale. `PACKAGES.TIER` is now "Tier (upgrade order)"; the dead `COMMON.CLONE` and `PACKAGES.STATUS_IMMUTABLE` keys were removed; `PLANS.IMMUTABILITY_NOTE`, both page titles/subtitles, and `ACTION_PUBLISH_DESCRIPTION` were rewritten in operator language (EN + AR). |
| 18 | PASS | Verified live (AC 9). The confirmation dialog states what will be created and that existing subscribers are unaffected. |
| 19 | PASS | Both dialogs use `section-title` groups (Packages: Identity / Tier / Limits / Reset / Features; Plans: Package / Labels / Pricing / Billing / Extra users), mark required fields, and render `saveBlockedReason()` naming the first unmet requirement whenever Save is disabled. |

**Migration delivery**

| # | Result | Evidence |
|---:|:---:|---|
| 20 | PASS | `node dist/database/migrations/run.js` applied one migration and wrote `schema_migrations{name: '001-package-tier-rank-repair', appliedAt: 2026-09-03T11:16:06Z, durationMs: 645}`; the next run reported zero pending and changed nothing. |
| 21 | PASS | Unit test starts two runners concurrently against one ledger: `up` runs exactly once, one runner reports `applied`, the other `skipped`. The lock is a unique-index-guarded upsert with stale-lock reclaim. |
| 22 | PASS | Unit test: a throwing migration propagates, `markApplied` is never called, the lock is released, and the ledger stays empty. `run.ts` exits non-zero on any error. |
| 23 | PASS | `k8s.deploy` declares `initContainers: [migrate]` on `ghcr.io/roya-tech-team/roya-dynamo-api-prod:latest` with `envFrom: roya-dynamo-api-env`, running `node dist/database/migrations/run.js` before the app container. |
| 24 | PASS | `Dockerfile.build` is untouched: `CMD ["sh","-c","node dist/database/seeds/datasource-type-meta.seed.js && node dist/main"]`. |
| 25 | PASS | `migrate:run` and `migrate:run:dry-run` (ts-node) plus `migrate:run:prod` (`node dist/...`), matching the existing seed-script naming. |
| 26 | PASS | `MIGRATIONS_ENABLED=false` logged that migrations are disabled, exited `0`, and opened no connection; unset/`true` runs normally. `false`/`off`/`0`/`no` are all accepted (case-insensitive) and covered by unit tests. |
| 27 | PASS | `deploy.md` covers prerequisites, rollout order, the initContainer, ledger + `tierRank` verification queries, the `MIGRATIONS_ENABLED` flip, and rollback. |

### Build and test evidence

- [x] Backend: `npx jest` — 14 suites, 69 tests passed.
- [x] Backend: `npm run build` (`nest build`) — passed.
- [x] Admin panel: `npm run build:prod` — passed. Pre-existing initial-bundle budget warning (538 kB vs 500 kB), unchanged by this change.
- [x] Customer portal: `npm run build` — passed. Pre-existing Sass `@import` deprecation warnings only.
- [x] EN/AR admin locales parse and hold 240 keys each with no missing key in either direction.
- [x] Live dry-run and real run of `001-package-tier-rank-repair` against the dev database, plus the `MIGRATIONS_ENABLED=false` off-switch.

### Live probe hygiene

Verification created 3 probe packages and 3 probe plans (including a real "Basic Plan v2" pair from the
new-version probe, and two published rows). All 6 were deleted after confirming zero references from
`workspacesubscriptions`, `subscriptionaccessperiods`, and `billinginvoices`. The catalog was re-read
afterwards: 3 packages / 3 plans, original `familyKey`s, original `updatedAt` values, no `v2` rows, and
no `displayName` set on any live plan. The 9 audit entries the probes generated were intentionally left
in place — the audit log is append-only.

### UI screenshot review

- Skipped: no screenshot or Figma reference was supplied. Routes, templates, action labelling, stage and
  next-step columns, disabled-reason copy, EN/AR keys, and RTL-safe layout were verified in source and by
  a production Angular build of both apps.

## Overall: PASS
