## Module: Data (Multi-Source Data Management)

### Data Sources Home Page *(change-022, change-038, change-045)*
- Route: `/app/data`
- Components: DataSourcesPage — **grouped by Data Source** *(change-045)*: one card per `DataConnection` (source icon, name, sourceType, status, **table count**, aggregate last-sync). Previously rendered each dataset (orders/products/customers) as its own card — now those are Tables shown **inside** their parent source. Clicking a source card navigates to the Data Source detail page. "Connect Source" dialog launches the shared setup wizard. Legacy CSV files still surface as single-table sources.
- Service: `GET /api/v1/data/connections` (list sources); `GET /api/v1/data/connections/:id/datasets` (table count / preview per source, EP-DATA-42)
- Guard: authGuard + onboardingGuard
- States: loading skeleton · empty state (no sources yet) · error toast

### Data Source Detail Page *(change-045)*
- Route: `/app/data/sources/:connectionId`
- Components: DataSourceDetailPage — everything about one Data Source in one place:
  - **Header:** source name, sourceType badge, connection status, "Test Connection", "Edit Source" (credentials/name)
  - **Tables list:** all Tables (Datasets) under this source via `GET /connections/:id/datasets`; per row: name, entity/semanticFlag, syncStatus, rowCount, lastSyncAt; row actions: Full/Incremental Sync, open Table detail, remove table
  - **Add / Manage Tables:** "Add tables" re-opens the shared `select-entities` step to add new entities/tables/collections/sheets to this source (non-destructive — existing tables untouched); backed by EP-DATA-43 (list entities) + EP-DATA-44 (create from selection)
  - **Per-table config** (opens Dataset/Table detail): edit field descriptions, edit canonical mapping, set watermark/PK, change schedule — all editable post-setup
- Service: `GET /api/v1/data/connections/:id`; `GET /api/v1/data/connections/:id/datasets` (EP-DATA-42); `GET /api/v1/data/connections/:id/entities` (EP-DATA-43); `POST /api/v1/data/connections/:id/datasets/from-entities` (EP-DATA-44); `POST /api/v1/data/datasets/:id/sync`; `DELETE /api/v1/data/datasets/:id`
- Guard: authGuard
- States: loading skeleton · empty (source has no tables yet → prompt to add) · error toast · progress loader while adding tables (entity listing can be slow)

### Backend-Driven Setup Wizard (shared, all sources) *(change-039, change-045)*
- Route: `/app/data/connect/:sourceType` (and re-entered from the Data Source detail page to add tables)
- Components: DatasetSetupWizardPage — renders the step sequence returned by `GET /api/v1/data/setup-flow?sourceType=…` (EP-DATA-41). Step kinds:
  - **`connect`** — source-specific credential/OAuth entry (CSV upload, OAuth redirect, DB URI/creds). OAuth callbacks (Zid/Salla/Shopify/Google) land here or skip straight to `select-entities`.
  - **`select-entities`** *(change-045)* — **shared "choose what to import" step for every source except CSV**: lists entities via `GET /connections/:id/entities` (EP-DATA-43) — e-commerce orders/products/customers, Google Sheets tabs, SQL tables, Mongo collections — as a multi-select checklist with name/label/type/preselect; "Import selected" calls `POST /connections/:id/datasets/from-entities` (EP-DATA-44). Shows a **percentage ProgressLoader** while entities are being fetched (fixes the long, loader-less Zid wait).
  - **`schema-review`** *(change-045, change-055)* — **shown for all semantic sources**: column selection table from `availableColumns` — **checkbox | order | name | type | description | PK | blocked badge**; drag-to-reorder + up/down; AI pre-selects ~25 (incl. FKs); blocked rows disabled with alert styling/tooltip; ≥1 selected required; missing PK allowed with message that incremental sync needs a PK; deselect mapped → warn, reject if mandatory. Then editable AI-proposed mapping (source dropdowns = selected columns) + semanticFlag picker. **"Map with AI"** (EP-DATA-46). Confirm: EP-DATA-48 (schema selection prune) then EP-DATA-23 (mapping); mapping Confirm disabled on `422 { missing }`.
  - **`schedule`** — syncPolicy selector + "Start sync"; first sync shows the **percentage ProgressLoader** polling `GET /datasets/:id/sync-runs/:runId` (EP-DATA-45) until terminal.
- Service: EP-DATA-41; EP-DATA-43; EP-DATA-44; EP-DATA-22; EP-DATA-48; EP-DATA-23; EP-DATA-46; EP-DATA-20; EP-DATA-45
- Guard: authGuard
- Notes: Supersedes the per-source setup pages below (change-023..028) which are retained here for historical reference; the shared wizard is the live flow. The wizard is fully reusable — a new data source only needs its connector's `listEntities()` + a `setup-flow` entry.

### Shared UI — ProgressLoader *(change-045)*
- Component: ProgressLoaderComponent (reusable) — percentage ring/bar + phase label; polls a `SyncRun` (or entity-listing signal) and renders `progress` + `phase` (queued/listing/discovering/extracting/loading/finalizing). Used by the setup wizard (entity listing, first sync) and the Data Source detail page (add-tables, re-sync). Replaces silent blank waits across all sources.

### CSV Upload Page *(change-022, updated change-047)*
- Route: `/app/data/csv-upload`
- Components: CsvUploadPage — 3-step wizard:
  - **Step 1 — Upload:** file picker accepting `.csv`, `.xlsx`, `.xls` (max 50 MB), file name preview; after upload response: if `sheets` array has >1 entry a **sheet picker dropdown** appears and the user selects the target sheet before continuing; single-sheet files skip the picker automatically; on continue → creates DataConnection + Dataset + triggers `discoverSchemaWithAiProposal`
  - **Step 2 — Schema Review:** shows discovered columns (name, inferred type, sample) + AI-proposed `semanticFlag` (editable dropdown) + AI-proposed `columnMapping` table (canonical field → source column, each row editable); "Refresh AI Proposal" button calls EP-DATA-22; loading state while AI runs
  - **Step 3 — Confirm & Sync:** summary of confirmed mapping; calls EP-DATA-23 then EP-DATA-20 (full sync); shows sync progress + "Done" redirect to `/app/data/datasets/:id`
- Service: `POST /api/v1/data/upload/file` (upload CSV/XLSX/XLS to R2, returns `{ storageKey, sheets? }`); `POST /api/v1/data/connections` (create DataConnection, credentials `{ storageKey, sheetName? }`); `POST /api/v1/data/datasets`; `GET /api/v1/data/datasets/:id`; `POST /api/v1/data/datasets/:id/confirm-mapping` (EP-DATA-23); `POST /api/v1/data/datasets/:id/sync` (EP-DATA-20)
- Guard: authGuard + onboardingGuard
- Notes: CSV/Excel upload creates one `DataConnection` (credentials = `{ storageKey, sheetName? }`) + one `Dataset` atomically. `sheetName` omitted for CSV or single-sheet Excel.

### Dataset Detail Page *(change-022)*
- Route: `/app/data/datasets/:id`
- Components: DatasetDetailPage — tabs:
  - **Overview:** dataset name, sourceType, semanticFlag badge, syncStatus badge, rowCount, analyticsTable; "Re-sync" button (EP-DATA-20); last sync timestamp + error message
  - **Schema:** live selected columns + **Edit Schema** (selection UI over `availableColumns`) + **Add column** (EP-DATA-49 refresh from source, AI for new cols) + confirm selection (EP-DATA-48); Save Schema patches (EP-DATA-40) where applicable
  - **Mapping:** columnMapping editor — table with canonical field → source column dropdown (selected columns); "Confirm Changes" button (EP-DATA-23)
  - **Sync History:** paginated sync runs table (mode, status, rowsIn, rowsLoaded, duration, error); (EP-DATA-21)
- Service: `GET /api/v1/data/datasets/:id`; `POST /api/v1/data/datasets/:id/sync`; `POST /api/v1/data/datasets/:id/refresh-available-columns` (EP-DATA-49); `POST /api/v1/data/datasets/:id/confirm-schema-selection` (EP-DATA-48); `POST /api/v1/data/datasets/:id/confirm-mapping`; `GET /api/v1/data/datasets/:id/sync-history`
- Guard: authGuard

### Legacy CSV — Data Files List Page *(kept for backward compat)*
- Route: `/app/data/files`
- Components: FilesListPage (files table with name/rows/columns/status badge/actions, "Upload" button, delete confirm)
- Service: `GET /api/v1/data/files`; `DELETE /api/v1/data/files/:id`
- Guard: authGuard + onboardingGuard

### Legacy CSV — Upload Wizard Page *(kept for backward compat)*
- Route: `/app/data/upload`
- Components: UploadWizardPage (Step 1: dropzone; Step 2: analysis progress; Step 3: column review table with editable descriptions)
- Service: `POST /api/v1/data/upload/file`; `GET /api/v1/data/files/:id` (polled during analysis); `PATCH /api/v1/data/files/:fileId/columns`
- Guard: authGuard + onboardingGuard
- Notes: Max file size enforced by System Settings (`maxFileSizeMb`, default 50MB).

---

### Google Sheets — Connect Page *(change-023)*
- Route: `/app/data/google-sheets/connect`
- Components: GoogleSheetsConnectPage — explanation of what access is requested ("read-only access to your Google Sheets"), "Connect with Google" button that calls `GET /api/v1/data/google/auth-url` then redirects the browser to the returned `authUrl`; loading spinner during URL fetch
- Service: `GET /api/v1/data/google/auth-url` (EP-DATA-24)
- Guard: authGuard
- States: loading (fetching auth URL) · error (API unreachable)

### Google Sheets — Setup Page *(change-023)*
- Route: `/app/data/google-sheets/setup/:connectionId`
- Components: GoogleSheetsSetupPage — 3-step wizard:
  - **Step 1 — Pick Spreadsheet & Sheet:** loads spreadsheet metadata from `GET /api/v1/data/connections/:id` (uses stored spreadsheet list from connector `discoverSchema` pre-check); user picks spreadsheet (if multiple) + sheet tab + optional cell range; "Next" calls `POST /api/v1/data/datasets` with `{ connectionId, sourceType: 'google_sheets', name }` and then `POST /api/v1/data/datasets/:id/discover-schema`
  - **Step 2 — Schema Review:** same AI-proposal review UI as CSV Upload Wizard (semantic flag picker + column mapping editor); "Confirm" calls EP-DATA-23
  - **Step 3 — Schedule & Sync:** syncPolicy selector (manual / hourly / daily); "Start sync now" calls EP-DATA-19 then navigates to `/app/data/datasets/:id`
- Service: `GET /api/v1/data/connections/:id`; `POST /api/v1/data/datasets`; `POST /api/v1/data/datasets/:id/discover-schema`; `POST /api/v1/data/datasets/:id/confirm-mapping`; `PATCH /api/v1/data/datasets/:id/mapping`; `POST /api/v1/data/datasets/:id/sync`
- Guard: authGuard
- Notes: OAuth callback from Google redirects directly to this page with `connectionId` in the URL — no user action needed to arrive here after Google consent.

---

### Shopify — Connect Page *(change-024)*
- Route: `/app/data/shopify/connect`
- Components: ShopifyConnectPage — brief description of what data is synced (orders, products, customers); a "My Shopify store URL" text input (`{shop}.myshopify.com`); "Install App" button calls `GET /api/v1/data/shopify/install-url?shopDomain=…` and redirects the browser to the returned `installUrl`; loading spinner during URL fetch
- Service: `GET /api/v1/data/shopify/install-url` (EP-DATA-26)
- Guard: authGuard
- States: loading · error (invalid domain / unreachable)

### Shopify — Setup Page *(change-024)*
- Route: `/app/data/shopify/setup/:connectionId`
- Components: ShopifySetupPage — 2-step wizard:
  - **Step 1 — Select Entities:** three checkboxes (Orders, Products, Customers) with descriptions of what each syncs; "Create Datasets" button calls `POST /api/v1/data/shopify/datasets` (ShopifyDatasetService endpoint) to create one Dataset per entity; shows loading state while datasets + AI proposals are generated
  - **Step 2 — Review & Sync:** cards per entity showing: name, semanticFlag badge, rowCount estimate, AI-proposed mapping summary; "Start sync for all" triggers EP-DATA-20 for each dataset; redirects to `/app/data` after queuing
- Service: `POST /api/v1/data/shopify/datasets`; `GET /api/v1/data/datasets/:id`; `POST /api/v1/data/datasets/:id/sync`
- Guard: authGuard
- Notes: OAuth callback from Shopify redirects directly to this page with `connectionId` in the URL.

---

### Salla — Connect Page *(change-025)*
- Route: `/app/data/salla/connect`
- Components: SallaConnectPage — explanation of what data is synced (orders, products, customers); "Connect with Salla" button calls `GET /api/v1/data/salla/auth-url` then redirects the browser to the returned `authUrl`; loading spinner during URL fetch
- Service: `GET /api/v1/data/salla/auth-url` (EP-DATA-29)
- Guard: authGuard
- States: loading · error (API unreachable)

### Salla — Setup Page *(change-025)*
- Route: `/app/data/salla/setup/:connectionId`
- Components: SallaSetupPage — confirmation screen shown after OAuth callback; lists the 3 provisioned Datasets (orders, products, customers) with their sync status tags; "Trigger Sync" per-entity button; "Go to Data Sources" + "Create Dashboard" CTAs
- Service: `GET /api/v1/data/datasets` (filtered by connectionId); `POST /api/v1/data/datasets/:id/sync`
- Guard: authGuard
- Notes: OAuth callback from Salla redirects directly to this page with `connectionId` in the URL.
---

### Zid — Connect Page *(change-026)*
- Route: `/app/data/zid/connect`
- Components: ZidConnectPage — explanation of what data is synced (orders, products, customers); "Connect with Zid" button calls `GET /api/v1/data/zid/auth-url` then redirects the browser to the returned `authUrl`; loading spinner during URL fetch
- Service: `GET /api/v1/data/zid/auth-url` (EP-DATA-32)
- Guard: authGuard
- States: loading · error (API unreachable)

### Zid — Setup Page *(change-026)*
- Route: `/app/data/zid/setup/:connectionId`
- Components: ZidSetupPage — confirmation screen shown after OAuth callback; lists the 3 provisioned Datasets (orders, products, customers) with their sync status tags; "Trigger Sync" per-entity button; "Go to Data Sources" + "Create Dashboard" CTAs
- Service: `GET /api/v1/data/datasets`; `POST /api/v1/data/datasets/:id/sync`
- Guard: authGuard
- Notes: OAuth callback from Zid redirects directly to this page with `connectionId` in the URL.

---

### SQL Server — Connect Wizard *(change-027)*
- Route: `/app/data/sql-server/connect`
- Components: SqlServerConnectPage — 4-step wizard:
  - **Step 1 — Credentials:** form fields for host, port (default 1433), database, username, password, encrypt toggle, trust-certificate toggle; "Test Connection" button calls `POST /api/v1/data/connections` + `EP-DATA-12`; shows success/error badge
  - **Step 2 — Pick Tables:** calls `EP-DATA-35` to list all tables/views; multi-select checklist with table name + type (TABLE / VIEW) + column count; each checked table becomes one Dataset
  - **Step 3 — Configure Tables:** for each selected table: name field (editable), watermark column picker (columns from `EP-DATA-22` schema, filtered to date/number types), optional preview button (calls `EP-DATA-36`); shows top-N preview in a mini table
  - **Step 4 — Schedule & Sync:** syncPolicy selector (manual / hourly / daily) applied to all datasets; "Create Datasets & Start Sync" button creates `POST /api/v1/data/datasets` for each table then enqueues sync via EP-DATA-20; redirects to `/app/data`
- Service: `POST /api/v1/data/connections`; EP-DATA-12; EP-DATA-35; EP-DATA-36; EP-DATA-22; `POST /api/v1/data/datasets`; EP-DATA-20
- Guard: authGuard
- States: each step has loading/error/success states; Step 1 has an inline connection test badge; Step 3 has a collapsible preview panel per table
- Notes: All live DB calls (test, table listing, preview) happen during setup only — no live queries at dashboard render time.

---

### MongoDB Atlas — Connect Wizard *(change-028)*
- Route: `/app/data/mongodb-atlas/connect`
- Components: MongoDbAtlasConnectPage — 4-step wizard:
  - **Step 1 — Connection URI:** textarea for Atlas connection string (SRV or standard); optional database name override; "Connect & Test" button calls `POST /api/v1/data/connections` + `EP-DATA-12`; shows IP allowlist warning with guidance text
  - **Step 2 — Pick Collections:** calls `EP-DATA-37` to list all collections/views; multi-select checklist with collection name + type badge; each checked collection becomes one Dataset
  - **Step 3 — Configure Collections:** for each selected collection: dataset name field (editable), watermark column input (optional, e.g. `updatedAt`), preview button (calls `EP-DATA-38`); shows top-N preview in a mini table with flattened dot-notation columns
  - **Step 4 — Done:** confirmation screen; "Go to Data Sources" CTA
- Service: `POST /api/v1/data/connections`; EP-DATA-12; EP-DATA-37; EP-DATA-38; `POST /api/v1/data/datasets`
- Guard: authGuard
- States: each step has loading/error/success states; Step 1 shows a static IP-allowlist warning panel; Step 3 has a collapsible preview panel per collection
- Notes: All live DB calls (test, collection listing, preview) happen during setup only — no live queries at dashboard render time. Nested documents are flattened with dot-notation in preview and during sync.

---

### Dataset Detail — Sync History & Observability *(change-029)*
- Route: `/app/data/datasets/:id` *(already registered — this page fills the existing route)*
- Components: DatasetDetailPage — full observability panel for a single dataset:
  - **Header:** dataset name, sourceType badge, semantic flag, "last synced X ago" (relative time from `dataset.lastSyncAt`)
  - **Schema Drift Banner:** shown when `dataset.hasSchemaDrift === true`; lists added/removed/retyped columns from the most recent `SyncRun.schemaDrift`; "Dismiss" clears `hasSchemaDrift` via `PATCH /data/datasets/:id`
  - **Sync History Table:** calls `EP in GET /data/datasets/:id/sync-runs`; columns: date, mode (FULL/INCR), status badge (queued/running/done/failed/cancelled), rows loaded, duration, error preview; sorted newest-first
  - **Retry Button:** shown on rows with `status = failed`; calls `EP-DATA-39 POST .../sync-runs/:runId/retry`; re-fetches history on success
  - **Full Sync / Incremental Sync buttons** *(change-038)*: replaces single "Sync Now" button; Full Sync always enabled; Incremental Sync disabled (tooltip: "Add a primary key column first") when no `schema` column has `isPrimaryKey = true`; both disabled when `syncStatus = syncing`
  - **Schema Columns Section** *(change-038, change-055)*: table **checkbox | order | name | type | description | PK | blocked badge**; drag + up/down reorder; blocked = disabled checkbox + alert color; "Save / Confirm Selection" → EP-DATA-48 (prune live schema); lightweight desc/PK patches → EP-DATA-40; **Edit Schema** opens full `availableColumns`; **Add column** → EP-DATA-49 then user selects + confirm + **manual sync** for OLAP data; save blocked while `syncStatus = syncing`; EN/AR i18n for new strings
  - **Subscription Limit Warning:** shown inline when retry/manual-sync returns 403 with sync limit code
- Service: `GET /data/datasets/:id`; `GET /data/datasets/:id/sync-runs`; `POST /data/datasets/:id/sync` (with `{ mode }` body); `POST /data/datasets/:id/sync-runs/:runId/retry`; `PATCH /data/datasets/:id`; `PATCH /data/datasets/:id/schema-columns` (EP-DATA-40); `POST /data/datasets/:id/confirm-schema-selection` (EP-DATA-48); `POST /data/datasets/:id/refresh-available-columns` (EP-DATA-49)
- Guard: authGuard
- States: history table has loading skeleton; running rows poll every 5s (or on-demand refresh); retry row spins during re-queue; schema save shows inline saving indicator

### Zid Install Landing Page *(change-044)*
- Route: `/app/zid-install`
- Components: ZidInstallPage — branded landing page for merchants arriving from Zid App Market install
  - Shows Dynamo logo + "Connect your Zid store to Roya AI Dynamo" heading
  - Explains what data will be synced (orders, products, customers) in a brief bullet list
  - Two CTA buttons: "Log in" (→ `/auth/login?returnTo=/app/zid-install`) and "Create account" (→ `/auth/register?returnTo=/app/zid-install`)
  - After login/signup, `returnTo` param brings the user back here where `ngOnInit` detects the session and auto-calls `getZidAuthUrl()` and redirects to Zid consent
- Service: `GET /api/v1/data/zid/auth-url` (EP-DATA-32) — called after session detected
- Guard: **none** — page is fully public
- States: loading spinner while fetching auth URL; error message if auth URL call fails
