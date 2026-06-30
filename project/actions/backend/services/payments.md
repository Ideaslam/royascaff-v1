# Services — Payments

## Module: Payments

### SVC-P01 · PaymentSessionService [domain, internal, Payments]
- Methods: `createPaymentSession`, `getPaymentSession`, `generateSessionToken`
- Deps: `PaymentRepository`, `ProductRepository`, `AppRepository`, `GatewayRepository`, `GatewayFactory`, `GatewaySelectionService`, `CurrencyService`, `CustomerService`, `PaymentService`
- Side effects: creates Payment document as session

### SVC-P02 · PaymentService [domain, internal, Payments]
- Methods: `tryProcessPayment`, `createPayment`, `getPayment`, `refundPayment`
- Deps: `PaymentRepository`, `GatewayRepository`, `GatewaySelectionService`, `AppGatewayService`, `PaymentProcessorFactory`
- Side effects: gateway API calls, status updates

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
