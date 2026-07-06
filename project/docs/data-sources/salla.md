# Salla

Connect a Salla store via OAuth. Dynamo auto-creates datasets for orders, products, and customers.

## Overview

| Item | Value |
|------|-------|
| Source type | `salla` |
| Category | E-commerce |
| Auth | OAuth 2.0 (Salla) |
| Datasets | Auto: orders, products, customers |
| Sync | Full + incremental + webhooks |
| Default scopes | `offline_access` (refresh token) |

## Developer setup

### 1. Create a Salla Partner app

1. Log in to [Salla Partners](https://salla.partners/)
2. Create a new app
3. Note **App ID** and **App Secret**
4. Configure redirect URL:

| Environment | Redirect URL |
|-------------|--------------|
| Production | `https://dynamo-api.roya.marketing/api/v1/data/salla/callback` |
| Development | `https://dynamo-api-dev.roya.marketing/api/v1/data/salla/callback` |
| Local | `http://localhost:3000/api/v1/data/salla/callback` |

5. Configure webhook URL (if Salla dashboard supports it):

| Environment | Webhook URL |
|-------------|-------------|
| Production | `https://dynamo-api.roya.marketing/api/v1/data/salla/webhook` |
| Development | `https://dynamo-api-dev.roya.marketing/api/v1/data/salla/webhook` |

### 2. Set environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `SALLA_APP_ID` | Yes | From Salla Partners |
| `SALLA_APP_SECRET` | Yes | From Salla Partners |
| `SALLA_CALLBACK_URL` | Yes | Must match redirect URL |
| `SALLA_SCOPES` | Optional | Default: `offline_access` |
| `FRONTEND_URL` | Yes | Post-OAuth redirect |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Token encryption |
| `REDIS_*` | Yes | OAuth nonce |

### 3. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/salla/auth-url` | JWT | Returns Salla OAuth URL |
| GET | `/data/salla/callback` | Public | OAuth callback |
| POST | `/data/salla/webhook` | Public | Incremental sync (HMAC via `X-Salla-Signature`) |

OAuth authorization URL: `https://accounts.salla.sa/oauth2/auth`

## Account manager checklist

Ask the customer:

- [ ] They have a Salla store admin account
- [ ] The Salla app is approved/published in Salla Partners (for production)
- [ ] They can approve OAuth consent when prompted

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **Salla**
2. Or open `/app/data/connect/salla`
3. Click **Connect Salla** → approve in Salla OAuth screen
4. After redirect, three datasets are created automatically
5. Complete schema review → schedule → sync

## What gets synced

| Entity | Semantic flag |
|--------|---------------|
| Orders | `orders` |
| Products | `products` |
| Customers | `customers` |

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| OAuth state expired | User took >10 min | Retry connect flow |
| Webhook HMAC failed | Wrong `SALLA_APP_SECRET` | Verify secret in env matches Partners dashboard |
| No workspace on webhook | Store not provisioned yet | Re-connect store to register webhook route |
