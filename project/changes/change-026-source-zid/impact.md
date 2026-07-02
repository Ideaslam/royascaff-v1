# Impact Analysis — change-026: Zid Source

## 1. Code Reconnaissance

### Feature state: `none` (greenfield)
No Zid-specific code exists. `DataSourceType` union already includes `'zid'` (added in change-015).

### Framework reused (from change-024/025)
All connectors/shopify and connectors/salla patterns apply directly. Same module wiring, same dataset provisioning pattern.

---

## 2. Zid API — Key Facts

| Fact | Detail |
|---|---|
| Base URL | `https://api.zid.sa/v1` |
| OAuth URL | `https://oauth.zid.sa` |
| Auth headers | TWO headers per request: `Authorization: Bearer <authToken>` + `X-Manager-Token: <accessToken>` |
| Token TTL | 1 year (very long-lived; refresh token optional) |
| Pagination | `?page=N&per_page=100` (max 100/page) |
| Rate limit | 60 req/min per app per store (leaky bucket) |
| Incremental filter | `?created_at_from=ISO8601` / `?updated_at_from=ISO8601` on orders |
| Webhooks | `order.create`, `order.status.update`, product/customer events via `POST /v1/managers/webhooks` |
| Webhook validation | HMAC-SHA256 on raw body using app secret |
| Entities | `/managers/store/orders`, `/managers/store/products`, `/managers/store/customers` |
| Key difference | Dual header auth: `Authorization` = app Bearer token; `X-Manager-Token` = per-store access token |

---

## 3. Impact Map

### Backend — Create New
| File | Action |
|---|---|
| `src/integrations/connectors/zid/zid-rate-limiter.ts` | Token-bucket: 1 req/s (60/min), burst 10 |
| `src/integrations/connectors/zid/zid-api.client.ts` | Axios; dual-header auth; page-number pagination; 429 back-off |
| `src/integrations/connectors/zid/zid-oauth.service.ts` | Auth URL builder; Redis nonce; code exchange; HMAC webhook validation |
| `src/integrations/connectors/zid/zid.connector.ts` | ConnectorInterface; static column schemas; flatten helpers; incremental via `updated_at_from` |
| `src/integrations/connectors/zid/zid-dataset.service.ts` | Post-OAuth provisioning: 1 DataConnection + 3 Datasets; triggers initial syncs |
| `src/modules/data/controllers/zid.controller.ts` | EP-DATA-32 (auth-url), EP-DATA-33 (callback), EP-DATA-34 (webhook) |

### Backend — Modify
| File | Action |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Add ZidApiClient, ZidOAuthService, ZidConnector |
| `src/modules/data/data.module.ts` | Add ZidDatasetService, ZidController |
| `src/config/config.ts` | Add `zid.*` config block |
| `src/config/env.validation.ts` | Add `ZID_*` env vars |

### Frontend — Create New
| File | Action |
|---|---|
| `src/app/pages/data/zid-connect/zid-connect.page.ts` + `.html` | One-click OAuth redirect |
| `src/app/pages/data/zid-setup/zid-setup.page.ts` + `.html` | Post-OAuth setup: provisioned datasets + sync status |

### Frontend — Modify
| File | Action |
|---|---|
| `src/app/core/models/data.models.ts` | Add `ZidAuthUrlResponse` |
| `src/app/core/services/data.service.ts` | Add `getZidAuthUrl()` |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "Zid" button |
| `src/app/app.routes.ts` | Register Zid connect/setup routes |

### Planning docs to update
| Doc | Update |
|---|---|
| `actions/backend/endpoints/data.md` | Add EP-DATA-32/33/34 |
| `actions/backend/services/connectors.md` | Add SVC-CONN-ZID, SVC-CONN-ZID-OAUTH, SVC-CONN-ZID-DS |
| `actions/customer-portal/pages/data.md` | Add Zid connect/setup pages |
| `actions/customer-portal/pages/_index.md` | Add Zid routes |

---

## 4. New Packages
None — `axios`, `ioredis` already installed.

---

## 5. Risks
| Risk | Mitigation |
|---|---|
| Dual-header auth (unusual pattern) | Store both `authorizationToken` and `accessToken` in credentials JSON |
| Token TTL 1 year (no refresh mechanism documented) | Store `expiresAt`; log warning when nearing expiry; no auto-refresh needed initially |
| Rate limit 60 req/min = 1/s | Rate limiter set to 1 req/s, burst 10 |
| Incremental filter availability on products/customers | Fall back to full sync if `updated_at_from` not supported |

---

## 6. Implementation Order
1. Config additions  
2. ZidRateLimiter  
3. ZidApiClient  
4. ZidOAuthService  
5. ZidConnector  
6. ZidDatasetService  
7. ZidController  
8. Wire ConnectorsModule + DataModule  
9. Frontend: models + service  
10. Frontend: ZidConnectPage + ZidSetupPage  
11. Routes + DataSources home button  
12. Compile check  
