# System Profile

## Product

- **Name**: PayUp
- **Type**: SaaS — embeddable multi-gateway payment platform
- **Users**: merchant (user), platform admin (admin), end-customer (checkout, no login)

## Applications

| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `backend` | PayUp API | api | `payup-api-typescript` | Express 4 + TypeScript 5.9 | — | JWT (merchant), API keys (`pk_`/`sk_`), client tokens (`tk_*`), SDK JWT, pay verification token |
| `customer-portal` | Customer Portal | web | `payup-frontend-customer-control` | Angular 21 (standalone) | PrimeNG 21, ngx-translate | Bearer JWT (`localStorage.token`) |
| `checkout` | Checkout Page | web | `payup-frontend-checkout` | Angular 18 (standalone) | PrimeNG 18 | SDK JWT (query param / localStorage) |
| `landing-page` | Landing Page | web | `payup-landing-page` | Static HTML/CSS/JS | Custom CSS, Font Awesome | — |
| `web-sdk` | Web SDK | shared | `payup-web-sdk` | TypeScript 5 + Webpack 5 | — | Client token → SDK JWT |
| `client-example` | Client Sample | web | `client-payup-example` | Static HTML + Bootstrap 5 | Bootstrap, Font Awesome | — (embeds SDK) |
| `api-docs` | API Documentation | web | `api-docs` | Docusaurus 2.4 + Redoc | — | — |

## Repositories

| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `payup-stack` | Multi-repo workspace (7 apps) | `/payup-stack/` | ❓ not detected |

Architecture: **multi-repo folder layout** inside a single workspace root — not an npm/yarn monorepo (no root `package.json` workspaces).

## Tech Stack

**Backend**: TypeScript, Express 4, MongoDB (Mongoose 8), Redis (IORedis), BullMQ, Zod validation, Pino logging, OpenTelemetry, Prometheus metrics

**Frontend**: Angular 21 (portal) + Angular 18 (checkout), PrimeNG, ngx-translate (portal only)

**SDK**: TypeScript library bundled via Webpack (UMD), obfuscated in production

**Docs**: Docusaurus 2 + Redocusaurus (OpenAPI)

**Async**: BullMQ queues (`notif-events`, `notif-deliveries`) — no cron jobs detected

## Brand Tokens

| Token | Value | Role |
|-------|-------|------|
| Primary | `#ff6b35` | Coral orange — CTAs, accents |
| Secondary | `#20c997` | Teal green — success, highlights |
| Accent | `#6c5ce7` | Purple — secondary accents |
| Text | `#2d3436` | Body text |

Per-app branding: merchants configure `brandName` / `brandLogo` per App via customer portal.

## Environments

### Config file locations

| App | Config files |
|-----|--------------|
| Backend | `payup-api-typescript/.env` (local), `.env.dev` (local dev — same as `.env`), `.env.prod` (production) |
| Customer portal | `payup-frontend-customer-control/src/environments/environment.{ts,local,dev,stage,prod}.ts` |
| Checkout | `payup-frontend-checkout/src/environments/environment.{ts,local,dev,stage,prod}.ts` |
| Web SDK | `payup-web-sdk/src/config.ts` (`data-env` / `data-api-url` on script tag) |

Backend port: **3301** (all envs). Route prefixes: `/api/v1` (public/SDK), `/api/merchant/v1` (merchant panel), `/api/admin` (stub).

### Environment matrix

#### Local (`.env`, `.env.dev`)

| Service | URL |
|---------|-----|
| API (`API_PUBLIC_URL`) | `http://localhost:3301` |
| Merchant API (portal) | `http://localhost:3301/api/merchant` |
| Customer portal | `http://localhost:4301` |
| Checkout | `http://localhost:5600` |
| Media CDN | `https://media-payup.iilm.io` |
| MongoDB | Atlas — database `payup` |
| Redis | `redis://localhost:6379` |
| JWT expiry | 7d |
| WebAuthn RP | `localhost` · origin `http://localhost:4301` |

CORS `ALLOWED_ORIGINS`: `localhost:4200/4301/5500`, `payup-panel.iilm.io`, `payup-admin-dev.iilm.io`, `payup-checkout-dev.iilm.io`, internal IPs `10.10.0.10/0.1`.

#### Dev hosted (frontend `environment.dev.ts` — backend `.env` not separate)

| Service | URL |
|---------|-----|
| API | `https://payup-api-dev.iilm.io` |
| Merchant API (portal) | `https://payup-api-dev.iilm.io/api/merchant` |
| Checkout domain | `payup-checkout-dev.iilm.io` |
| Web SDK default | `https://payup-api-dev.iilm.io/api` |

#### Stage (frontend `environment.stage.ts`)

| Service | URL |
|---------|-----|
| API | `https://payup-api.iilm.io` |
| Merchant API (portal) | `https://payup-api.iilm.io/api/merchant` |
| Checkout domain | `payup-checkout-dev.iilm.io` (same as dev in checkout env) |

#### Production (`.env.prod`)

| Service | URL |
|---------|-----|
| API (`API_PUBLIC_URL`) | `https://api.payupconnect.com` |
| App base (`BASE_URL`, `APP_BASE_URL`) | `https://dash.payupconnect.com` |
| Customer portal (CORS) | `https://control.payupconnect.com` |
| Checkout (`CHECKOUT_FRONTEND_URL`) | `https://checkout.payupconnect.com` |
| Media CDN | `https://media.payupconnect.com` |
| MongoDB | Self-hosted replica set — database `payup_production` |
| Redis | Self-hosted (`10.10.0.17:7897`) |
| JWT expiry | 1d |
| WebAuthn RP | `payupconnect.com` · origin `https://dash.payupconnect.com` |
| Mailjet sender | `noreply@payupconnect.com` (PayUp Connect) |

CORS `ALLOWED_ORIGINS`: `dash.payupconnect.com`, `checkout.payupconnect.com`, `control.payupconnect.com`.

Observability (prod): OTEL → `http://10.10.0.12:4318/v1/traces` · Loki → `http://10.10.0.12:3100/`.

### Frontend env drift (needs alignment with `.env.prod`)

Angular production/stage builds still reference legacy domains — update when deploying to `payupconnect.com`:

| App | File | Current `apiUrl` |
|-----|------|------------------|
| Customer portal | `environment.prod.ts` | `https://payup-api.iilm.io/api/merchant` |
| Customer portal | `environment.stage.ts` | `https://payup-api.iilm.io/api/merchant` |
| Checkout | `environment.prod.ts` | `https://payup-api.e2community.org` |
| Web SDK | `config.ts` production | `https://api.payup.com/api` |

Target after alignment: API `https://api.payupconnect.com`, checkout `https://checkout.payupconnect.com`, portal `https://control.payupconnect.com`.

### Backend env var reference (names only — values in `.env*` files, never in blueprint)

`NODE_ENV`, `PORT`, `BASE_URL`, `APP_BASE_URL`, `CHECKOUT_FRONTEND_URL`, `API_PUBLIC_URL`, `SKIP_DB`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ALLOWED_ORIGINS`, `RATE_LIMIT_*`, `REDIS_URL`, `QUEUE_*`, `WEBHOOK_AUTO_DISABLE_THRESHOLD`, `MASTER_ENCRYPTION_KEY`, `ENCRYPTION_STORAGE_TYPE`, `NOTIF_SECRET_ENC_KEY`, `AWS_S3_*`, `MAILJET_*`, `GOOGLE_CLIENT_*`, `WEBAUTHN_*`, `TWO_FACTOR_*`, `LOG_LEVEL`, `OTEL_*`, `LOKI_*`, `METRICS_TOKEN`.

## Integrations

| Provider | Purpose | Module / Location |
|----------|---------|-------------------|
| Stripe | Payment gateway | `services/gateway/gateways/stripe-gateway.ts` |
| PayPal | Payment gateway | `services/gateway/gateways/paypal-gateway.ts` |
| Moyasar | Payment gateway (MENA) | `services/gateway/gateways/moyasar-gateway.ts` |
| MyFatoorah | Payment gateway (MENA) | `services/gateway/gateways/myfatoorah-gateway.ts` |
| Test Gateway | Dev/test payments | `services/gateway/gateways/test-gateway.ts` |
| Mailjet | Transactional email (OTP, reset) | `external-services/mailjet/` — local: `info@roya.marketing` · prod: `noreply@payupconnect.com` |
| n8n webhook | Welcome emails | `services/email/email-service.ts` → `n8n.e2community.org` |
| AWS S3 / Cloudflare R2 | Media & document storage | `services/storage/s3-service.ts` — local CDN: `media-payup.iilm.io` · prod CDN: `media.payupconnect.com` |
| Google OAuth | Merchant login | `services/auth/oauth/google-provider.ts` |
| WebAuthn (SimpleWebAuthn) | Passkey auth | `services/auth/passkey-service.ts` |
| Redis | Rate limiting, BullMQ | `config/redis.ts` |
| MongoDB | Primary database | `config/database.ts` |
| OpenTelemetry + Pino + Loki | Observability | `observability/` |
| Prometheus | Metrics (`/metrics`) | `observability/` |

**Note**: Checkout frontend calls Moyasar/MyFatoorah tokenization APIs directly (card tokenization) — deviation from engine frontend convention.

## System Conventions

- **i18n**: Portal uses `@ngx-translate/core`; landing page uses `translation.js` + JSON files (`en`, `ar`).
- **Multi-app context**: Portal scopes most operations to selected app via `AppContextService` + `localStorage.selectedAppId`.
- **SDK integration paths**:
  - **Frontend**: merchant site embeds `payup-web-sdk` → `tk_*` token → `/api/v1/tokenize` → SDK JWT → `/api/v1/checkout/web/session` → redirect to checkout.
  - **Backend**: server uses `pk_`/`sk_` → `/api/v1/auth` → backend SDK JWT → `/api/v1/checkout/backend/session`.
- **Payment sessions**: stored as `Payment` documents (no separate session collection).
- **Scope-based permissions**: SDK tokens carry scopes (`payment:create_session`, `product:link`, etc.) defined in `constants/scope-constants.ts`.
- **Shared library**: `web-sdk` has no `project/actions/` folder — SDK surface documented under consuming apps (`client-example`, merchant sites).

## Completion Checklist

- [x] All applications listed with correct types, frameworks, and repo paths
- [x] Stable **Key** values defined for `project/actions/<key>/` folders
- [x] Integrations documented
- [x] Database (MongoDB) and auth strategies identified
- [x] Environments and API URLs captured
- [x] Brand tokens documented
- [x] Architecture type identified (multi-repo workspace, not monorepo)
