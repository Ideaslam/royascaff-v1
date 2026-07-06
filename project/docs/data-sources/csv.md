# CSV File

Upload a `.csv` file directly into Dynamo. No external app registration required.

## Overview

| Item | Value |
|------|-------|
| Source type | `csv` |
| Category | File |
| Auth | None |
| Datasets | One dataset per upload |
| Sync | Full sync only (file is static) |
| Max file size | 50 MB |

## Developer setup

No third-party API keys. Ensure these server variables are configured:

| Variable | Required | Notes |
|----------|----------|-------|
| `R2_ENDPOINT` | Yes | Cloudflare R2 (or S3-compatible) endpoint |
| `R2_ACCESS_KEY_ID` | Yes | Storage access key |
| `R2_SECRET_ACCESS_KEY` | Yes | Storage secret |
| `R2_BUCKET_NAME` | Yes | Bucket for uploaded CSV files |
| `R2_PUBLIC_BASE_URL` | Optional | Public URL prefix for stored files |
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts connection metadata |

## Account manager checklist

Before connecting, confirm with the customer:

- [ ] They have a valid `.csv` file (UTF-8 recommended)
- [ ] File is under 50 MB
- [ ] Their subscription plan allows another upload this month (upload limits apply)

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **CSV File**
2. Or open `/app/data/connect/csv`
3. Click **Browse CSV file** and select the file
4. Enter a **Dataset name** (e.g. "Sales Q1 2026")
5. Click **Continue**
6. Wait for upload and AI column analysis
7. Review schema mapping → set sync schedule → run first sync

## What gets synced

- All rows from the uploaded CSV
- Column names and types inferred by AI
- Data stored in the workspace analytics store

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| Upload limit reached | Subscription quota | Upgrade plan or wait for next billing period |
| Upload fails | File too large | Split file or compress; max 50 MB |
| Analysis stuck | AI job timeout | Retry from dataset detail page |
