# Verification — Admin Panel: Money Display + Currency/FX Operations

**Status: PASS** (automated + static). Live `/currencies` sync, exponent audit, and payment/revenue screens not opened against a running API this session.

Repo: `payup-frontend-admin`

## Plan Consistency
- [x] Pages exist in specs (`/currencies`, `/payments`, `/payments/:sessionId`, `/`) — see `verify-plan.md`, all 6 checks PASS
- [x] Services exist in specs; `AdminCurrenciesService` mapped to EP-AD16–18, EP-AD35, EP-AD36
- [x] Data model consistent — `AdminCurrency` and `Money` shapes match the backend action docs
- [x] Routes match; endpoint total 34
- [x] Auth declared (unchanged; `authGuard` + `adminGuard`)
- [x] RULE-022 / RULE-023 honoured; exponent change opens a confirm dialog before HTTP

## Code Verification
- [x] Routed admin screens unchanged in `app.routes.ts` (currencies / payments / dashboard still present; no new route)
- [x] `src/core/money/` exports `Money`, `formatMoney`, `MoneyPipe` only
- [x] `AdminCurrenciesService.sync()` → `POST /currencies/sync`; `getSyncStatus()` → `GET /currencies/sync/status`. Payment + dashboard models use `Money`.
- [x] Components call frontend services; no raw HTTP in the currencies / payments / dashboard pages
- [x] Calls via `ApiService` / `environment.apiUrl`
- [x] `authGuard` + `adminGuard` still wrap the authenticated layout
- [x] `npx ng build --configuration production` — success, zero TS errors
- [x] `npx ng test --watch=false` — **17/17 passed**
- [x] Unrouted merchant-portal copy deleted; remaining pages compile
- [x] Gateway catalog already used `AdminCurrenciesService` (not the deleted merchant currencies service)

## Acceptance Criteria

### Money module
- [x] 1 · Barrel: `Money`, `formatMoney`, `MoneyPipe`
- [x] 2 · `formatMoney` uses `money.exponent` for fraction digits
- [x] 3 · `MoneyPipe` returns an em dash (`\u2014`) for null/undefined
- [x] 4 · `grep toMinor src/` — no matches

### Currency screen — change-011
- [x] 5 · `exchangeRateToUSD` appears only as a negative assertion in `currencies.spec.ts`
- [x] 6 · `AdminCurrency` has `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource`
- [x] 7 · Table headers: Rate (per 1 USD), Exponent, Source, Updated
- [x] 8 · Dialog: rate `p-inputNumber` max 6 fraction digits, `min` 0.000001; exponent `p-select` 0/2/3
- [x] 9 · `openCreate()` defaults `{ isActive: true, rateFromUsd: 1, minorUnitExponent: 2 }`
- [x] 10 · `validate()` requires name, symbol, rate > 0, exponent
- [x] 11 · `rateSource` is a `p-tag` (`fastforex` info, `manual` warn, else secondary)

### FX operations
- [x] 12 · Sync now sets `syncing` and calls `currenciesService.sync()`
- [x] 13 · Success reloads list + status; failure toasts and does not clear the table (pinned)
- [x] 14 · `getSyncStatus()` on init. Strip shows provider, active count, last success, **last failure**, staleness badge
- [x] 15 · `ageSeverity` / `syncStatusSeverity` change with age (pinned)
- [x] 16 · Both methods called from the currencies page

### Exponent guard
- [x] 17 · Changed exponent → `confirmationService.confirm` **before** `updateCurrency` (pinned)
- [x] 18 · Message names code, old exponent, new exponent, and reinterpretation
- [x] 19 · Warning icon, explicit header, `p-button-danger` accept
- [x] 20 · Cancel: no HTTP, dialog stays open (pinned)
- [x] 21 · Unchanged exponent: no confirm (pinned)

### Money display — change-012
- [x] 22 · `AdminPaymentSession.amount` is `Money`; no redundant currency field
- [x] 23 · `getPayment()` returns `AdminPaymentDetails`; detail component is typed
- [x] 24 · List + detail use `| money`
- [x] 25 · Dashboard `statistics.payments.revenue` is `Money` on a Revenue card
- [x] 26 · Pipe uses em dash for missing amounts
- [x] 27 · `money.spec.ts` pins KWD 3 decimals and JPY 0. **Live payment rows deferred.**

### Legacy code
- [x] 28 · Deleted unrouted merchant copy (`services/{payments,products,customers,currencies}.service.ts` and the unrouted `pages/{products,payments,customers,reports,gateways}/` trees). App builds.

### Build and tests
- [x] 29 · Production build clean
- [x] 30 · `money.spec.ts` + `currencies.spec.ts` cover create payload, exponent guard, sync reload, staleness, sync-status isolation
- [x] 31 · `app.spec.ts` expects title `PayUp Admin`, not the customer-control scaffold string
- [x] 32 · 17/17 tests passed

### Manual verification
- [ ] 33 · **Deferred** — live `/currencies` table + status strip
- [ ] 34 · **Deferred** — Sync now against fastFOREX
- [ ] 35 · **Deferred** — rate-only edit
- [ ] 36 · **Deferred** — KWD exponent 3→2 dialog + `/audit-logs` `currency.exponent.updated`
- [ ] 37 · **Deferred** — live `/payments` list + detail
- [ ] 38 · **Deferred** — live Revenue card

### Release train
- [x] 39 · Code-level train gate: `exchangeRateToUSD` is gone from checkout, portal, admin (except the admin negative test), api-docs, and the SDK. Frontends send `*Minor` integers or no money; they read `Money`. Residual unused portal type `CreatePaymentRequest.amount: number` has no caller.

## Result: PASS

**Overall: PASS** for code and automated tests. Criteria 33–38 need a signed-in admin pass before release.

This change closes the 013–016 train. Do not ship 011–016 independently.
