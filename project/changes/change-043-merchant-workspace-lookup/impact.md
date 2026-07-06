# Impact Analysis — change-043: Merchant → workspace lookup

## Feature State
`none` — no `webhook_routes` collection or lookup mechanism exists. All webhook handlers log a TODO comment about this missing lookup.

## Code Reconnaissance
| File | Finding |
|------|---------|
| `zid.controller.ts:104-106` | Comment: "merchantId → workspaceSlug lookup (future enhancement)" |
| `salla.controller.ts:109-112` | Comment: "merchant_id; workspace resolution is best-effort... future" |
| `shopify.controller.ts:120-122` | Comment: "store shopDomain → workspaceSlug mapping in MongoDB" |
| `zid-dataset.service.ts:applyWebhookEvent` | Expects `workspaceSlug` param — ready to be called once lookup exists |
| `salla-dataset.service.ts:applyWebhookEvent` | Same |
| `shopify-dataset.service.ts:applyWebhookEvent` | Same |
| `zid-api.client.ts:getProfile()` | Returns profile including store info — source of store ID |

## Impact Map

### Backend — Create New
| File | Action |
|------|--------|
| `src/modules/data/schemas/webhook-route.schema.ts` | New Mongoose schema for `webhook_routes` collection |
| `src/modules/data/repositories/webhook-route.repository.ts` | New repository: `upsert()`, `findByStore()` |
| `src/modules/data/services/webhook-route.service.ts` | New service wrapping repository |

### Backend — Modify
| File | Action |
|------|--------|
| `src/integrations/connectors/zid/zid-dataset.service.ts` | Inject `WebhookRouteService`; after provisioning call `getProfile()` to get Zid store ID, then `webhookRouteService.upsert()` |
| `src/integrations/connectors/salla/salla-dataset.service.ts` | Inject `WebhookRouteService`; upsert with Salla merchant ID from credentials/profile |
| `src/integrations/connectors/shopify/shopify-dataset.service.ts` | Inject `WebhookRouteService`; upsert with shopDomain as storeId |
| `src/modules/data/data.module.ts` | Register `WebhookRouteRepository`, `WebhookRouteService`; add to exports |
| `src/integrations/connectors/connectors.module.ts` | Import `WebhookRouteService` from DataModule (or provide via shared module) |

### Planning docs to update
| Doc | Update |
|-----|--------|
| `project/plan/data-model.md` | Add `WebhookRoute` entity |
| `project/actions/backend/services/data.md` | Add `WebhookRouteService` entry |

## Risks
- Zid profile call during provisioning may fail → handle gracefully (log warning, do not block provisioning)
- Salla and Shopify merchant ID discovery depends on what their provisioning flow provides — use available credentials
