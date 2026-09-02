# Services — Admin Panel

App key: `backend` · Module 14 · Route prefix: `/api/admin/v1`

All services live under `src/services/admin/`. Controllers under `src/routes/company-admin/v1/`.

---

## Module: Admin Auth

### SVC-AD01 · AdminAuthService [domain, internal, Admin Panel]
- Methods:
  - `login(email, password): AuthResponse` — delegates to `AuthService.login`; after credential validation (or before issuing JWT), asserts `user.role === 'admin'` and `user.isActive`; returns same shape as merchant login (JWT or 2FA challenge)
  - `verify2fa(challengeToken, code, method?): AuthResponse` — delegates to merchant 2FA verify flow; asserts admin role before issuing JWT
  - `getProfile(userId): User` — delegates to `AuthService.getProfile`
  - `refreshToken(userId): Token` — delegates to `AuthService.refreshToken`
  - `assertAdminEligible(user): void` — private; throws 401 with generic message if not admin/active
- Deps: `AuthService`, `UserRepository`, `TotpService` (for 2FA verify path)
- Side effects: audit log on successful admin login (`AuditService`)
- Rules: RULE-016; never reveal whether email exists vs wrong role

---

## Module: Admin Dashboard

### SVC-AD02 · AdminDashboardService [domain, internal, Admin Panel]
- Methods: `getDashboard(): AdminDashboardDTO`
- Returns: counts — merchants (total/active/suspended), apps, payments (total/completed/failed/revenue as `Money`), pending gateway requests, failed deliveries (7d), recent gateway requests, recent audit entries
- Deps: `UserRepository`, `AppRepository`, `PaymentRepository`, `GatewayRequestRepository`, `DeliveryRepository`, `AuditLogRepository`
- Side effects: read-only aggregations (`$sum` `amountMinor`; mixed-currency revenue wrapped with `reportingMoney`)

---

## Module: Admin Merchants

### SVC-AD03 · AdminMerchantService [domain, internal, Admin Panel]
- Methods:
  - `listMerchants(filters, pagination): PaginatedResponse<MerchantListDTO>`
  - `getMerchant(userId): MerchantDetailDTO` — user + app count + recent activity summary
  - `updateStatus(userId, isActive, actorId): User` — suspend/activate merchant
  - `updateRole(userId, role, actorId): User` — promote/demote (`user` | `admin`); cannot demote self
- Deps: `UserRepository`, `AppRepository`, `PaymentRepository`, `AuditService`
- Side effects: audit `admin.merchant.status_changed`, `admin.merchant.role_changed`
- Rules: cannot suspend or demote the acting admin's own account

---

## Module: Admin Gateway Onboarding

### SVC-AD04 · AdminGatewayRequestService [domain, internal, Admin Panel]
- Methods:
  - `listRequests(filters): GatewayRequest[]` — platform-wide; no `userId` filter
  - `getRequest(id): GatewayRequest`
  - `updateStatus(id, status, actorId, actorName, actorEmail, note?): GatewayRequest`
  - `addCorrections(id, data, actorId, actorName, actorEmail): GatewayRequest`
  - `forwardToGateway(id, actorId, actorName, actorEmail): GatewayRequest`
- Deps: `GatewayRequestService` (existing), `AuditService`
- Side effects: status history updates; audit per RULE-010
- Notes: replaces broken `isAdmin(req)` checks on merchant routes

---

## Module: Admin Audit

### SVC-AD05 · AdminAuditService [domain, internal, Admin Panel]
- Methods: `query(filters, pagination): PaginatedAuditLogs`
- Deps: `AuditService`
- Side effects: read-only

---

## Module: Admin Platform Config

### SVC-AD06 · AdminCurrencyService [domain, internal, Admin Panel]
- Methods: `listCurrencies()`, `createCurrency(dto)`, `updateCurrency(code, dto)`, `triggerSync()`, `getSyncStatus()`
- Deps: `ICurrencyService`, `IExchangeRateSyncService`, `CurrencyRepository`
- Side effects: cache invalidation via `ICurrencyService`; `triggerSync` delegates to `IExchangeRateSyncService.syncNow('manual')` and audits the acting admin; `updateCurrency` writes `currency.exponent.updated` (before/after) when `minorUnitExponent` changes
- Rules: writes accept `rateFromUsd` / `minorUnitExponent`; a manually set rate is stamped `rateSource: 'manual'` and is overwritten by the next scheduled sync

### SVC-AD07 · AdminLibraryService [domain, internal, Admin Panel]
- Methods: `listLibraries()`, `getLibrary(id)`, `createLibrary(dto)`, `updateLibrary(id, dto)`, `deleteLibrary(id)`
- Deps: `LibraryService`
- Side effects: none

### SVC-AD08 · AdminAvailableGatewayService [domain, internal, Admin Panel]
- Methods: `listAll()`, `getByName(name)`, `createGateway(dto)`, `updateGateway(name, dto)`
- Deps: `AvailableGatewayService`, `AvailableGatewayRepository`
- Side effects: cache invalidation on catalog changes

---

## Module: Admin Payments Overview

### SVC-AD09 · AdminPaymentService [domain, internal, Admin Panel]
- Methods:
  - `listPayments(filters, pagination): PaginatedResponse<AdminPaymentListDTO>` — cross-merchant; filters: status, gateway, merchantId, appId, search (sessionId/email), date range
  - `getPaymentBySessionId(sessionId): AdminPaymentDetailDTO` — read-only; includes merchant/app context; masks sensitive metadata; money fields are `Money` objects
- Deps: `PaymentRepository`, `UserRepository`, `AppRepository`, `ProductRepository`
- Side effects: read-only
- Rules: no refund/process from admin V1

---

## Module: Admin Notifications Health

### SVC-AD10 · AdminNotificationHealthService [domain, internal, Admin Panel]
- Methods:
  - `listDeliveries(filters, pagination): DeliveryListResult` — platform-wide failed/recent deliveries; filters: status, channel, eventType, appId, merchantId
  - `listWebhookEndpoints(filters, pagination)` — endpoints with `consecutiveFailures > 0` or `isActive: false`
  - `redeliver(deliveryId): RedeliverResult` — delegates to `NotificationDeliveryService.redeliver` with platform scope check
- Deps: `DeliveryRepository`, `WebhookEndpointRepository`, `NotificationDeliveryService`, `AppRepository`
- Side effects: redelivery enqueues BullMQ job

---

## Migration Map (merchant → admin)

| Former merchant route | New admin route | Service |
|----------------------|-----------------|---------|
| `POST /merchant/v1/auth/login` (admin misuse) | `POST /admin/v1/auth/login` | `AdminAuthService` |
| `GET /merchant/v1/audit-logs` (admin) | `GET /admin/v1/audit-logs` | `AdminAuditService` |
| `POST/PUT /merchant/v1/core/currencies` | `POST/PUT /admin/v1/currencies` | `AdminCurrencyService` |
| `POST/PUT/DELETE /merchant/v1/core/libraries` | same on admin | `AdminLibraryService` |
| Gateway request admin actions on merchant | `/admin/v1/gateway-requests/*` | `AdminGatewayRequestService` |

Merchant routes above marked **deprecated** after admin API ships; `GET /audit-logs/me` stays on merchant API.
