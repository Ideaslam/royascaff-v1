# Endpoints — Public Payments

Prefix: `/api/v1/payments`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PP01 | POST | /process | pay verification token + rate limit | sessionToken, method, gateway, methodPayload | 200 payment result | `PaymentService.createPayment`, `CustomerService` | Card/wallet processing |
| EP-PP02 | POST | /confirm | pay verification token | sessionToken | 200 status | `PaymentStatusSyncService.sync` | Poll/confirm status |
| EP-PP03 | GET | /callback/:sessionToken | public | query: outcome | HTML redirect page | `PaymentStatusSyncService.sync` | Gateway return URL |

**Stubs:** `/api/v1/payment-methods/*` — empty router

## Module: Public Payment Webhooks — `/api/v1/webhooks`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-PW01 | POST | /stripe | Stripe signature + raw body | `WebhookService.handleStripeEvent` | Mounted |
| EP-PW02 | POST | /paypal | PayPal verification headers | `WebhookService.handlePaypalEvent` | Mounted |
| EP-PW03 | ALL | /moyasar | invoice id in body/query | `WebhookService.handleMoyasarCallback` | Mounted |
| EP-PW04 | ALL | /myfatoorah | InvoiceId in body/query | `WebhookService.handleMyFatoorahCallback` | Mounted |
