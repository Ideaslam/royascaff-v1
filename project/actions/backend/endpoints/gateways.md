# Endpoints — Gateways, Transactions, Notifications, Core, Audit, Dashboard

## Module: Transactions — `/api/merchant/v1/transactions/sessions`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-TR01 | GET | /stats | authenticated | `PaymentRepository` aggregate | **direct repo** — no service layer |
| EP-TR02 | GET | / | authenticated | `PaymentRepository.findPaginated` | — |
| EP-TR03 | GET | /list | authenticated | `PaymentRepository` | search/filter |
| EP-TR04 | GET | /:sessionId | authenticated | `PaymentRepository`, `ProductRepository` | session detail |

## Module: Gateways — `/api/merchant/v1/gateways`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-GW01 | GET | / | authenticated | `AvailableGatewayService` | platform catalog |
| EP-GW02 | GET | /currencies | authenticated | `AvailableGatewayService` | — |
| EP-GW03 | GET | /lite | authenticated | `AvailableGatewayService` | paginated |
| EP-GW04 | GET | /apps/:appId/gateways | authenticated | `GatewayService.listGateways` | — |
| EP-GW05 | GET | /apps/:appId/gateways/list | authenticated | `GatewayService.listGatewaysPaginated` | — |
| EP-GW06 | POST | /apps/:appId/gateways | authenticated | `GatewayService.createGateway` | — |
| EP-GW07 | PUT | /apps/:appId/gateways/:gatewayId | authenticated | `GatewayService.updateGateway` | — |
| EP-GW08 | DELETE | /apps/:appId/gateways/:gatewayId | authenticated | `GatewayService.deleteGateway` | — |

### Gateway Rules — `/gateways/rules`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-GW09 | GET | / | `GatewayRuleService.getRulesByAppId` | — |
| EP-GW10 | GET | /list | `GatewayRuleService.listGatewayRulesPaginated` | — |
| EP-GW11 | GET | /:id | `GatewayRuleService.getRuleById` | — |
| EP-GW12 | POST | / | `GatewayRuleService.createRule` | — |
| EP-GW13 | PUT | /:id | `GatewayRuleService.updateRule` | — |
| EP-GW14 | DELETE | /:id | `GatewayRuleService.deleteRule` | — |
| EP-GW15 | PATCH | /:id/toggle | `GatewayRuleService.toggleRuleActive` | — |
| EP-GW16 | POST | /seed | `GatewayRuleService.createSeedRules` | — |
| EP-GW17 | POST | /test | `GatewayRuleService.getMatchingRules` | rule simulator |

### Gateway Requests — `/gateways/requests`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-GW18 | POST | / | authenticated | `GatewayRequestService.createRequest` | — |
| EP-GW19 | GET | / | authenticated | `GatewayRequestService.listRequests` | — |
| EP-GW20 | GET | /list | authenticated | `GatewayRequestService.listGatewayRequestsPaginated` | — |
| EP-GW21 | GET | /:id | authenticated | `GatewayRequestService.getRequest` | — |
| EP-GW22 | PUT | /:id | authenticated | `GatewayRequestService.updateRequest` | — |
| EP-GW23 | POST | /:id/submit | authenticated | `GatewayRequestService.submitRequest` | — |
| EP-GW24 | PATCH | /:id/status | authenticated + **admin** | `GatewayRequestService.updateStatus` | — |
| EP-GW25 | POST | /:id/corrections | authenticated + **admin** | `GatewayRequestService.addCorrections` | — |
| EP-GW26 | POST | /:id/forward | authenticated + **admin** | `GatewayRequestService.forwardToGateway` | — |

### Gateway Request Webhooks — `/gateways/request-webhooks`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-GW27 | POST | /stripe | HMAC signature | `GatewayRequestService.handleGatewayWebhook` | — |
| EP-GW28 | POST | /paypal | HMAC | same | — |
| EP-GW29 | POST | /moyasar | HMAC | same | — |
| EP-GW30 | POST | /myfatoorah | HMAC | same | — |

## Module: Notifications — `/api/merchant/v1/notifications`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-N01 | GET | /event-types | `EventTypeRepository` | — |
| EP-N02 | GET | /channels | `ChannelRegistry.keys()` | — |
| EP-N03–N10 | CRUD | /webhook-endpoints/* | `WebhookEndpointService` | incl. roll-secret, test |
| EP-N11–N15 | CRUD | /rules/* | `NotificationRuleRepository` | **direct repo** |
| EP-N16–N18 | GET/POST | /deliveries/* | `NotificationDeliveryService` | redeliver queues BullMQ job |
| EP-N19–N23 | CRUD | /templates/* | `NotificationTemplateRepository` | **direct repo** |
| EP-N24–N27 | GET/PATCH | /inbox/* | `NotificationRepository` | in-app inbox |

## Module: Core

### Currencies — `/api/merchant/v1/core/currencies`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-CO01 | GET | / | public | `CurrencyService.getAllCurrencies` | — |
| EP-CO02 | GET | /:code | public | `CurrencyService.getCurrencyByCode` | — |
| EP-CO03 | POST | / | authenticated + **admin** | `CurrencyRepository.create` | — |
| EP-CO04 | PUT | /:code | admin | `CurrencyRepository` | — |
| EP-CO05 | POST | /convert | public | `CurrencyService.convertCurrency` | — |
| EP-CO06–08 | GET/POST | /gateways/:gatewayId/* | public | `CurrencyService` | currency validation |

### Domain Verification — `/core/domain-verification`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-CO09 | POST | /generate-well-known | `DomainVerificationService` | — |
| EP-CO10 | POST | /verify | `DomainVerificationService.verifyDomain` | — |
| EP-CO11 | GET | /verified-domains/:appId | `DomainVerificationService.getVerifiedDomains` | — |
| EP-CO12 | POST | /check-verified | `DomainVerificationService.isDomainVerified` | — |

### Libraries — `/core/libraries`

| ID | Method | Route | Auth | Service |
|----|--------|-------|------|---------|
| EP-CO13 | GET | / | authenticated | `LibraryService.listLibraries` |
| EP-CO14 | GET | /:libraryId | authenticated | `LibraryService.getLibrary` |
| EP-CO15 | POST | / | **admin** | `LibraryService.createLibrary` |
| EP-CO16 | PUT | /:libraryId | admin | `LibraryService.updateLibrary` |
| EP-CO17 | DELETE | /:libraryId | admin | `LibraryService.deleteLibrary` |

### Media — `/core/media`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-CO18 | POST | /upload | `MediaService.uploadMedia` | multipart |
| EP-CO19 | GET | / | `MediaService.listMedia` | — |
| EP-CO20 | GET | /:mediaId | `MediaService.getMedia` | — |
| EP-CO21 | DELETE | /:mediaId | `MediaService.deleteMedia` | — |

## Module: Profile — `/api/merchant/v1/profile`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-PF01 | GET | / | `AuthService.getProfile` | — |
| EP-PF02 | PUT | / | `AuthService.updateProfile` | — |
| EP-PF03–09 | CRUD | /companies/* | `CompanyService` | incl. document upload/delete |

## Module: Audit — `/api/merchant/v1/audit-logs`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AUD01 | GET | / | authenticated + **admin** | `AuditService.query` | — |
| EP-AUD02 | GET | /me | authenticated | `AuditService.getByActorId` | own logs |

## Module: Dashboard — `/api/merchant/v1/reports/dashboard`

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-DB01 | GET | / | repos direct | **direct repo** aggregates |
| EP-DB02 | GET | /tokens | `TokenRepository` | — |

## Module: Health

| ID | Method | Route | Auth | Notes |
|----|--------|-------|------|-------|
| EP-H01 | GET | /api/health | public | health check |
