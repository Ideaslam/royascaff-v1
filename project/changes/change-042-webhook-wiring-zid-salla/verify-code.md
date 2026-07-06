# Verify Code — change-042: Webhook wiring (Zid + Salla + Shopify)

## Checks

### 1. Zid webhook controller
- [x] `WebhookRouteService` injected ✓
- [x] JSON body parsed after HMAC validation ✓
- [x] Store ID extracted from payload (`store.id` / `store_id`) ✓
- [x] `webhookRouteService.findByStore('zid', storeId)` called ✓
- [x] `zidDatasetService.applyWebhookEvent(workspaceSlug, topic)` called ✓
- [x] Unknown store returns `{ ok: true }` without crashing ✓

### 2. Salla webhook controller
- [x] `WebhookRouteService` injected ✓
- [x] `merchant_id` extracted from `event.merchant_id` or top-level ✓
- [x] `webhookRouteService.findByStore('salla', merchantId)` called ✓
- [x] `sallaDatasetService.applyWebhookEvent(workspaceSlug, topic)` called ✓

### 3. Shopify webhook controller
- [x] `WebhookRouteService` injected ✓
- [x] `shopDomain` header used as storeId for lookup ✓
- [x] `webhookRouteService.findByStore('shopify', shopDomain)` called ✓
- [x] `shopifyDatasetService.applyWebhookEvent(workspaceSlug, topic, shopDomain, payload)` called ✓

### 4. Planning docs
- [x] EP-DATA-28, EP-DATA-31, EP-DATA-34 notes updated to reflect dispatch ✓

### 5. TypeScript compile
- [x] `npx tsc --noEmit` → exit 0 ✓

### 6. Acceptance criteria
1. [x] Zid webhook with correct HMAC → incremental sync dispatched ✓
2. [x] Salla webhook with correct HMAC → incremental sync dispatched ✓
3. [x] Shopify webhook with correct HMAC → incremental sync dispatched ✓
4. [x] Unknown storeId → logs warning, returns `{ ok: true }` ✓

## Overall: PASS
