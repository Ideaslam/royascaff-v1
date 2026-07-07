# Change Request

## Metadata
- **date**: 2026-07-07
- **change-type**: general (refactor + modify-feature + new-feature)
- **target-app**: customer-portal + backend
- **affected-repos**: backend+frontend
- **priority**: high

---

## Scope
- **Module(s)**: Data (Multi-Source Data Management), Connectors (S10), Pipelines (S11), Customer Portal Shell (S1 — data pages)
- **Feature(s)**:
  - Data-source grouping (one Data Source → many Tables) in the UI
  - Unified "select what to import" wizard step for every source
  - Phase-based progress loader for data fetch + sync
  - AI mapping suggestion + editing for all semantic sources (fixes confirm-mapping block)
  - Fully editable data source (add/remove tables, edit descriptions/mapping, re-select)
- **Endpoint(s)**:
  - New: `GET /data/connections/:id/datasets` (list tables in a source)
  - New: `GET /data/connections/:id/entities` (list importable entities — generic, replaces per-source list endpoints)
  - New: `GET /data/datasets/:id/sync-runs/:runId` (single run status with progress) — or extend existing status
  - Modify: `GET /data/source-types/:type/setup-flow` (EP-DATA-41) — emit new `select-entities` step
  - Modify: `POST /data/datasets/:id/confirm-mapping` (EP-DATA-23) — structured validation response
- **Page(s)/View(s)**:
  - `customer-portal: data-sources` (regroup: one card per Data Source)
  - `customer-portal: data-source-detail` (NEW — tables inside a source, all editable)
  - `customer-portal: dataset-setup-wizard` (add select-entities step + progress loader + mapping for all)
- **Service(s)**:
  - `ConnectorInterface` (add `listEntities()`), `ConnectorRegistry`
  - `DatasetService`, `DataConnectionService`, `SyncService`
  - `PipelineTypeRegistry` (add select-entities to setup flow)
  - Pipeline steps (write progress to `SyncRun`)
  - Per-source `*-dataset.service.ts` (provisioning becomes selection-driven)

---

## Description

### Problem
The multi-source data experience has five structural issues:

1. **No "choose what to import" step** for most sources. Only MongoDB and SQL Server let the user pick (checkbox list buried inside their connect component). Google Sheets asks for a single tab as free text; Zid/Salla/Shopify auto-create a fixed 3 datasets (orders/products/customers) with no choice. There is no shared, reusable selection step.
2. **No progress feedback** while a source's data is being fetched. `SyncRun` has no progress field; loaders are message-only overlays. During the first Zid integration the tables took a long time to load with no indicator, so users think it errored.
3. **Mapping fails for e-commerce.** The wizard only shows the canonical-mapping UI for `csv`/`google_sheets`, but still calls `confirm-mapping` for every source. For the Zid `customers` table the AI proposal lacks `customer_id`, so the backend hard-throws `400 Missing required canonical fields for 'customers': customer_id` — and the user has no UI to fix it.
4. **Nothing is editable after setup.** There is no way to re-enter a source to add another table, change a field description, or re-run selection.
5. **Datasets show as separate sources.** The data list renders one card per `Dataset`, so connecting Zid produces three "sources" (Product, Customer, Order) even though they share one `DataConnection`. The grouping already exists in the data model (`Dataset.connectionId`) but the UI ignores it.

### Desired behavior (target architecture)

**Terminology reframe (UI only, no schema rename):**
- **Data Source** = `DataConnection` (the Zid store, the Mongo cluster, the Google account, the uploaded CSV batch).
- **Table** = `Dataset` (a table/collection/sheet/entity inside a source), linked by `connectionId`.

**A. Grouping (issue 5)**
- Data list shows **one card per Data Source**, with its source type, status, and table count.
- Clicking a source opens a **Data Source detail page** listing all its Tables, each with sync status, row count, and per-table actions.
- Backend exposes `GET /data/connections/:id/datasets`.

**B. Unified selection step (issue 1)**
- New reusable connector method `listEntities(connection)` → `[{ name, label, kind, semanticFlag?, preselected }]`.
  - `zid/salla/shopify`: return orders/products/customers (all preselected).
  - `google_sheets`: list the spreadsheet's tabs.
  - `mongodb_atlas`: reuse `listCollections`.
  - `sql_server`: reuse `listTables`.
  - `csv`: no selection (single file) — step skipped.
- New generic endpoint `GET /data/connections/:id/entities`.
- New shared wizard step kind `select-entities` (backend setup-flow adds it for sources that support selection; skipped for csv).
- New shared `SelectEntitiesStepComponent` (checkbox list, mirrors the Mongo/SQL UX).
- **Dataset creation becomes selection-driven and unified**: the connect step establishes only the `DataConnection` (OAuth callback no longer auto-creates the 3 e-commerce datasets); the selection step creates one `Dataset` per chosen entity. This makes all seven sources follow the same path.

**C. Phase-based progress loader (issue 2)**
- Add `progress` (0–100) and `phase` (`queued | listing | discovering | extracting | loading | finalizing | done | failed`) to `SyncRun`, plus live `rowsIn`/`rowsLoaded` as they accrue.
- Pipeline steps update `SyncRun.progress`/`phase` as they run (extract, transform, load, finalize).
- Expose run status via `GET /data/datasets/:id/sync-runs/:runId` (progress included).
- New shared `ProgressLoaderComponent` (percentage bar + phase label + row counts). Used in the wizard during entity listing, schema discovery, and the first sync (polled). Also reused on the Data Source detail page for active syncs.

**D. AI mapping for all sources + non-blocking edit (issue 3)**
- Show the canonical-mapping UI in schema review for **every** semantic source (whenever `semanticFlag !== 'arbitrary'`), not just csv/google_sheets.
- **On-demand "Map with AI" button**: in schema review, once the user picks a canonical type, a button triggers AI mapping for *that* type (`POST /datasets/:id/propose-mapping`, EP-DATA-46) and fills the dropdowns (editable) before continuing. Available for **all** sources including CSV — not only e-commerce, and not only at discovery time. Shows a loading state and a soft inline error on failure. Backend reuses one shared `runAiMappingProposal` helper for both automatic (discovery) and on-demand mapping.
- Improve backend proposal: before/after AI, apply a **name-match prefill** for required canonical fields (e.g. `customer_id` ← `customer_id|id|_id`, `order_id` ← `order_id|id`, `product_id` ← `product_id|id|sku`).
- Frontend highlights required-but-unmapped canonical fields inline and disables **Confirm** until they are mapped (arbitrary datasets have none). This replaces the opaque network 400 with an in-UI, resolvable validation. Backend keeps `validateColumnMapping` as a safety net and returns a structured `{ missing: [...] }` payload.

**E. Full editability (issue 4)**
- Data Source detail page supports: **Add tables** (re-opens selection listing not-yet-imported entities), edit a table's name, edit column descriptions, edit canonical mapping, change schedule, trigger sync, delete a table, and re-run selection.
- Reuse existing dataset endpoints (create, `mapping`, `schema-columns`, delete); add list-by-connection + entities.

### Engine / reusability goals
- One `listEntities` contract + registry → a **future source** needs only: implement `ConnectorInterface` (incl. `listEntities`) + one registry line + a connect component + (optional) setup-flow override.
- Selection, schema-review, schedule, and progress are **shared step components** — connect is the only per-source UI.
- Progress is written in one place (pipeline/sync) and read by one shared component.

### Who is affected
Authenticated customer-portal editors/admins connecting or managing any data source. No admin-panel or landing changes.

### Out of scope
- No new external providers; no OLAP engine changes.
- Legacy CSV upload flow (`CsvFile`/`ColumnMetadata`) untouched.
- No true per-row streaming rewrite of extraction (progress is phase-based with row counts).
- Dashboard generation flow unchanged.

---

## Acceptance Criteria

**Grouping**
1. `GET /data/connections/:id/datasets` returns all tables for a source.
2. The data list (`/app/data`) shows **one card per Data Source** (not per table), with table count and status.
3. A **Data Source detail page** lists all tables in the source with per-table status, row count, and actions.
4. Connecting Zid produces **one** Data Source containing 3 tables (or the subset chosen), not 3 separate sources.

**Selection**
5. `ConnectorInterface.listEntities()` is implemented by all seven connectors; `GET /data/connections/:id/entities` returns the importable entities per source.
6. The setup wizard shows a shared **Select entities** step for `zid/salla/shopify/google_sheets/mongodb_atlas/sql_server`; `csv` skips it.
7. For e-commerce, the user can deselect entities and import a subset; datasets are created only for selected entities (OAuth callback no longer auto-provisions all three).
8. `EP-DATA-41` setup-flow returns the `select-entities` step kind for selection-capable sources.

**Progress**
9. `SyncRun` has `progress` (0–100) and `phase`; pipeline steps update them during a run.
10. `GET /data/datasets/:id/sync-runs/:runId` returns live progress/phase/row counts.
11. The wizard shows a **percentage progress loader** during entity listing, schema discovery, and the first sync; the Data Source detail page shows progress for active syncs.

**Mapping**
12. Schema review shows the canonical-mapping UI for every source where `semanticFlag !== 'arbitrary'` (including Zid/Salla/Shopify).
13. Required canonical fields are pre-filled by name match when possible; the Zid `customers` flow no longer 400s — any still-missing required fields are shown inline and block Confirm until mapped.
14. AI still proposes mapping + semantic flag; the user can edit every mapping before confirming.
14b. A **"Map with AI"** button in schema review runs AI mapping on demand for the user-chosen canonical type (EP-DATA-46) and fills the editable dropdowns; it works for every source including CSV, and re-runs correctly after the user changes the semantic type.

**Editability**
15. From the Data Source detail page the user can: add tables (re-select), edit a table's field descriptions, edit its canonical mapping, change its schedule, trigger a sync, and delete a table.

**Quality**
16. Backend compiles with no TypeScript errors; frontend builds with no errors and no hardcoded external URLs (all calls via `apiUrl`).
17. Adding a hypothetical new source requires only: connector impl (+`listEntities`), one registry line, a connect component, and (optional) a setup-flow override — no changes to shared steps.

---

## Notes
- **Implementation order (single change, phased):**
  1. **Grouping**: list-by-connection endpoint + regrouped data list + Data Source detail page (reads existing model).
  2. **Selection engine**: `listEntities` on interface + all connectors + generic endpoint + `select-entities` step kind + shared component; move e-commerce provisioning from OAuth callback to selection.
  3. **Mapping fix**: name-match prefill + show mapping UI for all + inline required-field validation.
  4. **Progress**: `SyncRun.progress/phase` + pipeline writes + run-status endpoint + shared `ProgressLoaderComponent` wired into wizard + detail page.
- **Migration**: `SyncRun.progress/phase` are additive (default `0`/`queued`); existing datasets already carry `connectionId`, so grouping needs no backfill. Existing e-commerce connections keep their datasets.
- **Risk**: complexity **High**; cross-module **Yes** (Data + Connectors + Pipelines + CP); migration **No** (additive fields only). Main behavioral change: e-commerce datasets are created at the selection step instead of on OAuth callback — the OAuth callback still creates the connection + webhook route and redirects into the wizard.
- **Reference UX**: the AI widget loader (change-033) for loader polish; the Mongo/SQL "select collections/tables" component as the base for the shared selection step.
