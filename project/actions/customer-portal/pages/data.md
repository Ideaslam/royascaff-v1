## Module: Data (Multi-Source Data Management)

### Data Sources Home Page *(change-022, change-038)*
- Route: `/app/data`
- Components: DataSourcesPage — dataset cards with: source icon, name, type, rowCount, lastSyncAt, syncStatus badge; actions on card header: Full Sync icon button + Incremental Sync icon button (disabled + tooltip "No primary key" when `schema` has no PK column); clicking card navigates to detail page; "Connect Source" dialog
- Service: `GET /api/v1/data/datasets` (list); `POST /api/v1/data/datasets/:id/sync` (with `{ mode }` body)
- Guard: authGuard + onboardingGuard
- States: loading skeleton · empty state (no datasets yet) · error toast

### CSV Upload Page *(change-022)*
- Route: `/app/data/csv-upload`
- Components: CsvUploadPage — 3-step wizard:
  - **Step 1 — Upload:** dropzone (CSV only, max 50 MB), file name preview, upload progress bar; on success → creates DataConnection + Dataset + triggers `discoverSchemaWithAiProposal`
  - **Step 2 — Schema Review:** shows discovered columns (name, inferred type, sample) + AI-proposed `semanticFlag` (editable dropdown) + AI-proposed `columnMapping` table (canonical field → source column, each row editable); "Refresh AI Proposal" button calls EP-DATA-22; loading state while AI runs
  - **Step 3 — Confirm & Sync:** summary of confirmed mapping; calls EP-DATA-23 then EP-DATA-20 (full sync); shows sync progress + "Done" redirect to `/app/data/datasets/:id`
- Service: `POST /api/v1/data/upload/file` (upload CSV to R2); `POST /api/v1/data/connections` (create DataConnection); `POST /api/v1/data/datasets` (create Dataset + triggers AI proposal); `GET /api/v1/data/datasets/:id` (poll for aiProposedMapping); `POST /api/v1/data/datasets/:id/confirm-mapping` (EP-DATA-23); `POST /api/v1/data/datasets/:id/sync` (EP-DATA-20)
- Guard: authGuard + onboardingGuard
- Notes: CSV upload creates one `DataConnection` (credentials = `{ storageKey }`) + one `Dataset` atomically. The wizard abstracts this complexity from the user.

### Dataset Detail Page *(change-022)*
- Route: `/app/data/datasets/:id`
- Components: DatasetDetailPage — tabs:
  - **Overview:** dataset name, sourceType, semanticFlag badge, syncStatus badge, rowCount, analyticsTable; "Re-sync" button (EP-DATA-20); last sync timestamp + error message
  - **Schema:** discovered columns table (name, type, sample values); "Refresh Schema" button (EP-DATA-22)
  - **Mapping:** columnMapping editor — table with canonical field → source column dropdown; "Confirm Changes" button (EP-DATA-23)
  - **Sync History:** paginated sync runs table (mode, status, rowsIn, rowsLoaded, duration, error); (EP-DATA-21)
- Service: `GET /api/v1/data/datasets/:id`; `POST /api/v1/data/datasets/:id/sync`; `POST /api/v1/data/datasets/:id/discover-schema`; `POST /api/v1/data/datasets/:id/confirm-mapping`; `GET /api/v1/data/datasets/:id/sync-history`
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
  - **Schema Columns Section** *(change-038)*: shows discovered columns table with columns: name, type, description (inline editable input), PK checkbox (`isPrimaryKey` toggle — checking one clears others); "Save Schema" button calls EP-DATA-40; "Refresh Schema" button calls EP-DATA-22; loading skeleton while saving
  - **Subscription Limit Warning:** shown inline when retry/manual-sync returns 403 with sync limit code
- Service: `GET /data/datasets/:id`; `GET /data/datasets/:id/sync-runs`; `POST /data/datasets/:id/sync` (with `{ mode }` body); `POST /data/datasets/:id/sync-runs/:runId/retry`; `PATCH /data/datasets/:id`; `PATCH /data/datasets/:id/schema-columns` (EP-DATA-40)
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
