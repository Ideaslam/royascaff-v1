# Change Request

## Metadata
- **date**: 2026-08-31
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: `payup-frontend-customer-control`
- **priority**: high

## Scope
- Module(s): Products, Payments, Customers, Dashboard, Gateway Rules, Apps (settings), Core (Currencies)
- Feature(s): Product CRUD pricing, refunds, transaction list/detail, dashboard revenue, gateway routing rules, app payment settings
- Endpoint(s): EP-PR02–07 (products), EP-TR01–04 (transactions), EP-CU05 (customer payments), EP-DB01 (dashboard), EP-GW09–17 (gateway rules), EP-AP09/11 (app settings), EP-CO01 (currencies)
- Page(s)/View(s): `customer-portal:` products list/create/view/edit, payments, customers view, dashboard, gateway-rules, apps/view
- Service(s): `ProductsService`, `PaymentsService`, `CustomersService`, `DashboardService`, `GatewayRulesService`, `AppSettingsService`, `CurrenciesService`; **new** shared money module
- Depends on: **change-011** ✓, **change-012** ✓, **change-013** for the written contract
- Distinguishing feature: **the only downstream change that both reads and writes money**

---

## Description

### Problem

The portal is the merchant's control surface, and it is the only frontend that *sends* money to the API. Change-012 renamed every money request key and changed every money response to a `Money` object, so both directions are broken:

**Writes fail with 400.** The product form posts `price: 49.99`; the API now requires `priceMinor: 4999` and rejects both the old key and the decimal. Same for `compareAtPrice`, `unitPrice`, `costPerItem`, `variants[].price`, refund `amount`, app settings `minimumAmount`/`maximumAmount`, and the gateway-rule test `context.amount`.

**Reads render as objects.** Eleven `CurrencyPipe` bindings across payments, products, and dashboard receive a `Money` object where they expect a number. Two ad-hoc `Intl.NumberFormat` helpers in `customer-view` and `product-view` do the same.

**Two client-side recomputations exist**, at `payments.component.html:401` and `:404`, multiplying a unit price by a quantity to show a line subtotal. Change-012 made the server allocate line totals so that `Σ (paidPriceMinor × quantity) === amountMinor` exactly. A float client cannot reproduce that, so these two bindings must read the server-allocated value rather than be ported to minor units.

**There is no exponent anywhere in this repo.** `CurrenciesService.Currency` carries `code`, `name`, `symbol`, and the now-deleted `exchangeRateToUSD`. Every price input hardcodes `minFractionDigits: 2` / `maxFractionDigits: 2`, so a merchant pricing in KWD physically cannot enter the third decimal — and that is the exact class of defect that produced bug-008.

### Desired outcome

Merchants keep typing prices the way they think about them — `49.99`, `12.500` — and the portal converts at the service boundary using the currency's real exponent. Every displayed amount comes from a `Money` the server sent. Nothing derives a total.

### The input decision: major in, minor out

This is the central design call of this change, and it differs from checkout.

**Merchant-facing inputs stay in major units.** Nobody wants to type `4999` for a $49.99 product. The `p-inputNumber` controls keep decimal entry; the **service layer** converts to minor immediately before the HTTP call, and back to major immediately after a load.

```
form (major decimal)  ──toMinor(v, exponent)──►  { priceMinor: 4999 }  ──►  API
form (major decimal)  ◄──toMajor(money)────────  { price: Money }      ◄──  API
```

Two consequences that must hold:

1. **The exponent drives the control, not a constant.** `[maxFractionDigits]` and `[minFractionDigits]` come from the selected currency's `minorUnitExponent` — 2 for SAR, 3 for KWD, 0 for JPY. A KWD product can be priced at `12.500`; a JPY product cannot be given decimals at all.
2. **Conversion happens in exactly one place.** `toMinor` / `toMajor` live in the money module and are called only from services. No component multiplies by a power of ten.

`toMinor` rounds half-up on the last minor unit and rejects a value with more fraction digits than the exponent allows, rather than silently truncating a merchant's third decimal.

### The money module

New folder `src/core/money/`:

```
core/money/
  money.model.ts   — Money interface
  money.util.ts    — formatMoney, toMinor, toMajor, subtractMoney
  money.pipe.ts    — MoneyPipe, standalone, replaces every CurrencyPipe binding
  money.spec.ts    — unit tests
```

`Money` matches the API exactly: `{ minor: number; currency: string; exponent: number; display: string }`.

`MoneyPipe` is the display path — the portal is template-heavy and already binds through pipes eleven times, so a pipe is the shape that fits. `{{ payment.amount | money }}` returns `Money.display` by default and accepts an optional locale for `Intl.NumberFormat`, which matters here because this app **does** have working `ar` support with RTL (`TranslationService.updateHtmlAttributes()` sets `dir="rtl"`).

### Currency service gains the exponent

`CurrenciesService.Currency` (`core/services/currencies.service.ts:5–10`) absorbs change-011:

| Field | Action |
|-------|--------|
| `exchangeRateToUSD` | **removed** |
| `rateFromUsd` | added — units per 1 USD |
| `minorUnitExponent` | added — **required by every price input in the app** |
| `rateUpdatedAt`, `rateSource` | added, read-only |

`getCurrency(code)` at line 23 is currently defined and never called. It becomes the lookup that resolves the exponent for the selected currency, so it stops being dead code.

### Product form — `core/pages/products/product-form/product-form.component.ts`

Four price controls (975-line inline template):

| Field | Lines | Change |
|-------|-------|--------|
| Price | 210–219 | `[maxFractionDigits]` from currency exponent; still `[required]` |
| Compare at price | 255–262 | same |
| Unit price | 266–273 | same |
| Cost per item | 277–284 | same |

Payload construction at 928–968 currently spreads the whole form object. It becomes an explicit mapper that emits `priceMinor`, `compareAtPriceMinor`, `unitPriceMinor`, `costPerItemMinor`, and `variants[].priceMinor`, and strips the UI-only `valuesString` field that is presently sent to the API by accident.

**`currency` becomes required.** Change-012 made it mandatory server-side, because a minor amount without a currency has no exponent and therefore no value. In the form:

- `showClear="true"` is removed from the `p-select` at 196–206
- the label gets the `*` marker
- validation at 919 checks `currency` alongside `title`, `appId`, `price`
- `ensureProductCurrency()` (802–805) stays as the load-time backfill
- **changing the currency re-validates the entered prices** against the new exponent — switching a `12.505` SAR product to JPY must be caught, not silently rounded

**A pre-existing bug is fixed in the same pass.** `loadProduct()` (817–837) maps `price` and `currency` but never maps `compareAtPrice`, `unitPrice`, or `costPerItem` — so editing a product silently blanks three prices. Since the entire mapping is being rewritten for `Money`, leaving this in place would mean knowingly shipping it.

Variants keep no price input (the model supports `variants[].price`, the UI at 465–472 does not expose it). Adding one is out of scope; the mapper handles the field if present.

### Refund — `core/pages/payments/payments.component.ts:308–332`

```ts
// today
{ amount: payment.amount, reason: 'Customer requested refund' }
// after
{ amountMinor: payment.amount.minor, reason: 'Customer requested refund' }
```

The native `confirm()` at line 309 interpolates a raw number. It is replaced with the PrimeNG confirm dialog, showing `payment.amount.display`. The success toast at line 320 renders `refund.amount` — now a `Money` — through the pipe.

Refunds remain full-amount only; there is no partial-refund input today and none is added.

### Payments / transactions — `core/pages/payments/payments.component.html`

| Line | Today | After |
|------|-------|-------|
| 39 | `stats.totalRevenue \| currency:'USD':'symbol':'1.0-0'` | `stats.totalRevenue \| money` — the hardcoded USD was wrong for any non-USD merchant |
| 253 | `payment.amount \| currency:payment.currency` | `payment.amount \| money` |
| 331 | detail hero amount | `\| money` |
| 391 | `product.currentProductPrice` | `\| money` |
| 395 | `product.sessionPrice` | `\| money` |
| **401** | `product.sessionPrice * product.quantity` | **`product.total \| money`** — server-allocated |
| **404** | `product.price * product.quantity` | **`product.total \| money`** — server-allocated |
| 413 | total session price | `\| money` |

Lines 401 and 404 are the only money arithmetic in the app, and both are deleted rather than converted.

### Dashboard — `core/pages/dashboard/dashboard.ts`

- Line 91: `revenue | currency:'USD'` → `| money`. The hardcoded USD is removed — a merchant trading in SAR has been shown a dollar sign on their revenue card.
- Line 158: `session.amount | currency:session.currency` → `| money`.
- `DashboardService` types: `statistics.orders.revenue`, `chartData.dailyPayments[].amount`, `chartData.summary.totalAmount`, `chartData.summary.averageDaily` all become `Money`; every count stays `number`.

`ChartModule` is imported at lines 7 and 23 but no `<p-chart>` is rendered, and `chartData` is loaded and never displayed. Typing it correctly is in scope; **wiring the chart is not** — that is a feature, not a migration.

### Gateway rules — `core/pages/gateway-rules/`

Condition field values are renamed to match the backend enum:

| Label | Was | Becomes |
|-------|-----|---------|
| Amount | `'amount'` | `'amountMinor'` |
| Product Price | `'productPrice'` | `'productPriceMinor'` |

(`fieldOptions`, TS 142–151; rendered HTML 353–358.) The other six option values are unchanged.

Condition **values** are entered through a plain `<input pInputText>` (HTML 369–379) regardless of field type. For the two money fields the control becomes an integer-only `p-inputNumber` with helper text stating the value is in minor units, because a gateway rule threshold has no currency attached to derive an exponent from. Defaults `value: 100` (TS 192–195, 211–214) and `value: 0` (`addCondition`, 521–525) become `10000` and `0`.

The rule-test context form (HTML 448–496) posts `context.amount`. It becomes `context.amountMinor`, and the input's `mode="currency" currency="USD"` (454–461) — which hardcoded a currency into a test harness — becomes an integer control. Default `100` → `10000`.

**Recorded as drift, not fixed here**: a rule threshold is compared against a session amount in the session's own currency, so a single numeric threshold means different real values in SAR and KWD. That is a pre-existing modelling weakness in change-012's rule engine, unchanged by this migration.

### App settings — `core/pages/apps/app-view/app-view.component.ts`

The two `p-inputNumber` controls at 488–493 and 505–510 keep decimal entry, with fraction digits driven by `settings.payment.defaultCurrency`'s exponent (line 30 of the settings interface). The save path at 969–994 converts to `minimumAmountMinor` / `maximumAmountMinor`. Defaults at 909–910 (`1`, `100000`) stay in major units in the form and convert on save.

This screen's UI is Arabic-only, which makes it the natural first consumer of `MoneyPipe`'s locale argument.

### Display helpers consolidated

Two ad-hoc `Intl.NumberFormat` formatters are replaced by the pipe:

- `customer-view.component.ts:343–347` `formatCurrency`
- `product-view.component.ts:356–363` `formatPrice`

`formatCurrencyLabel` in `product-form.component.ts:808–810` and `products.component.ts:286–287` formats a **dropdown label**, not an amount. Both stay, extended to show the exponent so a merchant selecting KWD can see it takes three decimals.

`products.component.ts:141` (`product.price | currency:product.currency`) moves to the pipe.

### Tests

The repo has one spec file — `src/app/app.spec.ts`, a bootstrap smoke test. Vitest + jsdom is configured and unused. Two suites are added:

**`core/money/money.spec.ts`**
- `toMinor('49.99', 2) === 4999`; `toMinor('12.500', 3) === 12500`; `toMinor('3750', 0) === 3750`
- `toMinor` rejects `12.505` at exponent 2 rather than truncating
- half-up rounding at the boundary
- `toMajor(toMinor(v)) === v` round-trips for exponents 0, 2, 3
- `formatMoney` returns `display` with no locale; renders Arabic-Indic digits with `ar-SA`

**`core/pages/products/product-form/product-form.spec.ts`**
- A SAR form produces `priceMinor: 4999`, not `price: 49.99`
- A KWD form accepts `12.500` and produces `12500`
- Saving with no currency is blocked
- Loading a product populates all four price fields — the 817–837 regression

### Out of scope

- Partial refunds
- Wiring the dashboard chart
- Fixing the cross-currency gateway-rule threshold semantics
- Adding a variant price input
- `reports.component.ts` hardcoded `'12,000'` / `'41.90'` strings — the route redirects to dashboard (`app.routes.ts:58`); it is dead and stays dead
- Translating the English-hardcoded pages

---

## Acceptance Criteria

### Money module

1. `src/core/money/` exports `Money`, `formatMoney`, `toMinor`, `toMajor`, `subtractMoney`, and a standalone `MoneyPipe`.
2. `toMinor` and `toMajor` are the only power-of-ten operations in the repo; `grep -rn "\* 100\|/ 100" src/core` returns no money match.
3. `toMinor` throws on a value with more fraction digits than the exponent permits — it never truncates silently.
4. `toMajor(toMinor(v, e), e) === v` for exponents 0, 2, and 3.
5. Conversion is called only from services, never from a component or template.

### Requests

6. Product create and update send `priceMinor`, `compareAtPriceMinor`, `unitPriceMinor`, `costPerItemMinor`, and `variants[].priceMinor` as integers; no decimal money and no old key leaves the app.
7. The UI-only `valuesString` field is stripped before send.
8. Refund sends `amountMinor` as an integer.
9. App settings send `minimumAmountMinor` and `maximumAmountMinor` as integers.
10. Gateway-rule test sends `context.amountMinor` as an integer.
11. `grep -rn "price:\|amount:" src/core/services` shows no major-unit money in any request payload.

### Currency and exponent

12. `CurrenciesService.Currency` exposes `minorUnitExponent`, `rateFromUsd`, `rateUpdatedAt`, and `rateSource`; `exchangeRateToUSD` appears nowhere in the repo.
13. Every price input derives its fraction digits from the selected currency's exponent — no hardcoded `2` survives in a `p-inputNumber` money control.
14. A KWD product accepts `12.500` and saves `12500`.
15. A JPY product rejects decimal entry and saves an integer.
16. Changing the currency re-validates entered prices against the new exponent.

### Product form

17. `currency` is required: `showClear` removed, `*` on the label, validation blocks save without it.
18. Loading a product for edit populates `price`, `compareAtPrice`, `unitPrice`, **and** `costPerItem` — the 817–837 gap is closed.
19. Round-tripping a product (load → save with no edits) produces byte-identical stored minor values.

### Responses

20. All eleven `CurrencyPipe` bindings use `MoneyPipe`.
21. Both ad-hoc `Intl.NumberFormat` amount formatters are deleted.
22. `totalRevenue` and dashboard `revenue` no longer hardcode `'USD'`.
23. Dashboard service types every money field as `Money` and every count as `number`.
24. No screen renders `[object Object]`, `NaN`, or `undefined` where an amount belongs.

### No derivation

25. `payments.component.html:401` and `:404` render the server-allocated line total; `price * quantity` appears nowhere.
26. Displayed line totals sum exactly to the displayed session total, including on a session with a remainder-producing allocation.

### Gateway rules

27. Condition field values are `'amountMinor'` and `'productPriceMinor'`; the other six are unchanged.
28. Money condition values use an integer control labelled as minor units; defaults are `10000` and `0`.
29. The rule-test amount input is an integer control with no hardcoded `currency="USD"`.

### Build and tests

30. `npm run build` and `ng build --configuration production` compile with zero TypeScript errors.
31. `money.spec.ts` covers every case listed in the description.
32. `product-form.spec.ts` pins the SAR and KWD payloads, the required-currency rule, and the edit-load regression.
33. `npm test` passes.

### Manual verification

34. Create a SAR product at `49.99`, reload the edit form, and confirm it still reads `49.99`.
35. Create a KWD product at `12.500` and confirm three decimals survive the round trip.
36. Refund a completed payment; the confirm dialog and the toast both show a formatted amount.
37. Payments list, detail, customer payment history, and dashboard all render real amounts.
38. Save app payment settings and confirm the stored minor values are correct.
39. Switch the portal to Arabic and confirm amounts render correctly under RTL.

---

## Notes

### Why the input strategy differs from change-014

Checkout only displays money, so its rule is absolute: never compute, always render what the server sent. The portal has to accept money, and a merchant will not type minor units. The boundary is therefore not "no arithmetic" but "arithmetic in exactly one function, driven by the currency's own exponent, at the service layer."

That single function is where a KWD bug would live if one survived — which is why criteria 2–5 fence it in and criteria 14–16 test it with a three-decimal and a zero-decimal currency.

### The exponent is genuinely new here

Checkout and admin mostly *display* money and can lean on `Money.display`. The portal must know, before the server ever sees the value, how many decimals a currency has. Change-011 put `minorUnitExponent` in the database and change-013 documents it; this is the first change that makes a **user interface** depend on it. If `CurrenciesService` does not carry the exponent, every price input in the portal is guessing.

### Pre-existing defects fixed here

Two, both because the surrounding code is being rewritten and leaving them would be a deliberate act:

- Product edit silently blanking `compareAtPrice`, `unitPrice`, `costPerItem` (817–837)
- `totalRevenue` and dashboard `revenue` labelled USD for every merchant regardless of currency

### Risks

| Risk | Mitigation |
|------|------------|
| A merchant's price is silently rounded on save | `toMinor` throws rather than truncates (criterion 3); round-trip asserted (4, 19, 34–35) |
| KWD merchants cannot enter the third decimal | Exponent drives the control (13); asserted for KWD and JPY (14–15) |
| A request still sends a decimal and returns 400 | Explicit mappers, not object spread (6–7); grep assertion (11) |
| Displayed line totals disagree with the session total | Recomputation deleted (25); remainder case tested (26) |
| Currency becomes required and blocks a legitimate save | `ensureProductCurrency()` backfill retained; default `SAR` unchanged |
| Renamed gateway-rule fields stop matching existing rules | Intended — a stale rule failing to match is safer than one mis-routing; operators must re-save affected rules |
| Cross-currency rule thresholds remain semantically wrong | Pre-existing; recorded as drift, explicitly out of scope |
| Arabic RTL money rendering regresses | Criterion 39; `MoneyPipe` takes a locale from the start |
| 975-line inline-template component is hard to change safely | Mitigated by the new spec file (32) — the form has never had one |
