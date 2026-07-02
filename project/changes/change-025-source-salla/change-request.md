# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Data, `connectors`, `integrations` (Salla)
- Feature(s): Salla data source
- Endpoint(s): Salla OAuth connect/callback, entity selection, webhook receiver, dataset create
- Page(s)/View(s): customer-portal: connect store, choose entities, sync status
- Service(s): `SallaConnector`

## Description
Add **Salla** by reusing the e-commerce connector framework from Shopify (change-024). Salla orders/products/customers map to the **same canonical flags** but land in **separate OLAP tables** (per A4), unified via canonical views.

Desired behavior:
- Salla OAuth connect → encrypted `DataConnection` (`sourceType: salla`).
- Entity selection → flagged `Dataset`s with AI `columnMapping` from Salla's API fields to canonical fields.
- Full + incremental sync (watermark) + webhooks where Salla supports them; load via ingest pipeline.
- Salla and Shopify orders remain **separate tables**, both included in the canonical `orders` view → one template covers both.
- Frontend mirrors the Shopify connect/select/status UX.

Out of scope: Shopify/Zid specifics beyond shared framework.

## Acceptance Criteria
1. A user can connect Salla; credentials stored encrypted as a `DataConnection`.
2. Selected entities create flagged `Dataset`s with AI mappings to the canonical dictionary.
3. Full and incremental sync load Salla data into its own per-entity OLAP tables; `SyncRun` recorded.
4. Salla tables are included in canonical views alongside Shopify without merging into one physical table.
5. A dashboard/template built on canonical `orders` shows combined Shopify + Salla data correctly.
6. Rate limits and webhook signatures are respected.

## Notes (optional)
- Depends on: 014–021, and 024 (e-commerce framework).
- Confirm Salla API auth model + webhook availability during implementation.
- Reference: `Phases.md` C27.
