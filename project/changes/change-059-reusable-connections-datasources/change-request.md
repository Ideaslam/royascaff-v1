# Change Request

## Metadata
- **date**: 2026-07-13
- **change-type**: general
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data (Multi-Source Data Management) — split Connection vs Data Source; Connections management surface
- Feature(s):
  - Manage Connections (CRUD, rename, test, re-auth, delete-when-unused)
  - Create / manage Data Sources (pick or create Connection; type-specific scope; rename)
  - Manage Datasets/Tables under a Data Source (reuse parent Connection)
  - Migration script: existing DataConnection → Connection + DataSource; Dataset → dataSourceId
- Endpoint(s): Connections CRUD + test + re-auth; Data Sources CRUD (scoped to connectionId); Dataset create/list under dataSourceId; existing sync/schema endpoints updated to resolve credentials via Connection
- Page(s)/View(s):
  - customer-portal: Data Sources home (primary entry + link to Connections)
  - customer-portal: Connections list (`/app/data/connections`) — table layout
  - customer-portal: Connection create/edit (drawer / wizard step)
  - customer-portal: Create Data Source wizard — Choose Connection step
  - customer-portal: Data Source detail — rename, add tables via existing connection, cascade-delete with confirm
- Service(s): ConnectionService (auth/credentials), DataSourceService, Dataset/Sync services (resolve Connection for credentials); connectors unchanged in behavior

## Description

### Problem
Today `DataConnection` conflates **credentials** and **Data Source**. Users re-enter the same SQL/OAuth credentials for every source, cannot reuse one connection across many sources, find rename/reuse awkward, and the labels Connection / Data Source / Table are unclear.

### Desired outcome
Users manage **Connections** separately (auth only). When creating a **Data Source**, they choose an existing Connection of that type or add a new one. Many Data Sources can share one Connection. Adding tables under a Data Source always uses that source’s Connection. Connection and Data Source can be renamed. Existing setups, syncs, and dashboards keep working after a one-shot migration script.

### Who is affected
All authenticated Customer Portal roles in the workspace (workspace-scoped; any member can manage any connection/source in the workspace). Admin Panel out of scope for UI.

### Entity model
| Entity | Role |
|--------|------|
| **Connection** | Auth only: name, sourceType, AES-256-GCM encrypted credentials (DB) or OAuth tokens (integrations), status. Evolved from today’s `DataConnection`. |
| **Data Source** | New entity: name, `connectionId`, sourceType, type-specific **scope** (e.g. SQL DB name, Google spreadsheet ID, Shopify shop domain), status. |
| **Dataset (Table)** | Linked via `dataSourceId` (not `connectionId`). Sync/listEntities use parent Data Source → Connection for credentials. |
| **CSV** | Special one-off Data Source — **no** reusable Connection. |

### Happy path — create Data Source
1. User opens Connect Source (Data Sources home remains primary) → picks source type.
2. **Choose connection**: pick existing of that type **or** Add new connection.
3. If new: enter credentials / OAuth → **must pass Test Connection before save** → save Connection.
4. Enter type-specific scope → select entities/tables → schema → schedule → sync.
5. Later: add more tables from Data Source detail using the **same** Connection (no re-auth).

### Connections module (Phase 1)
- UI: both dedicated Connections page **and** picker when creating a source.
- Actions: create, list (search/filter/sort), rename, edit credentials / re-auth tokens, test connection, disable/enable, delete **only when no Data Sources reference it**.
- Types: same set as today (`csv` excluded from reusable Connections; CSV remains one-off).
- List: **table** layout for dense credential management; follow existing Data Sources + side-drawer patterns; EN/AR i18n.

### Rename & rebind
- Rename Connection and Data Source only (Dataset rename out of scope).
- **No** rebinding a Data Source to a different Connection after create — only rename / edit within the original Connection.

### Deletes
- **Connection**: block if any Data Source uses it; message e.g. “Cannot delete — used by N data sources.”
- **Data Source**: confirmation alert → cascade-delete all Tables (and sync history). **Block** if any dashboard still uses a table from that source.
- No undo after delete.

### Security
- JWT + workspace context; no public credential endpoints.
- Secrets/tokens never returned in API (mask / `hasCredentials` only); safe fields (host, shop domain, spreadsheet title) may be visible.
- Audit trail deferred.
- Keep existing Data API rate limits; **add** rate limits on test-connection and OAuth.

### Migration
- One-shot script: each existing `DataConnection` → 1 Connection (auth) + 1 Data Source (scope moved); Datasets get `dataSourceId`. User runs script then removes it. Zero user action for dashboards/syncs after migrate.
- Must not break: existing Google Sheets / Shopify / Salla / Zid / SQL / Mongo / CSV setups, syncs, dashboards, or primary routes (`/app/data`, source detail, connect wizard).

### Edge cases
- Empty Connections → CTA Add connection; create source with no matching connections → only Add new.
- OAuth cancel / expired token / unreachable host → surface error; do not auto-delete Connection; **re-auth flow for expired OAuth in Phase 1**.
- Concurrent rename: last-write-wins.
- Sync/schema/AI pipelines reused; credentials resolved via Connection.

### Out of scope
- Admin Panel Connections UI
- New connector types
- Changing sync/OLAP/AI mapping behavior (beyond credential resolution path)
- Dataset rename
- Rebinding Data Source to another Connection
- Audit trail
- Undo after delete

### User stories
- As an editor, I create one SQL Connection and attach multiple Data Sources (different databases/scopes) without re-entering credentials.
- As an editor, I rename a Connection or Data Source without affecting tables or dashboards.
- As an editor, I add tables to an existing Data Source without re-authenticating.
- As an editor, I cannot delete a Connection still used by Data Sources, or a Data Source whose tables are used by dashboards.
- As an editor, when OAuth expires I re-auth the Connection and continue using linked Data Sources.

## Acceptance Criteria
1. Connection entity stores auth only (encrypted DB credentials or OAuth tokens); API never returns raw secrets/tokens.
2. Data Source entity stores name + `connectionId` + sourceType + type-specific scope; many Data Sources may share one Connection.
3. Dataset records use `dataSourceId`; adding tables under a Data Source uses that source’s Connection for listEntities/sync/schema.
4. Connections list page (`/app/data/connections`) is a searchable/filterable/sortable **table**; create/edit/rename/test/disable/enable via existing drawer patterns; EN/AR strings present.
5. Create Data Source wizard includes a **Choose connection** step (pick existing of that type or add new); Test Connection must succeed before saving a new Connection.
6. CSV remains a one-off Data Source without a reusable Connection.
7. User can rename Connection and Data Source; cannot rebind Data Source to a different Connection.
8. Delete Connection is blocked when any Data Source references it, with a clear message including count of linked sources.
9. Delete Data Source shows confirmation, then cascade-deletes tables/sync history; blocked if any dashboard still references a table from that source.
10. Expired OAuth: user can re-auth the Connection in Phase 1 without recreating Data Sources.
11. Test-connection and OAuth endpoints have rate limits in addition to existing Data API limits.
12. Migration script converts existing DataConnection+Dataset data to Connection+DataSource+dataSourceId; after migrate, existing syncs and dashboards continue to work without manual user fixes.
13. Data Sources home remains the primary entry; Connections is secondary (linked from Data area).
14. Workspace-scoped: any authenticated workspace member can manage connections/sources; no public credential endpoints.

## Notes
- Evolve today’s `DataConnection` collection/schema into Connection (auth-only); add new DataSource collection — avoid duplicate “connection” concepts in the UI.
- Plan docs and code must keep terminology aligned: Connection ≠ Data Source ≠ Table.
- High priority: foundation for reusable credentials across the multi-source platform.
- Visual approach: match existing Customer Portal PrimeNG + brand tokens + change-057 side drawers; Connections list = table.
`}