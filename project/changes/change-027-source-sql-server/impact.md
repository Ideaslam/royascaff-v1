# Impact Analysis — change-027: SQL Server Source

## 1. Code Reconnaissance

### Feature state: `none` (greenfield)
No SQL Server–specific code exists. `DataSourceType` union already includes `'sql_server'`.

### Key architecture difference from OAuth connectors
SQL Server is a **direct database connector** (not an API). The integration layer changes:

| Dimension | OAuth connectors (Shopify/Salla/Zid) | SQL Server |
|---|---|---|
| Auth | OAuth 2.0 flow + redirect | Connection string (host/port/db/user/pass) |
| Setup UX | One-click OAuth redirect | Multi-step wizard with credential form |
| Webhooks | Yes | No |
| Schema discovery | Static (known at design time) | Dynamic (query `INFORMATION_SCHEMA`) |
| Extract | REST API pagination | SQL `SELECT` with optional watermark `WHERE` |
| Preview endpoint | No | Yes — top-N rows, used only during setup |
| New npm package | No | **`mssql`** |

---

## 2. SQL Server Connection — Key Facts

| Fact | Detail |
|---|---|
| npm package | `mssql` (built on TDS protocol) |
| Credentials | host, port (default 1433), database, username, password, `encrypt` flag, `trustServerCertificate` flag |
| Schema discovery | `SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES` + `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table` |
| Extract | `SELECT * FROM [table]` + optional `WHERE [watermarkCol] > @lastSync ORDER BY [watermarkCol]` |
| Incremental | User selects a watermark column (e.g. `updated_at`, `ModifiedDate`) during wizard |
| Preview | `SELECT TOP 50 * FROM [table]` |
| Connection pooling | `mssql.ConnectionPool` per sync run; closed after |
| No Rate limit | Direct DB — respect timeouts (30s query, 10s connect) |

---

## 3. New Endpoints

| ID | Method | Route | Auth | Description |
|---|---|---|---|---|
| EP-DATA-35 | POST | /api/v1/data/connections/:id/sql-server/tables | JWT | List all tables/views in the database |
| EP-DATA-36 | POST | /api/v1/data/connections/:id/sql-server/preview | JWT | Top-50 rows from a specified table |

> `testConnection` is already covered by the generic `EP-DATA-12` (`POST /connections/:id/test`).
> `discoverSchema` is already covered by `EP-DATA-22` (`POST /datasets/:id/discover-schema`).
> Two SQL-Server-specific endpoints are needed: table listing (before dataset creation) and preview.

---

## 4. Impact Map

### Backend — Create New
| File | Action |
|---|---|
| `src/integrations/connectors/sql-server/sql-server.connector.ts` | ConnectorInterface; dynamic schema discovery; SQL SELECT extract with watermark; normalize |
| `src/integrations/connectors/sql-server/sql-server-query.builder.ts` | Builds safe parameterized SQL for SELECT, schema introspection, preview |
| `src/modules/data/controllers/sql-server.controller.ts` | EP-DATA-35 (list tables), EP-DATA-36 (preview) |

### Backend — Modify
| File | Action |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Add `SqlServerConnector` |
| `src/modules/data/data.module.ts` | Add `SqlServerController` |
| `src/config/config.ts` | No changes needed (no platform-level app credentials) |

### Frontend — Create New
| File | Action |
|---|---|
| `src/app/pages/data/sql-server-connect/sql-server-connect.page.ts` + `.html` | 4-step wizard: credentials → test → pick tables → watermark + schedule |

### Frontend — Modify
| File | Action |
|---|---|
| `src/app/core/models/data.models.ts` | Add `SqlServerTable`, `SqlServerPreviewResult` |
| `src/app/core/services/data.service.ts` | Add `listSqlServerTables()`, `previewSqlServerTable()` |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "SQL Server" button |
| `src/app/app.routes.ts` | Register SQL Server connect route |

### Planning docs to update
| Doc | Update |
|---|---|
| `actions/backend/endpoints/data.md` | Add EP-DATA-35/36 |
| `actions/backend/services/connectors.md` | Add SVC-CONN-SQLSERVER, SVC-CONN-SQLSERVER-QB |
| `actions/customer-portal/pages/data.md` | Add SQL Server wizard page |
| `actions/customer-portal/pages/_index.md` | Add SQL Server route |

---

## 5. New Packages
- **`mssql`** — Microsoft SQL Server client for Node.js

---

## 6. Risks
| Risk | Mitigation |
|---|---|
| Firewall / network access | Document requirement for allowlisting backend IP; surface clear error on connection timeout |
| SQL injection | All table/column names sanitised via whitelist from schema discovery; parameterized queries only |
| Large tables (full sync) | Paginated `SELECT` with `OFFSET FETCH` (SQL Server 2012+) |
| Column name with spaces/reserved words | Always quote identifiers with `[brackets]` |
| `encrypt` / TLS certificate issues | Expose `trustServerCertificate` toggle in wizard (dev mode) |

---

## 7. Implementation Order
1. Install `mssql`
2. `SqlServerQueryBuilder`
3. `SqlServerConnector`
4. `SqlServerController` (EP-DATA-35/36)
5. Wire `ConnectorsModule` + `DataModule`
6. Frontend: models + service
7. Frontend: SQL Server wizard page
8. Routes + DataSources button
9. Compile check
