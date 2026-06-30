# Endpoints — Public Payments

Prefix: `/api/v1/payments`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PP01 | POST | /process | pay verification token + rate limit | sessionToken, method, gateway, methodPayload | 200 payment result | `PaymentService.createPayment`, `CustomerService` | Card/wallet processing |
| EP-PP02 | POST | /confirm | pay verification token | sessionToken | 200 status | `PaymentStatusSyncService.sync` | Poll/confirm status |
| EP-PP03 | GET | /callback/:sessionToken | public | query: outcome | HTML redirect page | `PaymentStatusSyncService.sync` | Gateway return URL |

**Stubs:** `/api/v1/webhooks/*`, `/api/v1/payment-methods/*` — empty routers (handlers exist unmounted)
