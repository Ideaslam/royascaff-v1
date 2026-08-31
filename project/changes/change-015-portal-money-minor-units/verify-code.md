# Verification — Customer Portal to Minor Units

**Status: PASS** (automated + static). Live product/refund/RTL pass not run against a backend this session.

Repo: `payup-frontend-customer-control`

## Plan Consistency
- [x] Pages exist in specs (products, payments, customers, dashboard, gateway-rules, apps/view) — see `verify-plan.md`, all 6 checks PASS
- [x] Services exist in specs and map to documented endpoints
- [x] Data model consistent — request `*Minor` keys and `Money` responses match the backend action docs
- [x] Routes match; none added or removed
- [x] Auth declared (unchanged; `authGuard` + `merchantGuard`)
- [x] RULE-022 / RULE-023 honoured

## Code Verification
- [x] No route added or removed
- [x] `src/core/money/` with `MoneyPipe`. Templates use `| money`.
- [x] Services re-typed. `ProductsService.buildCreateRequest` / `buildUpdateRequest` emit `*Minor` integers. Refund type is `amountMinor`. App settings mapper uses `toMinor`.
- [x] `toMinor` / `toMajor` imported only from services (`products.service.ts`, `app-settings.service.ts`). Components do not call them.
- [x] Calls go through `ApiService` / `environment.apiUrl`
- [x] Auth guards unchanged
- [x] `npx ng build --configuration production` — success, zero TS errors (CSS budget warnings only, pre-existing)
- [x] `npx ng test --watch=false` — **24/24 passed** (scaffold title test updated so it no longer looks for a non-existent `h1`)
- [x] Non-money flows not rewritten

## Acceptance Criteria

### Money module
- [x] 1 · Barrel exports `Money`, `formatMoney`, `toMinor`, `toMajor`, `subtractMoney`, `MoneyPipe`
- [x] 2 · Power-of-ten work lives in `money.util.ts`
- [x] 3 · `toMinor` throws when fraction digits exceed the exponent (`'12.505'` at exp 2)
- [x] 4 · Round-trip tests for exponents 0, 2, 3
- [x] 5 · Conversion called from services only

### Requests
- [x] 6 · Create/update send `priceMinor`, `compareAtPriceMinor`, `unitPriceMinor`, `costPerItemMinor`, `variants[].priceMinor`
- [x] 7 · `valuesString` stripped in `buildCreateRequest` (pinned in `product-form.spec.ts`)
- [x] 8 · `RefundRequest.amountMinor`; payments UI sends `payment.amount.minor`
- [x] 9 · App settings send `minimumAmountMinor` / `maximumAmountMinor`
- [x] 10 · Rule-test context binds `amountMinor`
- [x] 11 · No live request path sends a major-unit amount. Residual unused type: `CreatePaymentRequest.amount: number` on a helper with **zero call sites** — not sent.

### Currency and exponent
- [x] 12 · `Currency` has `minorUnitExponent`, `rateFromUsd`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource`. No `exchangeRateToUSD` in `src/`.
- [x] 13 · Price inputs use `[minFractionDigits]` / `[maxFractionDigits]` = `selectedCurrencyExponent`
- [x] 14 · `toMinor(12.5, 3) === 12500` (pinned)
- [x] 15 · `toMinor(3750, 0) === 3750`; excess decimals throw
- [x] 16 · `onCurrencyChange` re-reads the exponent and rejects prices that exceed it

### Product form
- [x] 17 · Currency label has `*`. Select has no `showClear`. Save blocked without `product.currency`.
- [x] 18 · `toFormPrices` maps `price`, `compareAtPrice`, `unitPrice`, `costPerItem`
- [x] 19 · Round-trip of unchanged majors is `toMajor(toMinor(...))` — pinned for SAR 49.99 → 4999 → 49.99. **Live reload deferred.**

### Responses
- [x] 20 · List/detail/dashboard bindings use `MoneyPipe` (`| money`). No `CurrencyPipe` amount bindings remain.
- [x] 21 · Ad-hoc amount `Intl.NumberFormat` removed from pages (only `formatMoney` uses it)
- [x] 22 · Revenue fallbacks are `Money` objects, not `'USD'` strings
- [x] 23 · `DashboardData` types money as `Money` and counts as `number`
- [x] 24 · Pipe returns `''` for null. **Live empty-state pass deferred.**

### No derivation
- [x] 25 · `payments.component.html` line total is `product.total | money`
- [x] 26 · Client does not re-sum. **Live remainder allocation deferred.**

### Gateway rules
- [x] 27 · Condition values are `amountMinor` / `productPriceMinor`
- [x] 28 · Money conditions use an integer control; defaults `10000` / `0`
- [x] 29 · Test amount is integer `p-inputNumber` labelled “Amount (Minor Units)”. No `currency="USD"` mode on that control (placeholder `USD` is on the separate currency text field).

### Build and tests
- [x] 30 · Production build clean
- [x] 31 · `money.spec.ts` covers convert, throw, round-trip, format, subtract
- [x] 32 · `product-form.spec.ts` pins SAR 4999, KWD 12500, `valuesString` strip, all four prices, missing currency
- [x] 33 · 24/24 tests passed

### Manual verification
- [ ] 34 · **Deferred** — live SAR product round-trip
- [ ] 35 · **Deferred** — live KWD 12.500
- [ ] 36 · **Deferred** — refund dialog/toast
- [ ] 37 · **Deferred** — live list/detail/dashboard amounts
- [ ] 38 · **Deferred** — app payment settings save
- [ ] 39 · **Deferred** — Arabic + RTL. `formatMoney(..., 'ar-SA')` is unit-tested to emit Arabic-Indic digits.

## Result: PASS

**Overall: PASS** for code and automated tests. Criteria 34–39 need a signed-in portal pass before release.

**Release note:** existing gateway rules stored as `amount` / `productPrice` will stop matching until re-saved as `amountMinor` / `productPriceMinor`.
