# Pages — Checkout

See `_index.md` for full spec. Module files consolidated here.

## Checkout Page — `/checkout/:token`

- Components: CheckoutComponent, OrderSummary, Stepper, PaymentGateways (Moyasar card/Apple Pay, MyFatoorah, PayPal)
- Services: SessionService, PaymentService, VerificationService, CheckoutStateService
- Endpoints: EP-PC03, EP-PC06, EP-PC07, EP-PP01
- Guard: CheckoutGuard (bypassed)
- UI: isLoadingSession, CheckoutStateService idle/processing/done, redirect on 401/403/404

## Thank You — `/thank-you/:token`

- Service: SessionService → EP-PC03
- UI: loading, error signals, status badges

## Error — `/error`

- Static; message from query param
