# Impact Analysis — Currency Service + Exchange Rate Sync

Change: `change-011-currency-fx-sync-service` · Repo: `payup-api-typescript`

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Currency schema | **partial** | `models/Currency.ts` | Has `code`, `name`, `symbol`, `exchangeRateToUSD`, `isActive`. No exponent, no provenance, no freshness. Rate semantics are the inverse of what fastFOREX returns. |
| Currency repository | **partial** | `repositories/currency/currency-repository.ts` | `findActive`, `findByCode`, `updateExchangeRate(code, rate)` — single-currency only. No bulk upsert for a ~160-currency snapshot. |
| Currency service | **partial** | `services/currency/currency-service.ts` | Read + convert + Redis caching all present, but a concrete class with **no interface**, hardcoded `CACHE_TTL = 3600`, and the conversion formula reads the rate in the opposite direction to the provider payload. |
| Rate source | **none** | — | No provider, no fetch, no scheduling. Rates come from `scripts/seed-currencies.ts` hardcoded literals. |
| External service pattern | **complete** | `external-services/mailjet/mailjet.service.ts` | Sole precedent — one folder per provider. Directly reusable shape for fastFOREX. |
| Queue infrastructure | **complete** | `queue/queues.ts`, `queue/connection.ts` | Two BullMQ queues with shared `defaultJobOptions` (6 attempts, exponential backoff). No repeatable/cron job exists yet — this is the first. |
| Worker pattern | **complete** | `workers/notif-*.worker.ts`, `index.ts:15-16` | Workers self-register by import side-effect. Directly reusable. |
| Redis cache | **complete** | `utils/cache-service.ts` | `get`/`set`/`delete`/`deleteMany`/`getOrSet` with graceful degradation when Redis is down. No change needed. |
| Config | **complete** | `config/environment.ts` | `redisUrl`, `queue.*` block established. Needs a new `fx` block. |
| Audit service | **complete** | `services/audit/audit-service.ts` | Generic `log()` with `Mixed` metadata. Accepts a new action with no schema change. |
| Admin currency service | **complete** | `services/admin/admin-currency-service.ts` | Thin wrapper over repository + cache invalidation. |

**Feature state**: `partial` for currency management (exists, wrong semantics, no interface), **`none`** for exchange rate sync.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **core (currencies)** | `Currency` model gains 4 fields and renames 1; `CurrencyService` extracted behind `ICurrencyService`, formula inverted, TTL from env; repository gains bulk upsert; **new** provider, sync service, queue, worker |
| **payments** | `payment-session-service.ts` depends on `ICurrencyService` instead of the concrete class — no behavioural change beyond correct rates |
| **gateways** | `gateway-service.ts` depends on the interface for cache invalidation |
| **admin** | `admin-currency-service.ts` exposes the new fields; **2 new endpoints** for manual sync and status |
| **apps/checkout (public)** | 3 controllers that construct `CurrencyService` directly switch to the interface |

---

## Plan Docs to Update

- [x] `profile.md` — fastFOREX added to Integrations; `FX_*` / `FASTFOREX_*` env table added; `fx-rates` noted as the third BullMQ queue and the only scheduled job
- [x] `plan/data-model.md` — `Currency` table rewritten: `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource`, plus semantics notes
- [x] `plan/modules.md` — new Core feature 2 "Exchange Rate Sync" (later features renumbered); admin currency feature notes sync trigger
- [x] `rules.md` — **RULE-023 · Exchange Rates Are Stored, Never Fetched Inline**
- [x] `actions/backend/services/core.md` — SVC-CR01 now implements `ICurrencyService`; added SVC-CR02 `FastForexRateProvider`, SVC-CR03 `ExchangeRateSyncService`
- [x] `actions/backend/services/admin.md` — SVC-AD06 gains `triggerSync` / `getSyncStatus`, depends on the interfaces
- [x] `actions/backend/endpoints/gateways.md` — EP-CO01–08 field renames and `ICurrencyService` wiring
- [x] `actions/backend/endpoints/admin.md` — EP-AD16–18 field changes + new EP-AD35 (`POST /currencies/sync`), EP-AD36 (`GET /currencies/sync/status`)
- [x] `actions/backend/services/_index.md`, `actions/backend/endpoints/_index.md` — counts (17→19 core services, 32→34 admin endpoints)
- [x] `changes/change-log.md` — registered 011 and 012

Also updated: `changes/change-012-money-minor-units-foundation/{change-request,impact}.md` — now consumes `minorUnitExponent` via `ICurrencyService` rather than introducing it, drops the `currency.rate.updated` audit action and the currency re-seed, and declares change-011 a hard prerequisite. `bugs/bug-008-*.md` corrected to point the money-module supersession at 012.

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/services/currency/currency-service.interface.ts` | `ICurrencyService` + `CurrencyView`, `CurrencyConversionResult` types |
| `src/services/currency/exchange-rate-provider.interface.ts` | `IExchangeRateProvider`, `ExchangeRateSnapshot` |
| `src/services/currency/exchange-rate-sync-service.interface.ts` | `IExchangeRateSyncService`, `ExchangeRateSyncResult`, `ExchangeRateSyncStatus` |
| `src/services/currency/exchange-rate-sync-service.ts` | Fetch → validate → bulk upsert → invalidate cache → audit |
| `src/services/currency/exchange-rate-provider.factory.ts` | Resolves `FX_PROVIDER`; fails fast on unknown values |
| `src/external-services/fastforex/fastforex.service.ts` | `FastForexRateProvider implements IExchangeRateProvider` |
| `src/external-services/fastforex/fastforex.types.ts` | Raw `/fetch-all` response shape — the only place fastFOREX field names appear |
| `src/workers/fx-rate-sync.worker.ts` | BullMQ worker, self-registering by import |
| `src/constants/iso-currency-exponents.ts` | The single static ISO 4217 exponent table — bug-008's map relocated here; seed source and offline fallback |
| `tests/currency/currency-service.test.ts` | Criterion 26 |
| `tests/currency/fastforex-provider.test.ts` | Criterion 27 |
| `tests/currency/exchange-rate-sync.test.ts` | Criterion 28 |

### Modify

| Path | Change |
|------|--------|
| `src/models/Currency.ts` | Rename `exchangeRateToUSD` → `rateFromUsd`; add `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource` |
| `src/repositories/currency/currency-repository.ts` | `updateExchangeRate` → `updateRate`; add `bulkUpsertRates(snapshot)`; add `findNewestRateUpdatedAt()` |
| `src/services/currency/currency-service.ts` | `implements ICurrencyService`; invert the conversion formula; stop rounding the rate; TTL from `config.fx.cacheTtlSeconds`; add `getCurrencyExponent`, `getRateFromUsd`, `getExchangeRate`; stale-rate warning |
| `src/config/environment.ts` | New `fx` config block (9 variables) |
| `src/queue/queues.ts` | New `fxRatesQueue` + register in `closeQueues()` |
| `src/index.ts` | Import the worker; register the repeatable job when `FX_SYNC_ENABLED` |
| `src/scripts/seed-currencies.ts` | Rewrite for `rateFromUsd` (inverted values), `minorUnitExponent`, `rateSource: 'seed'` |
| `src/constants/currency-constants.ts` | Exponent map moves out to `iso-currency-exponents.ts`; re-export the three helpers so the gateway adapters and bug-008's test keep compiling |
| `src/services/admin/admin-currency-service.ts` | New fields in create/update/list; depend on `ICurrencyService`; write `currency.exponent.updated` when `minorUnitExponent` changes |
| `src/routes/company-admin/v1/admin-v1.routes.ts` | Zod schemas (lines 93, 100) + 2 new sync routes |
| `src/routes/merchant-panel/v1/core/currencies.controller.ts` | Zod schemas (17, 24) + response mapping (71, 82, 107, 123); add the missing Zod schema on `/convert` |
| `src/services/payment/payment-session-service.ts` | Depend on `ICurrencyService` (lines 14, 88, 98) |
| `src/services/gateway/gateway-service.ts` | Depend on `ICurrencyService` (lines 5, 14, 20) |
| `src/routes/public-api/v1/tokenize/tokenize.controller.ts` | Depend on the interface (lines 7, 18) |
| `src/routes/public-api/v1/checkout/sessions/sessions.controller.ts` | Depend on the interface (lines 3, 10) |
| `src/routes/public-api/v1/checkout/ui/ui.controller.ts` | Depend on the interface (lines 3, 8) |

**Total: 12 created, 16 modified.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| `exchangeRateToUSD` → `rateFromUsd` | 6 backend files: `models/Currency.ts`, `currency-service.ts` (9 sites), `currency-repository.ts`, `admin-currency-service.ts` (3 sites), `admin-v1.routes.ts` (2 sites), `currencies.controller.ts` (6 sites), `seed-currencies.ts` (14 sites) | Rename + **invert every stored value** in the seed |
| Semantics inversion | `currency-service.ts:201-204` only | Formula flipped; regression test pins 100 USD → 375.45 SAR |
| `CurrencyService` → `ICurrencyService` | 8 consumers construct it directly | Swap the type; construction can stay for now (no DI container in this codebase) |
| New `fx-rates` queue | `queue/queues.ts`, `closeQueues()`, `index.ts` graceful shutdown | Mirror the two existing queues |
| First repeatable job in the codebase | `index.ts` startup | Idempotent repeat key so restarts and multiple instances don't multiply the schedule |
| `Currency` response shape | `payup-frontend-admin` currencies screen + service, `payup-frontend-customer-control` currencies service, `api-docs` (2 files, 9 spec sites + `pin-request-examples.py` 6 sites) | **Out of scope** — changes 013 and 016, same release train |
| `minorUnitExponent` introduced here | `change-012` change request | Rewrite 012 to consume, not introduce |
| bug-008's `CURRENCY_MINOR_UNIT_EXPONENT` | `constants/currency-constants.ts` | Table **moves** to `constants/iso-currency-exponents.ts` (the one static table: seed source + offline fallback). `currency-constants.ts` re-exports `getCurrencyExponent` / `toMinorUnits` / `fromMinorUnits` from the new location so the Stripe and Moyasar adapters and `gateway-amount-scaling.test.ts` keep compiling untouched; change-012 retires the re-exports when it moves the callers into the money module |

---

## Reuse Opportunities

- **`external-services/mailjet/`** is the exact structural precedent for `external-services/fastforex/`.
- **`workers/notif-dispatch.worker.ts`** gives the worker + import-side-effect registration pattern verbatim.
- **`CacheService.getOrSet`** already implements cache-aside with graceful degradation when Redis is unavailable — no new caching code needed, only an env-driven TTL.
- **`CurrencyService`'s existing cache keys and invalidation methods** (`currencies:all`, `currency:*`, gateway keys) carry over unchanged; the sync service simply calls `invalidateAllCurrencyCache()`.
- **bug-008's exponent table** becomes the ISO seed table rather than being rewritten.
- **`auditService.log`** takes the new action with no model change.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| `POST /merchant/v1/currencies/convert` has no Zod schema — uses `parseFloat` on raw body | Add the schema here (was queued for 012, but this change already owns the file) |
| Seed comments contradict the field name — `exchangeRateToUSD: 0.27, // 1 SAR = 0.27 USD (or 1 USD = 3.75 SAR)` | Resolved by the rename; the parenthetical value becomes the stored one |
| `data-model.md:369` documents only `exchangeRateToUSD` | Rewrite the Currency table |
| `admin.md` EP-AD17 lists `exchangeRateToUSD` in its input contract | Update to `rateFromUsd` + `minorUnitExponent` |
| `AdminCurrencyService` duplicates repository calls the merchant controller also makes | Left as-is — out of scope |

---

## Risk

**Complexity: MEDIUM · Cross-module: YES (5 modules, all shallow) · Migration: YES (rate values must be inverted)**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| Inverted semantics silently corrupt every conversion | **High** | Field renamed → compile errors; criterion 6 and the regression test pin 100 USD → 375.45 SAR |
| Seed values not inverted alongside the rename | **High** | Seed rewritten wholesale, not patched; a sync overwrites it within the hour anyway |
| Provider outage blocks checkout | Medium | Sessions never call the provider; last known rates always serve |
| Stale rates charge the wrong price | Medium | Configurable staleness warning on every affected conversion |
| Duplicate repeatable schedules | Medium | Fixed repeat key; verified by restarting the API |
| API key required for local dev | Low | `FX_SYNC_ENABLED=false` must start cleanly without a key (criterion 15) |
| Partial write from a truncated payload | Medium | Whole-snapshot validation before any write |
| ~160 documents where 9 existed | Low | Only 9 active; list endpoints already filter on `isActive` |
| Admin panel + api-docs break on the rename | Medium | Expected; same release train, changes 013 and 016 |

---

## Recommendation

- **Create** — 3 interface files, sync service, provider factory, fastFOREX provider (2 files), worker, ISO exponent table, 3 test suites
- **Complete** — `CurrencyService` (extract interface, invert formula, env TTL, exponent + rate accessors, staleness warning); `CurrencyRepository` (bulk upsert)
- **Modify** — `Currency` model, config, queues, `index.ts`, seed script, admin currency service, 2 route files, 5 interface-swap consumers
- **Ripple** — change-012's change request; frontends and api-docs deferred to 013/016

**Sequence within the change**: interfaces → `Currency` model + repository → ISO exponent table + seed rewrite → `CurrencyService` refactor (formula inversion + tests immediately, since this is the highest-risk step) → fastFOREX provider + factory → sync service + audit → queue + worker + startup registration → admin endpoints → consumer interface swaps → full verification.
