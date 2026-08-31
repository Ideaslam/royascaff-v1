# Endpoints — Apps, Keys, Products, Tokens, Customers

## Module: Apps — `/api/merchant/v1/apps`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AP01 | POST | / | authenticated | `AppService.createApp` | auto-provisions keys |
| EP-AP02 | GET | / | authenticated | `AppService.listApps` | — |
| EP-AP03 | GET | /switcher | authenticated | `AppService.listAppsSwitcher` | header switcher |
| EP-AP04 | GET | /list | authenticated | `AppService.listAppsPaginated` | paginated |
| EP-AP05 | GET | /lite | authenticated | `AppService.listAppsLite` | dropdowns |
| EP-AP06 | GET | /:appId | authenticated | `AppService.getApp` | — |
| EP-AP07 | PUT | /:appId | authenticated | `AppService.updateApp` | — |
| EP-AP08 | DELETE | /:appId | authenticated | `AppService.deleteApp` | — |

### App Settings — `/api/merchant/v1/apps/:appId/settings`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-AP09 | GET | / | `AppSettingsService.getSettings` | `payment.minimumAmountMinor` / `maximumAmountMinor` |
| EP-AP10 | PUT | / | `AppSettingsService.updateSettings` | full update; payment limits are integer `*Minor` |
| EP-AP11 | PUT | /:group | `AppSettingsService.updateGroup` | branding, checkout, payment (`*Minor`), notifications, security, integration |
| EP-AP12 | POST | /reset | `AppSettingsService.resetToDefaults` | — |
| EP-AP13 | POST | /reset/:group | `AppSettingsService.resetToDefaults` | — |

## Module: Keys — `/api/merchant/v1/keys`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-KY01 | GET | /:appId/keys | `ApiKeyService.listKeys` | ownership check |
| EP-KY02 | POST | /:appId/keys/:environment/rotate | `ApiKeyService.rotate` | sandbox \| live |

## Module: Products — `/api/merchant/v1/products`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-PR01 | POST | / | `ProductService.createProduct` | body `*Minor` prices + required `currency`; response prices are `Money`; audits `product.created` |
| EP-PR02 | GET | /app/:appId | `ProductService.listProducts` | prices are `Money` |
| EP-PR03 | GET | /app/:appId/list | `ProductService.listProductsPaginated` | prices are `Money` |
| EP-PR04 | GET | /app/:appId/lite | `ProductService.listProductsLite` | — |
| EP-PR05 | GET | /:productId | `ProductService.getProduct` | prices are `Money` |
| EP-PR06 | PUT | /:productId | `ProductService.updateProduct` | body `*Minor`; audits `product.updated` with before/after `Money` |
| EP-PR07 | DELETE | /:productId | `ProductService.deleteProduct` | — |

## Module: Tokens — `/api/merchant/v1/tokens`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-TK01 | POST | / | `TokenService.createToken` | generates `tk_*` |
| EP-TK02 | GET | /app/:appId | `TokenService.listTokens` | — |
| EP-TK03 | GET | /app/:appId/list | `TokenService.listTokensPaginated` | — |
| EP-TK04 | GET | /app/:appId/lite | `TokenService.listTokensLite` | — |
| EP-TK05 | GET | /:tokenId | `TokenService.getToken` | — |
| EP-TK06 | PUT | /:tokenId | `TokenService.updateToken` | — |
| EP-TK07 | POST | /:tokenId/revoke | `TokenService.revokeToken` | — |
| EP-TK08 | DELETE | /:tokenId | `TokenService.deleteToken` | — |
| EP-TK09 | POST | /:tokenId/domains | `TokenService.addDomain` | — |
| EP-TK10 | DELETE | /:tokenId/domains/:domain | `TokenService.removeDomain` | — |

## Module: Customers — `/api/merchant/v1/customers`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-CU01 | GET | /app/:appId | `CustomerService.getCustomersByApp` | — |
| EP-CU02 | GET | /app/:appId/list | `CustomerService.listCustomersPaginated` | — |
| EP-CU03 | GET | /:customerId | `CustomerService.getCustomerById` | — |
| EP-CU04 | POST | / | `CustomerService.createCustomer` | — |
| EP-CU05 | PUT | /:customerId | `CustomerService.updateCustomer` | — |
| EP-CU06 | DELETE | /:customerId | `CustomerService.deleteCustomer` | — |
| EP-CU07 | GET | /:customerId/payments | `CustomerService.getCustomerPaymentHistory` | paginated; `amount` is a `Money` object |

## Module: Merchant Payments — `/api/merchant/v1/payments`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-PY01 | POST | /:paymentId/refund | authenticated | `PaymentService.refundPayment` | Body `amountMinor`. Response `amount` is `Money`. Audits `payment.refund.issued` |
