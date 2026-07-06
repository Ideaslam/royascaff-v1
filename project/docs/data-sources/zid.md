# Zid

Connect a Zid store via OAuth. Dynamo auto-creates datasets for orders, products, and customers. Supports install from the Zid App Market.

## Overview

| Item | Value |
|------|-------|
| Source type | `zid` |
| Category | E-commerce |
| Auth | OAuth 2.0 (Zid dual-token model) |
| Datasets | Auto: orders, products, customers |
| Sync | Full + incremental + webhooks |
| Read access | Read-only — Dynamo never writes to the store |

## Developer setup

### 1. Create a Zid Partner app

1. Log in to the [Zid Partner Dashboard](https://partners.zid.sa/) (or your Zid developer portal)
2. Create a new app for **Roya AI Dynamo**
3. Collect these credentials:

| Credential | Env variable | Where to find |
|------------|--------------|---------------|
| App ID (Client ID) | `ZID_APP_ID` | Partner dashboard → App details |
| App Secret | `ZID_APP_SECRET` | Partner dashboard → App details |
| Authorization Key | `ZID_AUTHORIZATION_KEY` | Partner dashboard → API / Authorization key |

### 2. Configure URLs in Zid Partner Dashboard

| Setting | Production | Development | Local |
|---------|------------|-------------|-------|
| **Redirection URL** (App Market install) | `https://dynamo-api.roya.marketing/api/v1/data/zid/install` | `https://dynamo-api-dev.roya.marketing/api/v1/data/zid/install` | `http://localhost:3000/api/v1/data/zid/install` |
| **OAuth callback / Redirect URI** | `https://dynamo-api.roya.marketing/api/v1/data/zid/callback` | `https://dynamo-api-dev.roya.marketing/api/v1/data/zid/callback` | `http://localhost:3000/api/v1/data/zid/callback` |
| **Webhook URL** | `https://dynamo-api.roya.marketing/api/v1/data/zid/webhook` | `https://dynamo-api-dev.roya.marketing/api/v1/data/zid/webhook` | Use ngrok or dev tunnel for testing |

OAuth authorization URL: `https://oauth.zid.sa/oauth/authorize`

### 3. Set environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `ZID_APP_ID` | Yes | Client ID |
| `ZID_APP_SECRET` | Yes | Used for webhook HMAC validation |
| `ZID_AUTHORIZATION_KEY` | Yes | Sent with Zid API requests |
| `ZID_CALLBACK_URL` | Yes | Must match OAuth redirect URI exactly |
| `FRONTEND_URL` | Yes | Post-OAuth and install redirects |
| `API_BASE_URL` | Yes | Public API base |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts tokens at rest |
| `REDIS_*` | Yes | OAuth CSRF nonce (10 min TTL) |

### 4. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/zid/install` | Public | App Market install → redirects to `/app/zid-install` |
| GET | `/data/zid/auth-url` | JWT | Returns Zid OAuth consent URL |
| GET | `/data/zid/callback` | Public | OAuth callback; provisions connection + datasets |
| POST | `/data/zid/webhook` | Public | Incremental sync (`X-Zid-Signature`, `X-Zid-Event` headers) |

### 5. Webhook events handled

| Zid event topic | Entity synced |
|-----------------|---------------|
| `order.create` | orders |
| `order.status.update` | orders |
| `product.create` | products |
| `product.update` | products |
| `customer.create` | customers |
| `customer.update` | customers |

## Account manager checklist

Before onboarding a Zid merchant:

- [ ] Zid app is registered and approved in Zid App Market (production)
- [ ] All three URLs above are configured in the Partner Dashboard
- [ ] Server env vars are set for the target environment
- [ ] Merchant has (or will create) a Dynamo account

## Merchant steps — from inside Dynamo

1. Log in to Dynamo
2. Go to **Data** → **Connect Source** → **Zid**
3. Or open `/app/data/connect/zid`
4. Click **Connect Zid** → approve on Zid OAuth screen
5. After redirect, three datasets are created automatically
6. Complete schema review → schedule → first sync

## Merchant steps — install from Zid App Market

Use this flow when the merchant clicks **Install** on the Zid App Market before having a Dynamo account:

1. Merchant clicks **Install** on Zid App Market
2. Zid redirects to `{API}/api/v1/data/zid/install`
3. Dynamo redirects to `{FRONTEND}/app/zid-install`
4. Merchant sees landing page with two options:
   - **Log in** → `/auth/login?returnUrl=/app/zid-install`
   - **Create account** → `/auth/register?returnUrl=/app/zid-install`
5. After login, Dynamo automatically starts Zid OAuth
6. Merchant approves access → datasets provisioned → setup wizard continues

## What gets synced

| Entity | Semantic flag | Dataset name pattern |
|--------|---------------|---------------------|
| Orders | `orders` | Zid Orders |
| Products | `products` | Zid Products |
| Customers | `customers` | Zid Customers |

Stored credentials (encrypted): `authorizationToken`, `accessToken`, `expiresAt`.

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| Redirect goes to localhost in production | `FRONTEND_URL` not set | Set `FRONTEND_URL` to production portal URL |
| OAuth callback fails | `ZID_CALLBACK_URL` mismatch | Must match Zid dashboard exactly |
| Webhook HMAC fails | Missing raw body or wrong secret | Confirm `rawBody: true` in API bootstrap; verify `ZID_APP_SECRET` |
| Webhook received but no sync | Store not in webhook route index | Re-connect store (provisioning registers store ID → workspace mapping) |
| Install from App Market 404 | `/data/zid/install` not deployed | Deploy latest API with change-044 |
