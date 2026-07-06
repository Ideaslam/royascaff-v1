# Google Sheets

Connect a Google account via OAuth, then pick a spreadsheet and tab to sync.

## Overview

| Item | Value |
|------|-------|
| Source type | `google_sheets` |
| Category | Spreadsheet |
| Auth | OAuth 2.0 (Google) |
| Datasets | One dataset per spreadsheet/tab |
| Sync | Full sync only (no incremental watermark) |
| Scopes | `spreadsheets.readonly`, `drive.readonly` |

## Developer setup

### 1. Create a Google Cloud OAuth app

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google Sheets API** and **Google Drive API**
4. Go to **APIs & Services → Credentials → Create OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URI (must match exactly):

| Environment | Redirect URI |
|-------------|--------------|
| Production | `https://dynamo-api.roya.marketing/api/v1/data/google/callback` |
| Development | `https://dynamo-api-dev.roya.marketing/api/v1/data/google/callback` |
| Local | `http://localhost:3000/api/v1/data/google/callback` |

### 2. Set environment variables

| Variable | Required | Example |
|----------|----------|---------|
| `GOOGLE_CLIENT_ID` | Yes | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | Yes | Must match redirect URI above |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | 64-char hex key |
| `FRONTEND_URL` | Yes | Customer portal URL |
| `REDIS_*` | Yes | OAuth nonce storage |

### 3. API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/data/google/auth-url` | JWT | Returns Google consent URL |
| GET | `/data/google/callback` | Public | OAuth callback; creates connection |

## Account manager checklist

Ask the customer:

- [ ] They have a Google account with access to the target spreadsheet
- [ ] The spreadsheet is shared with their Google account (if not owner)
- [ ] They know the spreadsheet URL and tab name (optional)

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **Google Sheets**
2. Or open `/app/data/connect/google_sheets`
3. Click **Continue with Google** → approve access in Google
4. After redirect, enter:
   - **Dataset name**
   - **Google Sheets URL** (full URL from browser address bar)
   - **Sheet / tab name** (optional, defaults to `Sheet1`)
5. Click **Continue** → AI analyzes columns
6. Complete schema review → schedule → sync

## What gets synced

- Rows from the selected spreadsheet range (default `A:Z`)
- Header row used for column names
- Read-only access — Dynamo never writes to the sheet

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| OAuth redirect error | `GOOGLE_CALLBACK_URL` mismatch | Match Google Cloud redirect URI exactly |
| Spreadsheet not found | Wrong URL or no access | Verify URL and Google account permissions |
| Empty dataset | Wrong tab name | Check tab name matches exactly |
