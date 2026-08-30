# Verification — Currency FX Sync Service

## Plan Consistency
- [x] Endpoints exist in specs (EP-CO01–08, EP-AD16–18, EP-AD35–36)
- [x] Services exist in specs (SVC-CR01 `ICurrencyService`, SVC-CR02 provider, SVC-CR03 sync)
- [x] Data model updated (`rateFromUsd`, `minorUnitExponent`, rate provenance fields)
- [x] Routes match (merchant currencies + admin currencies + new sync routes)
- [x] Auth declared (admin sync routes use `adminMiddleware`)
- [x] RULE-023 added — rates stored, never fetched inline
- [x] Recon findings reflected (semantics flip, exponent table move, cache TTL)

## Code Verification
- [x] Endpoints implemented: merchant GET/POST/PUT currencies + convert; admin CRUD; `POST /api/admin/v1/currencies/sync`; `GET /api/admin/v1/currencies/sync/status`
- [x] Services implemented behind interfaces; FastForex isolated in `external-services/fastforex/`
- [x] Pages/views — N/A (backend-only; admin UI is change-016)
- [x] Layering: controller → `ICurrencyService` / `IExchangeRateSyncService` → repository; provider only from factory + worker/admin trigger
- [x] Frontend isolation — N/A
- [x] Auth guards: admin currency write + sync require admin auth
- [x] `npm run type-check` in `payup-api-typescript` — PASS
- [x] `npm test` — PASS (62 tests: currency unit/provider/sync, gateway-amount-scaling, sdk)
- [x] Payment session path does not import or call the FX provider
- [x] `exchangeRateToUSD` removed from the model and all readers; `$unset` remains only as a migration write
- [x] Bug-008 helpers still re-exported from `currency-constants.ts`; ISO table lives in `iso-currency-exponents.ts`

## Acceptance Criteria
1. Currency documents carry `rateFromUsd`, `minorUnitExponent`, provenance fields — PASS (`models/Currency.ts`)
2. Exponents: KWD/BHD/OMR = 3, USD/EUR/GBP/SAR/AED/QAR = 2 — PASS (ISO table + seed)
3. Sync upserts every provider rate; enum currencies stay the only `isActive` inserts — PASS (`bulkUpsertRates` `$setOnInsert.isActive`)
4. USD always stored as `rateFromUsd: 1` — PASS (`withForcedUsdRate`)
5. Rates stored byte-identical to the payload — PASS (no scale/invert on write; provider tests)
6. 100 USD → SAR at 3.7545 = 375.45, not 27.00 — PASS (semantics-flip tests)
7. Identity conversion returns `exchangeRate: 1` — PASS
8. Cross-rate is `to.rateFromUsd / from.rateFromUsd` unrounded — PASS
9. Returned `exchangeRate` is full precision — PASS
10. Consumers typed as `ICurrencyService` — PASS
11. `FastForexRateProvider` imported only by the factory (and its tests) — PASS
12. Unknown `FX_PROVIDER` fails fast — PASS (`assertKnownFxProvider`)
13. Payment session never calls the provider — PASS
14. Repeatable `fx-rates` scheduler id is fixed (`fx-rates-hourly`) — PASS
15. `FX_SYNC_ENABLED=false` skips job registration; local `.env` sets this so the API starts without a key — PASS
16. Successful sync invalidates currency cache — PASS
17. Redis TTL is `FX_CACHE_TTL_SECONDS` (1800), hardcoded 3600 gone — PASS
18. Cache hit skips MongoDB — PASS
19–20. Provider failure leaves rates untouched, logs, conversions still use stored rates — PASS
21. Stale-rate warning on conversion — PASS
22. Malformed snapshot rejected wholesale — PASS
23–24. `currency.rates.synced` audit; manual records admin, scheduled records `system` — PASS
25. `currency.exponent.updated` on admin exponent change — PASS (`AdminCurrencyService.updateCurrency`)
26–29. Unit / provider / sync / regression tests — PASS
30. `npm run type-check` and `npm test` — PASS
31–32. Planning docs updated in the prior step — PASS

## Result: PASS

**Overall: PASS**
