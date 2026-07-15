# Meta Ads

Connect a Meta (Facebook & Instagram) ad account via OAuth, select a Business Manager and ad account, then choose which report entities to sync.

## Overview

| Item | Value |
|------|-------|
| Source type | `meta_ads` |
| Category | Advertising |
| Auth | OAuth 2.0 (dedicated Meta app; scopes `ads_read`, `business_management`) |
| Datasets | One dataset per selected entity (campaigns, ad sets, ads, insights breakdowns, audiences, …) |
| Sync | Full + incremental (date-segmented insights reports) |
| Access | **Read-only** — Dynamo never mutates campaigns or ads |
| Platforms | Facebook, Instagram, and other Meta placements via unified ad account (platform breakdown entity available) |

## Developer setup

### 1. Create a Meta developer app

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → type **Business**
3. Add product **Marketing API**
4. Under **App settings → Basic**, note **App ID** and **App Secret**
5. Add **Valid OAuth Redirect URIs**:

| Environment | Redirect URI |
|-------------|--------------|
| Production | `https://dynamo-api.roya.marketing/api/v1/data/meta-ads/callback` |
| Development | `https://dynamo-api-dev.roya.marketing/api/v1/data/meta-ads/callback` |
| Local | `http://localhost:3000/api/v1/data/meta-ads/callback` |

6. Add test users / ad accounts while in **Development** mode
7. Submit for **App Review** with `ads_read` before production merchants connect live ad accounts

### 2. Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `META_ADS_APP_ID` | Yes | Meta app ID |
| `META_ADS_APP_SECRET` | Yes | App secret |
| `META_ADS_CALLBACK_URL` | Yes | Must match redirect URI exactly |
| `META_ADS_API_VERSION` | No | Default `v21.0` |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts tokens at rest |
| `FRONTEND_URL` | Yes | Post-OAuth redirects |
| `REDIS_*` | Yes | OAuth CSRF nonce |

### 3. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/meta-ads/auth-url` | JWT | OAuth consent URL |
| GET | `/data/meta-ads/callback` | Public | OAuth callback |
| GET | `/data/meta-ads/businesses` | JWT | List accessible Business Managers |
| GET | `/data/meta-ads/ad-accounts` | JWT | List ad accounts for `businessId` |
| GET | `/data/source-types/meta_ads/sync-settings` | JWT | Lookback preset metadata |

## Merchant steps

1. **Data** → **Connect Source** → **Meta Ads** (or `/app/data/connect/meta_ads`)
2. Click **Connect Meta Ads** → approve OAuth on Meta
3. Select **Business Manager** (required)
4. Select **ad account** under that business
5. **Select entities** (campaign performance, campaigns, ad sets, ads, breakdowns, audiences, …)
6. Schema review → schedule → sync
7. Adjust **Sync Settings** (historical lookback) anytime on the data source detail page

## Entities (user selects in wizard)

**Preselected:** Campaign Performance (Daily), Campaigns, Ad Sets, Ads

**Opt-in performance** (`marketing_spend`): Ad Set/Ad insights, Platform, Device, Age & Gender, Region, Account performance

**Opt-in structure:** Ad Creatives, Custom Audiences, Saved Audiences

Performance entities map to the `marketing_spend` canonical model for MER/MMM dashboards.

## DataSource scope

```json
{
  "businessId": "1234567890",
  "adAccountId": "act_1234567890",
  "syncLookback": "90d"
}
```

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| OAuth redirect error | Callback URL mismatch | Match Meta app redirect URI |
| No businesses listed | Missing `business_management` scope or no BM access | Re-auth with account that manages ad accounts |
| No ad accounts under business | Wrong Business Manager selected | Pick the BM that owns the ad account |
| Insights sync empty | Date range outside lookback | Increase lookback in Sync Settings |
| App review required | Production ad account + dev-mode app | Complete Meta App Review for `ads_read` |
