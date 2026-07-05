# Verify Code — change-039

## Build / Type Checks
- Backend: `cd roya-ai-dynamo-api && npx tsc --noEmit -p tsconfig.json` → exit 0
- Frontend: `cd roya-ai-dynamo-frontend && npx ng build --configuration development` → Application bundle generation complete

## Backend Checks

### 1. UI metadata + SetupFlow types
```
grep -n "WizardStepKind\|WizardStepMeta\|SetupFlow\|ui?:" roya-ai-dynamo-api/src/modules/pipelines/pipeline.interface.ts
```
Expected: `WizardStepKind`, `WizardStepMeta`, `SetupFlow` exported; `ui?: WizardStepMeta` on `PipelineStepConfig`.

### 2. Per-source resolution + setup flow
```
grep -n "resolveIngestForSource\|getSetupFlow\|SOURCE_INGEST_OVERRIDES" roya-ai-dynamo-api/src/modules/pipelines/pipeline-type.registry.ts
```
Expected: overrides map + both methods; ingest `extract`→connect and `identify-columns`→schema-review carry `ui`.

### 3. Engine resolves per source
```
grep -n "sourceType\|resolveIngestForSource" roya-ai-dynamo-api/src/modules/pipelines/pipeline.engine.ts
```
Expected: when `pipelineType === 'ingest' && opts.sourceType`, steps come from `resolveIngestForSource`.

### 4. Processor passes sourceType
```
grep -n "sourceType: connection.sourceType" roya-ai-dynamo-api/src/modules/data/processors/data-sync.processor.ts
```

### 5. EP-DATA-41 route
```
grep -n "source-types/:type/setup-flow\|getSetupFlow" roya-ai-dynamo-api/src/modules/data/controllers/datasets.controller.ts
```

### 6. OAuth redirects updated
```
grep -rn "app/data/connect/" roya-ai-dynamo-api/src/modules/data/controllers
```
Expected: google_sheets / shopify / salla / zid redirect to `/app/data/connect/{type}?connectionId=`.

## Frontend Checks

### 7. SetupFlow model + service
```
grep -n "SetupFlow\|getSetupFlow" roya-ai-dynamo-frontend/src/app/core/services/data.service.ts roya-ai-dynamo-frontend/src/app/core/models/data.models.ts
```

### 8. Generic wizard route
```
grep -n "data/connect/:type" roya-ai-dynamo-frontend/src/app/app.routes.ts
```
Expected: single `data/connect/:type` route; per-source connect/setup routes removed.

### 9. Source registry drives Data Sources page
```
grep -n "SOURCE_DEFINITIONS" roya-ai-dynamo-frontend/src/app/pages/data/data-sources/data-sources.page.ts
```

### 10. Shared step components exist
```
ls roya-ai-dynamo-frontend/src/app/shared/components/schema-review-step roya-ai-dynamo-frontend/src/app/shared/components/schedule-step
```

### 11. All 7 connect components exist
```
ls roya-ai-dynamo-frontend/src/app/pages/data/setup/connect
```
Expected: csv, google-sheets, shopify, salla, zid, sql-server, mongodb-atlas connect components + shared scss + oauth-resume util.

### 12. Old pages removed
```
ls roya-ai-dynamo-frontend/src/app/pages/data | grep -E "csv-upload|-connect$|-setup$"
```
Expected: no matches (all migrated into `setup/`).

## Manual E2E Test Plan
1. **All sources show schema review**: Set up each source → confirm the AI-description + primary-key table appears (previously CSV-only).
2. **Backend-driven order**: `GET /api/v1/data/source-types/csv/setup-flow` returns connect → schema-review → schedule; databases return connect → schema-review → schedule with schedule cadence enabled.
3. **CSV**: upload → schema review (edit description, pick PK) → confirm & sync → lands on dataset detail, no duplicate rows.
4. **Google Sheets**: connect button → Google OAuth → returns to `/app/data/connect/google_sheets?connectionId=` → pick sheet → schema review → schedule.
5. **SQL Server / MongoDB**: creds → test → select multiple tables/collections → configure → schema review loops per dataset → schedule → all sync.
6. **Shopify / Salla / Zid**: connect → OAuth → returns to shell → auto-provisioned datasets discovered → schema review per dataset → schedule.
7. **Loader**: full-page loader shows consistent messages across upload/connect/analyze/save/sync for every source.
8. **Add-a-source check**: adding an entry to `SOURCE_DEFINITIONS` + a connect component surfaces a new card and a working wizard with shared steps — no other UI wiring.
