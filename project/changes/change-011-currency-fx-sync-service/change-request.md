# Change Request

## Metadata
- **date**: 2026-08-30
- **change-type**: new-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Core (Currencies), Payments, Gateways, Admin
- Feature(s): **new** Exchange Rate Sync; Currency Management, Currency Conversion, Payment Session Creation
- Endpoint(s): merchant currency CRUD + convert, admin currency CRUD, **new** admin sync trigger + status
- Blocks: **change-012** cannot start until this merges — it supplies `Currency.minorUnitExponent` and `ICurrencyService`
- Page(s)/View(s): none (backend-only; admin currency screen updates in change-016)
- Service(s): **new** `IExchangeRateProvider` + `FastForexRateProvider`, **new** `IExchangeRateSyncService` + `ExchangeRateSyncService`, **new** `fx-rates` queue + worker; `CurrencyService` refactored behind `ICurrencyService`

---

## Description

### Problem

Exchange rates are static seed data. `scripts/seed-currencies.ts` hardcodes nine rates (`SAR: 0.27`, `KWD: 3.25`, …) that were correct on the day they were written and have drifted ever since. Every currency conversion in a payment session uses them, so the platform charges customers at rates that no longer reflect the market, and the only way to correct one is to edit a seed file and redeploy.

Three structural gaps behind that:

1. **No source of truth for rates.** Nothing fetches live rates; nothing records when a rate was last updated or where it came from.
2. **No minor-unit exponent.** The `Currency` model has no notion of how many decimals a currency has — the gap that produced [bug-008](../../bugs/bug-008-three-decimal-currency-undercharge.md), currently papered over by a constant table in `constants/currency-constants.ts`.
3. **No abstraction.** `CurrencyService` is a concrete class with no interface, so the rate source cannot be swapped without editing every consumer.

### Desired behaviour

Currencies become a properly maintained reference dataset: rate, exponent, provenance, and freshness all stored in MongoDB, refreshed on a schedule by a background job, served from Redis, and reached exclusively through interfaces so the provider can be replaced later without touching a single caller.

```
   fastFOREX  ─── IExchangeRateProvider ───┐
   (swappable via FX_PROVIDER)             │
                                           ▼
   BullMQ `fx-rates` ──► IExchangeRateSyncService ──► MongoDB (Currency)
   repeatable, hourly                      │                  │
                                           └── invalidates ───┤
                                                              ▼
   Payment session ──► ICurrencyService ──► Redis (30 min TTL) ┘
                       never calls the provider inline
```

**A payment session never calls fastFOREX.** It reads the rate through `ICurrencyService`, which serves from Redis and falls back to MongoDB. The provider is only ever contacted by the background job.

### The rate semantics flip (critical)

`Currency.exchangeRateToUSD` currently means *"1 unit of this currency = X USD"* — the seed stores `SAR: 0.27`, and the conversion multiplies by it:

```201:204:payup-api-typescript/src/services/currency/currency-service.ts
    const amountInUSD = amount * fromCurrencyData.exchangeRateToUSD;
    // Then convert USD to defaultCurrency
    const convertedAmount = amountInUSD / toCurrencyData.exchangeRateToUSD;
    const exchangeRate = fromCurrencyData.exchangeRateToUSD / toCurrencyData.exchangeRateToUSD;
```

fastFOREX `GET /fetch-all?from=USD` returns the **inverse** — `"SAR": 3.7545` means *1 USD = 3.7545 SAR*. The payload is stored as-is (no pre-transformation), so the field's meaning inverts.

**The field is therefore renamed `exchangeRateToUSD` → `rateFromUsd`, and the formula is inverted:**

```ts
const amountInUsd    = amount / from.rateFromUsd;
const convertedAmount = amountInUsd * to.rateFromUsd;
const exchangeRate    = to.rateFromUsd / from.rateFromUsd;
```

The rename is deliberate. Writing `3.7545` into a field the old formula reads as `0.27` would multiply where it should divide — roughly a 14× error on every SAR conversion, thrown by nothing. Renaming makes every consumer a compile error.

**The exchange rate is no longer rounded.** `Math.round(exchangeRate * 10000) / 10000` is removed: a rate is not money, and truncating it to four decimals injects error into every conversion before the amount is even computed.

### Currency model

| Field | Status | Notes |
|-------|--------|-------|
| `code`, `name`, `symbol` | unchanged | |
| `exchangeRateToUSD` | **renamed → `rateFromUsd`** | Units of this currency per 1 USD, stored exactly as the provider returns it. `USD` is always `1`. |
| `minorUnitExponent` | **new** | `0 \| 2 \| 3`, required, default `2`. Seeded from ISO 4217, admin-editable. Providers do not supply this. |
| `rateUpdatedAt` | **new** | When PayUp last wrote this rate. |
| `rateProviderUpdatedAt` | **new** | The provider's own `updated` timestamp from the payload. |
| `rateSource` | **new** | `'fastforex' \| 'manual' \| 'seed'` — provenance for reconciliation. |
| `isActive` | unchanged | Only active currencies are selectable for payments. |

**Coverage**: all ~160 currencies fastFOREX returns are stored; only the nine in the `Currency` enum are `isActive`. Enabling a tenth currency later becomes a flag flip rather than a data backfill, and rate history stays complete in the meantime.

`minorUnitExponent` was originally scoped to change-012. It moves here, because storing a rate without knowing the currency's decimals is exactly the gap that caused bug-008. Change-012 consumes this field instead of introducing it.

### Interfaces

Every consumer depends on an interface, never a concrete class.

**`ICurrencyService`** — the read side. `getAllCurrencies`, `getCurrencyByCode`, `getCurrencyExponent`, `getRateFromUsd`, `getExchangeRate(from, to)`, `convertCurrency`, `getDefaultCurrency`, `getAcceptedCurrencies`, `validateCurrency`, plus the existing cache invalidation methods. Implemented by the refactored `CurrencyService`.

**`IExchangeRateProvider`** — the swappable external source:

```ts
export interface ExchangeRateSnapshot {
  base: string;                      // 'USD'
  rates: Record<string, number>;     // units per 1 base, exactly as returned
  providerUpdatedAt: Date;           // provider's `updated` field
  fetchedAt: Date;
}

export interface IExchangeRateProvider {
  readonly name: string;
  fetchRates(baseCurrency: string): Promise<ExchangeRateSnapshot>;
}
```

Implemented by `FastForexRateProvider` (`external-services/fastforex/`, mirroring the existing `external-services/mailjet/` layout). Resolved through a small factory reading `FX_PROVIDER`, so switching providers is a config change.

**`IExchangeRateSyncService`** — control and update:

```ts
export interface IExchangeRateSyncService {
  syncNow(reason: 'scheduled' | 'manual'): Promise<ExchangeRateSyncResult>;
  getSyncStatus(): Promise<ExchangeRateSyncStatus>;
}
```

`syncNow` fetches through the provider, upserts every currency, stamps `rateUpdatedAt` / `rateProviderUpdatedAt` / `rateSource`, invalidates the Redis cache, and writes one audit entry.

### Background job

A new BullMQ queue `fx-rates`, following the existing `notif-events` / `notif-deliveries` pattern in `queue/queues.ts`, with a repeatable job registered at startup and a worker at `workers/fx-rate-sync.worker.ts` loaded by import side-effect in `index.ts`, exactly like the two notification workers.

- Interval: `FX_SYNC_INTERVAL_MS`, default `3600000` (1 hour).
- Registration is idempotent — a fixed repeat key, so multiple API instances do not multiply the schedule.
- Disabled entirely when `FX_SYNC_ENABLED=false`, for local development without an API key.
- Retry and backoff are inherited from the shared `defaultJobOptions` already used by the notification queues.
- One sync is also run on demand via the admin endpoint.

### Caching

`CurrencyService` already caches through `CacheService` with a hardcoded 1-hour TTL. That TTL becomes `FX_CACHE_TTL_SECONDS`, default **1800 (30 minutes)**.

The sync service invalidates currency cache keys immediately after a successful write, so a fresh rate is live at once rather than waiting out the TTL. The TTL is the safety net, not the delivery mechanism.

### Staleness handling

Sessions always convert using the last known stored rate — an FX outage never blocks a checkout. When the newest `rateUpdatedAt` is older than `FX_MAX_STALENESS_HOURS` (default `24`), `ICurrencyService` emits a loud structured warning on every conversion that uses a stale rate, carrying the age and the currency pair.

Sync failures are reported as structured error logs through `Observability` (Loki-visible). No new metric, no failure audit entry, no admin UI.

### Audit

Two audit actions:

- **`currency.rates.synced`** — one per successful run, carrying the provider name, base currency, the count of currencies updated, the provider timestamp, and the list of codes whose rate actually changed. Manual syncs record the acting admin; scheduled syncs record `actorType: 'system'`.
- **`currency.exponent.updated`** — written whenever an admin changes a currency's `minorUnitExponent`, with before and after values. This action belongs here rather than in change-012 because the field and the endpoint that edits it both ship in this change: changing an exponent reinterprets every stored amount in that currency, and leaving it unaudited until 012 would open a window where the single highest-risk currency edit in the system leaves no trace.

Per-payment rate provenance is already covered by the `currencyConversion` snapshot on each `Payment`.

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `FX_PROVIDER` | `fastforex` | Selects the `IExchangeRateProvider` implementation |
| `FX_SYNC_ENABLED` | `true` | Master switch for the background job |
| `FX_BASE_CURRENCY` | `USD` | Base passed to `/fetch-all?from=` |
| `FX_SYNC_INTERVAL_MS` | `3600000` | **DB refresh interval** — how often rates are written |
| `FX_CACHE_TTL_SECONDS` | `1800` | **Redis TTL** — 30 minutes |
| `FX_MAX_STALENESS_HOURS` | `24` | Age beyond which a stale-rate warning is logged |
| `FASTFOREX_API_KEY` | — | Required when the provider is active |
| `FASTFOREX_BASE_URL` | `https://api.fastforex.io` | |
| `FASTFOREX_TIMEOUT_MS` | `10000` | HTTP timeout |

### Endpoints

**Modified** — currency responses gain `minorUnitExponent`, `rateFromUsd`, `rateUpdatedAt`, `rateSource`, and drop `exchangeRateToUSD`:

- `GET/POST/PUT /api/merchant/v1/currencies`
- `POST /api/merchant/v1/currencies/convert`
- `GET/POST/PUT /api/admin/v1/currencies`

Create/update schemas accept `minorUnitExponent`; a manually supplied `rateFromUsd` sets `rateSource: 'manual'`.

**New** (admin, backend-only):

- `POST /api/admin/v1/currencies/sync` — triggers `syncNow('manual')`
- `GET /api/admin/v1/currencies/sync/status` — provider name, last success, last failure, staleness, active currency count

### Out of scope

- Minor-unit money migration — **change-012**, which consumes `minorUnitExponent` from here
- Admin panel currency screen (exponent column, sync button, staleness badge) — **change-016**
- Portal currency display updates — **change-015**
- Historical rate time series — audit entries only, per decision
- Per-merchant or per-gateway rate markup/spread
- Crypto and metals endpoints offered by fastFOREX

---

## Acceptance Criteria

### Data

1. `Currency` documents carry `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, and `rateSource`; `exchangeRateToUSD` no longer exists anywhere in the codebase.
2. `minorUnitExponent` is `3` for KWD, BHD, OMR (and JOD, TND, IQD, LYD if present) and `2` for USD, EUR, GBP, SAR, AED, QAR — verifiable after `npm run seed:currencies`.
3. After one sync, all ~160 currencies returned by fastFOREX exist as documents, and exactly the nine enum currencies are `isActive: true`.
4. `USD` always stores `rateFromUsd: 1`.
5. Stored rates are byte-identical to the provider payload — no rounding, scaling, or inversion on write.

### Conversion correctness

6. Converting 100 USD → SAR with `rateFromUsd(SAR) = 3.7545` yields `375.45`, not `27.00` — proving the formula was inverted along with the field.
7. Converting X → X returns the input amount with `exchangeRate: 1`.
8. A cross-rate (SAR → KWD) is computed as `to.rateFromUsd / from.rateFromUsd` with no intermediate rounding.
9. The returned `exchangeRate` is unrounded full precision.

### Interfaces and isolation

10. Every consumer of currency data depends on `ICurrencyService`, never on the concrete `CurrencyService`.
11. `FastForexRateProvider` is reachable only through `IExchangeRateProvider`; no other file imports it directly, and no file outside `external-services/fastforex/` references fastFOREX URLs or response field names.
12. Setting `FX_PROVIDER` to an unknown value fails fast at startup with a clear message.
13. **No code path in a payment session calls the provider.** Session creation resolves rates through `ICurrencyService` only.

### Job and cache

14. With `FX_SYNC_ENABLED=true`, a repeatable `fx-rates` job is registered at startup on the configured interval; restarting the API does not create a duplicate schedule.
15. With `FX_SYNC_ENABLED=false`, no job is registered and the API starts normally without `FASTFOREX_API_KEY`.
16. A successful sync invalidates currency cache keys, so the next read returns the new rate without waiting out the TTL.
17. Redis TTL equals `FX_CACHE_TTL_SECONDS` (1800 by default), and the previously hardcoded `3600` is gone.
18. A second read within the TTL is served from Redis and performs no MongoDB query.

### Resilience

19. A provider outage (timeout, 5xx, 401, quota exhausted) leaves existing rates untouched, logs a structured error, and does not throw into any request path.
20. Conversions continue to succeed during a provider outage using the last known rates.
21. When the newest `rateUpdatedAt` exceeds `FX_MAX_STALENESS_HOURS`, each conversion using a stale rate logs a warning with the age and currency pair.
22. A malformed or partial provider payload is rejected wholesale — no partial write.

### Audit

23. A successful sync writes one `currency.rates.synced` audit entry with provider, base, updated count, provider timestamp, and changed codes.
24. A manual sync records the acting admin as the actor; a scheduled sync records `actorType: 'system'`.
25. Changing a currency's `minorUnitExponent` through `PUT /api/admin/v1/currencies/:code` writes a `currency.exponent.updated` entry with before and after values and the acting admin.

### Tests

26. **Unit** — `tests/currency/currency-service.test.ts`: conversion in both directions, cross-rates, identity conversion, unrounded rate, stale-rate warning, cache hit avoids the DB.
27. **Provider** — `tests/currency/fastforex-provider.test.ts`: the real `/fetch-all?from=USD` payload shape maps correctly to `ExchangeRateSnapshot`; timeout, 401, and malformed body each fail cleanly.
28. **Sync** — `tests/currency/exchange-rate-sync.test.ts`: upserts all currencies, preserves `isActive` flags across runs, stamps provenance, invalidates cache, writes the audit entry, and performs no partial write on a bad payload.
29. **Regression guard** — a test asserting 100 USD → SAR is `375.45`, pinning the semantics flip so nobody reintroduces the inverted formula. Change-012 restates this same case in minor units (`10000` → `37545`) when it re-signs `convertCurrency`; the guard must survive that migration rather than be deleted with the old signature.
30. `npm run type-check` passes; `npm test` passes.

### Documentation

31. `profile.md` integrations table lists fastFOREX; the backend env var reference lists all nine new variables.
32. `plan/data-model.md`, `plan/modules.md`, `rules.md`, and the affected `services/` and `endpoints/` action docs reflect the new service, queue, and fields.

---

## Notes

### Revised program sequence

```
bug-008 ✓  →  change-011  →  change-012  →  change-013  →  change-014  →  change-015  →  change-016
KWD/BHD/OMR   currency +     money minor    api-docs +     checkout      customer       admin
undercharge   FX sync        units          web SDK                      portal         panel
(DONE)        (this)         foundation
```

Change-012 was renumbered from 011 when this change was inserted ahead of it, and must be updated to consume `minorUnitExponent` rather than introduce it.

### Interaction with change-012

| Concern | change-011 (this) | change-012 |
|---------|-------------------|------------|
| `Currency.minorUnitExponent` | **introduces** it, seeded from ISO 4217 | reads it via `ICurrencyService.getCurrencyExponent` |
| Static ISO exponent table | bug-008's table in `constants/currency-constants.ts` **moves** to `constants/iso-currency-exponents.ts` — the single static table, used for seeding and as the offline fallback | `money/currency-exponents.ts` **imports** that table rather than declaring its own; `currency-constants.ts` is left holding only the enum |
| Conversion arithmetic | fixes the semantics and stops rounding the rate | moves the arithmetic into integer minor-unit space |
| `ICurrencyService.convertCurrency` | defined here in **major-unit decimals** | **re-signed to minor units**, delegating to `money/convert.ts`, which sources its rate from `getExchangeRate` |
| `rateFromUsd` | introduces it | unchanged — a rate is not money and stays a float |
| `currency.exponent.updated` audit | **written here**, alongside the field and the endpoint that edits it | not re-declared |
| RULE-023 (rates are stored, never fetched inline) | **introduces** it | untouched — it governs rates, not money, and must not be folded into the rewritten RULE-022 |

Doing this first means change-012 never has to guess an exponent.

**Exactly two exponent artifacts may exist once both changes land**: the DB (`Currency.minorUnitExponent`, authoritative, reached through `ICurrencyService`) and one static table (`constants/iso-currency-exponents.ts`, for seed bootstrap and unknown currencies). A third copy is a regression — it is the condition that produced bug-008.

### Risks

| Risk | Mitigation |
|------|------------|
| Inverted rate semantics silently corrupt every conversion | Field renamed, so every consumer is a compile error; acceptance criteria 6 and 29 pin the direction with a concrete number |
| Provider outage blocks checkout | Sessions never call the provider; last known rates always serve (criteria 19–20) |
| Stale rates charge customers at the wrong price | Staleness warning with a configurable threshold (criterion 21) |
| Duplicate schedules across API instances | Idempotent repeatable-job key (criterion 14) |
| API key committed or required locally | `FX_SYNC_ENABLED=false` path must start cleanly without a key (criterion 15) |
| Partial write from a truncated payload | Validate the whole snapshot before any write (criterion 22) |
| ~160 currency documents where 9 existed | Only the 9 are active; list endpoints already filter on `isActive` |
| Admin panel currency screen breaks on the field rename | Expected — same release train, fixed in change-016 |
