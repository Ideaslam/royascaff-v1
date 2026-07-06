# Change Request

## Metadata
- **date**: 2026-07-06
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Data (webhook controllers)
- Feature(s): Zid webhook, Salla webhook, Shopify webhook
- Endpoint(s): EP-DATA-28, EP-DATA-31, EP-DATA-34
- Service(s): ZidDatasetService, SallaDatasetService, ShopifyDatasetService, WebhookRouteService

## Depends on
- change-040 (raw body middleware — rawBody must be populated)
- change-043 (merchant → workspace lookup — WebhookRouteService must exist)

## Description
The webhook controllers validate HMAC signatures and return `{ ok: true }` but never call `applyWebhookEvent()`, so real-time incremental syncs triggered by Zid/Salla/Shopify events are silently skipped.

Fix: in each webhook handler:
1. Extract the store identifier from the payload (Zid: `store.id` from body; Salla: `event.merchant_id`; Shopify: use the `X-Shopify-Shop-Domain` header that's already read).
2. Call `WebhookRouteService.findByStore(sourceType, storeId)` to resolve `workspaceSlug`.
3. If resolved, call `datasetService.applyWebhookEvent(workspaceSlug, topic, ...)`.
4. If not resolved, log a warning and return `{ ok: true }` (avoid blocking Zid/Salla/Shopify retry logic).

## Acceptance Criteria
1. A Zid webhook POST with correct HMAC triggers an incremental sync for matching datasets in the resolved workspace.
2. A Salla webhook POST with correct HMAC triggers an incremental sync.
3. An unknown `storeId` logs a warning and returns `{ ok: true }` without crashing.
4. App compiles with no TypeScript errors.
