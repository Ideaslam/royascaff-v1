# Change Request

## Metadata
- **date**: 2026-07-09
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, Pipelines
- Feature(s): Schema Discovery + AI column identify (`identify-columns`); Schema Review wizard; Dataset detail schema editor; Extract/Load column projection
- Endpoint(s): EP-DATA-40 (extend schema-columns); EP-DATA-22 / new refresh-available-columns for Add column; confirm/save schema selection; audit on selection changes
- Page(s)/View(s): customer-portal: schema-review-step; customer-portal: dataset-detail (Edit Schema / Add column)
- Service(s): SVC-DATA-DS (`updateSchemaColumns`, discover/refresh available columns, confirm selection prune); IdentifyColumnsStep; Extract/Load (project to selected columns only); AI `column-identify` prompt

## Description

### Problem
Wide tables (~100 columns) hurt performance across AI analysis, canonical mapping, and OLAP sync/storage. Today the pipeline describes all columns and picks a primary key, but keeps the full schema and syncs every column.

### Desired behavior
In the **same** `identify-columns` AI process that describes columns and chooses the PK, the AI also:
1. Marks **important** columns as selected (soft target ~25), always including the PK and important foreign keys.
2. Marks **sensitive** columns as `blocked` (passwords, tokens, secrets, etc.) so the user cannot select them.
3. Suggests a **selection order** for chosen columns.

The UI shows the full discovered column list with checkboxes, order controls (drag + up/down), descriptions, PK, and a blocked badge. The user can override AI selection (except blocked). On **user confirm**, only chosen columns are kept in live `Dataset.schema` metadata, participate in canonical mapping, and are extracted/loaded into OLAP. Unselected column data is **not** stored in OLAP until the user re-selects the column and runs a **manual sync**.

**Edit Schema / Add column** (in scope): from dataset detail, user can open the schema editor; **Add column** re-fetches columns from the source, merges with the current chosen set, and re-runs AI **only for new columns**. Newly selected columns require a manual sync before data appears in OLAP.

Applies to **any data source** (clean shared pipeline). Dashboard widgets that already reference dropped columns are **out of scope**. Admin-only column policies are **out of scope**.

### Who is affected
Merchants setting up or editing datasets for any data source in the customer portal.

### User story (happy path)
1. User selects entities / connects source → schema is discovered (all columns from source into `availableColumns` / full list).
2. Ingest pipeline `identify-columns` runs one AI call (`column-identify`): descriptions (EN/AR), PK, `isSelected` + order (~25, incl. FKs), `blocked` for sensitive cols. If AI fails → select none (user must choose).
3. Schema-review UI shows all columns: checkbox | order | name | type | description | PK | blocked badge. Blocked rows: disabled checkbox, alert color, tooltip. User can check/uncheck (non-blocked), reorder via drag and up/down, edit descriptions, set PK among selected.
4. Confirm requires ≥ 1 selected column. Confirm without PK is allowed, with a message that PK is required for incremental sync. Deselecting a mapped column warns; reject if it is a mandatory canonical field. Deselecting the PK forces picking another selected column as PK. Blocked wins over selected (force unselected).
5. On confirm: prune live `Dataset.schema` to selected columns (ordered); strip unselected from `columnMapping` where allowed; audit the change. Extract/Load project rows to selected columns only.
6. Later: **Edit Schema** → adjust selection from cached available list; **Add column** → re-discover from source + AI for new cols only → user selects → save → user syncs manually to load new column data.

### Permissions
Same as today: JWT workspace members who can edit datasets. Audit trail required for column selection changes.

### Data changes
- `DiscoveredColumn`: add `isSelected?: boolean`, `selectionOrder?: number`, `blocked?: boolean`.
- `Dataset.availableColumns` (full last-discovered list for UI); live `schema` = chosen columns only after confirm.
- Migration: existing datasets → treat current `schema` columns as selected (`isSelected: true`, ordered as today); copy into `availableColumns` if missing.
- Soft AI target ~25 selected; thin tables: select all non-blocked.
- No new external providers. Work stays inside existing ingest pipeline + extended dataset schema endpoints.

### Out of scope
- Auto-fixing dashboard widgets that reference dropped columns
- Admin-only column allow/deny policies
- Automatic sync after adding columns (user syncs manually)

## Acceptance Criteria
1. One `column-identify` AI call returns per-column description (EN/AR), `isPrimaryKey`, `isSelected`, `selectionOrder`, and `blocked`; soft target ~25 selected including PK and important FKs; on AI failure, no columns are pre-selected.
2. `blocked: true` forces `isSelected: false`; UI shows blocked badge, disabled checkbox with alert styling; API rejects attempts to select a blocked column.
3. Schema-review and dataset-detail schema UI show columns as: checkbox | order | name | type | description | PK | blocked badge; support drag-to-reorder and up/down; EN + AR i18n for new strings.
4. Confirm/save requires ≥ 1 selected column; allows missing PK with messaging that incremental sync needs a PK; warns on deselect of mapped columns and rejects deselect of mandatory mapped columns; deselecting PK requires choosing another selected column as PK; blocked while `syncStatus = syncing`.
5. After user confirm, live `Dataset.schema` contains only selected columns in order; `columnMapping` only references selected columns; extract/load store only those columns in OLAP; unselected data is absent until re-select + manual sync.
6. `Dataset.availableColumns` holds the full discovered list; **Add column** re-fetches from source, merges, runs AI for new columns only; newly selected columns appear in schema after save but OLAP data requires user-triggered sync.
7. Migration marks all existing schema columns as selected and populates `availableColumns` without breaking PK/incremental sync, mapping, or streaming resume.
8. Column selection confirm/save writes an audit event; failed confirm leaves schema unchanged.
9. Works for all data source types via the shared pipeline (no source-specific forks for selection).

## Notes
- Visual approach: extend existing PrimeNG schema-review / dataset-detail tables; no new design system.
- Performance goal: discriminate columns before mapping and sync steps.
- Ripple risk: high (AI prompt, dataset model, schema UI, extract/load projection, migration, audit).
