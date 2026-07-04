# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Data, `connectors`, `integrations` (SQL Server)
- Feature(s): SQL Server data source
- Endpoint(s): connection test, schema/table discovery, dataset create, preview
- Page(s)/View(s): customer-portal: connection wizard, table/view picker, preview
- Service(s): `SqlServerConnector`

## Description
Add **SQL Server** as a connector using an **ETL sync** model (customer prod DB behind firewall — never queried at render time). Live access is used only for connection test, schema discovery, and preview.

Desired behavior:
- Connection wizard collects host/port/db/**read-only** credentials → encrypted `DataConnection` (`sourceType: sql_server`); `testConnection` validates.
- `discoverSchema` lists tables/views + columns; user selects table(s)/view(s), each becomes a `Dataset` with AI mapping/flag.
- `extract`: initial **full** load then **incremental** via a watermark column (`updated_at` / change tracking) chosen in the wizard; `load` via ingest pipeline into the OLAP engine.
- Optional **preview** (top N rows) during setup (a permitted live read).
- Frontend: multi-step connection wizard, table/view picker, watermark column selection, preview, schedule.

Out of scope: writing back to SQL Server; cross-DB joins at source (handled in the OLAP engine post-sync).

## Acceptance Criteria
1. Connection wizard validates a read-only SQL Server connection; credentials stored encrypted.
2. Schema discovery lists tables/views + columns; the user can pick one or more as datasets.
3. Preview returns top-N rows live during setup only (not used for dashboards).
4. Full then incremental sync (watermark) loads selected tables into the OLAP engine; `SyncRun` recorded.
5. Dashboards are generated from synced SQL Server datasets (no live queries at render).
6. Connection failures/timeouts are surfaced clearly and do not crash syncs.

## Notes (optional)
- Depends on: 014–021.
- Require read-only DB users; document network/allowlist requirements.
- Reference: `Phases.md` C29.
