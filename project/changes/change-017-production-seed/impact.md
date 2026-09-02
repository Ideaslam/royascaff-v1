# Impact Analysis — Production Platform Seed

Change: `change-017-production-seed` · Repo: `payup-api-typescript`

Confirmed request: `changes/change-017-production-seed/change-request.md`

---

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Local unified seed | **complete** (unsafe for prod) | `src/scripts/seed.ts` | Orchestrates currencies → gateways → libraries → encryption → admin. Supports `--clear`. Always overwrite-oriented. |
| Currency seed | **complete** (destructive) | `src/scripts/seed-currencies.ts` | `updateOne` `$set`s `rateFromUsd`, `rateSource: 'seed'`, `isActive` on every run. Would wipe live FX. |
| Gateway catalog seed | **complete** (unsafe `enabled`) | `src/scripts/seed-available-gateways.ts` | Updates existing rows including `enabled`. Test gateway not in the list (good). |
| Library seed | **complete** | `src/scripts/seed-libraries.ts` | Insert + overwrite scopes/modules on known identifiers. `--clear` deletes all. |
| Admin seed | **complete** (overwrites password) | `src/scripts/seed-admin-user.ts` | Updates password/name/`isActive` when email exists. Hardcoded local defaults. |
| Encryption seed | **complete** (local-only) | `src/scripts/seed-encryption.ts` | Can write hardcoded `DEFAULT_MASTER_KEY` and demo keys. **Must not be called from prod path.** |
| Gateway-rules seed | **complete** (manual, keep) | `src/scripts/seed-gateway-rules.ts` + `GatewayRuleService.createSeedRules` + `POST .../gateway-rules/seed` | Per-app. Out of scope. |
| Notification seed | **complete** (idempotent) | `src/services/notifications/seed.ts` | Called from `index.ts` `startServer()`. Create-if-missing only. Reusable as-is. |
| Production seed service | **none** | — | No `PlatformSeedService`, no `seed:prod`, no dataset allowlist, no `--dry-run` / `--confirm`. |
| Currency writes | **complete** (reuse) | `repositories/currency/currency-repository.ts` | `findByCodeAny`, `create` (via `BaseRepository`). `bulkUpsertRates` overwrites rates — **do not use for this seed**. |
| Gateway catalog writes | **complete** (reuse) | `AvailableGatewayService` | `getGatewayByName`, `createGateway`, `updateGateway` (must omit `enabled` on update), `invalidateCache`. |
| Library writes | **complete** (reuse) | `LibraryService` | `createLibrary`, `updateLibrary`. `getLibraryByIdentifier` **throws 404** — catch or use `LibraryRepository.findByIdentifier`. |
| AdminUser writes | **partial** | `models/AdminUser.ts` | No `AdminUserService` / repository in code (plan drift: `merchant-team.md` documents a service that does not exist). `admin-auth-service.ts` and `seed-admin-user.ts` use the model directly. Prod seed follows that pattern; must **not** import `seedAdminUser()`. |
| App boot | **complete** | `src/index.ts:161` | Only `seedNotificationData()`. Must stay that way. |
| Env loading | **complete** | `src/config/environment.ts` | Honors `DOTENV_CONFIG_PATH`. Throws in production if required secrets missing. |
| Endpoints | **none needed** | — | No HTTP seed API. EP-GW16 stays merchant/admin “Load Seed Rules” only. |
| Pages | **none** | — | Backend CLI only. |
| Tests | **none** | `tests/` has currency/money suites, no seed tests | Need policy tests (mocked repos). |

**Feature state**: `partial` — local overwrite seeds exist; **production-safe selectable seed does not**.

### Plan-vs-code drift (noted, not fixed)

- `actions/backend/services/merchant-team.md` documents `AdminUserService` at `src/services/admin/admin-user-service.ts`. That file is absent; auth uses `AdminUser` directly. Out of scope except that the new service must not depend on the missing class.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **Infrastructure / Core Platform** | New `PlatformSeedService` + `seed-production.ts` + `npm run seed:prod`. Extract shared catalog constants so local scripts and prod service share lists, not policy. |
| **Currency** | Prod path inserts missing codes via `CurrencyRepository`; never calls `seedCurrencies()` or `bulkUpsertRates`. Invalidate currency cache after inserts (`ICurrencyService.invalidateAllCurrencyCache`). |
| **Gateways (catalog)** | Prod path uses `AvailableGatewayService`; never writes `enabled` on update; never calls `createSeedRules`. |
| **Libraries** | Prod path uses `LibraryService` for insert + known-identifier scope sync. |
| **Admin Panel (AdminUser)** | Prod path create-if-missing only; env-required credentials; never import local admin seed. |
| **Notifications** | Reuse `seedNotificationData()` when dataset selected. No boot change. |
| **Encryption** | No prod calls. Local script unchanged. |

---

## Plan Docs to Update

- [x] `project/plan/modules.md` — Infrastructure feature: production/selectable platform seed (CLI)
- [x] `project/rules.md` — **RULE-024 · Production Seed Is Insert-If-Missing**
- [x] `project/actions/backend/services/core.md` — new `SVC-CO05 · PlatformSeedService`
- [x] `project/actions/backend/services/_index.md` — core 19 → 20; total ~75 → ~76
- [x] `project/description.md` — short ops note: prod bootstrap is `seed:prod`, not `npm run seed`
- [x] `project/profile.md` — `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` / `ADMIN_SEED_NAME` in env-var reference (names only)
- [x] `project/changes/change-log.md` — row 017 (Step 5.6)

**Skip:** `data-model.md` (no schema change), all `endpoints/` and `pages/` (no HTTP/UI), encryption/gateway-rule service docs (unchanged).

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/services/core/platform-seed-service.ts` | Production policy: parse/validate datasets, per-dataset seed, summary `{ created, skipped, failed }`. Always production policy (no `clear`, no encryption, no gateway-rules, no admin overwrite). |
| `src/scripts/seed-production.ts` | Thin CLI: flags → connect DB → `PlatformSeedService.seed` → print summary → exit. |
| `src/constants/seed-catalogs.ts` | Shared lists: supported currencies, catalog gateways (no test), default libraries. Policy does **not** live here. |
| `tests/seed/platform-seed-service.test.ts` | Policy tests with mocked repos/services (confirm, dry-run, refuse forbidden datasets/`--clear`, currency rate preserve, admin skip, admin missing env, gateway `enabled` preserve). |

### Modify

| Path | Change |
|------|--------|
| `package.json` | Add `"seed:prod": "ts-node src/scripts/seed-production.ts"` |
| `src/scripts/seed-currencies.ts` | Import currency catalog from `seed-catalogs.ts`. **Behavior unchanged** (still overwrite + `--clear`). |
| `src/scripts/seed-available-gateways.ts` | Import gateway catalog. Behavior unchanged. |
| `src/scripts/seed-libraries.ts` | Import library catalog. Behavior unchanged. |
| `README.md` | Document `seed:prod` vs local `seed`; warn that `npm run seed` is not for production. |

### Do not modify

| Path | Why |
|------|-----|
| `src/index.ts` | Boot keeps only `seedNotificationData()` |
| `src/scripts/seed.ts` | Local orchestrator stays overwrite/dev |
| `src/scripts/seed-admin-user.ts` | Local defaults + password update stay local-only |
| `src/scripts/seed-encryption.ts` | Local-only |
| `src/scripts/seed-gateway-rules.ts` | Manual path |
| `src/services/notifications/seed.ts` | Reuse as-is |
| Gateway-rules controller / portal / admin “Load Seed Rules” | Unchanged |
| Models / endpoints / frontends | No schema or HTTP |

---

## Ripple / impact map

| Caller / callee | Action |
|-----------------|--------|
| `CurrencyRepository.findByCodeAny` + `create` | **Reuse** — insert missing; fill blank name/symbol/`minorUnitExponent` only |
| `ICurrencyService.invalidateAllCurrencyCache` | **Reuse** after currency inserts (RULE-023 cache) |
| `AvailableGatewayService` | **Reuse** — create missing; `updateGateway` without `enabled` |
| `LibraryService` / `LibraryRepository` | **Reuse** — create missing; update known identifiers |
| `AdminUser` model | **Reuse** (same as admin-auth) — `findOne` + `create` only |
| `seedNotificationData` | **Reuse** when `notifications` selected |
| `seedCurrencies` / `seedAdminUser` / `seedEncryption` / `seedGatewayRules` | **Must not call** from prod path |
| `CurrencyRepository.bulkUpsertRates` | **Must not call** — overwrites live rates |
| EP-GW16 / `createSeedRules` | **Ripple: none** — remains the only automated per-app rules path |
| Checkout / portal / admin UI | **None** — they only see catalog rows if they were missing |

---

## Reuse opportunities

- Catalog literals already exist in the three local seed scripts — extract, do not duplicate.
- Notification seed is already idempotent — call it, do not rewrite.
- Gateway and library writes already go through services with cache invalidation.
- Env loading already supports `DOTENV_CONFIG_PATH` (same as `scripts/run-api.sh`).

---

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Operator runs `npm run seed` on prod by habit | **High** | README + RULE-024; `seed:prod` is the named prod entry. Local script stays dangerous by design. |
| Currency seed wipes FX rates | **High** | Prod path never `$set`s rate fields on existing rows; never calls `seedCurrencies` / `bulkUpsertRates`. |
| Admin password reset in prod | **High** | Never update existing AdminUser; refuse hardcoded defaults; require env vars. |
| Re-enable disabled catalog gateway | **Medium** | Never pass `enabled` on update. |
| Encryption master key written to Mongo | **High** | Encryption dataset refused; local script not imported. |
| RULE-023 vs seed writes | **Low** | Writes go through `CurrencyRepository` (same as FX sync). Reads use `findByCodeAny` so inactive codes are not re-inserted. Do not construct `CurrencyService` except for cache invalidation via the interface. |
| `environment.ts` throws if prod secrets missing | **Low** | Expected — run with `DOTENV_CONFIG_PATH=.env.prod`. |
| `LibraryService.getLibraryByIdentifier` throws | **Low** | Use repository `findByIdentifier` or catch 404. |
| Partial dataset failure | **Low** | Continue remaining datasets; exit 1 if any failed. |

**Complexity:** M · **Cross-module:** Y (catalog + admin + notifications, one CLI) · **Migration:** N · **New endpoints:** N

---

## Recommendation

- **Create**: `PlatformSeedService`, `seed-production.ts`, `seed-catalogs.ts`, policy tests, `seed:prod` npm script
- **Modify**: local seed scripts (import catalogs only), `package.json`, API README
- **Reuse**: notification seed, currency/gateway/library write paths
- **Do not**: touch boot, HTTP, gateway rules, encryption, local overwrite behavior
