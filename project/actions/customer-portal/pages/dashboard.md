# Pages — Customer Portal (condensed)

All app-scoped pages require `AppContextService.selectedApp$` (app switcher in header).

## Module: Dashboard

### Dashboard Page
- Route: `/`
- Components: `DashboardComponent`, stats cards, recent sessions table
- Service: `DashboardService` → EP-DB01 (GET /reports/dashboard)
- Guard: `authGuard`
- UI: loading skeleton; empty table; error falls back silently

## Module: Apps

### Apps List — `/apps`
- Service: `AppsService`, `ApiKeysService`, `MediaService`
- Endpoints: EP-AP04, EP-AP01/07/08, EP-KY01/02, EP-CO18
- UI: loading, loadError + retry

### App View — `/apps/view/:id`
- Service: `AppsService`, `AppSettingsService`
- Endpoints: EP-AP06, EP-AP09/11
- UI: loading, loadError, saving

## Module: Products

### List `/products` · Create `/products/new` · View `/products/view/:id` · Edit `/products/edit/:id`
- Service: `ProductsService`, `CurrenciesService`
- Endpoints: EP-PR02–07, EP-CO01
- UI: loading, loadError, validation toasts

## Module: Tokens — `/tokens`

- Service: `TokensService`, `LibrariesService`
- Endpoints: EP-TK01–10, EP-CO09–12, EP-CO13
- UI: loading, domain verify states, empty states

## Module: Customers

- Routes: `/customers`, `/new`, `/view/:id`, `/edit/:id`
- Service: `CustomersService`
- Endpoints: EP-CU01–07
- UI: loading, loadError, payments empty state

## Module: Payments — `/payments`

- Service: `PaymentsService`
- Endpoints: EP-TR01–04, EP-CO01, filter EP-AP05, EP-GW03, EP-PR04, EP-TK04
- UI: loading, refund toasts

## Module: Gateways — `/gateways`

- Service: `GatewaysService`, `CurrenciesService`
- Endpoints: EP-GW01, EP-GW04–08, EP-CO01

## Module: Gateway Rules — `/gateway-rules`

- Service: `GatewayRulesService`
- Endpoints: EP-GW09–17, EP-GW01

## Module: Gateway Requests

- List `/gateway-requests` · New `/new` · View `/view/:id` · Admin `/admin`
- Service: `GatewayRequestsService`, `MediaService`
- Endpoints: EP-GW18–26, EP-CO18
- Note: `/edit/:id` route exists but only implements create

## Module: Notifications

### Webhooks `/notifications/webhooks`
- Endpoints: EP-N03–10

### Deliveries `/notifications/deliveries`
- Endpoints: EP-N16–18

## Module: Profile — `/profile`

- Service: `AuthService`, `ProfileService`
- Endpoints: EP-AU04/05, EP-PF01–09

## Module: Settings

- General `/settings` → EP-AU24–28
- Security `/settings/security` → EP-AU07–18, 2FA + passkeys

## Module: Auth (no guard)

- Login `/auth/login` → EP-AU02, EP-AU10, EP-AU15/16
- Register `/auth/register` → EP-AU01
- Access `/auth/access`, Error `/auth/error` — static

## Module: Redirects (legacy placeholder routes)

- `/domains` → redirects to `/tokens` (domain management on Tokens page)
- `/reports` → redirects to `/` dashboard (dedicated reports API TBD)
