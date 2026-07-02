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

### SVC-CONN-INTERFACE · ConnectorInterface [type, domain, Connectors]
Contract every data source adapter must implement.

```typescript
interface ConnectorInterface {
  testConnection(creds: Record<string, unknown>): Promise<{ ok: boolean; error?: string }>;
  discoverSchema(creds: Record<string, unknown>, opts?: Record<string, unknown>): Promise<ColumnSpec[]>;
  extract(creds: Record<string, unknown>, opts?: Record<string, unknown>): AsyncGenerator<Record<string, unknown>[]>;
  normalize(rows: Record<string, unknown>[], mapping: Record<string, string>): Record<string, unknown>[];
}
```
