# Google Ads

Connect a Google Ads account via OAuth (dedicated client), pick the customer account (MCC supported), then select which report entities to sync.

## Overview

| Item | Value |
|------|-------|
| Source type | `google_ads` |
| Category | Advertising |
| Auth | OAuth 2.0 (dedicated Google Ads client; scope `adwords`) |
| Datasets | One dataset per selected entity (campaigns, performance, keywords, audiences, billing, …) |
| Sync | Full + incremental (date-segmented performance reports) |
| Access | **Read-only** — Dynamo never mutates campaigns or ads |
| MCC | Supported via `loginCustomerId` in DataSource scope |

## Developer setup

### 1. Google Cloud — dedicated OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Ads API**
3. Create OAuth client ID (Web application) — **separate from Google Sheets client**
4. Authorized redirect URI:

| Environment | Redirect URI |
|-------------|--------------|
| Production | `https://dynamo-api.roya.marketing/api/v1/data/google-ads/callback` |
| Development | `https://dynamo-api-dev.roya.marketing/api/v1/data/google-ads/callback` |
| Local | `http://localhost:3000/api/v1/data/google-ads/callback` |

### 2. Google Ads API developer token

Apply at [Google Ads API Center](https://ads.google.com/aw/apicenter). Test access works with test accounts only until Basic/Standard access is approved.

### 3. Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `GOOGLE_ADS_CLIENT_ID` | Yes | Dedicated OAuth client |
| `GOOGLE_ADS_CLIENT_SECRET` | Yes | |
| `GOOGLE_ADS_CALLBACK_URL` | Yes | Must match redirect URI |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Yes | From API Center |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts tokens at rest |
| `FRONTEND_URL` | Yes | Post-OAuth redirects |
| `REDIS_*` | Yes | OAuth CSRF nonce |

### 4. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/google-ads/auth-url` | JWT | OAuth consent URL |
| GET | `/data/google-ads/callback` | Public | OAuth callback |
| GET | `/data/google-ads/customers` | JWT | List accessible customer accounts |
| GET | `/data/source-types/google_ads/sync-settings` | JWT | Lookback preset metadata |

## Merchant steps

1. **Data** → **Connect Source** → **Google Ads** (or `/app/data/connect/google_ads`)
2. Click **Connect Google Ads** → approve OAuth
3. Pick **customer account** (and MCC manager if applicable)
4. **Select entities** (campaigns, performance, keywords, audiences, billing, …)
5. Schema review → schedule → sync
6. Adjust **Sync Settings** (historical lookback) anytime on the data source detail page

## Entities (user selects in wizard)

**Preselected:** Campaign Performance (Daily), Campaigns, Ad Groups, Ads

**Opt-in:** Ad/Keyword/Search Term/Audience/Geo/Device performance, Keywords, Audiences, Conversion Actions, Campaign Budgets, Labels, Account Budgets, Billing Setup

Performance entities map to the `marketing_spend` canonical model for MER/MMM dashboards.

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| OAuth redirect error | Callback URL mismatch | Match Google Cloud redirect URI |
| Developer token rejected | Test token + production account | Use test account or apply for Basic access |
| No customers listed | Wrong Google account | Re-auth with account that has Ads access |
| MCC access denied | Missing login-customer-id | Select manager account when prompted |
