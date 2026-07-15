# Post-Build Verification — change-067-google-ads-connection

## Scope
Google Ads connection type + generic sync settings framework (Google Ads first implementation).

## Endpoints in code
| Endpoint | Status |
|----------|--------|
| GET `/api/v1/data/google-ads/auth-url` | PASS |
| GET `/api/v1/data/google-ads/callback` | PASS |
| GET `/api/v1/data/google-ads/customers` | PASS |
| GET `/api/v1/data/source-types/:type/sync-settings` | PASS |

## Pages in code
| Page / Component | Route / location | Status |
|------------------|------------------|--------|
| GoogleAdsConnectComponent | `/app/data/connect/google_ads` | PASS |
| SyncSettingsPanelComponent | source detail page | PASS |
| Registry entry `google_ads` | source-connect.registry.ts | PASS |

## Code layering (BE)
- Controller → OAuth/API/Dataset services → Connector: PASS
- Connector registered via `ConnectorRegistry.onModuleInit`: PASS
- No `engine-core` pipeline logic changes (only optional `syncSettings` on profile): PASS

## Frontend isolation
- All calls via `DataService` + `environment.apiUrl`: PASS

## Auth
- auth-url, customers, sync-settings: JWT guarded: PASS
- callback: Public: PASS

## Build
- `roya-dynamo-api` `npm run build`: PASS
- `roya-dynamo-frontend` `npm run build`: PASS

## Acceptance criteria
1. OAuth connect from `/app/data/connect/google_ads` — PASS (implemented)
2. Customer account picker after OAuth — PASS
3. MCC `loginCustomerId` support — PASS
4. 18 entities in `GOOGLE_ADS_ENTITIES`, user selects via wizard — PASS
5. Standard ingest pipeline (entity selection → schema → schedule) — PASS
6. `marketing_spend` canonical model in `canonical-fields.config.ts` — PASS
7. Sync settings on source detail, editable via PATCH scope — PASS
8. Generic `GET sync-settings` metadata endpoint — PASS
9. Read-only (SearchStream only, no mutate APIs) — PASS
10. Existing 7 source types build unchanged — PASS
11. `project/docs/data-sources/google-ads.md` — PASS

## UI screenshots
Skipped (not provided).

## Overall: PASS
