# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Data, `connectors`, `integrations` (Zid)
- Feature(s): Zid data source
- Endpoint(s): Zid OAuth connect/callback, entity selection, webhook receiver, dataset create
- Page(s)/View(s): customer-portal: connect store, choose entities, sync status
- Service(s): `ZidConnector`

## Description
Add **Zid** using the same e-commerce connector framework (changes 011/012). Zid orders/products/customers map to the shared canonical flags into **separate OLAP tables**, unified via canonical views.

Desired behavior:
- Zid OAuth connect → encrypted `DataConnection` (`sourceType: zid`).
- Entity selection → flagged `Dataset`s with AI `columnMapping` from Zid API fields to canonical fields.
- Full + incremental sync (watermark) + webhooks where available; load via ingest pipeline.
- Zid tables join Shopify/Salla in the canonical views so a single template spans all three.
- Frontend mirrors the shared connect/select/status UX.

Out of scope: source-specific work beyond the shared framework.

## Acceptance Criteria
1. A user can connect Zid; credentials stored encrypted as a `DataConnection`.
2. Selected entities create flagged `Dataset`s with AI mappings to the canonical dictionary.
3. Full and incremental sync load Zid data into its own per-entity OLAP tables; `SyncRun` recorded.
4. Zid tables are included in canonical views alongside Shopify and Salla (separate physical tables).
5. A canonical `orders` template shows combined Shopify + Salla + Zid data correctly.
6. Rate limits and webhook signatures are respected.

## Notes (optional)
- Depends on: 001–008, 011 (framework); parallels 012.
- Confirm Zid API auth model + webhook availability during implementation.
- Reference: `Phases.md` C28.
