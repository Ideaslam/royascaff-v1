# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: frontend
- **priority**: high

## Scope
- Module(s): Data
- Feature(s): Connections management, setup-wizard choose-connection step
- Endpoint(s): none (existing Connections CRUD/test/reauth APIs only)
- Page(s)/View(s): customer-portal: ConnectionsPage (`/app/data/connections`), ChooseConnectionStep (setup wizard), cross-links from DataSourcesPage / SourceDetailPage
- Service(s): none (existing `DataService` methods only)

## Description

### Problem
The **Manage Connections** page (`/app/data/connections`) is hard to use:
- Dense **table** with five icon-only row actions (rename, test, edit credentials, reauth, delete) — low discoverability, poor on smaller screens.
- Feels like a **hidden sub-page** ("Back to Sources" only) with no breadcrumbs; unclear relationship to Data Sources.
- **Inconsistent** with the Data Sources home (card grid + type-picker drawer) — users learn one pattern on `/app/data` and get a different one on Connections.
- **Create flow** jumps straight into a form drawer (SQL Server defaults) instead of picking a source type first like "Connect Source".
- Setup wizard **choose-connection** step uses a separate list UI that doesn't match Connections management.

### Desired behavior (after)
1. **Navigation (minimal change):** keep `/app/data/connections` as its own route; add **breadcrumbs** (`Data Sources → Connections`) and clearer cross-links (Data Sources header keeps "Manage Connections"; Connections header links back naturally). No tab/sidebar restructure.
2. **List → cards:** replace the table with a **card grid** matching Data Sources visual language — source-type icon/badge, connection name, type label, status tag, linked data-source count, last-tested hint. Toolbar (search / type filter / sort) stays.
3. **Detail → side drawer:** clicking a card opens a **detail drawer** (no new route) showing:
   - Name, source type, status, last tested
   - **Linked data sources** list (name + link to source detail)
   - Actions: rename, test, edit credentials, reauth, delete (grouped clearly — not five mystery icons)
4. **Create → type picker first:** "Add connection" opens a **type-picker drawer** (reuse the Connect Source category/icon pattern, excluding CSV) → on pick, second drawer step (or same drawer content swap) for credentials / OAuth CTA — same backend calls as today.
5. **Wizard alignment:** extract a shared **connection card** component and reuse it in `ChooseConnectionStep` so picking a connection during setup feels identical to the Connections page.

### Who is affected
Workspace members managing reusable credentials before or after creating Data Sources.

### Out of scope
- New backend endpoints, fields, or connection lifecycle rules (delete guard, test-before-save semantics unchanged).
- CSV connections (remain one-off, not listed here).
- Connection detail as a dedicated route (`/connections/:id`).
- Tab/sidebar navigation restructure for the Data module.
- De-duplicating `SOURCE_DEFINITIONS` vs backend `datasource_type_meta` (separate change).

## Acceptance Criteria
1. `/app/data/connections` renders connections as a **card grid** (not a table) with search/filter/sort/pagination preserved.
2. Card click opens a **detail side drawer** with full info: name, type, status, last tested, linked data sources (clickable), and grouped actions (rename, test, edit credentials, reauth, delete).
3. **Breadcrumbs** on Connections page: Data Sources → Connections; EN/AR strings added.
4. **Add connection** uses a **type-picker drawer first** (icon cards by category, CSV excluded), then credentials/OAuth step — existing API behavior preserved (test on create for DB types, OAuth redirect for Google/Zid, wizard redirect for other OAuth types as today).
5. `ChooseConnectionStep` reuses the shared connection card component — visual parity with Connections page list.
6. Loading, empty, and error states remain; mobile-friendly (cards stack, drawer full-width on small screens per existing drawer patterns).
7. RTL layout correct; no new hardcoded English in templates (i18n keys for new copy).
8. Frontend `ng build` succeeds; planning doc `pages/data.md` updated in place.

## Notes
- Reuse existing shared pieces where possible: `SideDrawerComponent`, Data Sources type-picker styling, source icon metadata from `SOURCE_DEFINITIONS` / `datasource_type_meta`.
- Detail drawer loads linked data sources via existing APIs (`listConnections` already returns `dataSourceCount`; may need `GET /data/connections/:id` or list data sources filtered by connection — use whatever exists today without new endpoints).
- Priority: **high**.
