## Module: Data

`@Controller('data')`

### Legacy CSV Endpoints

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-01 | POST | /api/v1/data/upload/file | JWT | `multipart/form-data` file (CSV, max 50 MB) | 202 `{ fileId, jobId, status }` | SVC-DATA.uploadFile() | Async; rejects non-CSV / >50 MB |
| EP-DATA-02 | POST | /api/v1/data/upload/initiate | JWT | `InitiateUploadDto` { filename, fileSizeBytes, mimeType } | 201 `{ fileId, uploadUrl, uploadId }` | SVC-DATA.initiateUpload() | Legacy presigned-URL flow |
| EP-DATA-03 | POST | /api/v1/data/upload/:fileId/complete | JWT | `:fileId` · `CompleteUploadDto` { storageKey } | 202 `{ fileId, jobId, status }` | SVC-DATA.completeUpload() | Async |
| EP-DATA-04 | GET | /api/v1/data/files | JWT | query: page, limit, search, status | 200 `Paginated<CsvFileListItemDto>` | SVC-DATA.listFiles() | |
| EP-DATA-05 | GET | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 `CsvFileDetailsDto` | SVC-DATA.getFile() | Includes `columns: ColumnMetadataDto[]` |
| EP-DATA-06 | PATCH | /api/v1/data/files/:fileId/columns | JWT | `:fileId` · `UpdateColumnsDto` { columns: [{ columnId, userDescription }] } | 200 `CsvFileDetailsDto` | SVC-DATA.updateColumns() | |
| EP-DATA-07 | DELETE | /api/v1/data/files/:fileId | JWT | `:fileId` param | 200 delete result | SVC-DATA.deleteFile() | Removes file, rows, columns |
| EP-DATA-08 | POST | /api/v1/data/files/:fileId/analyze/retry | JWT | `:fileId` param | 202 `{ jobId, status }` | SVC-DATA.retryAnalysis() | Async |

### DataConnection Endpoints *(change-015)*

`@Controller('data/connections')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-09 | POST | /api/v1/data/connections | JWT | `CreateDataConnectionDto` { name, sourceType, credentials } | 201 `DataConnectionDto` | SVC-DATA-CONN.create() | Credentials encrypted before persist; never returned |
| EP-DATA-10 | GET | /api/v1/data/connections | JWT | query: page, limit, sourceType | 200 `Paginated<DataConnectionListItemDto>` | SVC-DATA-CONN.list() | No credentials in response |
| EP-DATA-11 | GET | /api/v1/data/connections/:id | JWT | `:id` | 200 `DataConnectionDto` | SVC-DATA-CONN.get() | |
| EP-DATA-12 | PATCH | /api/v1/data/connections/:id | JWT | `:id` · `UpdateDataConnectionDto` | 200 `DataConnectionDto` | SVC-DATA-CONN.update() | Re-encrypts if credentials changed |
| EP-DATA-13 | DELETE | /api/v1/data/connections/:id | JWT | `:id` | 204 | SVC-DATA-CONN.delete() | Blocked if active datasets reference it |
| EP-DATA-14 | POST | /api/v1/data/connections/:id/test | JWT | `:id` | 200 `{ ok: boolean, error?: string, testedAt: Date }` | SVC-DATA-CONN.testConnection() | |

### Dataset Endpoints *(change-015, updated change-022)*

`@Controller('data/datasets')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-15 | POST | /api/v1/data/datasets | JWT | `CreateDatasetDto` { connectionId, name, semanticFlag?, extractOptions? } | 201 `DatasetDto` | SVC-DATA-DS.create() | For CSV: auto-triggers `discoverSchemaWithAiProposal` *(change-022)* |
| EP-DATA-16 | GET | /api/v1/data/datasets | JWT | query: page, limit, connectionId, semanticFlag, syncStatus | 200 `Paginated<DatasetListItemDto>` | SVC-DATA-DS.list() | |
| EP-DATA-17 | GET | /api/v1/data/datasets/:id | JWT | `:id` | 200 `DatasetDto` | SVC-DATA-DS.get() | Includes schema, aiProposedMapping, aiProposedSemanticFlag, last sync info |
| EP-DATA-18 | PATCH | /api/v1/data/datasets/:id | JWT | `:id` · `UpdateDatasetDto` { name?, description?, extractOptions? } | 200 `DatasetDto` | SVC-DATA-DS.update() | Mapping changes via EP-DATA-23 (confirm); this endpoint does NOT update columnMapping directly |
| EP-DATA-19 | DELETE | /api/v1/data/datasets/:id | JWT | `:id` | 204 | SVC-DATA-DS.delete() | Drops OLAP table + FilterValueMeta |
| EP-DATA-20 | POST | /api/v1/data/datasets/:id/sync | JWT | `:id` · `SyncDatasetDto` { mode: 'full' \| 'incremental' } | 202 `{ syncRunId, status }` | SVC-DATA-DS.enqueueSyncJob() | Async; blocked if already syncing |
| EP-DATA-21 | GET | /api/v1/data/datasets/:id/sync-history | JWT | `:id` · query: page, limit | 200 `Paginated<SyncRunDto>` | SVC-DATA-DS.listSyncHistory() | |
| EP-DATA-22 | POST | /api/v1/data/datasets/:id/discover-schema | JWT | `:id` | 200 `DatasetDto` | SVC-DATA-DS.discoverSchemaWithAiProposal() | Re-discovers schema + refreshes AI mapping proposal *(change-022)* |
| EP-DATA-23 | POST | /api/v1/data/datasets/:id/confirm-mapping | JWT | `:id` · `ConfirmMappingDto` { columnMapping: Record<string,string>, semanticFlag: string } | 200 `DatasetDto` | SVC-DATA-DS.confirmMapping() | Promotes mapping into live fields; clears AI proposals *(change-022)* |

### Google Sheets OAuth Endpoints *(change-023)*

`@Controller('data/google')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-24 | GET | /api/v1/data/google/auth-url | JWT | query: `workspaceSlug` | 200 `{ authUrl: string }` | GoogleOAuthService.buildAuthUrl() | Returns Google OAuth consent URL; `state` param encodes workspaceSlug + userId + CSRF nonce |
| EP-DATA-25 | GET | /api/v1/data/google/callback | Public | query: `code`, `state` | 302 → `/app/data/google-sheets/setup/:connectionId` | GoogleOAuthService.handleCallback() | Exchanges code for tokens; encrypts + stores as new `DataConnection(sourceType=google_sheets)`; redirects to frontend setup page |

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
- [EP-DATA-15] For CSV datasets, after creating the Dataset record the backend automatically triggers schema discovery + AI mapping proposal. The response includes `aiProposedMapping` and `aiProposedSemanticFlag` for user review.
- [EP-DATA-20] Creates a `SyncRun` record immediately and returns `syncRunId`; actual sync runs asynchronously via BullMQ `DATA_SYNC_QUEUE`.
- [EP-DATA-22] Can be called again at any time to refresh schema (e.g. after re-uploading a CSV). Re-runs connector `discoverSchema` + AI proposal. Clears previous proposal.
- [EP-DATA-23] User confirms (or edits) the AI-proposed mapping. Only after this call does the Dataset become eligible for dashboard generation.
- [EP-DATA-24] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (stored in Redis with 10-minute TTL for CSRF validation in EP-DATA-25).
- [EP-DATA-25] Public endpoint (callback from Google) — validates `state` nonce, exchanges `code` via `OAuth2Client`, encrypts `{ accessToken, refreshToken }` as `DataConnection.credentialsEncrypted`, then redirects frontend to spreadsheet picker page.
- [EP-DATA-26] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min for CSRF validation in EP-DATA-27). `shopDomain` is normalised to `{shop}.myshopify.com`.
- [EP-DATA-27] Public callback: validates Shopify-signed HMAC on query params + validates state nonce; exchanges `code` for permanent offline access token; stores DataConnection; calls `ShopifyOAuthService.registerWebhooks()`; redirects to `/app/data/shopify/setup/:connectionId`.
- [EP-DATA-28] Public webhook receiver: validates `X-Shopify-Hmac-Sha256` using raw body + `shopify.webhookSecret`; maps `X-Shopify-Topic` (e.g. `orders/create`) to the corresponding Dataset for the store's DataConnection; enqueues `DATA_SYNC_QUEUE` with `mode=incremental`. Returns 200 immediately (async processing).
- [EP-DATA-29] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min). Salla authorization URL: `https://accounts.salla.sa/oauth2/auth`.
- [EP-DATA-30] Public callback: validates state nonce; `POST https://accounts.salla.sa/oauth2/token` with `grant_type=authorization_code`; encrypts `{ accessToken, refreshToken, expiresAt }` as `DataConnection.credentialsEncrypted(sourceType=salla)`; calls `SallaDatasetService.provisionFromOAuth()` to create 3 Datasets; redirects to `/app/data/salla/setup/:connectionId`.
- [EP-DATA-31] Public webhook receiver: validates `X-Salla-Signature` HMAC-SHA256 using app secret; maps Salla event topic (e.g. `order.created`) to entity type → Dataset; enqueues `DATA_SYNC_QUEUE` with `mode=incremental`. Returns 200 immediately.

### Zid OAuth + Webhook Endpoints *(change-026)*

`@Controller('data/zid')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-DATA-32 | GET | /api/v1/data/zid/auth-url | JWT | — | 200 `{ authUrl: string }` | ZidOAuthService.buildAuthUrl() | Returns Zid OAuth consent URL; `state` encodes workspaceSlug+userId+nonce |
| EP-DATA-33 | GET | /api/v1/data/zid/callback | Public | query: `code`, `state` | 302 → `/app/data/zid/setup/:connectionId` | ZidController.handleCallback() | Validates state nonce; exchanges code for dual tokens; encrypts + stores DataConnection; provisions 3 Datasets; redirects |
| EP-DATA-34 | POST | /api/v1/data/zid/webhook | Public | body: Zid event payload; header: `X-Zid-Signature` | 200 | ZidController.handleWebhook() | Validates HMAC-SHA256; maps event topic → entity → Dataset; enqueues incremental sync |
- [EP-DATA-32] `state` payload includes `workspaceSlug`, `userId`, and a random nonce (Redis TTL 10 min). Zid authorization URL: `https://oauth.zid.sa`.
- [EP-DATA-33] Public callback: validates state nonce; `POST https://oauth.zid.sa/oauth/token` with `grant_type=authorization_code`; encrypts both tokens `{ authorizationToken, accessToken, expiresAt }` as `DataConnection.credentialsEncrypted(sourceType=zid)`; calls `ZidDatasetService.provisionFromOAuth()` to create 3 Datasets; redirects to `/app/data/zid/setup/:connectionId`.
- [EP-DATA-34] Public webhook receiver: validates `X-Zid-Signature` HMAC-SHA256 using app secret; maps Zid event topic (e.g. `order.create`) to entity → Dataset; enqueues `DATA_SYNC_QUEUE` with `mode=incremental`. Returns 200 immediately.
