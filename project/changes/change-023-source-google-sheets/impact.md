# Impact Analysis — change-023: Google Sheets Source

## 1. Reconnaissance Summary

### Feature state: `none` (all Google Sheets connector code is greenfield)

| Layer | Existing? | Notes |
|---|---|---|
| `GoogleSheetsConnector` | ❌ None | Must create |
| Google OAuth (for data connections) | ❌ None (oauth/ folder is empty) | Auth module has a stub — not usable for data connections; must create |
| `googleapis` npm package | ❌ Not installed | Must add |
| `@nestjs/schedule` | ❌ Not installed | Must add for scheduled syncs |
| `ScheduledSyncService` | ❌ None | Must create |
| `DataConnection.sourceType = 'google_sheets'` | ✅ Already in enum | Ready |
| `SyncPolicy.HOURLY / DAILY` | ✅ Already in schema | Ready |
| `ConnectorRegistry` | ✅ Exists, self-registering pattern | `GoogleSheetsConnector` registers itself |
| `DataConnectionService` | ✅ Exists, `create` + encryption | Reused for token storage |
| `DatasetService.discoverSchemaWithAiProposal` | ✅ Implemented (change-022) | Reused |
| `DatasetsController` | ✅ Implemented (change-022) | Need to add Google OAuth endpoints |
| Frontend `DataSourcesPage` | ✅ Implemented (change-022) | Reused |
| Frontend `DataService` | ✅ Exists | Add Google OAuth + spreadsheet picker methods |

### Google OAuth for Data Connections vs Auth Login

The auth module's `/auth/oauth/callback` is for **user login**. We need a **separate** OAuth flow for authorizing access to a user's Google Sheets data:

- `GET /api/v1/data/google/auth-url` — generate OAuth URL (includes `state` with workspaceSlug+userId, `redirect_uri` to frontend callback)
- `GET /api/v1/data/google/callback` — exchange code for tokens, store as `DataConnection(sourceType=google_sheets)`, redirect to frontend setup page
- Credentials stored encrypted: `{ accessToken, refreshToken, spreadsheetId, sheetTitle, range }`
- Token refresh on each extract call (auto-refresh via googleapis OAuth2Client)

### Scheduled Sync
- `ScheduledSyncService` uses `@nestjs/schedule` `@Cron` to run hourly + daily
- Each cron tick queries all datasets across all workspaces with matching `syncPolicy` and `lastSyncAt` threshold, then enqueues `DATA_SYNC_QUEUE` jobs
- Uses the existing `SyncService.triggerSync` per dataset

---

## 2. Impact Map

### New packages to install
| Package | Reason |
|---|---|
| `googleapis` | Sheets API v4 + OAuth2Client |
| `@nestjs/schedule` | Cron-based scheduled sync |

### Backend — CREATE NEW
| File | Purpose |
|---|---|
| `src/integrations/connectors/google-sheets/google-sheets.connector.ts` | `GoogleSheetsConnector` implementing `ConnectorInterface` |
| `src/integrations/oauth/google/google-oauth.service.ts` | Auth URL generation, code exchange, token refresh |
| `src/modules/data/controllers/google-oauth.controller.ts` | `GET /data/google/auth-url`, `GET /data/google/callback` |
| `src/modules/data/services/scheduled-sync.service.ts` | `@Cron` hourly/daily dataset sync scheduler |

### Backend — MODIFY
| File | Change |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Register `GoogleSheetsConnector` |
| `src/modules/data/data.module.ts` | Import `ScheduleModule.forRoot()`, register `ScheduledSyncService` + `GoogleOAuthController` |
| `src/config/config.ts` | Add `google.redirectUri` to `oauth.google` block |

### Frontend — CREATE NEW
| File | Purpose |
|---|---|
| `src/app/pages/data/google-sheets-connect/google-sheets-connect.page.ts + .html` | Initiate OAuth → redirect to Google |
| `src/app/pages/data/google-sheets-setup/google-sheets-setup.page.ts + .html` | OAuth callback handler → spreadsheet/sheet/range picker → schema review → confirm |

### Frontend — MODIFY
| File | Change |
|---|---|
| `src/app/core/services/data.service.ts` | Add `getGoogleAuthUrl()`, `listSpreadsheets()`, `listSheets()`, `createGoogleDataset()` |
| `src/app/core/models/data.models.ts` | Add `SpreadsheetMeta`, `SheetMeta` interfaces |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "Connect Google Sheets" button |
| `src/app/app.routes.ts` | Register new Google Sheets pages |

---

## 3. Planning Documents to Update

| Document | Section | Change |
|---|---|---|
| `services/connectors.md` | `SVC-CONN-GOOGLE` | Add `GoogleSheetsConnector` entry |
| `services/data.md` | `SVC-DATA-SYNC` | Add `ScheduledSyncService` description |
| `endpoints/data.md` | Google OAuth endpoints | Add EP-DATA-24, EP-DATA-25 |
| `customer-portal/pages/data.md` | Google Sheets pages | Add connect + setup pages |
| `customer-portal/pages/_index.md` | Routes | Add new routes |

---

## 4. Ripple Effects

| Affected area | Action |
|---|---|
| `DataModule` | Import `ScheduleModule` + new providers — **must update** |
| `AppModule` | `ScheduleModule.forRoot()` must be registered at app level |
| `ConnectorsModule` | Register `GoogleSheetsConnector` — same pattern as `CsvConnector` |
| `DashboardsService.createDashboard` | Already handles any Dataset with `analyticsTable != null` — no change needed |
| Filter value refresh | Triggered by `DataSyncProcessor` after load — no change needed |

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| `googleapis` token expiry during long extract | Use `OAuth2Client.getAccessToken()` which auto-refreshes; store updated token back to `DataConnection` |
| Large sheets (>100k rows) | Page requests in 10k-row batches; yields each batch to pipeline |
| Schema drift (column moves/adds) | Detect column set change vs stored schema on each extract; surface in SyncRun error message (change-029 handles deep drift) |
| OAuth callback URL mismatch | `callbackUrl` must exactly match Google Cloud Console redirect URI; store in env + config |
| Scheduled sync fan-out | On restart, all daily datasets could enqueue at once; guard: skip if `syncStatus == SYNCING` (already in `SyncService`) |

---

## 6. Implementation Order

1. Install packages (`googleapis`, `@nestjs/schedule`)
2. `GoogleOAuthService` + Google OAuth config
3. `GoogleSheetsConnector` (testConnection, discoverSchema, extract, normalize)
4. Register connector in `ConnectorsModule`
5. `GoogleOAuthController` + `DataModule` wiring
6. `ScheduledSyncService` + `AppModule.ScheduleModule`
7. Frontend: models + service methods
8. Frontend: `GoogleSheetsConnectPage` + `GoogleSheetsSetupPage`
9. Frontend: routes + DataSources home button
10. Compile check (backend + frontend)
