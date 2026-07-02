# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, `connectors`, `integrations` (Shopify)
- Feature(s): Shopify data source (first e-commerce)
- Endpoint(s): Shopify OAuth connect/callback, entity selection, webhook receiver, dataset create
- Page(s)/View(s): customer-portal: connect store, choose entities, sync status
- Service(s): `ShopifyConnector`, Shopify OAuth + webhook provider

## Description
Add **Shopify** as the first e-commerce connector, establishing the reusable pattern for Salla/Zid. Shopify entities map to **canonical semantic flags** (`orders`, `products`, `customers`) via AI mapping; each entity becomes its own `Dataset`/OLAP table, unified logically by canonical views.

Desired behavior:
- OAuth connect a store → encrypted `DataConnection` (`sourceType: shopify`).
- User selects entities to sync (orders, products, customers). Each selected entity = a `Dataset` flagged accordingly, with an AI `columnMapping` to the canonical field dictionary.
- `extract`: initial **full sync** (paginated, e.g. last 12–24 months of orders) then **incremental** via `updated_at` watermark; **webhooks** for near-real-time create/update (respecting the "data as of last sync" model — webhook updates are still sync events).
- `load` through ingest pipeline; canonical `orders/products/customers` views include this store's tables.
- Frontend: connect store, pick entities, show sync status + "last updated X ago".

Out of scope: Salla/Zid (later, reuse this framework); write-back to Shopify.

## Acceptance Criteria
1. A user can OAuth-connect a Shopify store; credentials stored encrypted as a `DataConnection`.
2. Selecting orders/products/customers creates flagged `Dataset`s with AI mappings to canonical fields.
3. Initial full sync paginates correctly and loads into per-entity OLAP tables; `SyncRun` recorded.
4. Incremental sync via `updated_at` watermark and webhook-driven updates both work and are rate-limit-safe.
5. Canonical `orders` (etc.) views include the Shopify tables so cross-source templates work.
6. A dashboard can be generated from Shopify datasets with correct canonical metrics.

## Notes (optional)
- Depends on: 014–021. Establishes the e-commerce connector framework reused by 025/026.
- Respect Shopify API rate limits (leaky bucket); never query Shopify at widget render time.
- Reference: `Phases.md` C26.
