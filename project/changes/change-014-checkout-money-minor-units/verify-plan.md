# Pre-Build Plan Verification — change-014

Plan doc updated: `actions/checkout/pages/checkout.md`.

## 1. Feature coverage
- Both money-bearing pages are specced: Checkout Page `/checkout/:token` and Thank You `/thank-you/:token`. Error `/error` is static and carries no money. PASS
- The new shared primitive is recorded: `core/money/` module and the `app-amount` display component, both declared in the page spec's "Money handling" section. PASS
- No backend work — this change consumes endpoints only. PASS

## 2. Service coverage
- `SessionService` → EP-PC03 and `PaymentService` → EP-PP01 both exist in `actions/backend/endpoints/public-checkout.md` and `public-payments.md`, and both already declare `Money` response shapes. PASS
- `VerificationService` (EP-PC06/07) and `CheckoutStateService` carry no money. PASS

## 3. Data model consistency
- `SessionDetailsResponse` mirrors EP-PC03 exactly: `totalAmount` and `totalTax` as `Money`, `products[]` with `price` / `total` / `paidPrice` as `Money`, `currencyConversion` as `{ original, converted, exchangeRate }`. All four shapes are documented backend-side. PASS
- `products[].total` and `paidPrice` are new to the client model and both exist server-side (EP-PC01 and `services/payments.md` SVC-P01 allocation). PASS
- Dropping the redundant top-level `currency` string is safe — every `Money` carries its own currency. PASS

## 4. Endpoint–page linking
- Checkout Page → EP-PC03, EP-PC06, EP-PC07, EP-PP01. Thank You → EP-PC03. Routes in the page spec match the routes in the repo. PASS

## 5. Auth declarations
- Unchanged. `CheckoutGuard` remains bypassed as already recorded; EP-PC03 keeps SDK JWT, EP-PP01 keeps the pay verification token. No new endpoint, no auth change. PASS

## 6. Custom rules
- **RULE-022**: "frontends localize from `minor` + `exponent`" is implemented by `formatMoney`'s optional-locale signature; the no-rounding-outside-the-money-module constraint is enforced by confining every power-of-ten operation to `core/money/`. PASS
- **RULE-022** conversion-boundary clause: `toGatewayDecimalString` is the client-side analogue of the gateway-adapter boundary, used only for the Apple Pay sheet. PASS
- **RULE-023**: `currencyConversion.exchangeRate` stays a float and is not wrapped as `Money`. PASS
- `profile.md` note that checkout calls Moyasar/MyFatoorah tokenization directly remains accurate and unaffected — those calls carry no amount. PASS

## Result: PASS

One item deliberately left inconsistent and recorded as drift rather than fixed: the checkout app has no i18n/RTL despite Arabic being a product language. `formatMoney` accepts a locale so the plan does not block it, but wiring a locale switch is out of scope.
