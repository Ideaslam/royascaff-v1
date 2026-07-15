# Change Request — Meta Ads Connection Type

## Metadata
- **date**: 2026-07-15
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data (module 4), S10 Connectors, customer-portal data setup + source detail
- Feature(s): Manage Connections, Manage Data Sources, Select What to Import, Sync Dataset, Schema Discovery, Sync Settings (lookback)
- Endpoint(s): New Meta Ads OAuth + ad-account listing; reuse `GET /data/source-types/:type/sync-settings`
- Page(s)/View(s): customer-portal: `/app/data/connect/meta_ads`, connections page OAuth flows, source-detail sync settings panel
- Service(s): MetaAdsConnector, MetaAdsOAuthService, MetaAdsApiClient, MetaAdsDatasetService

## Description

### Problem
Users need to connect Meta (Facebook/Instagram) advertising accounts to Dynamo and sync campaign performance, structure, and audience data into OLAP for dashboards — especially MER/MMM templates that require the `marketing_spend` canonical model.

### Approach
Add `meta_ads` as a new connection type following the **Google Ads pattern** (OAuth + ad-account picker + entity selection + sync lookback), not the Zid auto-provision pattern. Data is retrieved via the **Meta Marketing API** (Graph API Insights + object endpoints). Each importable entity is a predefined Insights or object query template; the user picks which entities to sync in the shared `select-entities` wizard step.

### User decisions (confirmed 2026-07-15)
1. **Entity scope**: Ship **all 14 entities** (4 preselected + 10 opt-in) — full catalog from day one.
2. **Business Manager**: **Required picker** — user must select a Business Manager before ad accounts are listed (not optional).
3. **Facebook vs Instagram**: **Single `meta_ads` connection** — one OAuth, one ad account picker. Facebook and Instagram ads live in the same Meta ad accounts; platform split is available via the `platform_insights` entity (`publisher_platform` breakdown). Do **not** create separate Facebook/Instagram connection types.
4. **UI label**: **Meta Ads** (EN) / **إعلانات Meta** (AR).
5. **Meta app**: Greenfield — user will create a new Meta developer app; setup doc covers full registration from scratch.
6. **OAuth**: Dedicated Meta app client (`META_ADS_APP_ID` / `SECRET` / `CALLBACK`), separate from existing social-login OAuth.
7. **Scopes (v1)**: `ads_read`, `read_insights`, `business_management`.
8. **Historical sync window**: Reuse existing **sync-settings framework** (`syncLookback`, default `90d`).
9. **Read-only**: Dynamo only reads Meta Ads data; no campaign/ad mutations.
10. **Seed**: Add `meta_ads` row to `datasource-type-meta.seed.ts` (idempotent upsert).

### DataSource scope shape (meta_ads)
```json
{
  "adAccountId": "act_1234567890",
  "businessId": "9876543210",
  "syncLookback": "90d"
}
```
- `businessId` — **required** — selected Business Manager (stored on DataSource scope)
- `adAccountId` — **required** — selected ad account under that business (stored on DataSource scope)

### Out of scope (v1)
- Meta Ads write/mutate operations (create/edit campaigns, ads, budgets)
- Real-time webhooks from Meta
- Custom Insights field builder / arbitrary GraphQL
- Instagram organic (non-ads) data
- WhatsApp / Messenger ads as separate types
- Admin panel changes beyond `datasource_type_meta` seed
- Implementing sync lookback for non-advertising sources

## Acceptance Criteria
1. User can OAuth-connect Meta Ads from `/app/data/connect/meta_ads` using a **dedicated** Meta OAuth app.
2. After OAuth, user **must** pick a Business Manager, then an ad account under it.
3. Entity selection lists all defined Meta Ads entities with sensible preselection on core performance entities.
4. Selected entities become datasets, complete schema-review, and sync into OLAP via the standard ingest pipeline.
5. Campaign-level daily insights map to the `marketing_spend` canonical model.
6. Source detail shows **Sync Settings** (historical lookback preset) for Meta Ads; changing it persists via `PATCH /data/sources/:id` and affects the next sync.
7. `GET /data/source-types/meta_ads/sync-settings` returns connector-declared capability (reuse existing generic endpoint).
8. Dynamo is read-only against Meta Marketing API.
9. `npm run seed:datasource-types` upserts `meta_ads` metadata (EN/AR title + instructions).
10. Existing 8 source types unchanged — build green, wizard flows pass.
11. Developer setup documented in `project/docs/data-sources/meta-ads.md`.

## Notes
- Meta Marketing API via Graph API (`META_ADS_API_VERSION`, default latest stable).
- Long-lived token exchange after short-lived OAuth code (standard Meta flow).
- Rate limiting wrapper recommended (Meta app-level + ad-account quotas).
- Registration-seam safe: connector + `pipelineProfile` only; no `engine-core` edits.
- Reference implementation: change-067 (Google Ads) + change-026 (Zid OAuth wiring only).
