# Impact Analysis — change-042: Webhook wiring (Zid + Salla + Shopify)

## Feature State
`partial` — all three webhook endpoints exist, HMAC validation is in place, but `applyWebhookEvent()` is never called. `applyWebhookEvent()` is already implemented in all three dataset services.

## Code Reconnaissance
| File | Finding |
|------|---------|
| `zid.controller.ts:102-106` | After HMAC validation, logs topic but returns `{ ok: true }` without dispatch |
| `salla.controller.ts:109-115` | After HMAC validation, parses body but discards payload with `void payload` |
| `shopify.controller.ts:120-124` | After HMAC validation, logs but does not dispatch |
| `zid-dataset.service.ts:applyWebhookEvent()` | Ready: maps topic → entity, finds datasets, triggers incremental sync |
| `salla-dataset.service.ts:applyWebhookEvent()` | Ready |
| `shopify-dataset.service.ts:applyWebhookEvent()` | Ready — needs `workspaceSlug, topic, shopDomain, payload` |
| `WebhookRouteService` | Created in change-043 — provides `findByStore(sourceType, storeId)` |

## Impact Map

### Backend — Modify (Complete in place)
| File | Action |
|------|--------|
| `src/modules/data/controllers/zid.controller.ts` | Inject `WebhookRouteService`; parse body JSON; extract store ID; look up workspace; call `zidDatasetService.applyWebhookEvent()` |
| `src/modules/data/controllers/salla.controller.ts` | Inject `WebhookRouteService`; extract merchant ID from payload; look up workspace; call `sallaDatasetService.applyWebhookEvent()` |
| `src/modules/data/controllers/shopify.controller.ts` | Inject `WebhookRouteService`; use shopDomain header to look up workspace; call `shopifyDatasetService.applyWebhookEvent()` |

### Planning docs to update
| Doc | Update |
|-----|--------|
| `project/actions/backend/endpoints/data.md` | Update EP-DATA-28, EP-DATA-31, EP-DATA-34 notes to reflect dispatch is now wired |
