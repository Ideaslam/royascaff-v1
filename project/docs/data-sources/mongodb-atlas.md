# MongoDB Atlas

Connect to a MongoDB Atlas cluster using a connection URI and database name.

## Overview

| Item | Value |
|------|-------|
| Source type | `mongodb_atlas` |
| Category | Database |
| Auth | MongoDB connection URI (stored encrypted) |
| Datasets | One dataset per selected collection |
| Sync | Full + incremental (when watermark field is set) |
| App install | Not required |

## Developer setup

No third-party app registration. Ensure:

| Variable | Required | Notes |
|----------|----------|-------|
| `CREDENTIALS_ENCRYPTION_KEY` | Yes | Encrypts URI at rest |

The Dynamo API server must be able to reach the Atlas cluster. **Atlas IP Access List** must include the API server's outbound IP.

## Connection credentials (merchant provides)

| Field | Required | Notes |
|-------|----------|-------|
| Connection name | Yes | Display name in Dynamo |
| Connection URI | Yes | Standard MongoDB URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`) |
| Database name | Yes | Target database within the cluster |

Example URI format:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

## Account manager checklist

Ask the customer or their IT team:

- [ ] MongoDB Atlas connection URI with a read-only user (recommended)
- [ ] Target database name
- [ ] Dynamo API server IP added to **Atlas → Network Access → IP Access List**
- [ ] Which collections to sync
- [ ] Optional: field for incremental watermark (e.g. `updatedAt`)

## Merchant steps (customer portal)

1. Go to **Data** → **Connect Source** → **MongoDB Atlas**
2. Or open `/app/data/connect/mongodb_atlas`
3. **Step 1 — Credentials:** Enter connection name, URI, and database → Dynamo tests connection
4. **Step 2 — Collections:** Select one or more collections
5. **Step 3 — Configure:** Set dataset name and optional watermark field per collection
6. Click **Create datasets** → AI infers schema from sampled documents
7. Complete schema review → schedule → sync

## API endpoints (used by wizard)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/data/connections` | Create connection with URI |
| POST | `/data/connections/:id/test` | Test connection (ping) |
| POST | `/data/connections/:id/mongodb/collections` | List collections |
| POST | `/data/connections/:id/mongodb/preview` | Preview documents |

## What gets synced

- Selected collections only
- Nested documents are flattened for analytics
- Schema inferred by sampling up to 500 documents per collection
- `_id` is typically used as primary key

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| Connection refused / timeout | IP not whitelisted | Add Dynamo API server IP to Atlas IP Access List |
| Authentication failed | Wrong URI or user | Verify username, password, and auth database in URI |
| Empty schema | Collection has no documents | Ensure collection has data for schema sampling |
| Incremental disabled | No PK or watermark | Mark PK in schema; set watermark field during setup |
