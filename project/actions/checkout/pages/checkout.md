# Pages — Checkout

See `_index.md` for full spec. Module files consolidated here.

## Money handling (applies to every page below)

- **Type**: every money value from the API is `Money` — `{ minor, currency, exponent, display }`. `minor` is authoritative; `exponent` is the ISO 4217 exponent (3 for KWD/BHD/OMR, 0 for JPY, 2 for most).
- **Module**: `core/money/` — `money.model.ts` (the `Money` interface), `money.util.ts` (`formatMoney`, `subtractMoney`, `toGatewayDecimalString`), `money.spec.ts`. The only place in the app allowed to scale by a power of ten.
- **Display primitive**: `AmountDisplayComponent` (`app-amount`), `OnPush`, inputs `value: Money | null` and optional `locale`. Renders `Money.display` by default; with a locale, formats from `minor` + `exponent` via `Intl.NumberFormat`. Every visible amount goes through it — there is no per-component formatter.
- **No client-side derivation.** Line totals come from `products[].total` and session totals from `totalAmount` / `totalTax`, all server-allocated so that `Σ (paidPriceMinor × quantity) === amountMinor` exactly. The only permitted arithmetic is `subtractMoney(totalAmount, totalTax)` for the subtotal line.
- **Gateway boundary**: `toGatewayDecimalString(money)` produces the decimal string wallet SDKs require, with precision from the currency's own exponent. It is the sole sanctioned division by a power of ten.
- **Currency** is read from each `Money`; there is no separate `currency` string on the session or on a product.

## Checkout Page — `/checkout/:token`

- Components: CheckoutComponent, ProductsComponent (order summary), Stepper, PaymentGateways (Moyasar card/Apple Pay, MyFatoorah, PayPal), `app-amount`
- Services: SessionService, PaymentService, VerificationService, CheckoutStateService
- Endpoints: EP-PC03, EP-PC06, EP-PC07, EP-PP01
- Guard: CheckoutGuard (bypassed)
- UI: isLoadingSession, CheckoutStateService idle/processing/done, redirect on 401/403/404
- Money surfaces: order summary line totals, VAT, subtotal, total; mobile pay bar; pay-button label — all `app-amount`
- Apple Pay: sheet `total.amount` is `toGatewayDecimalString(session.totalAmount)`; `currencyCode` from `totalAmount.currency`
- Session model (`SessionDetailsResponse`): `totalAmount`, `totalTax` as `Money`; `products[]` carries `price`, `total`, `paidPrice` as `Money`; `currencyConversion` is `{ original: Money, converted: Money, exchangeRate: number }`
- Currency selector switches the selected code only; it does not override displayed currency and does not re-price the session

## Thank You — `/thank-you/:token`

- Service: SessionService → EP-PC03
- Components: `app-amount`
- UI: loading, error signals, status badges
- Money surfaces: order summary and print receipt; line-item totals read `products[].total` from the server

## Error — `/error`

- Static; message from query param
