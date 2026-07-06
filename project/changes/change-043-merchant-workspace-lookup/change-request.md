# Change Request

## Metadata
- **date**: 2026-07-06
- **change-type**: new-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Data (connectors, schemas)
- Feature(s): Webhook routing; Zid + Salla + Shopify connector provisioning
- Endpoint(s): EP-DATA-28, EP-DATA-31, EP-DATA-34 (webhook endpoints — use result of this change)
- Service(s): ZidDatasetService, SallaDatasetService, ShopifyDatasetService; new WebhookRouteService

## Description
Webhook handlers for Zid, Salla, and Shopify receive events but cannot resolve which workspace to sync because there is no `merchantId → workspaceSlug` mapping. As a result, `applyWebhookEvent()` is never called and webhooks silently no-op (change-042 will wire the call, but it needs this lookup first).

Solution: introduce a global (non-workspace-scoped) `webhook_routes` MongoDB collection that maps `{ sourceType, externalStoreId }` to `{ workspaceSlug, connectionId }`. Each e-commerce connector populates this entry during OAuth provisioning. Webhook handlers look up the route and forward the event to the correct workspace.

Details:
- New `WebhookRoute` Mongoose schema in `src/modules/data/schemas/webhook-route.schema.ts`.
- New `WebhookRouteRepository` in `src/modules/data/repositories/webhook-route.repository.ts`.
- New `WebhookRouteService` in `src/modules/data/services/webhook-route.service.ts` with `upsert(sourceType, externalStoreId, workspaceSlug, connectionId)` and `findByStore(sourceType, externalStoreId)`.
- `ZidDatasetService.provisionFromOAuth()` — call `ZidApiClient.getProfile()` to get Zid store ID, then call `webhookRouteService.upsert()`.
- `SallaDatasetService.provisionFromOAuth()` — extract merchant ID from Salla profile or OAuth response, upsert route.
- `ShopifyDatasetService.provisionFromOAuth()` — use `shopDomain` as the store identifier, upsert route.
- Register `WebhookRouteRepository` and `WebhookRouteService` in `DataModule`.

## Acceptance Criteria
1. `webhook_routes` collection exists with a unique compound index on `(sourceType, externalStoreId)`.
2. After completing Zid OAuth, a `webhook_routes` entry is created with the Zid store ID and the workspace slug.
3. After completing Salla OAuth, a `webhook_routes` entry is created.
4. After completing Shopify OAuth, a `webhook_routes` entry is created (keyed by shop domain).
5. `WebhookRouteService.findByStore(sourceType, storeId)` returns the matching `{ workspaceSlug, connectionId }` or `null`.
6. App compiles with no TypeScript errors.
