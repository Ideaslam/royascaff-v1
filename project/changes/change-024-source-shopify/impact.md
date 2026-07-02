# Impact Analysis — change-024: Shopify Source

## 1. Reconnaissance Summary

### Feature state: `none` — fully greenfield

| Layer | Existing? | Notes |
|---|---|---|
| `ShopifyConnector` | ❌ None | Must create |
| Shopify OAuth service | ❌ None | Must create (different from Google — uses custom app + API key model) |
| Shopify config | ❌ None | Must add `shopify.apiKey`, `shopify.apiSecret`, `shopify.scopes` to config |
| Shopify webhook controller | ❌ None | Must create |
| `@shopify/api-codegen` or HTTP-based | N/A | Will use raw REST API (fetch/axios) — no Shopify SDK needed |
| Multi-entity Dataset creation | ❌ None | Each entity (orders/products/customers) → separate Dataset |
| `lastSyncAt` watermark on Dataset | ✅ Exists | Used by DataSyncProcessor for incremental mode |
| `ExtractOptions.watermark` | ✅ Exists | Passed by DataSyncProcessor when mode=INCREMENTAL |
| `SyncRunMode.INCREMENTAL` | ✅ Exists | Full pipeline support confirmed |
| Webhook infrastructure | ❌ None | PayUp webhook stubs exist but no real HMAC validation infrastructure |

### Incremental Sync Flow (already works for watermark)
`DataSyncProcessor` already passes `watermark: dataset.lastSyncAt` when mode = INCREMENTAL.
`ShopifyConnector.extract()` uses `updated_at_min=watermark` in REST query.

### Webhook Flow
Shopify pushes `orders/create`, `orders/updated`, `products/create`, `customers/create` etc.
→ Webhook controller validates HMAC, maps topic to dataset, enqueues `DATA_SYNC_QUEUE` with mode=INCREMENTAL.
→ Regular SyncService picks it up; connector reads only delta.

---

## 2. Impact Map

### New packages to install
| Package | Reason |
|---|---|
| `axios` | HTTP client for Shopify REST API (if not already installed) |

### Backend — CREATE NEW
| File | Purpose |
|---|---|
| `src/integrations/connectors/shopify/shopify-oauth.service.ts` | OAuth install URL, callback exchange, token storage |
| `src/integrations/connectors/shopify/shopify.connector.ts` | `ShopifyConnector` — orders/products/customers extract with pagination + watermark |
| `src/integrations/connectors/shopify/shopify-rate-limiter.ts` | Token bucket / leaky bucket for Shopify API (2 req/s) |
| `src/integrations/connectors/shopify/shopify-api.client.ts` | Thin HTTP wrapper for Shopify Admin REST API |
| `src/modules/data/controllers/shopify.controller.ts` | OAuth install/callback (EP-DATA-26/27) + webhook receiver (EP-DATA-28) |
| `src/modules/data/services/shopify-dataset.service.ts` | Creates multi-entity Datasets from a single Shopify DataConnection |

### Backend — MODIFY
| File | Change |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Register `ShopifyConnector` + `ShopifyOAuthService` |
| `src/modules/data/data.module.ts` | Register new controller + service |
| `src/config/config.ts` | Add `shopify.apiKey`, `shopify.apiSecret`, `shopify.scopes`, `shopify.webhookSecret` |
| `src/config/env.validation.ts` | Add Shopify env vars |

### Frontend — CREATE NEW
| File | Purpose |
|---|---|
| `src/app/pages/data/shopify-connect/shopify-connect.page.ts + .html` | Store URL entry + "Install App" button |
| `src/app/pages/data/shopify-setup/shopify-setup.page.ts + .html` | OAuth callback + entity selector (orders/products/customers) + sync status |

### Frontend — MODIFY
| File | Change |
|---|---|
| `src/app/core/services/data.service.ts` | Add `getShopifyInstallUrl()` |
| `src/app/core/models/data.models.ts` | Add `ShopifyEntity` type |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "Connect Shopify" button |
| `src/app/app.routes.ts` | Register Shopify pages |

---

## 3. Planning Documents to Update

| Document | Section | Change |
|---|---|---|
| `services/connectors.md` | Add `SVC-CONN-SHOPIFY` | ShopifyConnector + ShopifyOAuthService + ShopifyDatasetService |
| `endpoints/data.md` | Add EP-DATA-26/27/28 | Install URL, OAuth callback, webhook receiver |
| `customer-portal/pages/data.md` | Add Shopify pages | Connect + Setup pages |
| `customer-portal/pages/_index.md` | Routes | Add Shopify routes |

---

## 4. Ripple Effects

| Affected area | Action |
|---|---|
| `ConnectorsModule` | Register ShopifyConnector + ShopifyOAuthService |
| `DataModule` | New controller + service |
| `DataSyncProcessor` | No change — watermark pass-through already implemented |
| `ExtractStep` | No change — watermark already forwarded |
| `ScheduledSyncService` | No change — HOURLY/DAILY already supported via SyncPolicy |

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| Shopify rate limit (2 req/s leaky bucket) | `ShopifyRateLimiter` token bucket; retry after `Retry-After` header |
| Webhook HMAC validation | Must validate `X-Shopify-Hmac-Sha256` before processing; reject 401 if invalid |
| Webhook duplicate delivery | Guard: skip if SyncRun already RUNNING for that dataset |
| Large order history (>10k) | REST pagination via `page_info` cursor; no limit on total pages |
| Multi-entity Datasets | Each entity → separate Dataset; ShopifyDatasetService creates all in one call |
| Token expiry | Shopify offline access tokens don't expire — no refresh needed |

---

## 6. New Endpoints

| EP | Method | Route | Notes |
|---|---|---|---|
| EP-DATA-26 | GET | /api/v1/data/shopify/install-url | Returns Shopify OAuth install URL for a store |
| EP-DATA-27 | GET | /api/v1/data/shopify/callback | Exchanges code, creates DataConnection, redirects to setup |
| EP-DATA-28 | POST | /api/v1/data/shopify/webhook | Receives Shopify webhooks (HMAC validated, Public endpoint) |

---

## 7. Implementation Order

1. Config additions (env vars + config.ts)
2. `ShopifyApiClient` + `ShopifyRateLimiter`
3. `ShopifyOAuthService` (install URL + callback)
4. `ShopifyConnector` (full + incremental extract per entity)
5. `ShopifyDatasetService` (multi-entity Dataset creation)
6. `ShopifyController` (EP-DATA-26/27/28)
7. Register in ConnectorsModule + DataModule
8. Frontend: models + service
9. Frontend: ShopifyConnectPage + ShopifySetupPage
10. Routes + DataSources button
11. Compile check
