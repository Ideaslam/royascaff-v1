## Module: Connectors

### SVC-CONN-REG · ConnectorRegistry [internal, domain, Connectors] *(change-018)*
Registry that maps `DataSourceType` values to concrete `ConnectorInterface` implementations.

**Methods:**
- `register(type: DataSourceType, connector: ConnectorInterface): void` — called by each connector's `onModuleInit()`
- `resolve(type: DataSourceType): ConnectorInterface` — returns the registered connector; throws `UnknownConnectorError` for unregistered types

**Deps:** none (pure registry; concrete connectors self-register)
**Rules:** Adding a new data source only requires implementing `ConnectorInterface` and calling `registry.register()` — zero changes to the engine · `resolve()` on unknown type throws a typed error (never returns null)

---

### SVC-CONN-CSV · CsvConnector [internal, domain, Connectors] *(change-022)*
`ConnectorInterface` implementation for `csv` source type. Reads CSV data from R2 storage.

**Methods:**
- `testConnection(creds)` — validates that the R2 object key is accessible; returns `{ ok: boolean, error?: string }`
- `discoverSchema(creds, opts)` — reads header row from CSV; infers column types from sample; returns `ColumnSpec[]`
- `extract(creds, opts)` — streams rows from R2 object; yields `Record<string, unknown>[]` batches
- `normalize(rows, columnMapping)` — applies `columnMapping` to rename keys to canonical fields; returns normalized rows

**Deps:** STORAGE_PROVIDER · ConfigService
**Side effects:** R2 downloads
**Rules:** Never holds entire file in memory; streams in configurable batch sizes · `normalize()` is pure (no I/O)

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
