# Change Request

## Metadata
- **date**: 2026-08-31
- **change-type**: modify-feature
- **target-app**: checkout
- **affected-repos**: `payup-frontend-checkout`
- **priority**: high

## Scope
- Module(s): Checkout (Module 6 — Payments, client side)
- Feature(s): Order summary, pay button, mobile pay bar, thank-you receipt, Apple Pay sheet
- Endpoint(s): consumes EP-PC03 (`GET /v1/checkout/session/:token`), EP-PP01 (`POST /v1/payments/process`)
- Page(s)/View(s): `checkout: /checkout/:token`, `checkout: /thank-you/:token`
- Service(s): `SessionService`, `PaymentService`; **new** shared money module
- Depends on: **change-011** ✓, **change-012** ✓, and **change-013** for the written contract
- Risk: **highest of the release train** — this is the live payment page an end-customer sees while deciding to pay

---

## Description

### Problem

Change-012 turned every money value in the checkout session response into a `Money` object. This app reads all of them as bare `number`. On merge, every amount on the payment page renders as `[object Object]` or `NaN`, and the Apple Pay sheet is handed a string that Apple will reject.

That is the visible half. The invisible half is worse, and it is why this change is not a search-and-replace:

**The client recomputes the total.** `products.component.ts:54` and `:68` sum `price × quantity` to produce the subtotal and the total shown next to the pay button. `checkout.component.ts:166` does the same for the mobile pay bar. `thank-you.component.ts:79` does it again for the receipt. Four independent float computations, none of which is the amount the customer is actually charged.

Change-012 made the backend guarantee `Σ (paidPriceMinor × quantity) === amountMinor` exactly, using largest-remainder allocation. The client's float version cannot reproduce that — it will drift by a minor unit on any session with an odd split, and the customer will see one number and be charged another. **The recomputation has to be deleted, not ported.** The server-allocated `products[].total` and session `totalAmount` are the only correct values.

**Seven copies of `formatAmount()` exist**, all identical, all `amount.toFixed(2)`:

| File | Line | Live? |
|------|------|:-----:|
| `features/checkout/products/products.component.ts` | 37–40 | **yes** — order summary |
| `features/checkout/payment-gateways/card/card.component.ts` | 82–85 | **yes** — pay button |
| `payment-gateways/applepay-moyasar/applepay-moyasar.component.ts` | 448–453 | **yes** — Apple Pay sheet |
| `shared/order-summary.component.ts` | 428–431 | no — component unreferenced |
| `features/checkout/payment-gateways/gateway.component.ts` | 143–146 | no |
| `payment-gateways/card-moyasar/card-moyasar.component.ts` | 463–466 | no |
| `payment-gateways/card-myfatoorah/card-myfatoorah.component.ts` | 442–445 | no |

Plus three parallel paths that are not called `formatAmount`: `checkout.component.html:223` (`totalAmount().toFixed(2)`), `thank-you.component.html` (`CurrencyPipe` with `'1.2-2'`), and `amount-display.component.ts:9` (`/ 100 | number:'1.2-2'`). Ten formatting implementations, every one hardcoding two decimal places.

**The Apple Pay sheet is the sharpest edge.** `applepay-moyasar.component.ts:357–390`:

```ts
const formattedAmount = this.formatAmount(this.sessionDetails.totalAmount);
// → totalAmount.toFixed(2)
const applePayPaymentRequest = {
  currencyCode: this.sessionDetails.currency,
  total: { label: merchantName, amount: formattedAmount },   // "13.50"
};
```

Apple requires `total.amount` as a decimal string whose precision matches the currency. For KWD it must be `"37.500"`, not `"37.50"` — and once `totalAmount` is a `Money`, `.toFixed(2)` on an object yields `"[object Object]"` and the sheet fails to open. This is a customer-facing hard failure on the highest-intent action in the product.

### Desired outcome

One money primitive. Zero client-side money arithmetic other than exact integer operations on `minor`. Every amount on screen traceable to a value the server sent.

### The money module

New folder `src/app/core/money/`, the single place in the app allowed to know that a minor unit is scaled by a power of ten.

```
core/money/
  money.model.ts   — Money interface; MoneyLike guards
  money.util.ts    — format, subtract, toGatewayDecimalString
  money.spec.ts    — unit tests
```

**`money.model.ts`**

```ts
export interface Money {
  readonly minor: number;     // integer, source of truth
  readonly currency: string;  // ISO 4217
  readonly exponent: number;  // 0 | 2 | 3
  readonly display: string;   // locale-neutral, e.g. "37.50 SAR"
}
```

**`money.util.ts`** — three functions, and only three:

| Function | Contract |
|----------|----------|
| `formatMoney(m, locale?)` | No locale → return `m.display` verbatim. Locale given → `Intl.NumberFormat(locale, { style: 'currency', currency: m.currency, minimumFractionDigits: m.exponent, maximumFractionDigits: m.exponent }).format(m.minor / 10 ** m.exponent)` |
| `subtractMoney(a, b)` | Integer `a.minor - b.minor`; throws if currencies or exponents differ. Used for subtotal = total − tax, and nothing else |
| `toGatewayDecimalString(m)` | `(m.minor / 10 ** m.exponent).toFixed(m.exponent)` — the **only** sanctioned division by a power of ten in the app, existing solely for wallet SDKs that demand a decimal string |

Anything else — multiplying a unit price by a quantity, summing line items, deriving a total — is not offered, because the server already did it.

**`AmountDisplayComponent` is rebuilt into the shared primitive.** It already exists at `src/app/shared/amount-display.component.ts`, is `OnPush`, is unreferenced by anything, and is the right shape — but it hardcodes `/ 100` and `'1.2-2'`, so it encodes exactly the bug being removed. It keeps its file and its `app-amount` selector, and its API becomes:

```ts
@Input({ required: true }) value!: Money | null;
@Input() locale?: string;    // omit → Money.display
```

Every amount in the app renders through `<app-amount [value]="…">`. The seven `formatAmount()` copies and the three parallel paths all go.

### What each screen changes to

| Surface | File:line | Today | After |
|---------|-----------|-------|-------|
| Line total | `products.component.html:16` | `formatAmount(product.price * product.quantity)` | `<app-amount [value]="product.total">` — server-allocated |
| VAT | `products.component.html:29` | `formatAmount(getTax())` | `<app-amount [value]="session.totalTax">` |
| Subtotal | `products.component.html:33` | `formatAmount(getSubtotal())` — sums line items | `<app-amount [value]="subtotal()">` where `subtotal = subtractMoney(totalAmount, totalTax)` |
| Total | `products.component.html:43` | `formatAmount(getTotalAmount())` — sums line items | `<app-amount [value]="session.totalAmount">` |
| Mobile pay bar | `checkout.component.html:223` | `totalAmount().toFixed(2)` + manual symbol | `<app-amount [value]="session().totalAmount">` |
| Pay button | `card.component.html:51` | `Pay {{ formatAmount(...) }} {{ currency }}` | `Pay <app-amount [value]="session.totalAmount">` |
| Thank-you summary | `thank-you.component.html:67,77,82` | `CurrencyPipe '1.2-2'` | `<app-amount>` |
| Print receipt | `thank-you.component.html:155–156,165,169` | same | same |
| Receipt line items | `thank-you.component.ts:79` | `total: p.price * p.quantity` | `total: p.total` from the server |
| Apple Pay sheet | `applepay-moyasar.component.ts:362` | `formatAmount(totalAmount)` | `toGatewayDecimalString(session.totalAmount)` |

`getSubtotal()`, `getTax()`, and `getTotalAmount()` in `products.component.ts` are deleted, not rewritten. The component receives money; it does not derive it.

### Types

`SessionDetailsResponse` in `src/app/core/services/session.service.ts` (lines 27–62) — the only session model in the app, re-exported by `checkout.guard.ts:6–7`:

| Field | Today | After |
|-------|-------|-------|
| `totalAmount` | `number` (27) | `Money` |
| `totalTax` | `number` (28) | `Money` |
| `currency` | `string` (29) | **removed** — currency lives inside each `Money`; keeping a second copy invites the two to disagree |
| `products[].price` | `number` (58) | `Money` |
| `products[].total` | absent | `Money` — **new**, server-allocated line total |
| `products[].paidPrice` | absent | `Money` — **new** |
| `products[].currency` | `string` (55) | **removed**, same reason |
| `currencyConversion` | untyped (test mock only) | `{ original: Money; converted: Money; exchangeRate: number }` |

`ProductItem` (`products.component.ts:8,12`) follows. `ShippingData.shippingCost` and `TaxData.taxAmount` (`payment-request.model.ts:29,36`) are optional and unset on every live path — they become `Money | undefined` for consistency rather than being left as the last two `number` amounts in the app.

### Apple Pay

`toGatewayDecimalString` replaces `formatAmount` at `applepay-moyasar.component.ts:362`. The sheet then receives `"37.500"` for KWD, `"37.50"` for SAR, `"3750"` for JPY — precision driven by the currency's own exponent instead of a constant.

`currencyCode` continues to come from the session, now read from `totalAmount.currency`.

Not touched: `countryCode: 'SA'` is hardcoded at line 366 and is wrong for non-Saudi merchants, but it is a pre-existing defect unrelated to money representation. Recorded as drift, deferred to its own change.

The merchant-validation `fetch` to `api.moyasar.com/v1/applepay/initiate` (line 325) carries no amount and is unaffected. The MyFatoorah Apple Pay component is a "coming soon" stub with no amount handling.

### Dead code removed in the same pass

Leaving these behind means the next developer copies a `.toFixed(2)` out of a file that looked authoritative:

- `src/app/shared/order-summary.component.ts` — entire component, unreferenced, contains its own `formatAmount` and its own subtotal arithmetic
- `formatAmount` in `gateway.component.ts`, `card-moyasar.component.ts`, `card-myfatoorah.component.ts` — unreferenced
- Currency symbol maps in `checkout.component.ts:157–159`, `products.component.ts:29–35`, `currency-selector.component.ts:22–26` — three copies of the same five-entry table, all obsoleted by `Money.display` and `Intl`

### Currency selector

`checkout.component.ts:446–448` sets a local currency signal on selection and **does not re-fetch the session or convert anything**. Today that mislabels amounts. Once every amount carries its own currency, a local override can only ever contradict the data — a SAR label over a USD `Money`.

The override is removed. Displayed currency always comes from the `Money`. Whether the selector should trigger a real re-priced session is a product question, logged as drift, not decided here.

### Tests

There is no money test coverage in the repo today — eight spec files, none touching amounts. Two suites are added:

**`core/money/money.spec.ts`**
- `formatMoney` with no locale returns `display` unchanged
- `formatMoney('ar-SA', …)` renders Arabic-Indic digits with the right fraction count
- `subtractMoney` is exact; throws on currency mismatch and on exponent mismatch
- `toGatewayDecimalString`: SAR `3750/2 → "37.50"`, KWD `37500/3 → "37.500"`, JPY `3750/0 → "3750"`, zero `0 → "0.00"`

**`applepay-moyasar.component.spec.ts`**
- The sheet's `total.amount` for a KWD session is `"37.500"` — the exact regression that `.toFixed(2)` produced
- `currencyCode` is taken from `totalAmount.currency`
- Nothing in the request object is `NaN` or `"[object Object]"`

`session.service.ts` `getTestSessionDetails()` (lines 193–212) is updated to the `Money` shape, including a KWD variant, so the `USE_TEST_DATA` path exercises the three-decimal case. `src/assets/mock/orders.json` already uses `*_minor` fields and is unused by the live service — left as is.

### i18n

The app has no runtime i18n library, `index.html` declares `lang="en"`, and there is no RTL path — despite Arabic being a first-class product language elsewhere in the stack. `formatMoney` takes an optional locale precisely so that adding Arabic later is a parameter, not a rewrite. Wiring an actual locale switch into checkout is **out of scope**; the default stays `Money.display`.

### Out of scope

- Adding i18n/RTL to checkout
- Apple Pay `countryCode` hardcoding
- Making the currency selector re-price the session
- Google Pay, Klarna, PayPal, Tamara, Tabby, STC Pay, Samsung Pay — all placeholders or stubs with no amount handling
- Card tokenization flows — they send tokens, never amounts; the backend owns the charge

---

## Acceptance Criteria

### Money module

1. `src/app/core/money/` exists with `money.model.ts`, `money.util.ts`, `money.spec.ts`, exporting exactly `formatMoney`, `subtractMoney`, `toGatewayDecimalString`.
2. `AmountDisplayComponent` (`app-amount`) takes `Money | null` and an optional locale, renders `display` by default, and contains no `/ 100` and no `'1.2-2'`.
3. `grep -rn "toFixed" src/app --include=*.ts --include=*.html` matches **only** `toGatewayDecimalString` in `money.util.ts`.
4. `grep -rn "/ 100\|\* 100" src/app` returns no money-related match (TTL arithmetic in `verification-storage.service.ts` and `customer-element.component.ts` is unrelated and stays).
5. No file outside `core/money/` divides or multiplies by a power of ten for money.

### No client-side derivation

6. `product.price * product.quantity` appears nowhere. Line totals render `products[].total` from the server.
7. `products.component.ts` has no `getSubtotal`, `getTax`, or `getTotalAmount`.
8. `checkout.component.ts:166` no longer reduces products into a total; the mobile bar reads `session.totalAmount`.
9. `thank-you.component.ts` line items read `p.total`, not `p.price * p.quantity`.
10. The only money arithmetic in the app is `subtractMoney(totalAmount, totalTax)` for subtotal.
11. Given a session whose allocation has a remainder (e.g. 3 units of a price that does not divide the total evenly), the sum of displayed line totals equals the displayed total exactly.

### Types

12. `SessionDetailsResponse.totalAmount` and `.totalTax` are `Money`; `products[]` carries `price`, `total`, and `paidPrice` as `Money`.
13. The redundant top-level `currency` and per-product `currency` strings are gone; displayed currency comes from a `Money`.
14. `currencyConversion` is typed `{ original: Money; converted: Money; exchangeRate: number }`.
15. `npm run build` and `ng build --configuration production` compile with zero TypeScript errors.

### Apple Pay

16. The Apple Pay sheet receives `total.amount` from `toGatewayDecimalString(session.totalAmount)`.
17. A KWD session produces `"37.500"` (three decimals); JPY produces `"3750"` (zero); SAR produces `"37.50"`.
18. `currencyCode` is read from `totalAmount.currency`.
19. No `formatAmount` remains in any Apple Pay file.

### Display

20. Order summary, mobile pay bar, pay button, thank-you summary, and print receipt all render through `<app-amount>`.
21. Every visible amount matches the server value byte for byte when no locale is set.
22. No screen shows `NaN`, `undefined`, `[object Object]`, or a bare `0.00` where a real amount exists.
23. A KWD session renders three decimals on every surface; a JPY session renders zero.

### Dead code

24. `shared/order-summary.component.ts` is deleted.
25. All seven `formatAmount` implementations are gone.
26. All three currency symbol maps are gone.
27. The currency selector no longer overrides displayed currency.

### Tests

28. `money.spec.ts` covers all four `toGatewayDecimalString` cases, both `subtractMoney` throw paths, and locale-aware formatting.
29. `applepay-moyasar.component.spec.ts` pins the KWD sheet amount as a regression test.
30. `npm test` passes; the eight pre-existing specs still pass.

### Manual verification

31. Load a live SAR session end to end — summary, pay button, mobile bar match; pay via test gateway; receipt matches.
32. Repeat with a KWD session and confirm three decimals throughout, including the Apple Pay sheet.
33. Confirm the checkout is served only from `environment.apiUrl` — no new hardcoded backend URL (the Moyasar/MyFatoorah tokenization endpoints are the documented pre-existing exception per `profile.md`).

---

## Notes

### Why this one is the dangerous one

013 breaks nothing at runtime. 015 and 016 break merchant-facing screens, where a wrong number is noticed by someone with a support channel. 014 breaks the page where an end-customer with no relationship to PayUp is deciding whether to hand over a card. A wrong total here is not a bug report — it is an abandoned payment, or worse, a correct charge next to an incorrect displayed amount.

That is why criteria 6–11 are phrased as deletions. The safest client-side money arithmetic is none.

### The allocation invariant, restated for the client

Change-012 acceptance criterion: `Σ (paidPriceMinor × quantity) === amountMinor`. The server achieves it with largest-remainder allocation over integers. A float client cannot reproduce it — `0.1 + 0.2 !== 0.3` is the whole reason minor units exist. Any client-side sum is therefore not a convenience, it is a second, wrong answer competing with the right one.

### `AmountDisplayComponent` — reuse, not rewrite

It was written for a minor-unit world that had not arrived yet: right instinct, hardcoded exponent. Keeping the file and the selector preserves whatever intent put it there, and turning `/ 100` into `10 ** exponent` is the entire correction.

### Risks

| Risk | Mitigation |
|------|------------|
| A money value renders as `[object Object]` on the live payment page | Criterion 22 plus manual runs on SAR and KWD (31–32); TypeScript catches most at build |
| Apple Pay sheet fails to open or shows the wrong amount | Criteria 16–19 plus a pinned KWD regression spec (29) |
| Displayed total differs from the charged amount | Recomputation deleted outright (6–11); criterion 11 tests the remainder case specifically |
| Three-decimal currencies regress for the third time | Exponent-driven everywhere; KWD asserted in criteria 17, 23, 29, 32 |
| A stray `.toFixed(2)` survives in a rarely-hit gateway component | Criterion 3 is a repo-wide grep with exactly one permitted match |
| Dead components get "fixed" instead of deleted and rot further | Criteria 24–26 require deletion |
| Arabic checkout is still unavailable | Pre-existing; `formatMoney` accepts a locale so the gap is one parameter wide |
| Currency selector silently mislabels | Override removed (27); real re-pricing logged as drift |
