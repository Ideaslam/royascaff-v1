# Modules & Features

PayUp — embeddable multi-gateway payment SaaS. See `project/profile.md` for apps and stack.

---

## 1. Auth

- Scope: BE `services/auth/` + FE `customer-portal/pages/auth`, `settings/security`
- Audience: public (login/register) + authenticated users
- Entities: `User`, `PasskeyCredential`
- Depends on: Email, Encryption, Merchant (post-login context)

### Features
1. **User Registration & Login** [both] — email/password, JWT issuance
2. **TOTP Two-Factor Authentication** [both] — setup, enable, verify, backup codes
3. **WebAuthn Passkeys** [both] — register and login without password
4. **Google OAuth** [both] — social login (env-configured)
5. **Password Reset** [both] — email link (15-minute token); require 2FA or passkey before save if either is enabled
6. **Account Settings** [both] — security, notifications, display, privacy groups
7. **Invite Registration** [both] — register via invite token, auto-join merchant

---

## 2. Apps & Multi-Tenancy

- Scope: BE `services/core/app-*`, `api-key-*` + FE `apps`
- Audience: authenticated members (role: owner, admin, member)
- Entities: `App`, `ApiKey`
- Depends on: Auth, Merchant (merchantId context)

### Features
1. **App Management** [both] — CRUD, switcher, paginated list
2. **App Settings** [both] — branding, checkout, payment, notifications, security, integration groups
3. **API Key Pairs** [both] — `pk_`/`sk_` per environment, rotate
4. **Per-App Branding** [both] — brandName, brandLogo, checkout UI toggles

---

## 3. Products

- Scope: BE `services/core/product-*` + FE `products`
- Entities: `Product`
- Depends on: Apps

### Features
1. **Product Catalog** [both] — CRUD with storeCode, integer `*Minor` prices, inventory, variants
2. **Ad-Hoc Products** [backend-only] — inline product creation during session (SDK)

---

## 4. Tokens & SDK Integration

- Scope: BE `token-*`, `sdk-token-*`, `domain-verification-*` + FE `tokens` + shared `web-sdk`
- Entities: `Token`, `Library`, `DomainVerification`
- Depends on: Apps

### Features
1. **Client Tokens (`tk_*`)** [both] — create, revoke, scopes, domain allowlist
2. **SDK Libraries** [both] — capability packages linked to tokens
3. **Domain Verification** [both] — well-known file generation, DNS/file verify
4. **Frontend SDK Flow** [both] — tokenize → SDK JWT → web session → checkout redirect
5. **Backend SDK Flow** [backend-only] — pk/sk auth → backend session

---

## 5. Customers

- Scope: BE `customer-*` + FE `customers`
- Entities: `Customer`
- Depends on: Apps

### Features
1. **Customer Records** [both] — CRUD, address, marketing prefs
2. **Payment History** [both] — per-customer session list
3. **Auto-Link on Checkout** [backend-only] — findOrCreate during payment process

---

## 6. Payments & Checkout

- Scope: BE `payment-*`, `verification-*` + FE `checkout`, `payments`
- Entities: `Payment`, `Verification`, `VerificationOTP`
- Depends on: Products, Gateways, Tokens, Customers

### Features
1. **Payment Session Creation** [both] — web (SDK) and backend paths; integer minor units everywhere; convert the session total once then allocate line `paidPriceMinor` so `Σ paidPriceMinor × quantity === amountMinor`; API responses wrap money as `{ minor, currency, exponent, display }`
2. **Checkout Page** [frontend] — multi-step: products, currency, customer OTP, address, shipping, tax, payment
3. **Payment Processing** [both] — card, Apple Pay, PayPal via gateway adapters
4. **Payment Callback** [backend-only] — gateway redirect handler
5. **Status Sync** [backend-only] — poll gateway, emit notification events
6. **Customer OTP Verification** [both] — email/mobile OTP at checkout
7. **Session Management (Portal)** [both] — list, stats, detail, refund
8. **Thank You Page** [frontend] — post-payment confirmation

---

## 7. Gateways

- Scope: BE `gateway-*` + FE `gateways`, `gateway-rules`, `gateway-requests`
- Entities: `Gateway`, `AvailableGateway`, `GatewayRule`, `GatewayRequest`
- Depends on: Apps, Encryption, Currency

### Features
1. **Gateway Configuration** [both] — per-app Stripe/PayPal/Moyasar/MyFatoorah credentials
2. **Gateway Selection Rules** [both] — condition-based routing with scoring
3. **Gateway Onboarding** [both] — KYC workflow, admin board, status transitions
4. **Gateway Request Webhooks** [backend-only] — HMAC webhooks from gateway partners
5. **Platform Gateway Catalog** [both] — available gateways and currencies

---

## 8. Notifications

- Scope: BE `notifications/*` + FE `notifications`
- Entities: `EventType`, `NotificationRule`, `NotificationTemplate`, `WebhookEndpoint`, `Delivery`, `Notification`
- Depends on: Apps, BullMQ

### Features
1. **Event-Driven Dispatch** [backend-only] — payment.completed/failed/cancelled/expired/refunded
2. **Webhook Endpoints** [both] — CRUD, roll secret, test ping
3. **Notification Rules** [both] — event → channel → recipient mapping
4. **Templates** [both] — email/push template CRUD
5. **Delivery Log** [both] — unified log with filters, detail, redeliver (stub)
6. **In-App Inbox** [both] — merchant notification inbox
7. **Channels** [backend-only] — webhook (HMAC), email (Mailjet), push (stub)

---

## 9. Core Platform

- Scope: BE `currency-*`, `media-*`, `library-*`, `domain-*`, `audit-*` + FE partial
- Entities: `Currency`, `Media`, `Library`, `AuditLog`, `EncryptionKey`, `EncryptionConfig`
- Depends on: Storage, Encryption, Redis + BullMQ (rate cache and `fx-rates` job), fastFOREX (via `IExchangeRateProvider`)

### Features
1. **Currency Management** [both] — list, convert, validate; admin CRUD. Reached exclusively through `ICurrencyService`; stores `rateFromUsd` (units per 1 USD) plus the ISO 4217 `minorUnitExponent`
2. **Exchange Rate Sync** [backend-only] — hourly BullMQ `fx-rates` job pulls live rates through the swappable `IExchangeRateProvider` (fastFOREX), bulk-upserts `Currency`, invalidates the Redis cache, and writes a `currency.rates.synced` audit entry. Payment sessions never call the provider; an outage falls back to the last stored rates with a staleness warning
3. **Media Upload** [both] — S3/R2 upload for app assets and documents
4. **SDK Libraries (admin)** [backend-only] — platform library CRUD (admin)
5. **Audit Logging** [both] — admin query all; merchant query own; money-mutating events (`product.created`, `product.updated`, `payment.session.created`, `payment.refund.issued`) store `Money` in metadata
6. **Field Encryption** [backend-only] — gateway credentials, webhook secrets, TOTP secrets

---

## 10. Profile & Companies

- Scope: BE `company-*`, auth profile + FE `profile`
- Entities: `Company`
- Depends on: Auth, Media, Merchant (companies belong to merchant)

### Features
1. **User Profile** [both] — name, photo (personal identity)
2. **Company Entities** [both] — KYC company CRUD with document upload (merchant-scoped)

---

## 11. Dashboard & Reports

- Scope: BE `reports/dashboard` + FE `dashboard`, `reports` (placeholder)
- Depends on: Payments, Apps, Gateways

### Features
1. **Dashboard Stats** [both] — aggregate counts, recent sessions
2. **Reports Page** [frontend] — **placeholder** — static dummy data, no API

---

## 12. Infrastructure (cross-cutting)

- Scope: observability, queues, rate limiting
- Type: infrastructure

### Features
1. **BullMQ Workers** [backend-only] — notif-events, notif-deliveries
2. **Observability** [backend-only] — Pino, OpenTelemetry, Prometheus `/metrics`
3. **Rate Limiting** [backend-only] — Redis-backed tiers per route class

---

## 13. Marketing & Docs (out of core API)

- `landing-page` — static marketing site
- `api-docs` — Docusaurus + OpenAPI
- `client-example` — Firebase-hosted SDK demo

---

## 14. Merchant & Team

- Scope: BE `services/merchant/` + FE `customer-portal/onboarding`, `settings/members`, sidebar switcher
- Audience: authenticated users (all roles interact with merchant context)
- Entities: `Merchant`, `MerchantMember`, `MerchantInvite`
- Depends on: Auth, Email

### Features
1. **Merchant CRUD** [both] — create (onboarding), update profile, delete (owner only)
2. **Slug Availability** [both] — check unique slug for merchant handle
3. **Onboarding Stepper** [frontend] — 3-step: create merchant (mandatory), branding (skip), invite (skip); each step is reusable component
4. **Merchant Switcher** [frontend] — sidebar switcher for multi-membership users
5. **Merchant Context Middleware** [backend-only] — resolves `X-Merchant-Id` header, validates membership, enforces workspace role
6. **Team Membership** [both] — list members, change roles, remove members
7. **Invite System** [both] — email invite with 3-day expiry, accept via registration
8. **Merchant Suspend/Activate** [backend-only] — platform admin action (blocks all API access)
9. **No-Merchant State** [frontend] — limited access (profile only) until user creates/joins a merchant

---

## 15. Admin Panel

- Scope: BE `routes/company-admin/` + `services/admin/` + FE `payup-frontend-admin`
- Audience: platform admin (`AdminUser` collection) only
- Entities: `AdminUser`, `Merchant`, `MerchantMember`, `Payment`, `GatewayRequest`, `AuditLog`, `Currency`, `Library`, `AvailableGateway`, `Delivery`, `WebhookEndpoint`, `App`
- Depends on: Merchant & Team, Gateways, Payments, Notifications, Core Platform
- API prefix: `/api/admin/v1/*` — all routes require `adminAuthMiddleware`

### Features
0. **Admin Auth** [both] — dedicated `POST /api/admin/v1/auth/login` (+ 2FA verify); authenticates against `AdminUser` collection; admin frontend never calls merchant API
1. **Platform Dashboard** [both] — cross-platform KPIs: merchants, apps, payments volume, pending gateway requests, recent activity
2. **Gateway Onboarding (Admin)** [both] — Kanban board, status transitions, corrections, forward to gateway
3. **Audit Logs** [both] — platform-wide audit query with filters (actor, action, date range)
4. **Platform Config — Currencies** [both] — admin CRUD on `Currency` reference data (rate, minor-unit exponent, active flag); manual FX sync trigger and sync status
5. **Platform Config — SDK Libraries** [both] — admin CRUD on `Library` capability packages
6. **Merchants Management** [both] — list/search merchants (Merchant entity), detail view with team members, suspend/activate (`Merchant.status`)
7. **Payments Overview** [both] — cross-merchant read-only payment session search and detail (support use)
8. **Notifications Health** [both] — platform-wide failed deliveries, disabled webhook endpoints, redeliver action
9. **Available Gateways Catalog** [both] — admin CRUD on `AvailableGateway` (enable/disable, currencies, payment methods)

### Notes
- Admin panel is a **separate Angular app** (`payup-frontend-admin`), shell copied from customer-control with merchant modules removed
- Login authenticates against `AdminUser` collection (fully isolated from merchant users)
- Admin app uses **only** `/api/admin/v1` — no merchant API calls
- Merchants Management operates on `Merchant` entity (not `User`); suspend sets `Merchant.status = suspended`
