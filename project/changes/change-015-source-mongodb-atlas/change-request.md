# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Data, `connectors`, `integrations` (MongoDB Atlas)
- Feature(s): MongoDB Atlas data source
- Endpoint(s): connection test, collection discovery, dataset create, preview
- Page(s)/View(s): customer-portal: connection wizard, collection picker, preview
- Service(s): `MongoAtlasConnector`

## Description
Add **MongoDB Atlas** (customer's cluster) as a connector, **sync-first** like SQL Server. Live reads only for connection test and preview; dashboards run on synced data in the OLAP engine.

Desired behavior:
- Connection wizard collects Atlas URI + **read-only** user → encrypted `DataConnection` (`sourceType: mongodb_atlas`); `testConnection` validates and warns about IP allowlist/network.
- `discoverSchema` samples collections to infer fields/types (schema-on-read); user picks collection(s), each a `Dataset` with AI mapping/flag.
- `extract`: initial full load then **incremental** (by `_id`/`updatedAt`); flatten nested documents to tabular rows during `normalize`; `load` via ingest pipeline into the OLAP engine.
- Optional preview (top-N docs) during setup.
- Frontend: connection wizard, collection picker, preview, schedule.

Out of scope: live federated queries against the customer cluster at render time (optional future power-user mode noted, not built here).

## Acceptance Criteria
1. Connection wizard validates a read-only Atlas connection; credentials stored encrypted; network/allowlist guidance shown.
2. Collection discovery samples and infers fields/types; user can select collections as datasets.
3. Nested documents are flattened to tabular rows during normalization.
4. Full then incremental sync loads collections into the OLAP engine; `SyncRun` recorded.
5. Preview returns top-N docs live during setup only.
6. Dashboards are generated from synced Atlas datasets (no live queries at render).

## Notes (optional)
- Depends on: 001–008.
- Flattening strategy for nested/array fields should be consistent and documented.
- Reference: `Phases.md` C30.
