## Module: Data (Multi-Source Data Management)

### Data Sources Home Page *(change-022, change-038, change-045, change-059, change-066)*
- Route: `/app/data`
- Components: DataSourcesPage — **integration-style tiles** per Data Source: bordered icon + status badge (table count / syncing / error), **title**, 3-line **description** (registry or DB instruction), footer with **status toggle** (read-only) + **Details** / **Manage** buttons → source detail. Compact grid (~3 columns). **"Connect Source"** opens side drawer (type picker) *(change-057)* → `/app/data/connect/:type`. Link to **Connections** (`/app/data/connections`). List uses **`projection=lite`**. Distinct from Connections **row** layout.
- Service: `GET /api/v1/data/sources` (EP-DATA-52); table counts via list aggregation
- Guard: authGuard + onboardingGuard
- States: loading skeleton tiles · empty state · error toast

### Connections List Page *(change-059, change-066)*
- Route: `/app/data/connections`
- Components: ConnectionsPage — **compact horizontal rows** (left accent, inline meta — distinct from Data Source tiles). Breadcrumbs: Data Sources → Connections. Row click → **detail side drawer** (full connection + linked sources). **Add connection** → type-picker drawer → credentials/OAuth. Shared `ConnectionCardComponent` in wizard choose-connection step. **`projection=lite`** list.
- Service: EP-DATA-09..14, EP-DATA-50; EN/AR i18n
- Guard: authGuard + onboardingGuard
- States: loading · empty · error · delete 409 toast

### Data Source Detail Page *(change-045, change-059)*
- Route: `/app/data/sources/:dataSourceId`
- Components: DataSourceDetailPage:
  - **Header:** source name (renamable), sourceType badge, linked Connection name/status, "Test Connection" (on Connection), "Edit scope" / rename source — **not** rebind Connection
  - **Tables list:** `GET /data/sources/:id/datasets` (EP-DATA-42); sync / open / remove table
  - **Add tables:** re-opens `select-entities` using **current Connection** (no re-auth); EP-DATA-43/44; discovery status list *(change-058)*
  - **Delete source:** confirmation alert → cascade tables; blocked with message if dashboards use any table
- Service: EP-DATA-53/54/55; EP-DATA-42/43/44; dataset sync/delete; EP-DATA-14 (test)
- Guard: authGuard
- States: loading · empty tables · discovery rows · delete confirm / 409

### Backend-Driven Setup Wizard (shared, all sources) *(change-039, change-045, change-058, change-059, change-065)*
- Route: `/app/data/connect/:sourceType`
- Components: DatasetSetupWizardPage — steps come **verbatim** from EP-DATA-41 (`SetupFlow`). The page renders whatever ordered steps the backend returns and does **no source-type branching** *(change-065)*. Step kinds:
  - **`choose-connection`** — pick existing Connection of this type **or** “Add new connection” (drawer/inline). New: enter credentials/OAuth → **Test must pass before save** → then continue. Empty list → only Add new. *(Backend omits this step for one-shot sources like csv.)*
  - **`connect` / scope** — type-specific scope (spreadsheet, database name, shop). Mounted from the resolved flow when it lands on `connect`; OAuth callbacks land with `connectionId` then continue to scope/`select-entities`.
  - **`select-entities`** — via Data Source (`GET /sources/:id/entities`); import → EP-DATA-44 + discovery status poll *(change-058)*
  - **`schema-review`** — column selection + mapping *(change-055)*
  - **`schedule`** — sync + ProgressLoader (EP-DATA-45). Cadence/policy UI shown only when the backend sets `config.allowPolicy` on this step (false for one-shot sources) *(change-065)*.
- Service: EP-DATA-41; Connections CRUD/test; Data Sources create; EP-DATA-43/44/42; EP-DATA-22/48/23/46/20/45
- Guard: authGuard
- Notes: Shared wizard is the live flow; EN/AR for all new strings *(change-059)*. **Single source of truth = backend flow.** If EP-DATA-41 fails, the wizard shows a retryable error banner instead of fabricating steps; the only local flow edit is dropping `choose-connection`/`connect` when adding tables to an existing source (`dataSourceId`) *(change-065)*.

### Shared UI — ProgressLoader *(change-045)* + Discovery Status List *(change-058)*
- Component: ProgressLoaderComponent — sync / entity listing.
- Component: SchemaDiscoveryStatusList — per-table discovery badges + Retry; poll 5s.

### CSV Upload Page *(change-022, updated change-047, change-059)*
- Route: `/app/data/csv-upload` (or via connect/csv)
- Components: CsvUploadPage — upload → creates **one-off Data Source** (no reusable Connection) + Dataset + enqueues discovery *(change-058)*
- Service: upload file; `POST /data/sources` (CSV); `POST /data/datasets` with `dataSourceId`; confirm-mapping; sync
- Guard: authGuard + onboardingGuard
- Notes: CSV does **not** create a Connection *(change-059)*.

### Dataset Detail Page *(change-022, change-059)*
- Route: `/app/data/datasets/:id`
- Components: DatasetDetailPage — Overview / Schema / Mapping / Sync History; parent breadcrumb loads Data Source (then Connection) via `dataSourceId`
- Service: dataset endpoints EP-DATA-17/20/21/22/40/48/49/23
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
  - **Schema Columns Section** *(change-038, change-055, change-058)*: table **checkbox | order | name | type | description | PK | blocked badge**; drag + up/down reorder; blocked = disabled checkbox + alert color; "Save / Confirm Selection" → EP-DATA-48 (prune live schema); lightweight desc/PK patches → EP-DATA-40; **Edit Schema** opens full `availableColumns`; **Add column** → EP-DATA-49 (202 enqueue) + poll `schemaDiscoveryStatus` every 5s then user selects + confirm + **manual sync** for OLAP data; save blocked while `syncStatus = syncing`; EN/AR i18n for new strings
  - **Subscription Limit Warning:** shown inline when retry/manual-sync returns 403 with sync limit code
- Service: `GET /data/datasets/:id`; `GET /data/datasets/:id/sync-runs`; `POST /data/datasets/:id/sync` (with `{ mode }` body); `POST /data/datasets/:id/sync-runs/:runId/retry`; `PATCH /data/datasets/:id`; `PATCH /data/datasets/:id/schema-columns` (EP-DATA-40); `POST /data/datasets/:id/confirm-schema-selection` (EP-DATA-48); `POST /data/datasets/:id/refresh-available-columns` (EP-DATA-49, 202)
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
