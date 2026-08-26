# Pages — Customer Portal (condensed)

All app-scoped pages require `AppContextService.selectedApp$` (app switcher in header).
All authenticated pages require `MerchantContextService.selectedMerchant$` (merchant switcher in sidebar).

### Sidebar — Main Menu order
- Component: `AppMenu` (`app.menu.ts`)
- Order: **Dashboard** (`/`) → **My Apps** (`/apps`) → nested **Tokens** (`/tokens`) → **Products** → **Customers**
- My Apps navigates to `/apps` and expands to show Tokens. On `/tokens`, Tokens is the active item and My Apps stays expanded.
- Payments and Notifications sections are unchanged.

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
- View: detail hero (title, status, price, store code) + summary cards (media, inventory, shipping, publishing, SEO, metadata). List/create/edit keep global page styles.

## Module: Tokens — `/tokens`

- Service: `TokensService`, `LibrariesService`
- Endpoints: EP-TK01–10, EP-CO09–12, EP-CO13
- UI: loading, domain verify states, empty states
- Nav: nested under My Apps in the sidebar
- View (side panel): hero (name, environment, status), featured copyable token value, Libraries / Scopes / Allowed Domains cards. Domain add, verify, generate-file, remove; Close / Edit Token. List + create/edit keep global page styles.

## Module: Customers

- Routes: `/customers`, `/new`, `/view/:id`, `/edit/:id`
- Service: `CustomersService`
- Endpoints: EP-CU01–07
- UI: loading, loadError, payments empty state
- View: detail hero (name, contact, member-since / payment count) + address / notes / tags cards + payment history table. Edit and lazy payment history. List/create/edit keep global page styles.

## Module: Payments — `/payments`

- Service: `PaymentsService`
- Endpoints: EP-TR01–04, EP-CO01, filter EP-AP05, EP-GW03, EP-PR04, EP-TK04
- UI: loading, refund toasts
- Detail (side panel): amount + status hero, then session / customer / products / metadata cards. Close / Refund (completed only). List + filters keep global page styles.

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

- Login `/auth/login` → EP-AU02, EP-AU10, EP-AU15/16; **Forgot password** → `/auth/forgot-password`; footer self-serve “Create an account” → `/auth/register`; post-login loads merchants (EP-MT03)
- Forgot password `/auth/forgot-password` → EP-AU19; email field; always generic success (EN/AR); back to login
- Reset password `/auth/reset-password?token=` → EP-AU21 then EP-AU20; invalid/expired shared message + request new link; if `requiresStepUp`, one of TOTP / backup / passkey (EP-AU15 for options only — never EP-AU10 or EP-AU16); then new password + confirm; success → `/auth/login`
- Register `/auth/register` → EP-AU01; redirects to `/onboarding`
- Register with invite `/auth/register?invite=TOKEN` → EP-MT23 (validate) → EP-AU01 → EP-MT24 (accept)
- Access `/auth/access`, Error `/auth/error` — static
- UI: `auth-split` + promo panel; reuse login TOTP/passkey controls; loading / error toast / expired-link / success states

## Module: Merchant & Team

### Onboarding Stepper — `/onboarding`
- Guard: `authGuard` (no merchantGuard — user has no merchant yet)
- Components: `OnboardingStepperComponent` (host), `CreateMerchantStepComponent`, `BrandingStepComponent`, `InviteStepComponent`
- Each step is a standalone component, injectable elsewhere
- Service: `MerchantService` → EP-MT01 (create), EP-MT02 (check slug)
- Service: `MerchantInviteService` → EP-MT20 (invite)
- UI: Full-page stepper with progress indicator; step 1 mandatory, steps 2-3 skippable; random name suggestion; real-time slug availability check
- On complete: sets `onboardingCompleted` (EP-MT06), navigates to `/`

### Merchant Switcher (sidebar component)
- Component: `MerchantSwitcherComponent` — embedded in sidebar
- Service: `MerchantContextService` → EP-MT03 (list user merchants)
- UI: Dropdown/list showing merchant name + logo; selected state; on switch: updates localStorage, reloads app list, resets app context
- Guard: `merchantGuard` on layout routes — if no merchant selected, redirect to `/onboarding` or prompt

### Merchant Settings — Members `/settings/members`
- Guard: `authGuard` + `merchantGuard` + `merchantRoleGuard(['owner', 'admin'])`
- Service: `MerchantMemberService` → EP-MT10, EP-MT11, EP-MT12
- Service: `MerchantInviteService` → EP-MT20, EP-MT21, EP-MT22
- UI: Members table (name, email, role, joined date, actions); invite form (side panel); pending invites list; role change dropdown; remove confirmation dialog
- States: loading, empty (just owner), invite sent toast, role changed toast

### No-Merchant State
- If user has no merchants (EP-MT03 returns empty): redirect to `/onboarding`
- If user's merchant is suspended: show suspended overlay with message, block all navigation except profile/settings

## Module: Redirects (legacy placeholder routes)

- `/domains` → redirects to `/tokens` (domain management on Tokens page)
- `/reports` → redirects to `/` dashboard (dedicated reports API TBD)
