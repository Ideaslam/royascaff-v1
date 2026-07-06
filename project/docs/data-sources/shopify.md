# Shopify

Connect a Shopify store via OAuth. Dynamo auto-creates datasets for orders, products, and customers.

## Overview

| Item | Value |
|------|-------|
| Source type | `shopify` |
| Category | E-commerce |
| Auth | OAuth 2.0 (Shopify Admin API) |
| Datasets | Auto: orders, products, customers |
| Sync | Full + incremental (with primary key) + webhooks |
| Default scopes | `read_orders`, `read_products`, `read_customers` |

## Developer setup

### 1. Create a Shopify Partner app

1. Log in to [Shopify Partners](https://partners.shopify.com/)
2. Create an app (Custom app or Public app)
3. Note the **API key** and **API secret key**
4. Configure URLs:

| Setting | Production value |
|---------|------------------|
| App URL | `https://dynamo.roya.marketing` |
| Allowed redirection URL(s) | `https://dynamo-api.roya.marketing/api/v1/data/shopify/callback` |

For development, use `dynamo-dev.roya.marketing` and `dynamo-api-dev.roya.marketing`.

### 2. Set environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `SHOPIFY_API_KEY` | Yes | App API key |
| `SHOPIFY_API_SECRET` | Yes | App secret |
| `SHOPIFY_CALLBACK_URL` | Yes | OAuth callback URL |
| `SHOPIFY_SCOPES` | Optional | Default: `read_orders,read_products,read_customers` |
| `SHOPIFY_WEBHOOK_SECRET` | Recommended | HMAC validation for webhooks |
| `API_BASE_URL` | Yes | Used when registering webhooks after OAuth |
| `FRONTEND_URL` | Yes | Post-OAuth redirect target |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Token encryption |
| `REDIS_*` | Yes | OAuth nonce |

### 3. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/shopify/install-url?shop={domain}` | JWT | Returns Shopify OAuth URL |
| GET | `/data/shopify/callback` | Public | OAuth callback |
| POST | `/data/shopify/webhook` | Public | Incremental sync via webhooks |

### 4. Webhooks (auto-registered)

After OAuth, Dynamo registers these Shopify webhooks:

- `orders/create`, `orders/updated`
- `products/create`, `products/updated`
- `customers/create`, `customers/updated`

Webhook URL: `{API_BASE_URL}/api/v1/data/shopify/webhook`

## Account manager checklist

Ask the customer:

- [ ] They are a Shopify store admin (or can approve app install)
- [ ] They know their store domain (e.g. `my-store.myshopify.com`)
- [ ] Dynamo app is published/approved if using a public Shopify app

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **Shopify**
2. Or open `/app/data/connect/shopify`
3. Enter **Store domain** (e.g. `your-store.myshopify.com`)
4. Click **Connect Shopify** → approve in Shopify Admin
5. After redirect, wait for three datasets to be provisioned
6. Complete schema review for each entity → schedule → sync

## What gets synced

| Entity | Semantic flag | Notes |
|--------|---------------|-------|
| Orders | `orders` | Order headers and line items |
| Products | `products` | Product catalog |
| Customers | `customers` | Customer records |

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| HMAC invalid on callback | Wrong `SHOPIFY_API_SECRET` | Verify secret matches Partner dashboard |
| Webhooks not firing | `API_BASE_URL` wrong or app not reachable | Confirm public API URL; check webhook registration logs |
| Incremental sync disabled | No primary key on schema | Mark a PK column in dataset schema settings |
