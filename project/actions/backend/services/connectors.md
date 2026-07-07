## Module: Connectors

### SVC-CONN-REG · ConnectorRegistry [internal, domain, Connectors] *(change-018)*
Registry that maps `DataSourceType` values to concrete `ConnectorInterface` implementations.

**Methods:**
- `register(type: DataSourceType, connector: ConnectorInterface): void` — called by each connector's `onModuleInit()`
- `resolve(type: DataSourceType): ConnectorInterface` — returns the registered connector; throws `UnknownConnectorError` for unregistered types

**Deps:** none (pure registry; concrete connectors self-register)
**Rules:** Adding a new data source only requires implementing `ConnectorInterface` and calling `registry.register()` — zero changes to the engine · `resolve()` on unknown type throws a typed error (never returns null)

---

### SVC-CONN-CSV · CsvConnector [internal, domain, Connectors] *(change-022, updated change-047)*
`ConnectorInterface` implementation for `csv` source type. Reads CSV **and Excel (.xlsx / .xls)** data from Cloudflare R2 storage.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → gets `storageKey` → calls `StorageProvider.exists(key)` → returns `{ ok: boolean, message? }`
- `discoverSchema(conn, dataset)` — downloads file from R2; detects type by extension; for CSV: `csv-parse/sync` first 500 rows; for Excel: `exceljs.Workbook.xlsx.load()` reads the sheet named in credentials (`sheetName`) or first sheet; infers column types; returns `DiscoveredColumn[]`
- `extract(conn, dataset, opts: ExtractOptions)` — downloads file from R2; detects type; for CSV: streams rows in 2000-row batches; for Excel: reads all rows from target sheet, yields in 2000-row batches; incremental mode not supported (falls back to full with warning); yields `Record<string, unknown>[]` batches
- `normalize(rows, schema: DiscoveredColumn[])` — casts each value to its inferred type per schema column; drops columns absent from schema; returns normalized rows

**CSV/Excel DataConnection credentials shape:**
```json
{ "storageKey": "uploads/{workspaceSlug}/{uuid}.csv" }
{ "storageKey": "uploads/{workspaceSlug}/{uuid}.xlsx", "sheetName": "Sheet2" }
```
`sheetName` is optional; omitting it reads the first sheet for Excel files.

**Deps:** ConnectorRegistry · STORAGE_PROVIDER · ConfigService · exceljs (already installed)
**Side effects:** R2 downloads only (no writes)
**Rules:** Never loads the entire file into memory simultaneously — CSV processed in streaming batches; Excel loaded once then chunked · `normalize()` is a pure function (no I/O) · Incremental mode logs a warning and falls back to full sync · File type detected by `storageKey` extension (`.xlsx` / `.xls` → Excel; anything else → CSV)

---

### SVC-CONN-GOOGLE · GoogleSheetsConnector [internal, domain, Connectors] *(change-023, updated change-047)*
`ConnectorInterface` implementation for `google_sheets` source type. Reads tabular data from a Google Sheets spreadsheet via the Sheets API v4, with automatic Drive API fallback for Office files.

**Constructor:** self-registers with `ConnectorRegistry` on `onModuleInit()`

**Methods:**
- `testConnection(conn: DataConnectionDocument)` — decrypts credentials → creates `OAuth2Client` → calls `sheets.spreadsheets.get(spreadsheetId)` → returns `{ ok, message? }`; auto-refreshes access token if expired and persists updated token
- `discoverSchema(conn, dataset)` — attempts Sheets API v4 first; if API returns `FAILED_PRECONDITION` (code 400, Office file), falls back to `google.drive.files.export({ fileId, mimeType: 'text/csv' })`, parses CSV via `csv-parse/sync`, returns `DiscoveredColumn[]`; logs warn on fallback
- `extract(conn, dataset, opts: ExtractOptions)` — attempts Sheets API paging (10 000-row batches) first; on `FAILED_PRECONDITION` falls back to Drive API CSV export + `csv-parse`, yields batches; incremental not supported; drift detection applies only to Sheets API path
- `normalize(rows, schema: DiscoveredColumn[])` — casts each cell to its inferred type; drops columns absent from schema; returns normalized rows

**Google Sheets DataConnection credentials shape (unchanged):**
```json
{
  "accessToken": "ya29...",
  "refreshToken": "1//0g...",
  "spreadsheetId": "1BxiMVs0X...",
  "sheetTitle": "Sheet1",
  "range": "A:Z"
}
```
For Office files via Drive fallback, `sheetTitle` and `range` are ignored (Drive CSV export uses the default/first sheet).

**Deps:** ConnectorRegistry · GoogleOAuthService · DataConnectionRepository (token refresh write-back) · googleapis Drive v3 (already imported)
**Side effects:** Sheets API reads only (no writes) · token refresh writes updated `accessToken` back to `DataConnection.credentialsEncrypted`
**Rules:** `drive.readonly` scope already declared in `GoogleOAuthService` — no re-auth needed · Drive fallback triggered only on `FAILED_PRECONDITION` — native Sheets connections unaffected · Always refresh token before each API call · Detect column-set drift on every extract (Sheets path only) · Incremental mode logs a warning and falls back to full sync

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

### SVC-CONN-SHOPIFY-DS · ShopifyDatasetService [internal, application, Data] *(change-024, updated change-045)*
Creates one `Dataset` per **user-selected** Shopify entity from a single `DataConnection`.

**Methods:**
- `createEntityDatasets(workspaceSlug, connectionId, userId, entities: ('orders'|'products'|'customers')[])` — for each entity: creates a `Dataset` with `semanticFlag = entity`, runs `discoverSchemaWithAiProposal()`, returns created Dataset records; **idempotent per (connectionId, entity)** so re-entering the wizard adds only new tables *(change-045)*

**Deps:** DatasetService · DatasetRepository · DataConnectionService
**Rules:** Each entity → independent Dataset (separate OLAP table) grouped under one Shopify connection · Canonical views include all entity tables across connectors · entity selection comes from the shared `select-entities` wizard step (backed by `connector.listEntities()`), not a hardcoded all-three provision *(change-045)*

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

### SVC-CONN-SALLA-DS · SallaDatasetService [internal, application, Data] *(change-025, updated change-045)*
Creates one `Dataset` per **user-selected** Salla entity from a single `DataConnection`.

**Methods:**
- `connectFromOAuth(workspaceSlug, userId, tokens)` — creates `DataConnection(sourceType=salla)` with encrypted tokens and returns `{ connectionId }`; **no longer auto-creates 3 Datasets** — the OAuth callback redirects to the `select-entities` wizard step *(change-045)*
- `createSelectedEntities(workspaceSlug, connectionId, userId, entities)` — for each selected entity: creates a `Dataset` with `sourceRef`/`semanticFlag`, runs `discoverSchemaWithAiProposal()`; idempotent per (connectionId, entity) *(change-045)*
- `applyWebhookEvent(workspaceSlug, topic, payload)` — maps Salla event topic to entity type; finds matching Datasets; enqueues incremental sync

**Deps:** DataConnectionService · DatasetRepository · DatasetService · SyncService
**Rules:** Each entity → independent Dataset (separate OLAP table) grouped under one Salla connection · Canonical views include both Salla and Shopify entity tables · entity set chosen in the wizard via `connector.listEntities()` *(change-045)*

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

### SVC-CONN-ZID-DS · ZidDatasetService [internal, application, Data] *(change-026, updated change-045)*
Creates one `Dataset` per **user-selected** Zid entity from a single `DataConnection`.

**Methods:**
- `connectFromOAuth(workspaceSlug, userId, authorizationToken, accessToken, expiresAt)` — creates `DataConnection(sourceType=zid)` with encrypted dual-token credentials and returns `{ connectionId }`; **no longer auto-creates 3 Datasets** — the OAuth callback redirects to the `select-entities` wizard step *(change-045)*
- `createSelectedEntities(workspaceSlug, connectionId, userId, entities)` — for each selected entity: creates a `Dataset` with `sourceRef`/`semanticFlag`, runs `discoverSchemaWithAiProposal()`; idempotent per (connectionId, entity) *(change-045)*
- `applyWebhookEvent(workspaceSlug, topic)` — maps Zid event topic to entity type; finds matching Datasets; enqueues incremental sync

**Deps:** DataConnectionService · DatasetRepository · DatasetService · SyncService
**Rules:** Each entity → independent Dataset (separate OLAP table) grouped under one Zid connection · Canonical views include Zid, Salla, and Shopify entity tables · entity set chosen in the wizard via `connector.listEntities()` (progress-tracked, since Zid listing is slow) *(change-045)*

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
### SVC-CONN-INTERFACE · ConnectorInterface [internal, domain, Connectors] *(change-018, updated change-045)*
Contract every data source adapter must implement.

```typescript
interface DataSourceEntity {
  name: string;                 // provider identifier (table/collection/sheet/entity name)
  label: string;                // human-readable label
  kind: 'entity' | 'sheet' | 'table' | 'collection';
  semanticFlag?: SemanticFlag;  // suggested flag for e-commerce entities (orders/products/customers)
  preselected?: boolean;        // UI default-checked
  meta?: Record<string, unknown>; // e.g. columnCount, rowEstimate, sheetGid
}

interface ConnectorInterface {
  testConnection(conn: DataConnectionDocument): Promise<{ ok: boolean; error?: string }>;
  discoverSchema(conn: DataConnectionDocument, dataset: DatasetDocument): Promise<DiscoveredColumn[]>;
  extract(conn: DataConnectionDocument, dataset: DatasetDocument, opts: ExtractOptions): AsyncGenerator<Record<string, unknown>[]>;
  normalize(rows: Record<string, unknown>[], schema: DiscoveredColumn[]): Record<string, unknown>[];
  // change-045 — unified entity listing used by the shared "select what to import" wizard step.
  // Replaces the ad-hoc listTables()/listCollections() helpers. csv returns []; e-commerce
  // returns orders/products/customers; google_sheets returns tabs; sql_server/mongodb_atlas
  // return tables/collections. May be progress-tracked for slow sources.
  listEntities(conn: DataConnectionDocument): Promise<DataSourceEntity[]>;
}
```

**Rules:** `listEntities()` is the single source of truth for the wizard's `select-entities` step across all connectors · slow implementations (e.g. Zid) surface progress so the UI can show a percentage loader · adding a new source still only requires implementing this interface + `registry.register()`.

---

### SVC-CONN-MONGOATLAS — MongoDbAtlasConnector *(change-028)*

**File:** `src/integrations/connectors/mongodb-atlas/mongodb-atlas.connector.ts`
**sourceType:** `mongodb_atlas`
**Driver:** `mongodb` (already installed as peer dep of `mongoose`; no new package needed)

**Utilities:**
- `mongo-flatten.util.ts` — recursive document flattener; dot-notation for nested objects (`address.city`), JSON-stringified arrays; depth cap = 5.
- `mongo-schema-sampler.ts` — samples up to 200 documents via `$sample` aggregate; walks all keys to build a union of fields → inferred `DiscoveredColumn[]`.

**Connection pattern:** `MongoClient` created per-operation (`new MongoClient(uri).connect()`), closed in `finally` block — same pool-per-call pattern as SQL Server. URI stored encrypted in `DataConnection.credentialsEncrypted`.

**testConnection:** connects and calls `db.command({ ping: 1 })`; catches `MongoServerSelectionError` to surface IP-allowlist guidance.

**discoverSchema:** reads collection name from `dataset.sourceRef`; runs `$sample` aggregate → `MongoSchemaSampler.infer()`; returns `DiscoveredColumn[]` with canonical types.

**extract (full):** `collection.find({}).batchSize(PAGE_SIZE)` — async cursor iteration; yields `PAGE_SIZE = 500` documents per batch as `Record<string,unknown>[]`.

**extract (incremental):** if `dataset.watermarkColumn` is set, uses `{ [watermarkCol]: { $gt: lastSync } }` filter sorted ascending; otherwise falls back to `_id > lastObjectId` ordering.

**normalize:** applies `flattenDocument()` to every raw doc; casts `ObjectId` → hex string; applies canonical type coercions using schema.

**listCollections (setup helper):** `db.listCollections().toArray()` — returns `{ name: string; type: 'collection' | 'view' }[]` for the wizard; used by `MongoDbAtlasController`.

**previewCollection (setup helper):** `collection.find().limit(n)` with `flattenDocument()` applied — returns `{ columns: string[]; rows: unknown[][] }`.

---

### SVC-CONN-MONGOATLAS-SAMPLER — MongoSchemaSampler *(change-028)*

**File:** `src/integrations/connectors/mongodb-atlas/mongo-schema-sampler.ts`

**infer(docs: Record<string,unknown>[], maxDepth = 5): DiscoveredColumn[]**
- Iterates all sampled docs; union-merges all keys (dot-notation paths).
- For each path, tallies JS type frequency across samples; most common wins.
- Maps JS types → canonical: `number` → `number`; `boolean` → `boolean`; `Date` / ISO string → `datetime`; `ObjectId` → `string`; everything else → `string`.
- `nullable = true` if the key is absent in any sample.
