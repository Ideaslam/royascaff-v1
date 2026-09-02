# Pages — Admin Panel

App key: `admin-panel` · Repo: `payup-frontend-admin` · Port: **4401**

**API base:** `environment.apiUrl` → `/api/admin/v1` (all HTTP via frontend services — no merchant API).

**Guards:** `authGuard` on all routes except `/auth/*`; `adminGuard` on all authenticated routes.

**Layout:** Copy `AppLayout` shell from customer-control — admin sidebar menu (no app switcher, no merchant switcher).

**Auth:** Authenticates against `AdminUser` collection (completely isolated from merchant users).

**i18n:** ngx-translate en/ar (copy from customer-control). Admin UI labels are hardcoded English today.

**Money:** `core/money/` — `money.model.ts` (`Money` = `{ minor, currency, exponent, display }`), `money.util.ts` (`formatMoney` only), `money.pipe.ts` (standalone `MoneyPipe`). Every amount renders through the pipe; `formatMoney` derives fraction digits from `exponent`, never a hardcoded 2. **The admin panel is read-only for money** — it submits no amount anywhere, so the module deliberately has no `toMinor`. `rateFromUsd` is a float rate and `minorUnitExponent` an integer; neither is money.

---

## Module: Auth (no authGuard)

### Login Page
- Route: `/auth/login`
- Components: `LoginComponent` (copy/adapt from customer-control)
- Service: `AdminAuthService`
- Endpoints: EP-AD01 (login against AdminUser), EP-AD02 (2FA verify if challenge returned)
- UI states: loading on submit; invalid credentials error; 2FA step inline; redirect to `/` on success
- Rules: on success store JWT in `localStorage.token`; AdminUser JWT (separate from merchant user JWT)

### Access Denied Page
- Route: `/auth/access`
- Components: static message — non-admin or wrong app
- Endpoints: none
- UI: link back to login

### Error Page
- Route: `/auth/error`
- Components: static
- Endpoints: none

---

## Module: Dashboard

### Platform Dashboard
- Route: `/`
- Components: `AdminDashboardComponent`, stat cards, recent gateway requests table, recent audit snippet
- Service: `AdminDashboardService` → EP-AD05
- Guards: `authGuard`, `adminGuard`
- UI states: loading skeleton; empty sections; error + retry
- Endpoints: EP-AD05
- Money: `statistics.payments.revenue` is `Money` and is shown on a Revenue stat card beside total/completed. No charts.

---

## Module: Merchants

### Merchants List
- Route: `/merchants`
- Components: paginated table, search, filters (status: active/suspended)
- Service: `AdminMerchantsService` → EP-AD06
- Guards: `authGuard`, `adminGuard`
- UI: loading, empty, error, row actions (view, suspend/activate)
- Data: Merchant entities (name, slug, status, member count, app count, created date)

### Merchant Detail
- Route: `/merchants/:merchantId`
- Components: merchant profile summary, team members list, app count, payment stats, suspend/activate toggle
- Service: `AdminMerchantsService` → EP-AD07, EP-AD08
- UI: loading, 404, confirm dialog on suspend/activate, success toasts
- Sections: profile info, team (read-only member list with roles), apps summary, recent payments link

---

## Module: Gateway Onboarding

### Gateway Requests Board (Kanban)
- Route: `/gateway-requests`
- Components: `GatewayRequestsBoardComponent` — **migrated from customer-portal**
- Service: `AdminGatewayRequestsService` → EP-AD10, EP-AD12–14
- Guards: `authGuard`, `adminGuard`
- UI: drag-drop columns by status; status/corrections/forward dialogs; loading, empty

### Gateway Request Detail
- Route: `/gateway-requests/:id`
- Components: full request detail, history timeline, admin action buttons
- Service: `AdminGatewayRequestsService` → EP-AD11, EP-AD12–14
- UI: loading, 404, action toasts

---

## Module: Audit Logs

### Audit Logs List
- Route: `/audit-logs`
- Components: filterable paginated table (actor, action, status, date range)
- Service: `AdminAuditService` → EP-AD15
- Guards: `authGuard`, `adminGuard`
- UI: loading, empty, error, pagination

---

## Module: Platform Config

### Currencies
- Route: `/currencies`
- Components: table + create/edit dialog + sync action + sync status strip + exponent confirm dialog
- Service: `AdminCurrenciesService` → EP-AD16–18, EP-AD35 (sync), EP-AD36 (sync status)
- UI: loading, empty, validation errors, save toasts, per-action sync loading, staleness badge
- Table columns: Code · Name · Symbol · **Rate (per 1 USD)** (`rateFromUsd`) · **Exponent** (`minorUnitExponent`) · **Source** (`rateSource` as `p-tag`: fastforex / manual / seed) · **Updated** (`rateUpdatedAt`, severity by age) · Active · Edit
- Header: **Sync now** button (`p-button [loading]`) → EP-AD35, then reloads list + status. Sync status strip (EP-AD36) shows provider, last success, last failure, staleness, active currency count; loaded independently so a status failure never empties the table
- Dialog: code (disabled on edit) · name · symbol · `rateFromUsd` (`p-inputNumber`, ≤6 fraction digits, > 0, help text "units of this currency per 1 USD; USD is 1") · `minorUnitExponent` (`p-select` 0/2/3, required) · active. Create defaults `{ isActive: true, rateFromUsd: 1, minorUnitExponent: 2 }`
- Validation on name, symbol, rate, and exponent — the screen previously validated nothing
- **Exponent guard**: changing `minorUnitExponent` on an existing currency opens a `ConfirmDialog` (warning icon, danger accept) naming the currency and both values before any request — the edit reinterprets every amount already stored in that currency. Backend writes `currency.exponent.updated` to the audit log

### SDK Libraries
- Route: `/libraries`
- Components: table + create/edit form, delete confirm
- Service: `AdminLibrariesService` → EP-AD19–23
- UI: loading, empty, delete confirmation

---

## Module: Payments Overview

### Payments List
- Route: `/payments`
- Components: cross-merchant session table, filters (status, gateway, merchant, search)
- Service: `AdminPaymentsService` → EP-AD24
- Guards: `authGuard`, `adminGuard`
- UI: loading, empty, read-only badge
- Money: `AdminPaymentSession.amount` is `Money`, rendered via `MoneyPipe` (no separate `currency` string)

### Payment Detail
- Route: `/payments/:sessionId`
- Components: session detail (reuse patterns from portal sessions detail — read-only)
- Service: `AdminPaymentsService` → EP-AD25
- UI: loading, 404; no refund button in V1
- Money: `amount` is `Money` via `MoneyPipe`; `getPayment()` returns a typed `AdminPaymentDetails`, not `Observable<any>`

---

## Module: Notifications Health

### Failed Deliveries
- Route: `/notifications/deliveries`
- Components: delivery log table, filters, redeliver action
- Service: `AdminNotificationsService` → EP-AD26, EP-AD28
- UI: loading, empty, redeliver confirm + toast

### Webhook Endpoint Health
- Route: `/notifications/webhooks`
- Components: table of disabled/high-failure endpoints
- Service: `AdminNotificationsService` → EP-AD27
- UI: loading, empty, link to merchant context if needed

---

## Module: Available Gateways Catalog

### Gateway Catalog
- Route: `/gateways/catalog`
- Components: catalog table (logo thumbnail, countries, currencies), edit/create dialog
- Service: `AdminAvailableGatewaysService` → EP-AD29–34; currencies from `AdminCurrenciesService`
- Form controls: `p-select` (gateway name), `p-multiSelect` (countries, currencies, payment methods), logo URL + file upload
- UI: loading, empty, edit dialog, save toasts

---

## Admin Sidebar Menu (planned)

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/` | home |
| Merchants | `/merchants` | users |
| Gateway Requests | `/gateway-requests` | clipboard |
| Payments | `/payments` | receipt |
| Notifications | `/notifications/deliveries` | bell |
| Audit Logs | `/audit-logs` | history |
| Currencies | `/currencies` | dollar |
| Libraries | `/libraries` | code |
| Gateway Catalog | `/gateways/catalog` | server |

---

## Frontend Services (planned)

| Service | File | Endpoints |
|---------|------|-----------|
| `AdminAuthService` | `core/services/admin-auth.service.ts` | EP-AD01–04 |
| `AdminDashboardService` | `core/services/admin-dashboard.service.ts` | EP-AD05 |
| `AdminMerchantsService` | `core/services/admin-merchants.service.ts` | EP-AD06–09 |
| `AdminGatewayRequestsService` | `core/services/admin-gateway-requests.service.ts` | EP-AD10–14 |
| `AdminAuditService` | `core/services/admin-audit.service.ts` | EP-AD15 |
| `AdminCurrenciesService` | `core/services/admin-currencies.service.ts` | EP-AD16–18, EP-AD35, EP-AD36 |
| `AdminLibrariesService` | `core/services/admin-libraries.service.ts` | EP-AD19–23 |
| `AdminPaymentsService` | `core/services/admin-payments.service.ts` | EP-AD24–25 |
| `AdminNotificationsService` | `core/services/admin-notifications.service.ts` | EP-AD26–28 |
| `AdminAvailableGatewaysService` | `core/services/admin-available-gateways.service.ts` | EP-AD29–32 |

**HTTP interceptor:** attach `Authorization: Bearer` from `localStorage.token`; base URL from `environment.apiUrl` only.

---

## Customer Portal Cleanup (Phase 3)

- Remove route `/gateway-requests/admin` and `GatewayRequestsBoardComponent` from customer-control
- Remove admin board from sidebar menu
- Optional: remove `adminGuard` from portal if no admin routes remain

## Admin Repo Cleanup

The admin repo carried an unrouted copy of merchant-portal code (products pages + service, merchant payments page with refund flow, customers view, reports, merchant `currencies.service.ts`, `customers.service.ts`). None of it was in `app.routes.ts` or `app.menu.ts`, and all of it held a pre-minor-units money model. **Removed** — the admin panel manages no products and issues no refunds.

---

## Pages Summary

| Route | Page | Endpoints |
|-------|------|-----------|
| `/auth/login` | Login | EP-AD01, EP-AD02 |
| `/auth/access` | Access denied | — |
| `/` | Dashboard | EP-AD05 |
| `/merchants` | Merchants list | EP-AD06 |
| `/merchants/:userId` | Merchant detail | EP-AD07–09 |
| `/gateway-requests` | Kanban board | EP-AD10, EP-AD12–14 |
| `/gateway-requests/:id` | Request detail | EP-AD11–14 |
| `/audit-logs` | Audit logs | EP-AD15 |
| `/currencies` | Currencies + FX ops | EP-AD16–18, EP-AD35, EP-AD36 |
| `/libraries` | Libraries | EP-AD19–23 |
| `/payments` | Payments list | EP-AD24 |
| `/payments/:sessionId` | Payment detail | EP-AD25 |
| `/notifications/deliveries` | Deliveries health | EP-AD26, EP-AD28 |
| `/notifications/webhooks` | Webhook health | EP-AD27 |
| `/gateways/catalog` | Gateway catalog | EP-AD29–32 |

**Total:** 15 routes · 10 frontend services · 34 backend endpoints
