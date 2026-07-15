# Post-Build Verification — change-070-meta-ads-connection

## Scope
Meta Ads connection type (`meta_ads`) — OAuth, required Business Manager picker, 14 entities, sync lookback reuse.

## Endpoints in code
| Endpoint | Status |
|----------|--------|
| GET `/api/v1/data/meta-ads/auth-url` | PASS |
| GET `/api/v1/data/meta-ads/callback` | PASS |
| GET `/api/v1/data/meta-ads/businesses` | PASS |
| GET `/api/v1/data/meta-ads/ad-accounts` | PASS |
| GET `/api/v1/data/source-types/meta_ads/sync-settings` | PASS (reused generic endpoint) |

## Pages in code
| Page / Component | Route / location | Status |
|------------------|------------------|--------|
| MetaAdsConnectComponent | `/app/data/connect/meta_ads` | PASS |
| Registry entry `meta_ads` | source-connect.registry.ts | PASS |
| SyncSettingsPanel | source detail (existing, connector-driven) | PASS |

## Code layering (BE)
- Controller → OAuth/API/Dataset services → Connector: PASS
- Connector registered via `ConnectorRegistry.onModuleInit`: PASS
- No `engine-core` changes: PASS

## Frontend isolation
- All calls via `DataService` + `environment.apiUrl`: PASS

## Auth
- auth-url, businesses, ad-accounts, sync-settings: JWT guarded: PASS
- callback: Public: PASS

## Build
- `roya-ai-dynamo-api` `npm run build`: PASS
- `roya-ai-dynamo-frontend` `npm run build`: PASS

## Seed
- `meta_ads` row in `datasource-type-meta.seed.ts`: PASS

## Acceptance criteria
1. OAuth connect from `/app/data/connect/meta_ads` — PASS (implemented)
2. Required Business Manager picker → ad account picker — PASS
3. All 14 entities in `META_ADS_ENTITIES`, user selects via wizard — PASS
4. Standard ingest pipeline (entity selection → schema → schedule) — PASS
5. Campaign insights → `marketing_spend` semantic flag — PASS
6. Sync settings on source detail via existing framework — PASS
7. Generic `GET sync-settings` metadata endpoint — PASS
8. Read-only (Graph API insights/objects only) — PASS
9. Seed upserts `meta_ads` metadata — PASS
10. Existing 8 source types build unchanged — PASS
11. `project/docs/data-sources/meta-ads.md` — PASS

## UI screenshots
Skipped (not provided).

## Overall: PASS
