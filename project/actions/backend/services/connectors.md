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
