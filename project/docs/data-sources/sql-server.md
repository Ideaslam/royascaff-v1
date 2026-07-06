# SQL Server

Connect directly to a Microsoft SQL Server database using host, port, and credentials.

## Overview

| Item | Value |
|------|-------|
| Source type | `sql_server` |
| Category | Database |
| Auth | Username + password (stored encrypted) |
| Datasets | One dataset per selected table or view |
| Sync | Full + incremental (when watermark column is set) |
| App install | Not required |

## Developer setup

No third-party app registration. Ensure server-side encryption is configured:

| Variable | Required | Notes |
|----------|----------|-------|
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts DB credentials at rest |

The Dynamo API server must be able to reach the SQL Server host on the configured port (default **1433**). If the database is on a private network, allow the API server's outbound IP through the firewall.

## Connection credentials (merchant provides)

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| Connection name | Yes | — | Display name in Dynamo |
| Host | Yes | — | Server hostname or IP |
| Port | No | `1433` | SQL Server port |
| Database | Yes | — | Database name |
| Username | Yes | — | SQL login |
| Password | Yes | — | SQL password |
| Encrypt | No | `true` | TLS encryption |
| Trust server certificate | No | `false` | Set `true` for self-signed certs in dev |

## Account manager checklist

Ask the customer or their IT team:

- [ ] SQL Server hostname/IP and port
- [ ] Database name
- [ ] Read-only SQL login (recommended) with `SELECT` on target tables/views
- [ ] Firewall rule allowing Dynamo API server IP
- [ ] Whether TLS is required and if self-signed certs are used
- [ ] Which tables/views to sync
- [ ] Optional: column to use as incremental watermark (e.g. `UpdatedAt`)

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **SQL Server**
2. Or open `/app/data/connect/sql_server`
3. **Step 1 — Credentials:** Enter connection details → Dynamo tests the connection
4. **Step 2 — Tables:** Select one or more tables/views from the list
5. **Step 3 — Configure:** Set dataset name and optional watermark column per table
6. Click **Create datasets** → AI discovers schema
7. Complete schema review → schedule → sync

## API endpoints (used by wizard)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/data/connections` | Create connection with credentials |
| POST | `/data/connections/:id/test` | Test connection |
| POST | `/data/connections/:id/sql-server/tables` | List tables/views |
| POST | `/data/connections/:id/sql-server/preview` | Preview rows from a table |

## What gets synced

- Selected tables or views only
- Column schema discovered from `INFORMATION_SCHEMA`
- Incremental sync uses the watermark column when configured and a primary key exists in schema

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| Connection timeout | Firewall blocks API server | Whitelist Dynamo API outbound IP |
| Login failed | Wrong credentials | Verify username/password/database |
| Certificate error | Self-signed TLS | Enable "Trust server certificate" |
| Incremental disabled | No PK or watermark | Set PK in schema review; configure watermark column |
| Table not listed | Insufficient permissions | Grant `SELECT` on target schema |
