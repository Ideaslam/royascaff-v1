# Impact Analysis — change-025: Salla Source

## 1. Code Reconnaissance

### Feature state: `none` (greenfield)
No Salla-specific code exists. The `DataSourceType` union already includes `'salla'` (added in change-015).

### Existing framework reused (from change-024/Shopify)
| Artefact | Reuse |
|---|---|
| `ConnectorInterface` | ✓ implement directly |
| `ConnectorRegistry` | ✓ auto-register via `onModuleInit` |
| `ShopifyRateLimiter` | Pattern copied; distinct class needed (different limits) |
| `ShopifyDatasetService` pattern | Copy; `SallaDatasetService` injects same deps |
| `GoogleOAuthService` / `ShopifyOAuthService` pattern | Copy; different URLs/endpoints |
| `DataConnectionService.create()` | ✓ reused as-is |
| `DatasetRepository.create()` + `update()` | ✓ reused as-is |
| `SyncService.triggerSync()` | ✓ reused as-is |
| `DatasetService.discoverSchemaWithAiProposal()` | ✓ reused as-is |
| `Dataset.sourceRef` field (added change-024) | ✓ reused — stores `orders` / `products` / `customers` |

### Plan-vs-code drift: none
`salla` sourceType already in schema enum.

---

## 2. Salla API — Key Facts

| Fact | Detail |
|---|---|
| Base URL | `https://api.salla.dev/admin/v2` |
| Auth | OAuth 2.0; Auth URL: `https://accounts.salla.sa/oauth2/auth`; Token URL: `https://accounts.salla.sa/oauth2/token` |
| Access token TTL | 14 days |
| Refresh token TTL | 30 days (requires `offline_access` scope) |
| Pagination | Page-number based: `?page=N&per_page=60` (max 60/page) |
| Rate limit — General | ~500 req/10 min per endpoint family |
| Rate limit — Customers | 500 req/10 min per IP (stricter) |
| Incremental filter | `?updated_at_min=ISO8601` on orders; `?updated_at_start` on products/customers |
| Webhooks | POST events: `order.created`, `order.updated`, `product.created`, `product.updated`, `customer.created`, `customer.updated` |
| Webhook validation | HMAC-SHA256 via `X-Salla-Signature` header (computed with app secret) |
| Entities | `/orders`, `/products`, `/customers` |

---

## 3. Impact Map

### Backend — Create New
| File | Action |
|---|---|
| `src/integrations/connectors/salla/salla-rate-limiter.ts` | Token-bucket; 8 req/s burst 40; extra caution for `/customers` |
| `src/integrations/connectors/salla/salla-api.client.ts` | Axios client; Bearer token; page-number pagination; 429 back-off |
| `src/integrations/connectors/salla/salla-oauth.service.ts` | Auth URL builder; Redis nonce; code exchange (POST to token endpoint with `client_credentials`-style body); token refresh; HMAC webhook validation |
| `src/integrations/connectors/salla/salla.connector.ts` | Implements `ConnectorInterface`; entity definitions for orders/products/customers; flatten helpers |
| `src/integrations/connectors/salla/salla-dataset.service.ts` | Post-OAuth provisioning: 1 DataConnection + 3 Datasets; triggers initial syncs |
| `src/modules/data/controllers/salla.controller.ts` | EP-DATA-29 (auth-url), EP-DATA-30 (callback), EP-DATA-31 (webhook) |

### Backend — Modify
| File | Action |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Add `SallaApiClient`, `SallaOAuthService`, `SallaConnector` |
| `src/modules/data/data.module.ts` | Add `SallaDatasetService`, `SallaController` |
| `src/config/config.ts` | Add `salla.*` config block |
| `src/config/env.validation.ts` | Add `SALLA_*` env vars |

### Frontend — Create New
| File | Action |
|---|---|
| `src/app/pages/data/salla-connect/salla-connect.page.ts` + `.html` | One-click OAuth redirect |
| `src/app/pages/data/salla-setup/salla-setup.page.ts` + `.html` | Post-OAuth setup: shows provisioned datasets + sync status |

### Frontend — Modify
| File | Action |
|---|---|
| `src/app/core/models/data.models.ts` | Add `SallaInstallUrlResponse` |
| `src/app/core/services/data.service.ts` | Add `getSallaAuthUrl()` |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "Salla" button |
| `src/app/app.routes.ts` | Register Salla connect/setup routes |

### Planning docs to update
| Doc | Update |
|---|---|
| `actions/backend/endpoints/data.md` | Add EP-DATA-29/30/31 |
| `actions/backend/services/connectors.md` | Add `SVC-CONN-SALLA`, `SVC-CONN-SALLA-OAUTH`, `SVC-CONN-SALLA-DS` |
| `actions/customer-portal/pages/data.md` | Add Salla connect/setup pages |
| `actions/customer-portal/pages/_index.md` | Add Salla routes |

---

## 4. New Packages
None — `axios` already installed (change-024). `ioredis` already present.

---

## 5. Risks
| Risk | Mitigation |
|---|---|
| Salla token TTL is only 14 days | Store `refreshToken`; add auto-refresh logic in `SallaApiClient` on 401 |
| Customer endpoint stricter rate limit (500/10min) | Rate limiter uses 1 req/s for customer pages |
| Salla pagination is page-number based (not cursor) | Track `pagination.totalPages`; iterate pages 1..N |
| Webhook validation uses app secret (not per-store secret) | Use `SALLA_APP_SECRET` as HMAC key |
| No `updated_at_min` filter on Customers API (unclear) | Fall back to full sync if incremental filter not available |

---

## 6. Implementation Order
1. Config additions (backend)
2. `SallaRateLimiter`
3. `SallaApiClient`
4. `SallaOAuthService`
5. `SallaConnector`
6. `SallaDatasetService`
7. `SallaController`
8. Wire `ConnectorsModule` + `DataModule`
9. Frontend: models + service
10. Frontend: SallaConnectPage + SallaSetupPage
11. Routes + DataSources home button
12. Compile check (backend + frontend)
