# Endpoints — Admin Panel

Prefix: **`/api/admin/v1`** · Mount: `src/routes/company-admin/admin.routes.ts` → `router.use('/admin/v1', adminV1Routes)`

**Auth default:** `adminAuthMiddleware` unless marked **public**.

Rate limit: `MERCHANT_SENSITIVE` on auth login/2FA; `MERCHANT_GENERAL` on other routes.

---

## Module: Admin Auth — `/auth`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD01 | POST | /login | **public**; rate limit | email, password | 200 JWT or 2FA challenge | `AdminAuthService.login` | Authenticates against AdminUser collection |
| EP-AD02 | POST | /2fa/verify | **public**; rate limit | challengeToken, code, method? | 200 JWT | `AdminAuthService.verify2fa` | — |
| EP-AD03 | GET | /profile | admin | — | 200 profile | `AdminAuthService.getProfile` | For topbar + adminGuard |
| EP-AD04 | POST | /refresh | admin | — | 200 JWT | `AdminAuthService.refreshToken` | — |

---

## Module: Dashboard — `/dashboard`

| ID | Method | Route | Auth | Return | Service | Notes |
|----|--------|-------|------|--------|---------|-------|
| EP-AD05 | GET | / | admin | 200 stats + recent items | `AdminDashboardService.getDashboard` | Platform KPIs |

**Response shape (summary):**
```json
{
  "statistics": { "merchants", "apps", "payments", "gatewayRequests", "failedDeliveries" },
  "recentGatewayRequests": [],
  "recentAuditLogs": [],
  "shortcuts": [{ "label", "path", "icon" }]
}
```

---

## Module: Merchants — `/merchants`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD06 | GET | / | admin | query: page, limit, search, status, sortBy, sortOrder | 200 paginated | `AdminMerchantService.listMerchants` | Lists Merchant entities |
| EP-AD07 | GET | /:merchantId | admin | — | 200 detail (merchant + members + stats) | `AdminMerchantService.getMerchant` | 404 if not found |
| EP-AD08 | PATCH | /:merchantId/status | admin | `{ status: 'active' \| 'suspended' }` | 200 merchant | `AdminMerchantService.updateStatus` | Audit logged; blocks all member access when suspended |

---

## Module: Gateway Onboarding — `/gateway-requests`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD10 | GET | / | admin | query: status, gateway | 200 `{ requests }` | `AdminGatewayRequestService.listRequests` | All merchants |
| EP-AD11 | GET | /:id | admin | — | 200 request | `AdminGatewayRequestService.getRequest` | — |
| EP-AD12 | PATCH | /:id/status | admin | status, note? | 200 request | `AdminGatewayRequestService.updateStatus` | Migrated from EP-GW24 |
| EP-AD13 | POST | /:id/corrections | admin | message, fields[] | 200 request | `AdminGatewayRequestService.addCorrections` | Migrated from EP-GW25 |
| EP-AD14 | POST | /:id/forward | admin | — | 200 request | `AdminGatewayRequestService.forwardToGateway` | Migrated from EP-GW26 |

---

## Module: Audit — `/audit-logs`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD15 | GET | / | admin | actorId, action, status, startDate, endDate, page, limit | 200 paginated | `AdminAuditService.query` | Migrated from EP-AUD01 |

---

## Module: Currencies — `/currencies`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD16 | GET | / | admin | — | 200 array | `AdminCurrencyService.listCurrencies` | Includes inactive. Returns `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateSource` |
| EP-AD17 | POST | / | admin | code, name, symbol, rateFromUsd, minorUnitExponent, isActive? | 201 | `AdminCurrencyService.createCurrency` | Migrated from EP-CO03. A supplied rate sets `rateSource: 'manual'` |
| EP-AD18 | PUT | /:code | admin | partial currency fields | 200 | `AdminCurrencyService.updateCurrency` | Migrated from EP-CO04. Editing `minorUnitExponent` is high-risk — it changes how every amount in that currency is interpreted |
| EP-AD35 | POST | /sync | admin | — | 200 sync result | `ExchangeRateSyncService.syncNow('manual')` | Manual FX refresh; records the acting admin in the audit entry |
| EP-AD36 | GET | /sync/status | admin | — | 200 status | `ExchangeRateSyncService.getSyncStatus` | Provider, last success, last failure, staleness, active currency count |

Public GET `/merchant/v1/core/currencies` unchanged in shape for checkout/portal, but its fields follow the renames above.

---

## Module: Libraries — `/libraries`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD19 | GET | / | admin | — | 200 array | `AdminLibraryService.listLibraries` | — |
| EP-AD20 | GET | /:libraryId | admin | — | 200 library | `AdminLibraryService.getLibrary` | — |
| EP-AD21 | POST | / | admin | identifier, name, scopes, modules, isActive? | 201 | `AdminLibraryService.createLibrary` | Migrated from EP-CO15 |
| EP-AD22 | PUT | /:libraryId | admin | partial fields | 200 | `AdminLibraryService.updateLibrary` | Migrated from EP-CO16 |
| EP-AD23 | DELETE | /:libraryId | admin | — | 204 | `AdminLibraryService.deleteLibrary` | Migrated from EP-CO17 |

---

## Module: Payments Overview — `/payments`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD24 | GET | / | admin | page, limit, search, status, gateway, merchantId, appId, from, to | 200 paginated | `AdminPaymentService.listPayments` | Read-only |
| EP-AD25 | GET | /:sessionId | admin | — | 200 detail | `AdminPaymentService.getPaymentBySessionId` | Cross-merchant. Existing keys unchanged; additive `currencyConversion` + product `paidPrice`/`paidCurrency`. List (EP-AD24) unchanged |

---

## Module: Notifications Health — `/notifications`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD26 | GET | /deliveries | admin | status, channel, eventType, appId, merchantId, page, limit | 200 paginated | `AdminNotificationHealthService.listDeliveries` | Default filter: failed |
| EP-AD27 | GET | /webhook-endpoints | admin | isActive, minFailures, page, limit | 200 paginated | `AdminNotificationHealthService.listWebhookEndpoints` | Problem endpoints |
| EP-AD28 | POST | /deliveries/:id/redeliver | admin | — | 200 | `AdminNotificationHealthService.redeliver` | Platform scope |

---

## Module: Available Gateways — `/available-gateways`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AD29 | GET | / | admin | — | 200 array | `AdminAvailableGatewayService.listAll` | Includes disabled |
| EP-AD30 | GET | /:name | admin | — | 200 gateway | `AdminAvailableGatewayService.getByName` | — |
| EP-AD31 | POST | / | admin | name, enabled, displayName, description, logo, availableCurrencies, availableCountries, supportedPaymentMethods | 201 | `AdminAvailableGatewayService.createGateway` | — |
| EP-AD32 | PUT | /:name | admin | partial fields incl. logo, availableCountries | 200 | `AdminAvailableGatewayService.updateGateway` | Cache invalidation |
| EP-AD33 | GET | /form-options | admin | — | 200 `{ paymentMethods, countries }` | `AdminAvailableGatewayService.getFormOptions` | For admin form selects |
| EP-AD34 | POST | /logo-upload | admin | multipart file | 201 `{ url }` | `AdminAvailableGatewayService.uploadLogo` | S3 platform/gateways |

---

## Deprecation (merchant API — remove after admin app live)

| Old ID | Old route | Replacement |
|--------|-----------|-------------|
| EP-AUD01 | `GET /merchant/v1/audit-logs` | EP-AD15 |
| EP-CO03–04 | `POST/PUT /merchant/v1/core/currencies` | EP-AD17–18 |
| EP-CO15–17 | `POST/PUT/DELETE /merchant/v1/core/libraries` | EP-AD21–23 |
| EP-GW24–26 | Gateway request admin on merchant | EP-AD12–14 |

**Total:** 34 endpoints · **Stub replaced:** `/api/admin` empty router
