# Data Sources — Setup & Usage Guide

This folder contains one guide per supported data source in **Roya AI Dynamo**. Each document is written for:

- **Developers** — environment variables, API URLs, app registration, and deployment setup
- **Account managers** — what to ask the customer for, and how to walk them through connection
- **Merchants / end users** — steps inside the Dynamo customer portal

## Supported sources

| Source | Type | Auth model | App install required? | Guide |
|--------|------|------------|----------------------|-------|
| CSV File | File upload | None | No | [csv.md](./csv.md) |
| Google Sheets | Spreadsheet | OAuth 2.0 | Google Cloud app (developer) | [google-sheets.md](./google-sheets.md) |
| Shopify | E-commerce | OAuth 2.0 | Shopify Partner app (developer) | [shopify.md](./shopify.md) |
| Salla | E-commerce | OAuth 2.0 | Salla Partner app (developer) | [salla.md](./salla.md) |
| Zid | E-commerce | OAuth 2.0 | Zid Partner app (developer) | [zid.md](./zid.md) |
| SQL Server | Database | Credentials | No | [sql-server.md](./sql-server.md) |
| MongoDB Atlas | Database | Connection URI | No | [mongodb-atlas.md](./mongodb-atlas.md) |

## Common merchant flow (all sources)

1. Log in to Dynamo → **Data** (`/app/data`)
2. Click **Connect Source**
3. Pick a source → follow the setup wizard at `/app/data/connect/{sourceType}`
4. Complete **Connect → Schema review → Schedule → Sync**

E-commerce sources (Shopify, Salla, Zid) auto-create three datasets after OAuth: **orders**, **products**, **customers**.

## Shared server requirements

These apply to every environment where data connections are used:

| Variable | Purpose |
|----------|---------|
| `CREDENTIALS_ENCRYPTION_KEY` | AES-256 key (64 hex chars) — encrypts stored connection credentials |
| `FRONTEND_URL` | Customer portal base URL (OAuth redirects after callback) |
| `API_BASE_URL` | Public API base URL (webhook registration, install URLs) |
| `REDIS_HOST` / `REDIS_PORT` | OAuth CSRF nonce storage (required for OAuth sources) |
| `MONGODB_URI` | Primary application database |
| `R2_*` | Object storage (CSV uploads) |

## Environment URL reference

| Environment | Frontend | API |
|-------------|----------|-----|
| Production | `https://dynamo.roya.marketing` | `https://dynamo-api.roya.marketing` |
| Development | `https://dynamo-dev.roya.marketing` | `https://dynamo-api-dev.roya.marketing` |
| Local | `http://localhost:4200` | `http://localhost:3000` |

All API paths below are relative to `{API_BASE_URL}/api/v1`.
