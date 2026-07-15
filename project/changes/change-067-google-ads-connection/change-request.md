# Change Request — Google Ads Connection Type

## Metadata
- **date**: 2026-07-14
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data (module 4), S10 Connectors, customer-portal data setup + source detail
- Feature(s): Manage Connections, Manage Data Sources, Select What to Import, Sync Dataset, Schema Discovery
- Endpoint(s): New Google Ads OAuth + customer listing; generic sync-settings metadata endpoint
- Page(s)/View(s): customer-portal: `/app/data/connect/google_ads`, source-detail sync settings panel
- Service(s): GoogleAdsConnector, GoogleAdsOAuthService, GoogleAdsApiClient, GoogleAdsDatasetService, DataSourceService (sync settings)

## Description

### Problem
Users need to connect Google Ads accounts to Dynamo and sync advertising data (campaigns, performance stats, audiences, keywords, billing) into OLAP for dashboards — especially MER/MMM templates that require a `marketing_spend` canonical model.

### Approach
Add `google_ads` as a new connection type following the **Zid OAuth + entity-selection pattern** (not SQL Server). Data is retrieved via **GAQL** (`GoogleAdsService.SearchStream`), not database tables. Each importable entity is a predefined GAQL report template; the user picks which entities to sync in the shared `select-entities` wizard step.

### User decisions (confirmed 2026-07-14)
1. **Entity scope**: Ship a comprehensive entity catalog (core + opt-in + audiences, keywords, search terms, etc.). User chooses via entity-selection pipeline; nothing auto-synced beyond preselected defaults.
2. **OAuth**: **Separate** Google Cloud OAuth client for Google Ads (`GOOGLE_ADS_CLIENT_ID` / `SECRET` / `CALLBACK`), distinct from Google Sheets OAuth.
3. **MCC**: Support manager accounts — store `loginCustomerId` when user connects via MCC; list accessible customers after OAuth.
4. **Historical sync window**: Introduce a **generic, connector-driven sync-settings framework** on DataSource (editable anytime in source detail). Google Ads is the first implementation (`syncLookback` preset). Framework designed so other source types can adopt later without rework.
5. **Read-only**: Dynamo only reads Google Ads data; no campaign/ad mutations.

### DataSource scope shape (google_ads)
```json
{
  "customerId": "1234567890",
  "loginCustomerId": "9876543210",
  "syncLookback": "90d"
}
```

### Generic sync settings (all types that declare capability)
Connectors may declare `syncSettingsCapability` on `pipelineProfile`. When enabled, source detail shows a **Sync Settings** panel with preset options. Value stored in `DataSource.scope.syncLookback` (preset id). Connectors read it from merged credentials at extract time.

### Out of scope (v1)
- Google Ads write/mutate operations
- Real-time push notifications from Google
- Custom GAQL query builder
- Implementing sync lookback for Zid/Salla/Shopify/SQL Server (framework only; Google Ads first)
- Admin panel changes beyond `datasource_type_meta` seed

## Acceptance Criteria
1. User can OAuth-connect Google Ads from `/app/data/connect/google_ads` using a **dedicated** Google Ads OAuth client.
2. After OAuth, user picks a Google Ads customer account; MCC users can select `loginCustomerId` when applicable.
3. Entity selection lists **all** defined Google Ads entities (campaigns, performance reports, audiences, keywords, billing, etc.) with sensible preselection on core performance entities.
4. Selected entities become datasets, complete schema-review, and sync into OLAP via the standard ingest pipeline.
5. `campaign_performance` (and other performance entities) map to the `marketing_spend` canonical model.
6. Source detail shows **Sync Settings** (historical lookback preset) for Google Ads; changing it persists via `PATCH /data/sources/:id` and affects the next sync.
7. `GET /data/source-types/:type/sync-settings` (or equivalent) returns connector-declared capability so the UI is generic.
8. Dynamo is read-only against Google Ads API.
9. Existing 7 source types unchanged — build green, wizard flows pass.
10. Developer setup documented in `project/docs/data-sources/google-ads.md`.

## Notes
- Requires `GOOGLE_ADS_DEVELOPER_TOKEN` (Google Ads API Center).
- Node client: `google-ads-api` (community) wrapped in `GoogleAdsApiClient`.
- Registration-seam safe: connector + `pipelineProfile` only; no `engine-core` edits.
