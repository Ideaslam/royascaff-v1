# Verification — Checkout Frontend to Minor Units

**Status: PASS** (automated + static). Live SAR/KWD checkout against a running backend not exercised this session.

Repo: `payup-frontend-checkout`

## Plan Consistency
- [x] Pages exist in specs (`/checkout/:token`, `/thank-you/:token`) — see `verify-plan.md`, all 6 checks PASS
- [x] Services exist in specs (`SessionService` → EP-PC03, `PaymentService` → EP-PP01)
- [x] Data model consistent (`Money`, `products[].total`/`paidPrice`, `currencyConversion`)
- [x] Routes match (`app.routes.ts`)
- [x] Auth declared (unchanged; `CheckoutGuard` bypassed)
- [x] RULE-022 / RULE-023 honoured

## Code Verification
- [x] Routes: `/checkout/:token`, `/thank-you/:token`, `/error`
- [x] `src/app/core/money/` exports `formatMoney`, `subtractMoney`, `toGatewayDecimalString`. `app-amount` (`shared/amount-display.component.ts`) is the display primitive.
- [x] `SessionDetailsResponse` re-typed: `totalAmount` / `totalTax` / line `price` / `total` / `paidPrice` are `Money`. Top-level `currency` string removed from the client model.
- [x] Components read `session.totalAmount` and `product.total`. Only arithmetic is `subtractMoney(totalAmount, totalTax)` in `products.component.ts`.
- [x] HTTP via `environment.apiUrl`. Moyasar/MyFatoorah tokenization exception unchanged.
- [x] Auth guards unchanged
- [x] `npx ng build --configuration prod` — success, zero TS errors (this app uses `prod`, not `production`)
- [x] `npx ng test --watch=false --browsers=ChromeHeadless` — **51/51 SUCCESS**
- [x] Non-money flow (verification, gateway selection) untouched in this change

## Acceptance Criteria

### Money module
- [x] 1 · Barrel exports exactly those three functions (+ `Money` type)
- [x] 2 · `app-amount` takes `Money | null` + optional locale; no `/ 100`, no `'1.2-2'`
- [x] 3 · `toFixed` appears only in `core/money/money.util.ts` (`subtractMoney` display + `toGatewayDecimalString`). No component uses it.
- [x] 4 · No money-related `/ 100` or `* 100`. Remaining `* 1000` values are verification timeouts, not money.
- [x] 5 · Power-of-ten scaling confined to `core/money/`

### No client-side derivation
- [x] 6 · `product.price * product.quantity` gone; lines bind `product.total`
- [x] 7 · `getSubtotal` / `getTax` / `getTotalAmount` deleted from `products.component.ts`. Subtotal is `subtractMoney`.
- [x] 8 · Mobile pay bar binds `sessionDetails()?.totalAmount`
- [x] 9 · Thank-you line items bind `item.total`
- [x] 10 · Only money arithmetic is `subtractMoney(totalAmount, totalTax)`
- [x] 11 · Allocation correctness is a server guarantee (change-012). Client displays server `total` fields; no client re-sum. **Live remainder session not run.**

### Types
- [x] 12 · Session model matches EP-PC03 Money shapes
- [x] 13 · Redundant top-level `currency` removed from `SessionDetailsResponse`
- [x] 14 · `currencyConversion?: { original: Money; converted: Money; exchangeRate: number }`
- [x] 15 · Prod build compiles clean

### Apple Pay
- [x] 16 · Moyasar sheet uses `toGatewayDecimalString(this.sessionDetails.totalAmount)`
- [x] 17 · Unit tests pin KWD `"37.500"`, JPY `"3750"`, SAR `"37.50"`
- [x] 18 · `currencyCode` from `totalAmount.currency`
- [x] 19 · No `formatAmount` remains. MyFatoorah Apple Pay passes `totalAmount.minor` (integer) into its own adapter — not a decimal sheet.

### Display
- [x] 20 · Order summary, mobile pay bar, pay button, thank-you, print receipt use `app-amount`
- [x] 21 · `formatMoney` without locale returns `m.display` unchanged
- [x] 22 · Null money renders empty string from `app-amount`
- [x] 23 · Covered by `toGatewayDecimalString` + `formatMoney` tests (KWD 3 decimals, JPY 0). **Live render deferred.**

### Dead code
- [x] 24 · `shared/order-summary.component.ts` gone
- [x] 25 · All `formatAmount` implementations gone
- [x] 26 · Currency symbol maps gone
- [x] 27 · Client model no longer carries a display-override currency string. `showCurrencySelector` remains a session flag only.

### Tests
- [x] 28 · `money.spec.ts` covers four `toGatewayDecimalString` cases, both `subtractMoney` throws, locale formatting
- [x] 29 · `applepay-moyasar.component.spec.ts` pins the KWD sheet amount
- [x] 30 · 51/51 tests passed

### Manual verification
- [ ] 31 · **Deferred** — no live SAR session against a running API in this session
- [ ] 32 · **Deferred** — no live KWD / Apple Pay sheet
- [x] 33 · No new hardcoded backend URL

## Result: PASS

**Overall: PASS** for code and automated tests. Criteria 31–32 need a hosted checkout pass before release.

Recorded drift (unchanged, out of scope): checkout has no i18n/RTL; Apple Pay `countryCode: 'SA'` remains hardcoded.
