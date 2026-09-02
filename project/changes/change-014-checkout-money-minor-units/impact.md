# Impact Analysis — Checkout Frontend to Minor Units

Change: `change-014-checkout-money-minor-units` · Repo: `payup-frontend-checkout` (Angular 18, PrimeNG 18, signals, SCSS, Karma+Jasmine) · Depends on: change-011 ✓, change-012 ✓, change-013

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Money type | **none** | — | No `Money` interface anywhere; every amount is a bare `number` beside a separate `currency: string` |
| Shared formatter | **partial** | `shared/amount-display.component.ts` | Exists, `OnPush`, correct instinct — but unreferenced, hardcodes `/ 100` and `'1.2-2'` |
| Ad-hoc formatters | **complete** | 7 × `formatAmount()` + 3 parallel paths | All `toFixed(2)`; 4 of the 7 unreferenced |
| Session model | **complete** | `core/services/session.service.ts:27–62` | `totalAmount`/`totalTax`/`products[].price` are `number`; no `total`, no `paidPrice`; `currencyConversion` untyped |
| Order summary | **complete** | `features/checkout/products/products.component.*` | Recomputes subtotal and total from `price × quantity` |
| Mobile pay bar | **complete** | `checkout.component.html:223`, `.ts:162–167` | `toFixed(2)` + manual symbol; own recomputation fallback |
| Pay button | **complete** | `payment-gateways/card/card.component.html:51` | `formatAmount` |
| Thank-you / receipt | **complete** | `features/.../thank-you.component.*` | `CurrencyPipe '1.2-2'`; line totals recomputed at `.ts:79` |
| Apple Pay | **complete** | `payment-gateways/applepay-moyasar/` | `total.amount = totalAmount.toFixed(2)` at `.ts:362` — breaks on `Money` and on 3-decimal currencies |
| Other wallets/gateways | **none** | Google Pay, Klarna, PayPal, Tamara, Tabby, STC Pay, Samsung Pay | Placeholders/stubs — no amount handling |
| Currency symbol maps | **complete** | 3 duplicates | `checkout.component.ts:157–159`, `products.component.ts:29–35`, `currency-selector.component.ts:22–26` |
| Dead component | **complete** | `shared/order-summary.component.ts` | Unreferenced; own formatter + own subtotal arithmetic |
| i18n / RTL | **none** | `index.html:2` `lang="en"` | No runtime i18n library; `extract-i18n` target configured but unused; no Arabic path |
| Tests | **partial** | 8 spec files | Zero money coverage; no `Intl.NumberFormat` usage anywhere in the app |

**Feature state**: `complete` — money display exists everywhere and is uniformly wrong for the new contract. `partial` for the shared primitive (right file, wrong implementation). `none` for tests and i18n.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **Checkout page** | Order summary, mobile pay bar, pay button, subtotal/VAT/total; delete three derivation methods |
| **Thank-you page** | Summary + print receipt bindings; line-item totals from server |
| **Payment gateways** | Apple Pay sheet amount string; remove three unreferenced `formatAmount` copies from card gateways |
| **Core services** | `SessionService` model re-typed; test fixture re-shaped |
| **Shared** | `AmountDisplayComponent` rebuilt as the single primitive; `OrderSummaryComponent` deleted; **new** `core/money/` module |

Single-app change, but it reaches every screen the app has — there are only two.

---

## Plan Docs to Update

- [x] `actions/checkout/pages/checkout.md` — added a "Money handling" section (module, `app-amount` primitive, no-derivation rule, gateway boundary); Checkout Page and Thank You entries record `Money`-typed session fields, the Apple Pay amount source, and server-provided line totals. Also corrected drift: the order summary component is `ProductsComponent`, not the unrouted `OrderSummary`
- [x] `actions/checkout/pages/_index.md` — no edit needed; page count unchanged (`OrderSummaryComponent` was never a page)

Not updated: `plan/data-model.md`, `plan/modules.md`, `rules.md`, `actions/backend/**` — all settled by change-012. RULE-022 already states that clients localize from `minor` + `exponent`; this change implements it rather than amending it.

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/app/core/money/money.model.ts` | `Money` interface |
| `src/app/core/money/money.util.ts` | `formatMoney`, `subtractMoney`, `toGatewayDecimalString` |
| `src/app/core/money/money.spec.ts` | Unit tests (criterion 28) |
| `src/app/core/money/index.ts` | Barrel |
| `payment-gateways/applepay-moyasar/applepay-moyasar.component.spec.ts` | KWD sheet-amount regression (criterion 29) |

### Modify

| File | Scope |
|------|-------|
| `shared/amount-display.component.ts` | Rebuilt: `Money` input, exponent-driven, optional locale. Keeps file + `app-amount` selector |
| `core/services/session.service.ts` | `SessionDetailsResponse` re-typed (27–62); drop redundant `currency`; add `total`/`paidPrice`; type `currencyConversion`; re-shape `getTestSessionDetails()` (193–212) with a KWD variant |
| `core/guards/checkout.guard.ts` | Re-export follows the type change (6–7) |
| `features/checkout/products/products.component.ts` | Delete `formatAmount` (37–40), `getSubtotal` (54), `getTotalAmount` (68), symbol map (29–35); `ProductItem` re-typed (8, 12) |
| `features/checkout/products/products.component.html` | Lines 16, 29, 33, 43 → `<app-amount>` |
| `features/checkout/checkout.component.ts` | Delete symbol map (157–159) and the total reduce (166); remove currency-selector override (446–448) |
| `features/checkout/checkout.component.html` | Line 223 mobile pay bar → `<app-amount>` |
| `features/checkout/payment-gateways/card/card.component.ts/.html` | Delete `formatAmount` (82–85); line 51 → `<app-amount>` |
| `features/checkout/thank-you/thank-you.component.ts` | Line 79 `p.price * p.quantity` → `p.total`; `orderTotal` from session |
| `features/checkout/thank-you/thank-you.component.html` | Lines 67, 77, 82, 155–156, 165, 169 → `<app-amount>` |
| `payment-gateways/applepay-moyasar/applepay-moyasar.component.ts` | Line 362 → `toGatewayDecimalString`; delete `formatAmount` (448–453); `currencyCode` from `totalAmount.currency` |
| `features/checkout/payment-gateways/gateway.component.ts` | Delete unreferenced `formatAmount` (143–146) |
| `payment-gateways/card-moyasar/card-moyasar.component.ts` | Delete unreferenced `formatAmount` (463–466); `validateSession` null-check follows the type (133) |
| `payment-gateways/card-myfatoorah/card-myfatoorah.component.ts` | Same (442–445, 120) |
| `features/checkout/currency-selector/currency-selector.component.ts` | Delete symbol map (22–26) |
| `core/models/payment-request.model.ts` | `shippingCost` (29), `taxAmount` (36) → `Money \| undefined` |

### Delete

| Path | Reason |
|------|--------|
| `src/app/shared/order-summary.component.ts` | Unreferenced; carries its own formatter and its own subtotal arithmetic |

**Total: 5 created, ~16 modified, 1 deleted.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| `SessionDetailsResponse` re-typed | `checkout.guard.ts`, `products.component`, `checkout.component`, `thank-you.component`, all 3 card gateways, Apple Pay | Compile errors surface every consumer — the reason the backend renamed rather than re-typed in place |
| Top-level `currency: string` removed | Every template pairing an amount with a manual symbol | Currency now read from the `Money`; 3 symbol maps become dead |
| `products[].total` added | Order summary, thank-you line items | Replaces all four recomputation sites |
| `formatAmount` deleted ×7 | 3 live call sites + 4 dead | Live sites move to `<app-amount>`; dead ones deleted with their components or in place |
| `AmountDisplayComponent` API change | Nothing today (unreferenced) | Becomes the app-wide primitive — the one place a future exponent bug could hide, hence criteria 3–5 |
| Apple Pay amount string | Live Apple Pay checkout on Moyasar | Highest-severity path; pinned by a KWD spec |
| Currency-selector override removed | `checkout.component.ts:446–448` and any template reading the local signal | Displayed currency comes from data; re-pricing logged as drift |
| Test fixture re-shaped | `USE_TEST_DATA` path in `session.service.ts` | Add a KWD variant so the 3-decimal case is exercised locally |

**Not a ripple**: card tokenization (`api.moyasar.com/v1/tokens`, `api.myfatoorah.com/v1/tokens`) carries no amount. Merchant validation (`applepay/initiate`) carries no amount. `payments/process` and `payments/confirm` carry no client-supplied amount — the backend prices the charge.

---

## Reuse Opportunities

- **`AmountDisplayComponent` already exists**, is `OnPush`, and already thinks in minor units. Rebuilding it in place is cheaper than a new component and preserves the original intent.
- **Signals are the established state pattern** (`CheckoutStateService`, component `signal()`/`computed()`). `subtotal()` as a `computed()` over `subtractMoney` fits without introducing anything new.
- **`src/assets/mock/orders.json` is already minor-unit shaped** (`price_minor`, `subtotal_minor`, `vat_minor`, `total_minor`) from the older APS adapter. Not wired to the live service, but it confirms the shape and can seed the new test fixture.
- **The 7 `formatAmount` copies are byte-identical**, so consolidation carries no behavioural merge risk — there is exactly one behaviour to preserve, and it is the wrong one.
- **8 existing spec files** establish the Karma/Jasmine component-spec pattern; the Apple Pay regression spec follows the existing gateway spec layout.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| Client recomputes the session total in 4 places | **Deleted** — server allocation is authoritative |
| `OrderSummaryComponent` is unreferenced dead code | Deleted |
| 3 of 7 `formatAmount` copies are unreferenced | Deleted |
| 3 duplicate currency symbol maps | Deleted |
| Currency selector changes the label without re-pricing | Override removed; real re-pricing is a product decision, logged not fixed |
| Apple Pay `countryCode: 'SA'` hardcoded (`:366`) | Out of scope — real defect, unrelated to money; needs its own change |
| Checkout has no i18n/RTL despite Arabic being a product language | Out of scope; `formatMoney` takes a locale so the gap is one parameter wide |
| `AmountDisplayComponent` written for minor units but never adopted | Adopted as the app-wide primitive |
| Zero money test coverage | Two suites added |
| `dist/` build artifacts committed to the repo | Noted, not touched |

---

## Risk

**Complexity: MEDIUM-HIGH · Cross-module: NO (single app) · Migration: NO · Customer exposure: HIGHEST IN THE TRAIN**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| Displayed total ≠ charged amount | **Critical** | All client derivation deleted; criterion 11 tests a remainder-producing allocation |
| Apple Pay sheet fails to open or shows a wrong amount | **Critical** | `toGatewayDecimalString` is exponent-driven; KWD pinned by spec (29) and manual run (32) |
| `[object Object]` on the live payment page | High | TypeScript catches most; criterion 22 + manual SAR and KWD runs |
| 3-decimal currency regresses a third time | High | Exponent-driven everywhere; KWD asserted in 4 separate criteria |
| A `.toFixed(2)` survives in a rarely-exercised gateway | Medium | Criterion 3 is a repo-wide grep with exactly one permitted match |
| Angular 18 here vs Angular 21 in portal/admin | Low | Money module uses only `Intl` and plain TS — no version-specific API |
| No Arabic localization for amounts | Low | Pre-existing; unblocked by the optional-locale signature |
| Deleting `OrderSummaryComponent` removes something still wanted | Low | Grep-confirmed unreferenced; recoverable from git |

---

## Recommendation

- **Create** — `core/money/` (4 files) + Apple Pay regression spec
- **Complete** — `AmountDisplayComponent`, which was built for minor units and never finished or adopted
- **Modify** — session model + guard re-export, order summary, checkout shell, pay button, thank-you + receipt, Apple Pay, 3 card gateways, currency selector, payment-request model
- **Delete** — `OrderSummaryComponent`, 7 `formatAmount` copies, 3 symbol maps, 4 recomputation sites
- **Ripple** — every consumer of `SessionDetailsResponse`; all surfaced as compile errors

**Sequence within the change**: money module + its spec first (so the primitive is tested before anything depends on it) → `AmountDisplayComponent` → session model re-type, then let the compiler enumerate the rest → order summary → checkout shell and pay button → thank-you → **Apple Pay last and slowest**, with its regression spec written before the edit → dead-code sweep → manual SAR and KWD runs.

**Line-number caveat**: captured on the current `feat/minor` working tree before any edit. Re-locate by symbol.
