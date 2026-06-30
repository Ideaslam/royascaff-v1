# Pages Registry — Checkout

App key: `checkout` · Repo: `payup-frontend-checkout`

| Module | File | Pages |
|--------|------|-------|
| checkout | [checkout.md](./checkout.md) | 1 |
| thank-you | [thank-you.md](./thank-you.md) | 1 |
| error | [error.md](./error.md) | 1 |

## Module: Checkout

### Checkout Page
- Route: `/checkout/:token`
- Components: `CheckoutComponent`, stepper, products, currency, customer, address, shipping, tax, payment gateways (Moyasar/MyFatoorah card + Apple Pay, PayPal)
- Services: `SessionService`, `PaymentService`, `VerificationService`, `CheckoutStateService`, gateway tokenization services
- Endpoints: EP-PC03, EP-PC06/07, EP-PP01; external: Moyasar/MyFatoorah token APIs
- Guard: `CheckoutGuard` (**bypassed** — always true)
- Auth: SDK JWT via query `sdk_token` or localStorage
- UI: session loading skeleton; processing/done states; redirect to `/thank-you` or `/error`

## Module: Thank You

### Thank You Page
- Route: `/thank-you/:token`
- Service: `SessionService` → EP-PC03
- UI: loading, error, status badges (paid/failed/processing/canceled/expired/refunded)

## Module: Error

### Error Page
- Route: `/error` (catch-all redirect)
- UI: static failure; message from query param
