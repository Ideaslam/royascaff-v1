# Services — Payments

## Module: Payments

### SVC-P01 · PaymentSessionService [domain, internal, Payments]
- Methods: `createPaymentSession`, `getPaymentSession`, `generateSessionToken`
- Deps: `PaymentRepository`, `ProductRepository`, `AppRepository`, `GatewayRepository`, `GatewayFactory`, `GatewaySelectionService`, `ICurrencyService`, `CustomerService`, `PaymentService`, money module
- Side effects: creates Payment document as session; integer `amountMinor` + snapshotted `currencyExponent`; convert-once then allocate `paidPriceMinor`; writes `payment.session.created` audit with a `Money` object; API responses wrap money as `Money`

### SVC-M01 · Money module (`src/services/money/`) [domain, internal, Payments]
- Files: `money.ts`, `convert.ts`, `allocate.ts`, `currency-exponents.ts`, `gateway-exponents.ts`, `api.ts`
- Pure functions: `fromMinor`, `toDisplay`, `allocateUnitPrices`, `convertMinorUnits`, `toGatewayOutbound`, `toMoney`
- Notes: the only shared rounding/allocation/FX-arithmetic site. Exactly two exponent artifacts — DB via `ICurrencyService` and `constants/iso-currency-exponents.ts`. No third table. Gateway adapters convert at their own boundary.

### SVC-P02 · PaymentService [domain, internal, Payments]
- Methods: `tryProcessPayment`, `createPayment`, `getPayment`, `refundPayment`
- Deps: `PaymentRepository`, `GatewayRepository`, `GatewaySelectionService`, `AppGatewayService`, `PaymentProcessorFactory`
- Notes: `createPayment` / `refundPayment` take `amountMinor`; gateway interface is `amountMinor`

### SVC-P03 · PaymentStatusSyncService [domain, internal, Payments]
- Methods: `sync(sessionToken)` — poll gateway status, persist, emit notification events
- Deps: `GatewayRepository`, `AppGatewayService`, `eventBus`
- Side effects: async notification events on status transition

### SVC-P04 · WebhookService [integration, external, Payments]
- Methods: `handleStripeEvent`, `handlePaypalEvent`, `handleMoyasarCallback`, `handleMyFatoorahCallback`
- Deps: gateway repos, gateway APIs
- Note: mounted at `/api/v1/webhooks/*` (Stripe, PayPal, Moyasar, MyFatoorah)

### SVC-P05 · PaymentProcessorFactory [domain, internal, Payments]
- Methods: `getProcessor`, `registerProcessor`
- Deps: Moyasar/MyFatoorah card + Apple Pay processors

### SVC-P06 · SdkTokenService [domain, internal, Payments]
- Methods: `signFrontendSdkToken`, `signBackendSdkToken`, `signCheckoutToken`, `signVerificationToken`, `verify`
- Deps: jwt, scope constants
- Rules: scope-based permissions on SDK JWT

### SVC-P07 · TransactionSessionService [domain, internal, Payments]
- Methods: `getStats`, `listSessions`, `listSessionsPaginated`, `getSessionDetails`
- Deps: `PaymentRepository`, `ProductRepository`, `TokenRepository`
- Used by: merchant panel `/transactions/sessions` routes
- Side effects: read-only aggregations and DTO mapping for payment sessions
- `getSessionDetails` returns `Money` for amount/product prices and `currencyConversion` as `{ original, converted, exchangeRate }`
