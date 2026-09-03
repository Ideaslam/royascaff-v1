# Endpoints — Gateways, Transactions, Notifications, Core, Audit, Dashboard

## Module: Transactions — `/api/merchant/v1/transactions/sessions`

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-TR01 | GET | /stats | authenticated | `PaymentRepository` aggregate | **direct repo** — no service layer. `$sum` `amountMinor`; revenue as `Money` |
| EP-TR02 | GET | / | authenticated | `PaymentRepository.findPaginated` | `amount` is a `Money` object |
| EP-TR03 | GET | /list | authenticated | `PaymentRepository` | search/filter; `amount` is a `Money` object |
| EP-TR04 | GET | /:sessionId | authenticated | `PaymentRepository`, `ProductRepository` | session detail — `amount` and product prices are `Money`; `currencyConversion` is `{ original, converted, exchangeRate }` |

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
| EP-GW17 | POST | /test | `GatewayRuleService.getMatchingRules` | rule simulator; context uses `amountMinor` / `productPriceMinor` |

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
| EP-CO01 | GET | / | public | `ICurrencyService.getAllCurrencies` | Returns `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt` |
| EP-CO02 | GET | /:code | public | `ICurrencyService.getCurrencyByCode` | Same field set |
| EP-CO03 | POST | / | authenticated + **admin** | `CurrencyRepository.create` | Body takes `rateFromUsd`, `minorUnitExponent` |
| EP-CO04 | PUT | /:code | admin | `CurrencyRepository` | Same renames |
| EP-CO05 | POST | /convert | public | `ICurrencyService.convertCurrency` | Body `amountMinor` (Zod). Response `{ original, converted, exchangeRate }` — amounts are `Money`; rate is unrounded |
| EP-CO06–08 | GET/POST | /gateways/:gatewayId/* | public | `ICurrencyService` | currency validation |

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

Auth for every endpoint below: `authMiddleware` + `merchantContext`. All merchant roles (owner, admin, member, developer) may read analytics — no role gate. Merchant isolation comes from `merchantId` always being the first term of every filter, so a foreign `appId` returns no data (RULE-017).

**Shared query params** (EP-DB03…EP-DB10): `range` = `7d` | `30d` | `90d` (default `30d`) · `from` / `to` ISO dates (override `range`) · `appId` optional — omitted means all of the merchant's apps · `reportingCurrency` default `USD` · `refresh=true` bypasses the Redis cache.

**Shared response envelope**: `{ meta: { range, from, to, appId, reportingCurrency, fxAsOf, fxStale }, data: … }`. Every money value is a `Money` object normalized into `reportingCurrency` via `ICurrencyService` (RULE-025). `fxStale` is true when FX data exceeds `FX_MAX_STALENESS_HOURS`.

**Caching**: `CacheService.getOrSet` keyed `dash:<facet>:<merchantId>:<appId|all>:<from>:<to>:<extra>`, TTL 60s, bypassed by `refresh=true`.

| ID | Method | Route | Service | Notes |
|----|--------|-------|---------|-------|
| EP-DB01 | GET | / | repos direct | **deprecated** — retained for back-compat. **direct repo** aggregates `$sum` `amountMinor`; revenue / daily amounts / session amounts are `Money`. Mixed-currency totals are **not** FX-normalized (superseded by EP-DB03) |
| EP-DB02 | GET | /tokens | `TokenRepository` | — |
| EP-DB03 | GET | /summary | `DashboardAnalyticsService.getSummary` | 4 KPIs — net revenue, successful count, success rate, average order value. Each returns `{ value, previous, deltaPct, sparkline[] }`; `previous` covers the immediately preceding period of equal length |
| EP-DB04 | GET | /timeseries | `DashboardAnalyticsService.getTimeseries` | extra param `granularity` = `day` \| `week` (default `day`). Returns `buckets[] { bucket, revenue: Money, count }`, zero-filled across the range |
| EP-DB05 | GET | /funnel | `DashboardAnalyticsService.getFunnel` | stages `init` → `pending` → `completed` with `count` + `dropOffPct` per stage; exposes checkout abandonment |
| EP-DB06 | GET | /breakdown | `DashboardAnalyticsService.getBreakdown` | extra param `facet` = `status` \| `gateway` \| `currency` (required). `gateway` facet adds `successRate` and `avgAmount`; `currency` facet reports each currency's **native** total plus its normalized value |
| EP-DB07 | GET | /failures | `DashboardAnalyticsService.getFailures` | groups `status: failed` by `errorCode` (falling back to `error`), ordered by count desc; extra param `limit` (default 10) |
| EP-DB08 | GET | /top-products | `DashboardAnalyticsService.getTopProducts` | `$unwind` on `products[]` of completed payments, ranked by revenue with units sold; extra param `limit` (default 5) |
| EP-DB09 | GET | /health | `DashboardAnalyticsService.getHealth` | integration checklist — active gateways, active tokens, verified domains, whether a first payment exists. Drives the setup empty state; not date-ranged |
| EP-DB10 | GET | /sessions | `DashboardAnalyticsService.listRecentSessions` | paginated recent sessions. Params `page`, `limit`, `status`, `gateway`, `search` + shared `appId`. **Was called by the portal but never registered** — this closes a live 404 |

## Module: Health

| ID | Method | Route | Auth | Notes |
|----|--------|-------|------|-------|
| EP-H01 | GET | /api/health | public | health check |
