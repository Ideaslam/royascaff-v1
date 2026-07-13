## Module: Data

`@Controller('data')`

### Legacy CSV Endpoints

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-01 | POST | /api/v1/data/upload/file | JWT | `multipart/form-data` file (CSV / XLSX / XLS, max 50 MB) | 202 `{ fileId, jobId, status, storageKey, sheets?: string[] }` | SVC-DATA.uploadFile() | Async; rejects unsupported types / >50 MB; `sheets` populated for Excel files *(change-047)* |
| EP-DATA-02 | POST | /api/v1/data/upload/initiate | JWT | `InitiateUploadDto` { filename, fileSizeBytes, mimeType } | 201 `{ fileId, uploadUrl, uploadId }` | SVC-DATA.initiateUpload() | Legacy presigned-URL flow |
| EP-DATA-03 | POST | /api/v1/data/upload/:fileId/complete | JWT | `:fileId` · `CompleteUploadDto` { storageKey } | 202 `{ fileId, jobId, status }` | SVC-DATA.completeUpload() | Async |
| EP-DATA-04 | GET | /api/v1/data/files | JWT | query: page, limit, search, status | 200 `Paginated<CsvFileListItemDto>` | SVC-DATA.listFiles() | |
| EP-DATA-05 | GET | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 `CsvFileDetailsDto` | SVC-DATA.getFile() | Includes `columns: ColumnMetadataDto[]` |
| EP-DATA-06 | PATCH | /api/v1/data/files/:fileId/columns | JWT | `:fileId` · `UpdateColumnsDto` { columns: [{ columnId, userDescription }] } | 200 `CsvFileDetailsDto` | SVC-DATA.updateColumns() | |
| EP-DATA-07 | DELETE | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 delete result | SVC-DATA.deleteFile() | Removes file, rows, columns |
| EP-DATA-08 | POST | /api/v1/data/files/:fileId/analyze/retry | JWT | `:fileId` param | 202 `{ jobId, status }` | SVC-DATA.retryAnalysis() | Async |

### Connection Endpoints *(change-015, evolved change-059)*

`@Controller('data/connections')` — **auth-only** Connection management

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-09 | POST | /api/v1/data/connections | JWT | `CreateConnectionDto` { name, sourceType, credentials } | 201 `ConnectionDto` | SVC-DATA-CONN.create() | **Test must pass before persist**; auth-only credentials encrypted; never returned; rate-limited *(change-059)* |
| EP-DATA-10 | GET | /api/v1/data/connections | JWT | query: page, limit, search, sourceType, sort | 200 `Paginated<ConnectionListItemDto>` | SVC-DATA-CONN.list() | No credentials; optional `dataSourceCount` *(change-059)* |
| EP-DATA-11 | GET | /api/v1/data/connections/:id | JWT | `:id` | 200 `ConnectionDto` | SVC-DATA-CONN.get() | Safe display fields only |
| EP-DATA-12 | PATCH | /api/v1/data/connections/:id | JWT | `:id` · `UpdateConnectionDto` { name?, credentials?, status? } | 200 `ConnectionDto` | SVC-DATA-CONN.update() | Credential changes require successful test; rename/disable/enable |
| EP-DATA-13 | DELETE | /api/v1/data/connections/:id | JWT | `:id` | 204 \| 409 | SVC-DATA-CONN.delete() | **Blocked** if any Data Source references it *(change-059)* |
| EP-DATA-14 | POST | /api/v1/data/connections/:id/test | JWT | `:id` | 200 `{ ok: boolean, error?: string, testedAt: Date }` | SVC-DATA-CONN.testConnection() | Real connector test; rate-limited *(change-059)* |
| EP-DATA-50 | POST | /api/v1/data/connections/:id/reauth | JWT | `:id` · credentials or OAuth resume payload | 200 `ConnectionDto` | SVC-DATA-CONN.reauth() | Refresh expired OAuth/tokens in place; rate-limited *(change-059)* |

### Data Source Endpoints *(change-059)*

`@Controller('data/sources')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-51 | POST | /api/v1/data/sources | JWT | `CreateDataSourceDto` { name, connectionId?, sourceType, scope? } | 201 `DataSourceDto` | SVC-DATA-SOURCE.create() | `connectionId` required except CSV; `connectionId` immutable after create |
| EP-DATA-52 | GET | /api/v1/data/sources | JWT | query: page, limit, search, sourceType, sort | 200 `Paginated<DataSourceListItemDto>` | SVC-DATA-SOURCE.list() | Powers Data Sources home (table counts) |
| EP-DATA-53 | GET | /api/v1/data/sources/:id | JWT | `:id` | 200 `DataSourceDto` | SVC-DATA-SOURCE.get() | Includes Connection summary (no secrets) |
| EP-DATA-54 | PATCH | /api/v1/data/sources/:id | JWT | `:id` · `UpdateDataSourceDto` { name?, scope?, status? } | 200 `DataSourceDto` | SVC-DATA-SOURCE.update() | Rename / scope only — no rebind |
| EP-DATA-55 | DELETE | /api/v1/data/sources/:id | JWT | `:id` | 204 \| 409 | SVC-DATA-SOURCE.delete() | Cascade Tables+SyncRuns; **blocked** if dashboards use any child table |

### Dataset Endpoints *(change-015, updated change-022, change-059)*

`@Controller('data/datasets')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-15 | POST | /api/v1/data/datasets | JWT | `CreateDatasetDto` { dataSourceId, name, semanticFlag?, extractOptions? } | 201 `DatasetDto` | SVC-DATA-DS.create() | Uses `dataSourceId` *(change-059)*; CSV enqueues discovery *(change-058)* |
| EP-DATA-16 | GET | /api/v1/data/datasets | JWT | query: page, limit, dataSourceId, semanticFlag, syncStatus | 200 `Paginated<DatasetListItemDto>` | SVC-DATA-DS.list() | |
| EP-DATA-17 | GET | /api/v1/data/datasets/:id | JWT | `:id` | 200 `DatasetDto` | SVC-DATA-DS.get() | Includes schema, AI proposals, discovery status, `dataSourceId` |
| EP-DATA-18 | PATCH | /api/v1/data/datasets/:id | JWT | `:id` · `UpdateDatasetDto` { name?, description?, extractOptions? } | 200 `DatasetDto` | SVC-DATA-DS.update() | Mapping via EP-DATA-23 |
| EP-DATA-19 | DELETE | /api/v1/data/datasets/:id | JWT | `:id` | 204 \| 409 | SVC-DATA-DS.delete() | Drops OLAP + FilterValueMeta; block if dashboard-linked |
| EP-DATA-20 | POST | /api/v1/data/datasets/:id/sync | JWT | `:id` · body `{ mode?: 'full' \| 'incremental' }` | 202 `{ syncRunId, status }` | SVC-DATA-SYNC.triggerSync() | Async; blocked if syncing *(change-038)* |
| EP-DATA-21 | GET | /api/v1/data/datasets/:id/sync-history | JWT | `:id` · query: page, limit | 200 `Paginated<SyncRunDto>` | SVC-DATA-DS.listSyncHistory() | |
| EP-DATA-40 | PATCH | /api/v1/data/datasets/:id/schema-columns | JWT | `:id` · body `{ columns: [...] }` | 200 `DatasetDto` | SVC-DATA-DS.updateSchemaColumns() | *(change-038, change-055)* |
| EP-DATA-48 | POST | /api/v1/data/datasets/:id/confirm-schema-selection | JWT | `:id` · body `{ columns: [...] }` | 200 `DatasetDto` \| 400/409/422 | SVC-DATA-DS.confirmSchemaSelection() | *(change-055)* |
| EP-DATA-49 | POST | /api/v1/data/datasets/:id/refresh-available-columns | JWT | `:id` | 202 `DatasetDto` | SVC-DATA-DS.enqueueSchemaDiscovery(mode=`new-columns-only`) | *(change-055, change-058)* |
| EP-DATA-22 | POST | /api/v1/data/datasets/:id/discover-schema | JWT | `:id` | 202 `DatasetDto` | SVC-DATA-DS.enqueueSchemaDiscovery(mode=`full`) | *(change-022, change-055, change-058)* |
| EP-DATA-23 | POST | /api/v1/data/datasets/:id/confirm-mapping | JWT | `:id` · `ConfirmMappingDto` | 200 `DatasetDto` \| 422 `{ missing }` | SVC-DATA-DS.confirmMapping() | *(change-022, change-045)* |

### Google Sheets OAuth Endpoints *(change-023)*

`@Controller('data/google')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-24 | GET | /api/v1/data/google/auth-url | JWT | query: `workspaceSlug` | 200 `{ authUrl: string }` | GoogleOAuthService.buildAuthUrl() | Returns Google OAuth consent URL; `state` param encodes workspaceSlug + userId + CSRF nonce |
| EP-DATA-25 | GET | /api/v1/data/google/callback | Public | query: `code`, `state` | 302 → wizard with `connectionId` | GoogleOAuthService.handleCallback() | Exchanges code for tokens; encrypts + stores as new **Connection** (auth only); rate-limited; redirects to choose-scope / select-entities *(change-059)* |

### Shopify OAuth + Webhook Endpoints *(change-024)*

`@Controller('data/shopify')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-26 | GET | /api/v1/data/shopify/install-url | JWT | query: `shopDomain` | 200 `{ installUrl: string }` | ShopifyOAuthService.buildInstallUrl() | Shopify OAuth install URL with HMAC; `state` encodes workspaceSlug+userId+nonce |
| EP-DATA-27 | GET | /api/v1/data/shopify/callback | Public | query: `code`, `shop`, `state`, `hmac` | 302 → `/app/data/shopify/setup/:connectionId` | ShopifyOAuthService.handleCallback() | Validates HMAC + state; exchanges code; stores DataConnection; registers webhooks; redirects |
| EP-DATA-28 | POST | /api/v1/data/shopify/webhook | Public | body: Shopify event payload; header: `X-Shopify-Hmac-Sha256`, `X-Shopify-Topic` | 200 | ShopifyController.handleWebhook() | Validates HMAC; maps topic → entity → dataset; enqueues incremental sync |

### Salla OAuth + Webhook Endpoints *(change-025)*

`@Controller('data/salla')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-29 | GET | /api/v1/data/salla/auth-url | JWT | — | 200 `{ authUrl: string }` | SallaOAuthService.buildAuthUrl() | Returns Salla OAuth consent URL; `state` encodes workspaceSlug+userId+nonce |
| EP-DATA-30 | GET | /api/v1/data/salla/callback | Public | query: `code`, `state` | 302 → `/app/data/salla/setup/:connectionId` | SallaController.handleCallback() | Validates state nonce; exchanges code for tokens; encrypts + stores DataConnection; provisions 3 Datasets; redirects |
| EP-DATA-31 | POST | /api/v1/data/salla/webhook | Public | body: Salla event payload; header: `X-Salla-Signature` | 200 | SallaController.handleWebhook() | Validates HMAC-SHA256; maps event topic → entity → Dataset; enqueues incremental sync |

**Notes:**
- [EP-DATA-01] Single-step upload: frontend sends file as multipart, backend streams to R2, creates `csvfiles` record, queues AI column analysis job.
- [EP-DATA-02] Legacy presigned-URL flow: creates a `csvfiles` record and returns a presigned upload URL plus upload session id for direct client-to-R2 upload.
- [EP-DATA-06] Accepts array of column updates setting each column's `userDescription`. When all columns confirmed, file becomes eligible for dashboard generation.
- [EP-DATA-09] Credentials are accepted in plain text over HTTPS, then immediately encrypted with AES-256-GCM before persisting. Never stored or returned in plaintext.
- [EP-DATA-15] For CSV datasets, after creating the Dataset record the backend **enqueues** schema discovery + AI mapping proposal *(change-058)*. Client polls Dataset `schemaDiscoveryStatus` before schema-review.
- [EP-DATA-20] Creates a `SyncRun` record immediately and returns `syncRunId`; actual sync runs asynchronously via BullMQ `DATA_SYNC_QUEUE`. The `mode` parameter defaults to `'full'` if omitted; incremental sync requires a PK column to be meaningful but is not server-enforced.
- [EP-DATA-40] Patches `availableColumns` (userDescription; isPrimaryKey; isSelected/selectionOrder). Exclusive PK. Rejects `isSelected: true` on `blocked` columns. Does not prune live `schema` — use EP-DATA-48.
- [EP-DATA-48] Atomic confirm of column selection: ≥1 selected; `blocked` never selected; deselecting PK requires another selected PK; deselecting a mandatory mapped column → 422; while `syncStatus = syncing` → 409; success writes pruned `schema`, updates `availableColumns` flags, audits; failure leaves schema unchanged.
- [EP-DATA-49] Enqueues Add-column rediscovery (202); AI for new cols only runs in worker; user must confirm selection (EP-DATA-48) then manual sync for OLAP data *(change-058)*.
- [EP-DATA-22] Enqueues full rediscovery (202); also Retry for `failed` discovery. Worker writes `availableColumns`, runs column-identify + mapping proposal. Does not silently replace a confirmed pruned `schema` without merge rules *(change-058)*.
- [EP-DATA-23] User confirms (or edits) the AI-proposed mapping. Only after this call does the Dataset become eligible for dashboard generation. *(change-045)* Validation is user-friendly: the server computes the set of required canonical fields for `semanticFlag` and returns `422 { missing: [...] }` when any are unmapped; the frontend disables Confirm and highlights the missing rows rather than surfacing a raw 400.
- [EP-DATA-24] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (stored in Redis with 10-minute TTL for CSRF validation in EP-DATA-25).
- [EP-DATA-25] Public endpoint (callback from Google) — validates `state` nonce, exchanges `code` via `OAuth2Client`, encrypts `{ accessToken, refreshToken }` as `DataConnection.credentialsEncrypted`, then redirects frontend to spreadsheet picker page.
- [EP-DATA-26] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min for CSRF validation in EP-DATA-27). `shopDomain` is normalised to `{shop}.myshopify.com`.
- [EP-DATA-27] Public callback: validates Shopify-signed HMAC on query params + validates state nonce; exchanges `code` for permanent offline access token; stores DataConnection; calls `ShopifyOAuthService.registerWebhooks()`; redirects to `/app/data/shopify/setup/:connectionId`.
- [EP-DATA-28] Public webhook receiver: validates `X-Shopify-Hmac-Sha256` using raw body + `shopify.webhookSecret`; uses `X-Shopify-Shop-Domain` header to resolve `workspaceSlug` via `WebhookRouteService`; calls `ShopifyDatasetService.applyWebhookEvent()` to enqueue incremental sync. Returns 200 immediately. *(change-042)*
- [EP-DATA-29] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min). Salla authorization URL: `https://accounts.salla.sa/oauth2/auth`.
- [EP-DATA-30] Public callback: validates state nonce; `POST https://accounts.salla.sa/oauth2/token` with `grant_type=authorization_code`; encrypts `{ accessToken, refreshToken, expiresAt }` as `DataConnection.credentialsEncrypted(sourceType=salla)`; redirects to the shared setup wizard at the `select-entities` step. *(change-045)* The callback no longer auto-provisions all 3 Datasets — the user picks which entities (orders/products/customers) to import in the wizard, and Datasets are created from that selection.
- [EP-DATA-31] Public webhook receiver: validates `X-Salla-Signature` HMAC-SHA256 using app secret; extracts `event.merchant_id` from JSON body; resolves `workspaceSlug` via `WebhookRouteService`; calls `SallaDatasetService.applyWebhookEvent()` to enqueue incremental sync. Returns 200 immediately. *(change-042)*

### Zid OAuth + Webhook Endpoints *(change-026)*

`@Controller('data/zid')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-32 | GET | /api/v1/data/zid/auth-url | JWT | — | 200 `{ authUrl: string }` | ZidOAuthService.buildAuthUrl() | Returns Zid OAuth consent URL; `state` encodes workspaceSlug+userId+nonce |
| EP-DATA-33 | GET | /api/v1/data/zid/callback | Public | query: `code`, `state` | 302 → `/app/data/zid/setup/:connectionId` | ZidController.handleCallback() | Validates state nonce; exchanges code for dual tokens; encrypts + stores DataConnection; provisions 3 Datasets; redirects |
| EP-DATA-34 | POST | /api/v1/data/zid/webhook | Public | body: Zid event payload; header: `X-Zid-Signature` | 200 | ZidController.handleWebhook() | Validates HMAC-SHA256; maps event topic → entity → Dataset; enqueues incremental sync |
- [EP-DATA-32] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min). Zid authorization URL: `https://oauth.zid.sa`.
- [EP-DATA-33] Public callback: validates state nonce; `POST https://oauth.zid.sa/oauth/token` with `grant_type=authorization_code`; encrypts both tokens `{ authorizationToken, accessToken, expiresAt }` as `DataConnection.credentialsEncrypted(sourceType=zid)`; redirects to the shared setup wizard at the `select-entities` step. *(change-045)* The callback no longer auto-provisions all 3 Datasets — the user picks which entities to import (with a live progress loader while Zid tables are listed), and Datasets are created from that selection.
- [EP-DATA-34] Public webhook receiver: validates `X-Zid-Signature` HMAC-SHA256 using app secret; parses JSON body; extracts Zid store ID → resolves `workspaceSlug` via `WebhookRouteService`; calls `ZidDatasetService.applyWebhookEvent(workspaceSlug, topic)` to enqueue incremental sync for matching datasets. Returns 200 immediately (even if workspace not found). *(change-042)*

### Zid Install Endpoint *(change-044)*

`@Controller('data/zid')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-35 | GET | /api/v1/data/zid/install | Public | — | 302 | ZidController.handleInstall() | Zid Redirection URL target; redirects to `/app/zid-install` for unauthenticated merchants |

- [EP-DATA-35] Public endpoint used as the **Redirection URL** in the Zid Partner Dashboard. When a merchant clicks Install from the Zid App Market, Zid redirects here. The endpoint always redirects to `{frontendUrl}/app/zid-install` so the frontend can handle login/signup before initiating OAuth.

### SQL Server — Table Discovery + Preview Endpoints *(change-027)*

`@Controller('data/connections')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-35 | POST | /api/v1/data/connections/:id/sql-server/tables | JWT | body: `{}` | 200 `{ tables: { name, type, columnCount }[] }` | SqlServerController.listTables() | Decrypts credentials; queries INFORMATION_SCHEMA.TABLES; returns table/view list for wizard table picker |
| EP-DATA-36 | POST | /api/v1/data/connections/:id/sql-server/preview | JWT | body: `{ table: string; limit?: number }` | 200 `{ columns: string[]; rows: unknown[][] }` | SqlServerController.previewTable() | Returns top-N rows (default 50) for a specified table; used only during setup wizard; never called at dashboard render time |

- [EP-DATA-35] Requires the DataConnection to have `sourceType = sql_server`. Opens a pool, queries `INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE IN ('BASE TABLE','VIEW')`, returns sorted list. Validates that the requesting user owns the DataConnection (workspaceSlug check).
- [EP-DATA-36] Opens pool, runs `SELECT TOP @n * FROM [table]`; table name validated against INFORMATION_SCHEMA whitelist before use. Max limit capped at 200.

---

### MongoDB Atlas — Collection Discovery + Preview Endpoints *(change-028)*

`@Controller('data/connections')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-37 | POST | /api/v1/data/connections/:id/mongodb/collections | JWT | body: `{}` | 200 `{ collections: { name, type }[] }` | MongoDbAtlasController.listCollections() | Decrypts URI; calls `db.listCollections()`; returns all user-defined collections+views for wizard picker |
| EP-DATA-38 | POST | /api/v1/data/connections/:id/mongodb/preview | JWT | body: `{ collection: string; limit?: number }` | 200 `{ columns: string[]; rows: unknown[][] }` | MongoDbAtlasController.previewCollection() | Returns top-N flattened documents (default 50, max 200); used only during setup wizard |

- [EP-DATA-37] Requires `sourceType = mongodb_atlas`. Connects with `MongoClient`, calls `db.listCollections({ nameOnly: false }).toArray()`; excludes system collections. Validates workspaceSlug ownership.
- [EP-DATA-38] `collection.find({}).limit(n)` with `flattenDocument()` applied; extracts union of all column names from returned docs. Max limit capped at 200.

---

### Cross-Cutting Sync Ops — Retry + Health Endpoints *(change-029)*

`@Controller('data')` (sync retry) · `@Controller('admin')` (health)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-39 | POST | /api/v1/data/datasets/:id/sync-runs/:runId/retry | JWT | `:id`, `:runId` | 200 `{ syncRunId, queued: true }` | SyncService.retryRun() | Re-queues a FAILED sync run as a new full-sync job; validates run belongs to dataset and is in FAILED status |
| EP-ADMIN-SH-1 | GET | /api/v1/admin/data/sync-health | JWT+admin | query: `?limit=50` | 200 `{ sources: SourceHealthDto[] }` | AdminSyncHealthController | Returns per-workspace per-sourceType last-run summary; status, lastSyncAt, rowsLoaded, errorMessage |

- [EP-DATA-39] Loads the `SyncRun` by `runId`; validates `status === 'failed'`; calls `SyncService.retryRun(workspaceSlug, runId)` which creates a new `SyncRun` record and enqueues a fresh BullMQ job for the same dataset in `FULL` mode. Returns new `syncRunId`.
- [EP-ADMIN-SH-1] Admin-only endpoint. Queries `SyncRun` across all workspaces for the most recent run per dataset; groups by `sourceType`; returns summary sorted by most-recent failure first.

---

### Data Source Grouping, Entity Selection & Progress Endpoints *(change-045, change-059)*

`@Controller('data')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-41 | GET | /api/v1/data/setup-flow | JWT | query: `sourceType` | 200 `{ steps: WizardStep[] }` | SVC-PIPE-TYPE-REG.getSetupFlow() | Steps include `choose-connection` (non-CSV) then `connect`/`scope` \| `select-entities` \| `schema-review` \| `schedule` *(change-059)* |
| EP-DATA-42 | GET | /api/v1/data/sources/:id/datasets | JWT | `:id` · query: page, limit, `schemaDiscoveryBatchId?` | 200 `Paginated<DatasetListItemDto>` | SVC-DATA-DS.listByDataSource() | Tables under one Data Source *(change-045, change-058, change-059)* |
| EP-DATA-43 | GET | /api/v1/data/sources/:id/entities | JWT | `:id` | 200 `{ entities: ImportableEntityDto[] }` | SVC-DATA-DS.listDataSourceEntities() | Resolves Connection+scope; `listEntities()` *(change-059)* |
| EP-DATA-44 | POST | /api/v1/data/sources/:id/datasets/from-entities | JWT | `:id` · body `{ entities: [...] }` | 201 `{ datasetIds, createdIds, schemaDiscoveryBatchId }` | SVC-DATA-DS.createFromEntities() | Idempotent per `(dataSourceId, entity)`; enqueues parallel discovery *(change-045, change-058, change-059)* |
| EP-DATA-45 | GET | /api/v1/data/datasets/:id/sync-runs/:runId | JWT | `:id`, `:runId` | 200 `SyncRunDto` | SVC-DATA-SYNC.getRun() | Live progress/phase |
| EP-DATA-46 | POST | /api/v1/data/datasets/:id/propose-mapping | JWT | `:id` · `ProposeMappingDto` { semanticFlag } | 200 `{ semanticFlag, columnMapping }` | SVC-DATA-DS.proposeMappingForFlag() | *(change-045)* |

- [EP-DATA-41] Includes `choose-connection` for all non-CSV types so the wizard can pick/create a Connection before scope/entities *(change-059)*.
- [EP-DATA-42] Validates workspace ownership of the Data Source; optional `schemaDiscoveryBatchId` for wizard polling *(change-058)*.
- [EP-DATA-43] Uses Data Source → Connection credentials + scope for live entity listing.
- [EP-DATA-44] Keyed on `(dataSourceId, entity)`; non-destructive add-tables from detail page.
- [EP-DATA-45] ProgressLoader polls until terminal status.
- [EP-DATA-46] On-demand AI mapping; live mapping only on EP-DATA-23.

---

### Data Source Type Metadata Endpoints *(change-048)*

`@Controller('data')` (customer) · `@Controller('admin')` (admin CRUD)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-47 | GET | /api/v1/data/source-types | JWT (any role) | — | 200 `DatasourceTypeMetaDto[]` | SVC-DSTYPE.findAll(activeOnly=true) | Returns only `isActive = true` entries; used by customer portal to build picker and display labels/logos |
| EP-DSTYPE-01 | GET | /api/v1/admin/data-source-types | JWT + admin | — | 200 `DatasourceTypeMetaDto[]` | SVC-DSTYPE.findAll() | Returns all 7 entries including inactive |
| EP-DSTYPE-02 | GET | /api/v1/admin/data-source-types/:type | JWT + admin | `:type` (DataSourceType string) | 200 `DatasourceTypeMetaDto` | SVC-DSTYPE.findOne() | Single type; 404 if unknown |
| EP-DSTYPE-03 | PATCH | /api/v1/admin/data-source-types/:type | JWT + admin | `:type` · `UpdateDatasourceTypeMetaDto` { titleEn?, titleAr?, logoUrl?, instructionEn?, instructionAr? } | 200 `DatasourceTypeMetaDto` | SVC-DSTYPE.update() | Partial update; non-admin returns 403 |
| EP-DSTYPE-04 | PATCH | /api/v1/admin/data-source-types/:type/toggle | JWT + admin | `:type` | 200 `DatasourceTypeMetaDto` | SVC-DSTYPE.toggleActive() | Flips `isActive`; immediate effect on customer portal picker |

- [EP-DATA-47] Authenticated (any JWT role). Returns only active types so the customer portal picker does not show disabled types. Falls back gracefully — if the collection is empty (before seeding), returns an empty array and the frontend falls back to registry icons/labels.
- [EP-DSTYPE-01..04] Admin-only (role guard). No create/delete endpoints — the set of 7 types is fixed to the `DataSourceType` enum. PATCH is partial (undefined fields are not updated).

