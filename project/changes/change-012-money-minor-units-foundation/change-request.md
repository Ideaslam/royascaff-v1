# Change Request

## Metadata
- **date**: 2026-08-30
- **change-type**: modify-data-model
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Payments, Products, Currencies, Gateways, Reporting, Audit
- Feature(s): Payment Session Creation, Payment Processing, Refunds, Product Catalog, Currency Conversion, Gateway Routing, Dashboard/Reports, Audit Trail
- Endpoint(s): EP-PC01–PC03 (public checkout), EP-TR01–TR04 (merchant transactions), EP-AD25 (admin payments), product CRUD, refund, currency convert, app payment settings, gateway rule test, dashboard/reports
- Page(s)/View(s): none (backend-only change — frontends handled in change-014/015/016)
- Depends on: **change-011** — supplies `Currency.minorUnitExponent`, `ICurrencyService`, and `constants/iso-currency-exponents.ts`. This change cannot start before it merges.
- Service(s): **new** MoneyService module; PaymentSessionService, PaymentService, `ICurrencyService` (implementation re-signed to minor units), ProductService, DashboardService, AdminDashboardService, TransactionSessionService, AdminPaymentService, GatewaySelectionService, GatewayRuleService, AuditService, all 5 gateway adapters, notification payload builder

---

## Description

### Problem

PayUp represents money as **decimal major units** (`amount: 37.50`) in the database, in every service, across every API boundary, and in gateway adapters. This is causing three distinct failures:

**1. Client amount mismatch (the reported symptom).** Line prices and the session total are rounded independently during currency conversion:

- `finalAmount` = the **total** converted once, then rounded to 2 dp (`currency-service.ts:209`)
- `paidPrice` = each **line** converted separately, then rounded to 2 dp (`payment-session-service.ts:687`)

The sum of rounded lines does not equal the rounded sum. An integrator adding up the line items gets a different number than the amount charged. This is a mathematical certainty, not an intermittent bug.

**2. A live 10× undercharge on three-decimal currencies.** `Currency` enum includes **KWD, BHD, OMR** — all three-decimal (1000 minor units per major). Both gateway adapters hardcode `× 100`:

- `stripe-gateway.ts:41` — `unit_amount: Math.round(payment.amount * 100)`
- `moyasar-gateway.ts:181` — `amount: Math.round((payment.amount || 0) * 100)`

Moyasar documents `1.00 KWD = 1000`. Sending `100` charges **0.100 KWD**. Every KWD/BHD/OMR transaction collects one tenth of the intended amount.

→ **Resolved ahead of this change as [bug-008](../../bugs/bug-008-three-decimal-currency-undercharge.md)** (shipped 2026-08-30). That hotfix added `CURRENCY_MINOR_UNIT_EXPONENT`, `getCurrencyExponent`, `toMinorUnits`, and `fromMinorUnits` to `src/constants/currency-constants.ts`, plus `toStripeMinorUnits` in the Stripe adapter, and `tests/gateway-amount-scaling.test.ts`.

**This change must absorb those helpers into `src/services/money/`, not duplicate them.** Two competing money utilities is exactly the condition that produced this bug. Concretely: the exponent table moves into `currency-exponents.ts` (backed by `Currency.minorUnitExponent` from the DB), `toStripeMinorUnits` becomes the Stripe entry in `gateway-exponents.ts`, `currency-constants.ts` is left holding only the currency enum, and `gateway-amount-scaling.test.ts` is folded into the golden-case suite so its assertions survive.

**3. Float arithmetic on money.** All amounts are IEEE-754 doubles. `Math.round(x * 100) / 100` is applied at seven separate call sites with no shared policy, so precision loss is unbounded and untested.

### Industry practice (researched)

| Source | Rule |
|--------|------|
| Stripe | Integer minor units. Zero-decimal and three-decimal currency tables published. |
| Adyen | Integer minor units. **Deviates from ISO 4217** for CLP, CVE, IDR, ISK — provider table wins. |
| Moyasar | Integer minor units. `1.00 SAR = 100`, `1.00 KWD = 1000`, minimum `100`. |
| MyFatoorah | **Decimal major units** — `InvoiceValue: 2.500`. |
| PayPal | **Decimal string** — `value: "10.00"`. |
| ISO 4217 | Exponent is per-currency: 0 (JPY, KRW), 2 (most), 3 (KWD, BHD, OMR, JOD, TND, IQD, LYD). |

Two conclusions drive the design:

- **Never hardcode 100.** The exponent is a per-currency property, overridable per gateway.
- **Providers disagree with each other.** Conversion belongs inside each gateway adapter, never in shared code.

### Desired behaviour

**Integer minor units are the single canonical representation** — in MongoDB, in every service signature, in every DTO, and in every request/response body. Decimals exist in exactly two places: inside a gateway adapter that demands them, and in a display string generated for humans.

```
  Request (integer minor)                    Response (Money object)
            │                                          ▲
            ▼                                          │
   ┌────────────────────────────────────────────────────────────┐
   │  Controllers · Services · Repositories · MongoDB           │
   │  integer minor units everywhere — no floats, no rounding   │
   └────────────────────────────────────────────────────────────┘
            │
            ▼  ← the ONLY conversion boundary
   ┌────────────────────────────────────────────────────────────┐
   │ Stripe: integer minor   │ MyFatoorah: "2.500" decimal      │
   │ Moyasar: integer minor  │ PayPal: "10.00" decimal string   │
   └────────────────────────────────────────────────────────────┘
```

### Contract decision: hard switch with renamed keys

Confirmed by product owner: **no backward-compatible parallel fields.** `amount` is not silently redefined — every money key is **renamed**. This is deliberate: a renamed key makes a stale client fail loudly with a validation error, whereas redefining `amount` in place would let a stale client keep working while being wrong by 100×. Silent financial errors are worse than loud failures.

Existing data may be discarded (project is pre-production).

### Money representation

**In requests** — bare integer plus currency (Stripe/Moyasar style):

```json
{ "priceMinor": 4999, "currency": "USD" }
```

**In responses** — a self-describing `Money` object:

```json
{
  "minor": 3750,
  "currency": "SAR",
  "exponent": 2,
  "display": "37.50 SAR"
}
```

`minor` is the source of truth. `exponent` lets any client format without a currency table. `display` is a locale-neutral convenience string; clients needing Arabic numerals or locale grouping format from `minor` + `exponent` via `Intl.NumberFormat`.

**In MongoDB** — flat integer field plus currency, so `$sum` aggregations stay exact:

```js
{ amountMinor: 3750, currency: "SAR", currencyExponent: 2 }
```

`currencyExponent` is snapshotted per document so historical records stay interpretable without a `Currency` lookup, and survive a future redenomination.

### New module: `src/services/money/`

| File | Responsibility |
|------|----------------|
| `money.ts` | `Money` type; `fromMinor`, `toDisplay`, `add`, `multiplyByQuantity`; integer + `MAX_SAFE_INTEGER` guards |
| `currency-exponents.ts` | Resolver over `ICurrencyService.getCurrencyExponent` (change-011's `Currency.minorUnitExponent`). **Declares no table of its own** — it imports `constants/iso-currency-exponents.ts` from change-011 as the fallback for unknown currencies |
| `gateway-exponents.ts` | Per-gateway format strategy (`integer-minor` \| `decimal-string`) and exponent overrides |
| `allocate.ts` | Largest-remainder allocation — distributes a converted total across lines so they sum **exactly** |
| `convert.ts` | FX conversion in integer space, single documented rounding mode (half-up), exponent-aware |

No new dependency. Pure functions, fully unit-tested.

**Exactly two exponent artifacts survive this change**: `Currency.minorUnitExponent` in MongoDB (authoritative, reached through `ICurrencyService`) and `constants/iso-currency-exponents.ts` (static, for seed bootstrap and unknown currencies). `currency-constants.ts` keeps only the currency enum, its bug-008 re-exports are deleted once their callers move here, and `money/currency-exponents.ts` re-declares nothing. A third copy of the table is a regression — duplicate exponent logic is what produced bug-008.

### `convertCurrency` moves into minor-unit space

Change-011 defines `ICurrencyService.convertCurrency` in major-unit decimals. This change **re-signs it to minor units** rather than leaving it alongside the new integer path — two live conversion implementations is the same failure mode as two exponent tables.

- `convertCurrency` accepts and returns integer minor units plus exponents, and delegates its arithmetic to `money/convert.ts`.
- `money/convert.ts` sources the rate from `ICurrencyService.getExchangeRate(from, to)`. It never reads the `Currency` model directly, per RULE-023.
- The float rounding left in `currency-service.ts` after change-011 (`Math.round(convertedAmount * 100) / 100`) is deleted here — rounding happens once, inside `convert.ts`, in integer space.
- Change-011's semantics-flip regression test is **restated, not deleted**: `100 USD → 375.45 SAR` becomes `10000 → 37545` with `rateFromUsd(SAR) = 3.7545`. Losing that assertion during the signature change would unpin the inversion guard.

### Rounding policy (fixes the mismatch)

1. Each line: `lineMinor = unitPriceMinor × quantity` — exact integer, no rounding.
2. `subtotalMinor = Σ lineMinor` — exact.
3. Convert the **total once**: `chargedTotalMinor = convert(subtotalMinor, rate, fromExp, toExp)` — one rounding event for the whole session.
4. Allocate `chargedTotalMinor` back across lines by largest remainder.

Guaranteed invariant: **`Σ paidPriceMinor × quantity === chargedTotalMinor`**, for every currency pair and every exchange rate. Enforced by a property test.

### Field renames

**`Payment`** (`src/models/Payment.ts`)

| Current | New | Type |
|---------|-----|------|
| `amount` | `amountMinor` | integer |
| `currency` | `currency` | unchanged |
| — | `currencyExponent` | integer (new, snapshot) |
| `metadata.taxAmount` | `taxAmountMinor` | integer (promoted to first-class) |
| `products[].price` | `products[].priceMinor` | integer |
| `products[].sessionPrice` | `products[].sessionPriceMinor` | integer |
| `products[].paidPrice` | `products[].paidPriceMinor` | integer |
| `currencyConversion.originalAmount` | `.originalAmountMinor` | integer |
| `currencyConversion.convertedAmount` | `.convertedAmountMinor` | integer |
| `currencyConversion.exchangeRate` | unchanged | float (a rate is not money) |

**`Product`** (`src/models/Product.ts`)

| Current | New | Type |
|---------|-----|------|
| `price` | `priceMinor` | integer |
| `compareAtPrice` | `compareAtPriceMinor` | integer |
| `unitPrice` | `unitPriceMinor` | integer |
| `costPerItem` | `costPerItemMinor` | integer |
| `variants[].price` | `variants[].priceMinor` | integer |
| `currency` (optional) | `currency` — **now required** | string |
| — | `currencyExponent` | integer (new, snapshot) |

`currency` becomes required because an integer minor amount without a currency is meaningless.
The undeclared `inventory.price` fallback (`payment-session-service.ts:544`) reads a field that does not exist in the schema — it is removed.

**`Currency`** (`src/models/Currency.ts`) — **no schema change in this change.**

`minorUnitExponent` is introduced and seeded by **change-011**, which ships first. This change only *reads* it, through `ICurrencyService.getCurrencyExponent`. If change-011 has not landed, this change cannot start — the money module has no authoritative exponent source without it.

**`App.settings.payment`** (`src/models/App.ts` + `app-settings.interface.ts`)

| Current | New |
|---------|-----|
| `minimumAmount` | `minimumAmountMinor` |
| `maximumAmount` | `maximumAmountMinor` |

**`GatewayRule` conditions** (`src/models/GatewayRule.ts`)

| Current `field` value | New |
|---------|-----|
| `'amount'` | `'amountMinor'` |
| `'productPrice'` | `'productPriceMinor'` |

Renaming the condition field is a safety measure: an un-migrated rule stops matching instead of silently mis-routing a transaction that is 100× off its intended threshold.

**Gateway adapter interface** (`src/services/gateway/base-gateway.ts`)

| Current | New |
|---------|-----|
| `PaymentRequest.amount: number` | `PaymentRequest.amountMinor: number` |
| `RefundRequest.amount?: number` | `RefundRequest.amountMinor?: number` |
| `PaymentStatusResponse.amount: number` | `PaymentStatusResponse.amountMinor: number` |

Per-adapter outbound conversion:

| Gateway | Outbound | Inbound |
|---------|----------|---------|
| Stripe | integer minor, assert three-decimal amounts divisible by 10 | integer minor as-is |
| Moyasar | integer minor, assert `>= 100` minimum | integer minor as-is |
| MyFatoorah | `toMajorDecimalString(minor, exponent)` → `"2.500"` | parse decimal → minor |
| PayPal | `toMajorDecimalString(minor, exponent)` → `"10.00"` | parse decimal → minor |
| Test | pass through minor | pass through minor |

### Request key renames (breaking)

| Endpoint | Current | New |
|----------|---------|-----|
| `POST /v1/checkout/backend/session` | `products[].price` | `products[].priceMinor` |
| `POST/PUT /merchant/v1/products` | `price`, `compareAtPrice`, `unitPrice`, `costPerItem`, `variants[].price` | `*Minor` equivalents |
| `POST /merchant/v1/payments/:id/refund` | `amount` | `amountMinor` |
| `POST /merchant/v1/currencies/convert` | `amount` | `amountMinor` |
| `PUT /merchant/v1/apps/:id/settings` | `payment.minimumAmount`, `maximumAmount` | `*Minor` |
| `POST /merchant/v1/gateways/rules/test` | `context.amount` | `context.amountMinor` |

`POST/PUT /merchant/v1/currencies` needs no request change — it already accepts `minorUnitExponent` from change-011, which also owns the `currency.exponent.updated` audit on that route.

New Zod helper `zMoneyMinor` = `z.number().int().nonnegative().safe()` with an explicit error message naming minor units, so a client sending `49.99` gets a clear 400 rather than a truncated charge.

The `POST /currencies/convert` handler currently bypasses Zod entirely (`parseFloat(amount)`, `currencies.controller.ts:142`) — it gets a proper schema as part of this change.

### Response changes (breaking)

Every money value becomes a `Money` object:

| Endpoint | Keys returned as `Money` |
|----------|--------------------------|
| `POST /v1/checkout/{web,backend}/session` | `amount`, `products[].price`, `products[].total`, `products[].paidPrice`, `currencyConversion.original`, `.converted` |
| `GET /v1/checkout/session/:token` | `totalAmount`, `totalTax`, `products[].price`, `products[].paidPrice`, `currencyConversion.*` |
| `GET /merchant/v1/transactions/sessions*` | `amount`, `totalRevenue`, product money fields, `currencyConversion.*` |
| `GET /merchant/v1/reports/dashboard` | `statistics.orders.revenue`, `chartData.dailyPayments[].amount`, `summary.totalAmount`, `summary.averageDaily`, `latestSessions[].amount` |
| `GET /admin/v1/payments*`, `/admin/v1/dashboard` | `amount`, `statistics.payments.revenue` |
| `POST /merchant/v1/payments/:id/refund` | `amount` |
| `GET/POST/PUT /merchant/v1/products*` | `price`, `compareAtPrice`, `unitPrice`, `costPerItem`, `variants[].price` |
| `POST /merchant/v1/currencies/convert` | `originalAmount`, `convertedAmount` |
| **Webhook payloads** (`whitelistPaymentFields`) | `amount`, `products[].price`, `products[].paidPrice`, `currencyConversion.*` |

`currencyConversion` is restructured from four flat amount keys into two `Money` objects plus the rate:

```json
{
  "original":  { "minor": 1000,  "currency": "USD", "exponent": 2, "display": "10.00 USD" },
  "converted": { "minor": 3750,  "currency": "SAR", "exponent": 2, "display": "37.50 SAR" },
  "exchangeRate": 3.75
}
```

`Pagination.total` and `totalPayments` are **counts, not money** — they stay plain integers.

### Audit trail (net-new)

Reconnaissance found the audit system covers **only auth and admin events** — no product, payment, refund, or price event is audited today, and `AuditLog.metadata` is untyped `Mixed`.

Two additions:

1. **Convention** — any money inside `metadata` is stored as a `Money` object, never a bare number. Enforced by a typed `AuditMoneyMetadata` helper on `AuditService`.
2. **New money-mutating events**:

| Action | Metadata |
|--------|----------|
| `product.created` | `priceMinor`, `currency`, `exponent` |
| `product.updated` | before/after `Money` for each changed price field |
| `payment.session.created` | `amountMinor`, `currency`, `exchangeRate`, `gateway` |
| `payment.refund.issued` | refunded `Money`, original `Money` |

Currency auditing is not listed here — change-011 owns both actions, `currency.rates.synced` and `currency.exponent.updated`, because the fields and the endpoints that write them ship there.

### Data handling

Pre-production, so no compatibility backfill. `scripts/migrate-money-minor.ts`:

- **Payments** — deleted (transient session records).
- **Products** — converted in place: `priceMinor = round(price × 10^exponent)`, using the product's `currency`; products with no `currency` are reported and skipped for manual resolution.
- **Currencies** — untouched; already carry `minorUnitExponent` from change-011.
- `--dry-run` default; `--apply` required to write; prints a per-document report.

### Out of scope

- Frontend changes — change-014 (checkout), change-015 (portal), change-016 (admin)
- OpenAPI specs and web SDK — change-013
- Currency rate sync, `rateFromUsd`, and `minorUnitExponent` themselves — **change-011**, lands first
- The KWD/BHD/OMR production hotfix — **bug-008**, already shipped
- Enforcing `minimumAmountMinor`/`maximumAmountMinor` during session creation (currently stored but never checked — a separate pre-existing gap, logged for a future change)
- Multi-currency wallet or settlement ledger

---

## Acceptance Criteria

### Correctness

1. Every exponent used anywhere in the codebase resolves through `ICurrencyService.getCurrencyExponent` (the `Currency.minorUnitExponent` seeded by change-011). Exactly two exponent artifacts exist — the DB and `constants/iso-currency-exponents.ts`; `grep` finds no third exponent map, and a test proves a DB value overrides the static fallback.
2. Exactly one conversion implementation exists. `ICurrencyService.convertCurrency` takes and returns minor units and delegates to `money/convert.ts`; no float conversion path survives in `currency-service.ts`, and change-011's inversion guard is present in minor-unit form (`10000` USD → `37545` SAR).
3. No money value is stored in MongoDB as a decimal. Every `*Minor` field is a JavaScript integer; `verify-money-data.ts` reports zero violations.
4. `grep` finds no `* 100`, `/ 100`, `.toFixed(`, or `Math.round(` applied to a money value anywhere outside `src/services/money/` and the gateway adapters.
5. For any session with any product mix and any exchange rate, `Σ (paidPriceMinor × quantity) === amountMinor` exactly.
6. A `1.00 KWD` payment sends `1000` to Moyasar and `1000` to Stripe — not `100`.
7. A `2.500 KWD` payment sends `InvoiceValue: "2.500"` to MyFatoorah.
8. A `10.00 USD` payment sends `1000` to Stripe/Moyasar and `"10.00"` to PayPal.
9. `npm run type-check` passes with zero errors — the renames force the compiler to surface every consumer.

### Contract

10. Every money value in every response is a `Money` object with all four keys (`minor`, `currency`, `exponent`, `display`).
11. Sending a decimal to any renamed `*Minor` request field returns `400` with a message naming minor units — never a silent truncation.
12. Sending the **old** key name (e.g. `price` instead of `priceMinor`) returns `400` for required fields — never a silent default.
13. `POST /merchant/v1/currencies/convert` validates through Zod (no `parseFloat`) and takes `amountMinor`.
14. Webhook payloads emit `Money` objects; `Pagination.total` and count fields remain plain integers.

### Audit

15. Creating a product writes a `product.created` audit entry containing a `Money` object.
16. Issuing a refund writes `payment.refund.issued` with refunded and original `Money`.
17. Every money value written into `AuditLog.metadata` is a `Money` object; a bare number fails the typed helper.
18. Change-011's `currency.rates.synced` and `currency.exponent.updated` entries still fire and are untouched by this change.

### Verification suites (all must pass in CI)

19. **Unit** — `tests/money/money.test.ts`: exponent resolution for 0/2/3-decimal currencies, `fromMinor`/`toDisplay` round-trip, integer guard rejects floats, `MAX_SAFE_INTEGER` guard, `allocate` distributes remainders correctly.
20. **Golden** — `tests/money/golden-cases.test.ts` driven by a `golden-cases.json` fixture of `(amount, currency, gateway) → exact expected outbound value`, covering all 9 currencies × all 5 gateways, including every case in criteria 6–8.
21. **Contract** — `tests/money/gateway-contract.test.ts`: HTTP mocked per adapter; asserts the **exact** outbound request body. A wrong multiplier in any adapter fails CI.
22. **Invariant** — `tests/money/invariant.test.ts`: 10,000 seeded pseudo-random line-set × exchange-rate combinations; asserts criterion 5 holds and no minor value is fractional, negative, or unsafe.
23. **End-to-end** — `scripts/verify-money-e2e.ts`: create session → fetch checkout details → pay via test gateway → assert `amountMinor` is byte-identical at every hop and `display` renders the correct decimal.
24. **Data** — `scripts/verify-money-data.ts`: scans all `Payment` and `Product` documents; fails if any legacy decimal key survives or any `*Minor` value is not an integer.
25. Change-011's currency suites (`tests/currency/*.test.ts`) still pass after `convertCurrency` is re-signed — updated for minor units, not deleted.
26. `npm test` runs suites 19–22 plus 25 and passes.

### Documentation

27. `RULE-022` in `project/rules.md` is rewritten from "session money fields are additive" to the minor-unit canonical rule, including the never-hardcode-100 constraint and the conversion-boundary rule. **`RULE-023` is left intact** — it governs exchange rates, which are not money and stay floats; the two rules must not be merged.
28. `project/plan/data-model.md`, the affected `services/` and `endpoints/` action docs, and `modules.md` reflect the renamed fields.

---

## Notes

### Sequencing

```
bug-008 ✓  →  change-011  →  change-012  →  change-013  →  change-014  →  change-015  →  change-016
KWD/BHD/OMR   currency +     money minor    api-docs +     checkout      customer       admin
undercharge   FX sync        units (this)   web SDK        frontend      portal         panel
(DONE)                                                     (highest
                                                            customer risk)
```

**This change is the breaking one.** The moment it lands, all three frontends and the published OpenAPI specs are wrong. Change-011 is breaking too, but only for the admin currency screen; 012 breaks every money surface in the product. Nothing from 011 onward may be deployed to a shared environment independently — **011 through 016 are one release train.**

### Downstream scope, recorded so nothing is missed

| Change | Repo | Known money surfaces |
|--------|------|----------------------|
| 013 | `api-docs` | ~30 money properties across `payup-public.yml` + `payup-merchant.yml`; ~12 major-unit `example:` values; `scripts/pin-request-examples.py` hardcodes `49.99` / `59.99` / `100` and must be updated in lockstep. Also carries change-011's currency field renames |
| 013 | `payup-web-sdk` | Low risk — SDK sends only `storeCode` + `quantity`. Dead `validateAmount`/`validateCurrency` in `utils.ts` to remove or repurpose |
| 014 | `payup-frontend-checkout` | Order summary, pay-button label, mobile pay bar, thank-you receipt; 6 duplicated `formatAmount()` helpers; client-side `price × quantity` recomputation; **Apple Pay sheet** passes `totalAmount.toFixed(2)`; existing unused `AmountDisplayComponent` already assumes minor units and can become the shared primitive |
| 015 | `payup-frontend-customer-control` | Product form `p-inputNumber` price inputs (4 fields), refund payload, payments/dashboard `CurrencyPipe` bindings, gateway-rule threshold inputs |
| 016 | `payup-frontend-admin` | Same product/refund surfaces plus raw unformatted `{{ row.amount }}` bindings, and the currency admin screen, which absorbs change-011's renamed fields, the exponent column, the manual sync button, and the staleness badge |

### Risks

| Risk | Mitigation |
|------|------------|
| A missed consumer silently reads a renamed field as `undefined` | Renames + `npm run type-check` make every consumer a compile error |
| A gateway adapter gets the wrong multiplier | Contract tests assert exact outbound bodies (criterion 21) |
| Three-decimal currencies regress again | Golden fixture pins KWD/BHD/OMR for all 5 gateways (criterion 20) |
| MongoDB `$sum` over mixed old/new documents | Old payments deleted; `verify-money-data.ts` proves no legacy shape survives |
| `display` string is not localized for Arabic | Documented as locale-neutral; frontends localize from `minor` + `exponent` via `Intl.NumberFormat` |
| Frontends break between 011 and 016 | Single release train; not deployed independently |
| A second conversion path or a third exponent table survives the merge | Both are named as regressions with explicit artifact counts; criteria 1 and 2 fail CI if either reappears |
