# Verify Code — change-043: Merchant → workspace lookup

## Checks

### 1. New files present
- [x] `src/modules/data/schemas/webhook-route.schema.ts` — `WebhookRoute` schema, collection `webhook_routes`, unique index `(sourceType, externalStoreId)` ✓
- [x] `src/modules/data/repositories/webhook-route.repository.ts` — `upsert()`, `findByStore()` ✓
- [x] `src/modules/data/services/webhook-route.service.ts` — wraps repo with error-safe `upsert()` ✓

### 2. DataModule registration
- [x] `WebhookRoute` schema registered via `MongooseModule.forFeature()` ✓
- [x] `WebhookRouteRepository` and `WebhookRouteService` in providers ✓
- [x] `WebhookRouteService` in exports (available to webhook controllers) ✓

### 3. Connector provisioning updated
- [x] `ZidDatasetService` — calls `getProfile()`, extracts store ID, calls `webhookRouteService.upsert()` (non-blocking) ✓
- [x] `SallaDatasetService` — calls `sallaClient.getStore()`, extracts store ID, calls `webhookRouteService.upsert()` (non-blocking) ✓
- [x] `ShopifyDatasetService` — uses `shopDomain` directly as `externalStoreId`, calls `webhookRouteService.upsert()` ✓

### 4. Code layering
- [x] Controller → Service → Repository chain maintained ✓
- [x] `WebhookRouteService.upsert()` failure never blocks OAuth provisioning (wrapped in try/catch) ✓

### 5. TypeScript compile
- [x] `npx tsc --noEmit` → exit 0 ✓

### 6. Acceptance criteria
1. [x] `webhook_routes` collection with unique compound index defined ✓
2. [x] Zid provisioning calls `getProfile()` and upserts route ✓
3. [x] Salla provisioning calls `getStore()` and upserts route ✓
4. [x] Shopify provisioning upserts route with shopDomain ✓
5. [x] `WebhookRouteService.findByStore()` returns `{ workspaceSlug, connectionId }` or null ✓
6. [x] App compiles ✓

## Overall: PASS
