# Change Request

## Metadata
- **date**: 2026-09-02
- **change-type**: new-feature
- **target-app**: backend
- **affected-repos**: backend (`payup-api-typescript`)
- **priority**: high

## Scope
- Module(s): Infrastructure (cross-cutting); Core Platform (Currency, Libraries, Encryption); Gateways (catalog only); Admin Panel (AdminUser); Notifications (catalog)
- Feature(s): **new** Production / selectable platform seed; existing local `npm run seed` stays the overwrite/dev path
- Endpoint(s): none — CLI only (no HTTP seed API)
- Page(s)/View(s): none
- Service(s): **new** `PlatformSeedService` (`src/services/core/platform-seed-service.ts`); thin CLI `src/scripts/seed-production.ts`; npm script `seed:prod`
- Does not change app boot — `startServer()` keeps only `seedNotificationData()`

---

## Description

### Problem

Local/dev seeding is a single overwrite-oriented script (`npm run seed` → `src/scripts/seed.ts`) plus per-dataset scripts. Those scripts are unsafe to run against production as-is:

- `seed-currencies.ts` **always `$set`s `rateFromUsd` / `rateSource: 'seed'`**, which would wipe live fastFOREX or admin-manual rates.
- `seed-admin-user.ts` **updates the password** when the email already exists, and ships a hardcoded default email/password.
- `seed-available-gateways.ts` can flip `enabled` back to the catalog default (re-enabling a gateway ops turned off).
- `seed-encryption.ts` can write a **hardcoded development master key** and demo keys with placeholder user/app IDs.
- `seed-gateway-rules.ts` writes **per-merchant-app** routing rules and must stay operator/manual (CLI + existing `POST .../gateway-rules/seed`).
- There is no way to choose a subset of datasets, dry-run, or refuse destructive flags.

A fresh or incomplete production Mongo (`payup_production`) therefore has no safe bootstrap: currencies, gateway catalog, libraries, and the first AdminUser must be inserted without touching live money or credentials.

### Desired behavior

A **production-safe seed service** plus a **CLI script** that:

1. Lets the operator **choose which datasets** to seed (`--only=...`).
2. Applies **insert-if-missing / never-overwrite-live-data** policies (below).
3. **Never** seeds gateway rules.
4. Creates the AdminUser **only if that email does not exist** — never updates password, name, or `isActive`.
5. Is **CLI-only** (no new endpoint, not wired into `index.ts`).
6. Leaves `npm run seed` and the individual local scripts unchanged for local/dev.

### Who is affected

- Platform operators / deployers (run the CLI against `.env.prod`).
- Platform AdminUser (first account can be created safely).
- Merchants / checkout: only indirectly — catalog and currency rows appear if they were missing; existing rates and gateway `enabled` flags stay intact.

### User story

**Happy path.** Operator runs `npm run seed:prod -- --confirm` (or `--only=currencies,libraries --confirm`). The service inserts missing platform rows, skips everything that already exists (except the allowed catalog metadata updates below), prints a created / skipped / failed summary, and exits 0.

**Partial select.** `--only=admin-user --confirm` creates the admin if missing and touches nothing else.

**Dry-run.** `--dry-run` prints the planned creates/skips and writes nothing.

**Admin already exists.** Log skip; do not hash or write a new password.

**Currency already exists with `rateSource: fastforex`.** Leave rate fields untouched; optionally fill blank name/symbol/`minorUnitExponent` only.

**Someone passes `--clear` or `--only=gateway-rules`.** Refuse and exit non-zero.

### Permissions

No HTTP surface. Whoever can run a process with the production Mongo URI and env file can run the CLI. Admin credentials in production come only from `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` (optional `ADMIN_SEED_NAME`) — **no hardcoded defaults**.

### Data changes

No new collections or fields. Writes are inserts (and limited catalog metadata updates) on existing `Currency`, `AvailableGateway`, `Library`, `AdminUser`, `EventType`, `NotificationTemplate`.

### Out of scope

- Changing app boot / auto-seed besides the existing notification seed
- HTTP or admin-panel “Run production seed” button
- Gateway rules (keep current merchant/admin “Load Seed Rules” + `npm run seed:gateway-rules`)
- Rewriting local `npm run seed` overwrite behavior
- Seeding merchants, apps, products, payments, tokens, or encryption keys
- Writing `MASTER_ENCRYPTION_KEY` into Mongo

---

## Production seed policy (datasets + extra conditions)

Default datasets when `--only` is omitted: `currencies`, `available-gateways`, `libraries`, `admin-user`, `notifications`.

| Dataset | Production | Policy |
|---------|------------|--------|
| `currencies` | Yes | **Insert missing codes only.** Never overwrite `rateFromUsd`, `rateSource`, `rateUpdatedAt`, `rateProviderUpdatedAt`, or `isActive` on an existing row (protects live FX + admin edits). May set missing `name` / `symbol` / `minorUnitExponent` if blank. New rows get ISO exponents and bootstrap `rateSource: 'seed'` until the hourly `fx-rates` job overwrites rates. |
| `available-gateways` | Yes | **Insert missing names** (paypal, stripe, moyasar, myfatoorah). May update catalog metadata on existing rows: `displayName`, `description`, `availableCurrencies`, `availableCountries`, `supportedPaymentMethods`. **Never overwrite `enabled`.** Never insert the Test gateway. Never delete extra catalog rows. |
| `libraries` | Yes | **Insert missing identifiers** (web-sdk, mobile-sdk, cart-module, custom-ui-module). **May update** `name`, `description`, `scopes`, `modules` on those known identifiers so new SDK scopes can roll out. Never delete libraries not in the seed list. |
| `admin-user` | Yes | **Create only if email not found.** Never update password, name, or `isActive`. In production mode, **require** `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`; refuse if missing (do not fall back to the local hardcoded defaults). |
| `notifications` | Yes (optional) | Same idempotent logic as boot (`seedNotificationData`): create missing event types / default templates only. Safe if the API has already started. |
| `encryption` | **No** | Skip. Prod already reads `MASTER_ENCRYPTION_KEY` and `ENCRYPTION_STORAGE_TYPE` from env. Local seed’s hardcoded master key and demo keys must never run against production. |
| `gateway-rules` | **No** | Always refuse. Per-app routing stays manual (CLI / portal / admin “Load Seed Rules”). |

### Extra safety conditions (recommended)

1. **Never run on app boot.** Production seed is an explicit CLI. `index.ts` keeps only notification catalog seed.
2. **`--clear` is forbidden** in production mode — exit non-zero, no deletes.
3. **`--confirm` is required** for production mode (or when `NODE_ENV=production`). `--dry-run` does not need `--confirm`.
4. **`--only=`** comma-separated allowlist. Unknown names or `gateway-rules` / `encryption` → refuse that run.
5. **`--dry-run`** prints planned created/skipped per dataset and writes nothing.
6. **Do not call existing `seedCurrencies()` / `seedAdminUser()` as-is.** Those overwrite. Shared catalog constants may be reused; write policy lives in `PlatformSeedService`.
7. **Local `npm run seed` unchanged** — still overwrite/upsert for local and `--clear`.
8. **Env loading** matches `scripts/run-api.sh`: honor `DOTENV_CONFIG_PATH` (`.env.prod` for prod). Refuse if `MONGODB_URI` is missing or `SKIP_DB` is set.
9. **Continue other datasets on failure**, then print a full summary (created / skipped / failed). Exit `1` if any dataset failed.
10. **No new HTTP endpoint** — avoid exposing seed on the public or admin API.
11. **Do not log secrets** — never print `ADMIN_SEED_PASSWORD` or connection strings; email may be logged.
12. **Idempotent and re-runnable** — second run with the same `--only` is all skips (except allowed library/gateway catalog metadata sync).

### CLI shape

```bash
# default datasets, production policy
DOTENV_CONFIG_PATH=.env.prod npm run seed:prod -- --confirm

# choose datasets
DOTENV_CONFIG_PATH=.env.prod npm run seed:prod -- --only=currencies,libraries --confirm

# first admin only
ADMIN_SEED_EMAIL=ops@payupconnect.com ADMIN_SEED_PASSWORD='...' \
  DOTENV_CONFIG_PATH=.env.prod npm run seed:prod -- --only=admin-user --confirm

# inspect without writes
DOTENV_CONFIG_PATH=.env.prod npm run seed:prod -- --dry-run --only=currencies,available-gateways
```

`package.json`: `"seed:prod": "ts-node src/scripts/seed-production.ts"`.

`seed-production.ts` is a thin wrapper: parse flags → `connectDatabase()` → `PlatformSeedService.seed(options)` → print summary → exit.

`PlatformSeedService.seed` accepts `{ datasets, dryRun, confirm }` and always applies production policy (never `clear`, never gateway-rules, never encryption, never admin overwrite).

---

## Acceptance Criteria

1. `npm run seed:prod -- --help` (or usage on bad flags) documents `--only`, `--confirm`, `--dry-run` and the allowed dataset names.
2. With `--dry-run`, Mongo receives no writes (no inserts/updates/deletes) and the process exits 0 after a planned summary.
3. Production mode without `--confirm` (and without `--dry-run`) exits non-zero and writes nothing.
4. `--clear` in production mode exits non-zero and deletes nothing.
5. `--only=gateway-rules` or `--only=encryption` (or unknown names) exits non-zero and writes nothing.
6. `currencies`: missing supported codes are inserted with ISO `minorUnitExponent` and `rateSource: 'seed'`; an existing currency with `rateSource` `fastforex` or `manual` keeps its `rateFromUsd` / timestamps / `isActive`.
7. `available-gateways`: missing paypal/stripe/moyasar/myfatoorah rows are created; an existing row whose `enabled` is `false` stays `false` after seed.
8. `libraries`: missing default identifiers are created; existing known identifiers may have scopes/modules updated; libraries not in the seed list are not deleted.
9. `admin-user`: if no `AdminUser` exists for `ADMIN_SEED_EMAIL`, one is created with that email and hashed password; if one exists, password/name/`isActive` are unchanged.
10. Production mode without `ADMIN_SEED_EMAIL` or `ADMIN_SEED_PASSWORD` refuses the `admin-user` dataset (and does not use the local hardcoded defaults).
11. `notifications`: missing event types/templates are created; existing ones are left as-is (same as boot).
12. `startServer()` still calls only `seedNotificationData()` — it does not call `PlatformSeedService`.
13. `npm run seed` and `seed:currencies` / `seed:available-gateways` / `seed:libraries` / `seed:encryption` / `seed:admin-user` / `seed:gateway-rules` keep their current local behavior.
14. No new HTTP route is registered for platform seed.
15. CLI summary reports created / skipped / failed per dataset; process exit code is 1 if any dataset failed, 0 otherwise.
16. Password and Mongo URI are never printed.

## Notes

- Fast-Track rejected: new service + more than one module (currency, gateway catalog, libraries, admin, notifications).
- Existing merchant/admin **Load Seed Rules** (`POST .../gateway-rules/seed`) is unchanged and remains the only automated path for per-app rules.
- After a first production currency insert, the hourly `fx-rates` job is expected to replace bootstrap `seed` rates; this change does not trigger a sync itself.
- The local admin seed’s hardcoded credentials stay in `seed-admin-user.ts` for local/dev only and must not be imported by the production path.
