## Module: Data (Multi-Source Data Management)

### Data Sources Home Page *(change-022)*
- Route: `/app/data`
- Components: DataSourcesPage — datasets table with columns: name, sourceType badge, semanticFlag badge, syncStatus badge, lastSyncAt, rowCount, actions (detail, sync, delete); "Add CSV Dataset" button; empty state with illustration
- Service: `GET /api/v1/data/datasets` (list); `DELETE /api/v1/data/datasets/:id`
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
