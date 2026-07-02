## Module: Connectors

### SVC-CONN-REG · ConnectorRegistry [internal, domain, Connectors] *(change-018)*
Registry that maps `DataSourceType` values to concrete `ConnectorInterface` implementations.

**Methods:**
- `register(type: DataSourceType, connector: ConnectorInterface): void` — called by each connector's `onModuleInit()`
- `resolve(type: DataSourceType): ConnectorInterface` — returns the registered connector; throws `UnknownConnectorError` for unregistered types

**Deps:** none (pure registry; concrete connectors self-register)
**Rules:** Adding a new data source only requires implementing `ConnectorInterface` and calling `registry.register()` — zero changes to the engine · `resolve()` on unknown type throws a typed error (never returns null)

---

### SVC-CONN-CSV · CsvConnector [internal, domain, Connectors] *(change-022 — implemented)*
`ConnectorInterface` implementation for `csv` source type. Reads CSV data from Cloudflare R2 storage.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → gets `storageKey` → calls `StorageProvider.exists(key)` → returns `{ ok: boolean, message? }`
- `discoverSchema(conn, dataset)` — downloads CSV header + first 500 rows from R2; infers column types (number / boolean / date / datetime / string) from sample; returns `DiscoveredColumn[]`
- `extract(conn, dataset, opts: ExtractOptions)` — streams all rows from R2 in configurable page sizes (default 2000 rows/batch); incremental mode not supported for CSV (falls back to full with a warning); yields `Record<string, unknown>[]` batches
- `normalize(rows, schema: DiscoveredColumn[])` — casts each value to its inferred type per schema column; drops columns absent from schema; returns normalized rows

**CSV DataConnection credentials shape:**
```json
{ "storageKey": "uploads/{workspaceSlug}/{uuid}.csv" }
```

**Deps:** ConnectorRegistry · STORAGE_PROVIDER · ConfigService
**Side effects:** R2 downloads only (no writes)
**Rules:** Never loads the entire file into memory simultaneously — processes in streaming batches · `normalize()` is a pure function (no I/O) · Incremental mode logs a warning and falls back to full sync

---

### SVC-CONN-GOOGLE · GoogleSheetsConnector [internal, domain, Connectors] *(change-023)*
`ConnectorInterface` implementation for `google_sheets` source type. Reads tabular data from a Google Sheets spreadsheet via the Sheets API v4.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → creates `OAuth2Client` → calls `sheets.spreadsheets.get(spreadsheetId)` → returns `{ ok, message? }`; auto-refreshes access token if expired and persists updated token
- `discoverSchema(conn, dataset)` — reads header row (row 1) + up to 500 sample rows from the configured sheet/range; infers column types from samples; returns `DiscoveredColumn[]`
- `extract(conn, dataset, opts: ExtractOptions)` — pages through sheet rows in 10 000-row batches using `sheets.spreadsheets.values.get` with `ROWS` major dimension; yields `Record<string, unknown>[]` batches; incremental not supported (full re-read each sync); detects column-set change vs stored schema and surfaces drift in context
- `normalize(rows, schema: DiscoveredColumn[])` — casts each cell to its inferred type; drops columns absent from schema; returns normalized rows

**Google Sheets DataConnection credentials shape:**
```json
{
  "accessToken": "ya29...",
  "refreshToken": "1//0g...",
  "spreadsheetId": "1BxiMVs0X...",
  "sheetTitle": "Sheet1",
  "range": "A:Z"
}
```

**Deps:** ConnectorRegistry · GoogleOAuthService · DataConnectionRepository (token refresh write-back)
**Side effects:** Sheets API reads only (no writes) · token refresh writes updated `accessToken` back to `DataConnection.credentialsEncrypted`
**Rules:** Always refresh token before each API call (use `OAuth2Client.getAccessToken()`) · Detect column-set drift on every extract; surface as SyncRun warning (not a hard failure) · Incremental mode logs a warning and falls back to full sync

---

### SVC-CONN-SHOPIFY · ShopifyConnector [internal, domain, Connectors] *(change-024)*
`ConnectorInterface` implementation for `shopify` source type. Reads e-commerce entities (orders, products, customers) from a Shopify store via the Admin REST API v2024-01.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → calls `GET /admin/api/.../shop.json` → returns `{ ok, message? }`
- `discoverSchema(conn, dataset)` — fetches 1 sample record for `dataset.extractOptions.entity`; maps Shopify field names to `DiscoveredColumn[]`; returns static schema (Shopify field set is known at design time, not runtime-discovered)
- `extract(conn, dataset, opts: ExtractOptions)` — paginates `GET /orders.json`, `/products.json`, or `/customers.json` using cursor-based `page_info`; for incremental uses `updated_at_min=watermark`; yields batches of 250 rows; rate-limited to ≤2 req/s via `ShopifyRateLimiter`
- `normalize(rows, schema: DiscoveredColumn[])` — flattens nested Shopify objects (e.g. `line_items`, `customer.email`); casts types; drops unmapped fields

**Shopify DataConnection credentials shape:**
```json
{
  "shopDomain": "my-store.myshopify.com",
  "accessToken": "shpua_...",
  "webhookSecret": "..."
}
```

**Deps:** ConnectorRegistry · ShopifyApiClient · ShopifyRateLimiter · DataConnectionRepository
**Side effects:** Shopify REST API reads only (no writes) · webhook registration on first connect
**Rules:** Never query Shopify at widget render time — all data in OLAP · Rate limit: ≤2 req/s leaky bucket · Incremental uses `updated_at_min` watermark · Full sync for `products` and `customers` uses cursor pagination; `orders` limited to last 60 days by default

---

### SVC-CONN-SHOPIFY-OAUTH · ShopifyOAuthService [internal, domain, Connectors] *(change-024)*
Shopify Partner App OAuth 2.0 flow for data connections.

**Methods:**
- `buildInstallUrl(shopDomain: string, state: string): string` — returns Shopify OAuth install URL with HMAC signature, requested scopes, and `state` for CSRF
- `exchangeCode(shopDomain: string, code: string, state: string, storedState: string): Promise<{ accessToken: string }>` — validates state, exchanges code for permanent offline access token; Shopify offline tokens never expire
- `registerWebhooks(shopDomain: string, accessToken: string): Promise<void>` — subscribes to `orders/create`, `orders/updated`, `products/create`, `products/updated`, `customers/create`, `customers/updated` via `POST /webhooks.json`

**Deps:** ConfigService (shopify.apiKey, shopify.apiSecret, shopify.scopes) · ShopifyApiClient
**Rules:** HMAC validation on all incoming webhook requests · State nonce validated before code exchange · Webhook registration is idempotent

---

### SVC-CONN-SHOPIFY-DS · ShopifyDatasetService [internal, application, Data] *(change-024)*
Creates one `Dataset` per selected Shopify entity from a single `DataConnection`.

**Methods:**
- `createEntityDatasets(workspaceSlug: string, connectionId: string, userId: string, entities: ('orders' | 'products' | 'customers')[])` — for each entity: creates a `Dataset` with `semanticFlag = entity`, runs `discoverSchemaWithAiProposal()`, returns array of created Dataset records

**Deps:** DatasetService · DatasetRepository · DataConnectionService
**Rules:** Each entity → independent Dataset (separate OLAP table) · Canonical views include all entity tables across connectors

---

### SVC-CONN-SALLA · SallaConnector [internal, domain, Connectors] *(change-025)*
`ConnectorInterface` implementation for `salla` source type. Reads e-commerce entities (orders, products, customers) from a Salla store via the Merchant API v2.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → calls `GET /admin/v2/store` → returns `{ ok, message? }`; auto-refreshes access token if expired
- `discoverSchema(conn, dataset)` — returns static `DiscoveredColumn[]` for `dataset.sourceRef` entity (field set known at design time)
- `extract(conn, dataset, opts: ExtractOptions)` — paginates `GET /orders`, `/products`, or `/customers` using page-number pagination (`?page=N&per_page=60`); for incremental uses `updated_at_min` (orders) or falls back to full; yields batches; rate-limited via `SallaRateLimiter`; auto-refreshes token on 401
- `normalize(rows, schema: DiscoveredColumn[])` — flattens Salla nested objects; casts types; drops unmapped fields

**Salla DataConnection credentials shape:**
```json
{
  "accessToken": "ory_at_...",
  "refreshToken": "ory_rt_...",
  "expiresAt": "ISO8601"
}
```

**Deps:** ConnectorRegistry · SallaApiClient · SallaRateLimiter · DataConnectionRepository
**Side effects:** Salla API reads only · token refresh writes updated credentials back to `DataConnection.credentialsEncrypted`
**Rules:** Auto-refresh token when expired (TTL 14 days) · Rate limit: ≤8 req/s general, ≤1 req/s for `/customers` · Page-number pagination: iterate pages 1..`totalPages` · `sourceRef` on Dataset stores entity name (`orders` | `products` | `customers`)

---

### SVC-CONN-SALLA-OAUTH · SallaOAuthService [internal, domain, Connectors] *(change-025)*
Salla Partner App OAuth 2.0 flow for data connections.

**Methods:**
- `buildAuthUrl(workspaceSlug: string, userId: string): string` — returns Salla OAuth authorization URL with `state` (encodes workspaceSlug+userId+nonce stored in Redis TTL 10 min)
- `exchangeCode(code: string, stateStr: string): Promise<{ workspaceSlug, userId, tokens }>` — validates nonce; `POST https://accounts.salla.sa/oauth2/token` with `grant_type=authorization_code`; returns `{ accessToken, refreshToken, expiresAt }`
- `refreshAccessToken(refreshToken: string): Promise<{ accessToken, expiresAt }>` — `POST https://accounts.salla.sa/oauth2/token` with `grant_type=refresh_token`
- `validateWebhookHmac(rawBody: Buffer, signature: string): boolean` — HMAC-SHA256 using `SALLA_APP_SECRET`

**Deps:** ConfigService (salla.appId, salla.appSecret, salla.callbackUrl) · ioredis
**Rules:** Nonce validated before code exchange · Webhook HMAC checked on all incoming events · Token refresh called by `SallaApiClient` on 401

---

### SVC-CONN-SALLA-DS · SallaDatasetService [internal, application, Data] *(change-025)*
Creates one `Dataset` per selected Salla entity from a single `DataConnection`.

**Methods:**
- `provisionFromOAuth(workspaceSlug, userId, tokens)` — creates `DataConnection(sourceType=salla)` with encrypted tokens; creates 3 Datasets (orders, products, customers) each with `sourceRef` set; runs `discoverSchemaWithAiProposal()` for each; enqueues initial full sync; returns `{ connectionId, datasetIds }`
- `applyWebhookEvent(workspaceSlug, topic, payload)` — maps Salla event topic to entity type; finds matching Datasets; enqueues incremental sync

**Deps:** DataConnectionService · DatasetRepository · DatasetService · SyncService
**Rules:** Each entity → independent Dataset (separate OLAP table) · Canonical views include both Salla and Shopify entity tables

---

### SVC-CONN-ZID · ZidConnector [internal, domain, Connectors] *(change-026)*
`ConnectorInterface` implementation for `zid` source type. Reads e-commerce entities (orders, products, customers) from a Zid store via the Merchant API v1.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → calls `GET /v1/managers/account/profile` with dual-header auth → returns `{ ok, message? }`
- `discoverSchema(conn, dataset)` — returns static `DiscoveredColumn[]` for `dataset.sourceRef` entity (field set known at design time)
- `extract(conn, dataset, opts: ExtractOptions)` — paginates `GET /managers/store/orders`, `/products`, or `/customers` using page-number pagination (`?page=N&per_page=100`); for incremental uses `updated_at_from` (orders only; others fall back to full); yields batches; rate-limited via `ZidRateLimiter` (1 req/s)
- `normalize(rows, schema: DiscoveredColumn[])` — flattens Zid nested objects; casts types; drops unmapped fields

**Zid DataConnection credentials shape:**
```json
{
  "authorizationToken": "Bearer eyJ...",
  "accessToken": "zid_mgr_...",
  "expiresAt": "ISO8601"
}
```

**Deps:** ConnectorRegistry · ZidApiClient · ZidRateLimiter
**Side effects:** Zid API reads only · no token refresh needed (TTL 1 year)
**Rules:** Both `Authorization` and `X-Manager-Token` headers required on every request · Rate limit: ≤1 req/s leaky bucket · `sourceRef` on Dataset stores entity name (`orders` | `products` | `customers`) · Incremental via `updated_at_from` for orders only

---

### SVC-CONN-ZID-OAUTH · ZidOAuthService [internal, domain, Connectors] *(change-026)*
Zid Partner App OAuth 2.0 flow for data connections.

**Methods:**
- `buildAuthUrl(workspaceSlug: string, userId: string): string` — returns Zid OAuth authorization URL (`https://oauth.zid.sa`) with `state` (encodes workspaceSlug+userId+nonce stored in Redis TTL 10 min)
- `exchangeCode(code: string, stateStr: string): Promise<{ workspaceSlug, userId, authorizationToken, accessToken, expiresAt }>` — validates nonce; `POST https://oauth.zid.sa/oauth/token` with `grant_type=authorization_code`; returns both tokens
- `validateWebhookHmac(rawBody: Buffer, signature: string): boolean` — HMAC-SHA256 using `ZID_APP_SECRET`

**Deps:** ConfigService (zid.appId, zid.appSecret, zid.callbackUrl) · ioredis
**Rules:** Nonce validated before code exchange · Webhook HMAC checked on all incoming events

---

### SVC-CONN-ZID-DS · ZidDatasetService [internal, application, Data] *(change-026)*
Creates one `Dataset` per Zid entity from a single `DataConnection`.

**Methods:**
- `provisionFromOAuth(workspaceSlug, userId, authorizationToken, accessToken, expiresAt)` — creates `DataConnection(sourceType=zid)` with encrypted dual-token credentials; creates 3 Datasets (orders, products, customers) each with `sourceRef` set; runs `discoverSchemaWithAiProposal()`; enqueues initial full sync; returns `{ connectionId, datasetIds }`
- `applyWebhookEvent(workspaceSlug, topic)` — maps Zid event topic to entity type; finds matching Datasets; enqueues incremental sync

**Deps:** DataConnectionService · DatasetRepository · DatasetService · SyncService
**Rules:** Each entity → independent Dataset (separate OLAP table) · Canonical views include Zid, Salla, and Shopify entity tables

---

### SVC-CONN-SQLSERVER · SqlServerConnector [internal, domain, Connectors] *(change-027)*
`ConnectorInterface` implementation for `sql_server` source type. Reads any user-selected table or view from a Microsoft SQL Server database using a read-only connection.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → opens a `mssql.ConnectionPool` → executes `SELECT 1` → closes pool; returns `{ ok, message? }`
- `discoverSchema(conn, dataset)` — queries `INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`; returns `DiscoveredColumn[]` with SQL type mapped to canonical type
- `extract(conn, dataset, opts: ExtractOptions)` — paginated `SELECT` with `OFFSET N ROWS FETCH NEXT 2000 ROWS ONLY`; for incremental uses `WHERE [watermarkCol] > @lastSync ORDER BY [watermarkCol]`; yields `Record<string, unknown>[]` batches; pool opened/closed per run
- `normalize(rows, schema: DiscoveredColumn[])` — casts SQL numeric/date types; returns normalized rows

**SQL Server DataConnection credentials shape:**
```json
{
  "host": "db.example.com",
  "port": 1433,
  "database": "sales_db",
  "username": "roya_readonly",
  "password": "...",
  "encrypt": true,
  "trustServerCertificate": false
}
```

**Deps:** ConnectorRegistry · SqlServerQueryBuilder
**Side effects:** DB reads only (no writes) · Connection pool opened and closed per sync run
**Rules:** All table/column identifiers quoted with `[brackets]` · Parameterized queries only — no string concatenation · Read-only credentials required · `trustServerCertificate` toggle exposed for dev/self-signed certs · Pagination via `OFFSET FETCH` (SQL Server 2012+)

---

### SVC-CONN-SQLSERVER-QB · SqlServerQueryBuilder [internal, utility, Connectors] *(change-027)*
Builds safe, parameterized SQL strings for SQL Server operations.

**Methods:**
- `buildSelectPage(table: string, watermarkCol?: string, page: number, pageSize: number): string` — returns paginated SELECT with optional WHERE watermark clause
- `buildSchemaQuery(table: string): string` — returns INFORMATION_SCHEMA columns query
- `buildTablesQuery(): string` — returns INFORMATION_SCHEMA tables/views listing query
- `buildPreviewQuery(table: string, topN = 50): string` — returns `SELECT TOP @n * FROM [table]`

**Rules:** All identifiers sanitized against schema whitelist before insertion into query strings · Never concatenates raw user input

---
Contract every data source adapter must implement.

```typescript
interface ConnectorInterface {
  testConnection(creds: Record<string, unknown>): Promise<{ ok: boolean; error?: string }>;
  discoverSchema(creds: Record<string, unknown>, opts?: Record<string, unknown>): Promise<ColumnSpec[]>;
  extract(creds: Record<string, unknown>, opts?: Record<string, unknown>): AsyncGenerator<Record<string, unknown>[]>;
  normalize(rows: Record<string, unknown>[], mapping: Record<string, string>): Record<string, unknown>[];
}
```
