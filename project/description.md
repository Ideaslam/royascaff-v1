# Product Description

## 1. Product Summary

- **Name**: PayUp (PayUp Connect in production)
- **Type**: SaaS — embeddable multi-gateway payment platform
- **Audience**: Merchants integrating payments into websites/apps; end-customers completing checkout; platform admins

PayUp lets businesses accept payments through multiple gateways (Stripe, PayPal, Moyasar, MyFatoorah) via a unified API, embeddable Web SDK, and hosted checkout page. Merchants manage apps, products, customers, gateways, and notifications through a customer portal.

## 2. Core Workflow

1. User registers and completes **onboarding** (creates a Merchant workspace with name + slug)
2. User (now owner) creates an **App** in the customer portal
3. User configures **gateways**, **products**, and generates **client token** (`tk_*`) with verified domains
4. User embeds **Web SDK** on their site → customer clicks pay
5. SDK tokenizes → creates payment session → redirects to **checkout page**
6. Customer completes OTP verification (if enabled), selects payment method, pays via selected gateway
7. API syncs status → **notification events** fire → merchant webhooks/email delivered
8. User monitors sessions, customers, and deliveries in the portal
9. Owner invites **team members** (admin, member, developer roles) to collaborate on the merchant workspace
10. Platform **AdminUser** reviews gateway onboarding, manages merchants, and monitors platform health in the admin panel

**Backend integration path:** Server uses `pk_`/`sk_` keys to create sessions without browser SDK.

**Admin workflow:** Admin logs into admin panel via **`POST /api/admin/v1/auth/login`** → reviews gateway requests, audit logs, failed deliveries → manages platform currencies/libraries and merchant accounts.

## 3. Core Features

- **Merchant Workspaces**: Multi-user organizations with role-based access (owner/admin/member/developer)
- **Team Collaboration**: Invite system, role management, multi-merchant membership
- **Multi-Gateway Payments**: Stripe, PayPal, Moyasar, MyFatoorah, Test gateway with rule-based routing
- **Embeddable Web SDK**: One-line integration with domain-verified client tokens
- **Hosted Checkout**: Multi-step checkout with branding, OTP, Apple Pay, cards
- **Customer Portal**: Apps, products, customers, tokens, gateways, rules, onboarding, notifications, team management
- **Admin Panel**: Platform operations — merchants, gateway onboarding review, audit logs, currencies, libraries, cross-merchant payments, notification health, gateway catalog
- **Notification System**: Event-driven webhooks, email, push-ready architecture with delivery log
- **Security**: JWT, 2FA, passkeys, password reset (email link + 2FA/passkey step-up), encrypted credentials, rate limiting, audit log

## 4. Key Entities

- **User**: Personal identity with auth, settings, 2FA
- **Merchant**: Workspace/organization — all business resources belong here
- **MerchantMember**: Links users to merchants with roles (owner/admin/member/developer)
- **AdminUser**: Platform administrator (isolated collection)
- **App**: Merchant application with branding and checkout/payment settings
- **Product**: Catalog item with storeCode for SDK purchases
- **Token**: Client SDK token with scopes and domain allowlist
- **Payment**: Session + payment record (amount, status, gateway, products)
- **Gateway**: Per-app gateway credentials and configuration
- **Customer**: End-customer linked to app
- **WebhookEndpoint / Delivery**: Notification infrastructure
- **Company**: Business entity for KYC (merchant-owned, one merchant → many companies)

## 5. User Roles

### Platform Level
- **AdminUser**: Platform operations via dedicated admin panel — merchant management, gateway onboarding review, currency/library CRUD, full audit logs

### Workspace Level (within a Merchant)
- **owner**: Full control + team management + delete merchant (creator)
- **admin**: Manage all modules + invite/remove members (can't delete merchant)
- **member**: Operate modules (apps, payments, products) but can't manage team
- **developer**: API keys, tokens, webhooks, SDK config, sandbox payments only
- **end-customer**: No login — interacts via checkout page only

## 6. Integrations

- **Stripe, PayPal, Moyasar, MyFatoorah**: Payment processing
- **Mailjet**: Transactional email
- **Cloudflare R2**: Media and document storage
- **Redis + BullMQ**: Queues and rate limiting
- **Google OAuth**: Social login [INFERRED — env vars empty in dev]
- **n8n**: Welcome email webhook
- **OpenTelemetry + Loki**: Observability

## 7. Tech & Constraints

- Backend: Express + TypeScript, MongoDB, Redis, BullMQ
- Frontend: Angular 21 (portal), Angular 18 (checkout), PrimeNG
- SDK: TypeScript Webpack UMD bundle
- i18n: ngx-translate (portal), en/ar (landing page)
- Production domain: `payupconnect.com` (API, dashboard, checkout, control portal)
- Production Mongo bootstrap is **`npm run seed:prod`** (`PlatformSeedService`, insert-if-missing). Local `npm run seed` is overwrite/dev only and must not run against production (RULE-024)
- [INFERRED] Frontend prod env files not yet aligned with `.env.prod`

## 8. Business Rules

1. Domain must be verified before frontend SDK tokenization (RULE-005)
2. Payment sessions and payments share one `Payment` entity (RULE-006)
3. Gateway credentials encrypted at rest (RULE-008)
4. Notification channels pluggable — adding channel never touches event emitters (RULE-003)
5. Card tokenization happens at gateway from checkout frontend (RULE-002)
6. Production platform seed is insert-if-missing, CLI-only, and never overwrites live FX rates or an existing admin password (RULE-024)

## 9. Out of Scope

- Mobile native apps
- Built-in subscription/billing for PayUp itself
- Disputes, settlements, risk scoring (future admin modules — stubbed in legacy `admin.routes` comments)

## 10. Success Criteria

1. Merchant can embed SDK and receive payment in sandbox end-to-end
2. Multiple gateways routable via rules per app
3. Payment status changes trigger merchant webhooks reliably
4. Portal provides full session and customer visibility per app
5. Admin can manage gateway onboarding, merchants, and platform config from dedicated admin panel
