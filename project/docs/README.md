# Roya AI Dynamo — Project Documentation

Internal documentation for developers, account managers, and onboarding teams.

## Data sources

Step-by-step guides for connecting each supported data source:

→ **[Data Sources — Setup & Usage](./data-sources/README.md)**

| Guide | Summary |
|-------|---------|
| [CSV](./data-sources/csv.md) | Upload a `.csv` file (no app install) |
| [Google Sheets](./data-sources/google-sheets.md) | OAuth + pick spreadsheet |
| [Shopify](./data-sources/shopify.md) | Shopify Partner app + OAuth |
| [Salla](./data-sources/salla.md) | Salla Partner app + OAuth |
| [Zid](./data-sources/zid.md) | Zid Partner app + OAuth + App Market install |
| [SQL Server](./data-sources/sql-server.md) | Direct DB credentials |
| [MongoDB Atlas](./data-sources/mongodb-atlas.md) | Connection URI + database |

Each guide includes:

- Developer env vars and third-party app registration steps
- Required URLs (OAuth callback, webhooks, install redirect)
- Account manager checklist (what to collect from the customer)
- Merchant steps in the customer portal
- Troubleshooting
