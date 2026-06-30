# Endpoints — Public Checkout

Prefix: `/api/v1/checkout`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PC01 | POST | /web/session | SDK JWT; scopes: payment:create_session, product:link; domain verified | body: createSessionSchema | 201 session + redirectUrl | `PaymentSessionService`, `SdkTokenService` | Frontend SDK path |
| EP-PC02 | POST | /backend/session | Backend SDK JWT; scope: payment:create_session | body: createSessionSchema | 201 session | `PaymentSessionService` | Server-side path; inline products allowed |
| EP-PC03 | GET | /session/:token | SDK JWT | param: sessionToken | 200 session details | `PaymentRepository`, `GatewayConfigEncryption` | Checkout page load |
| EP-PC04 | GET | /sessions/currencies | public | — | 200 currencies | `CurrencyService.getAllCurrencies` | — |
| EP-PC05 | GET | /sessions/gateways | public | — | 200 gateways | `AvailableGatewayService` | — |
| EP-PC06 | POST | /verification/request | SDK JWT; scope: payment:send_otp | method, identifier | 200 | `VerificationService.requestVerification` | — |
| EP-PC07 | POST | /verification/verify | SDK JWT; scope: payment:verify_otp | method, identifier, code | 200 + pay token | `VerificationService.verify` | — |
| EP-PC08 | GET | /verification/methods | SDK JWT | — | 200 methods | `VerificationService.getAvailableMethods` | — |

**Stubs:** `/ui/*` — empty router
