# Verify Code — change-038

## Backend Checks

### 1. IdentifyColumnsStep wired correctly
```
grep -r "identify-columns" roya-ai-dynamo-api/src
```
Expected: appears in `pipeline-type.registry.ts` (order 15) and `pipelines.module.ts` (provider).

### 2. isPrimaryKey in DiscoveredColumn
```
grep -n "isPrimaryKey" roya-ai-dynamo-api/src/modules/data/schemas/dataset.schema.ts
```
Expected: `isPrimaryKey?: boolean;` present.

### 3. LoadStep truncates on FULL sync
```
grep -n "dropDatasetTable\|SyncRunMode.FULL" roya-ai-dynamo-api/src/modules/pipelines/steps/load.step.ts
```
Expected: `dropDatasetTable` called when `mode === SyncRunMode.FULL`.

### 4. ScheduledSyncService uses INCREMENTAL for datasets with PK
```
grep -n "INCREMENTAL\|isPrimaryKey" roya-ai-dynamo-api/src/modules/data/services/scheduled-sync.service.ts
```
Expected: INCREMENTAL chosen when `schema.some(c => c.isPrimaryKey)`.

### 5. EP-DATA-40 route exists
```
grep -n "schema-columns\|updateSchemaColumns" roya-ai-dynamo-api/src/modules/data/controllers/datasets.controller.ts
```
Expected: `PATCH('datasets/:id/schema-columns')` handler.

### 6. EP-DATA-20 accepts mode
```
grep -n "mode.*incremental\|SyncRunMode" roya-ai-dynamo-api/src/modules/data/controllers/datasets.controller.ts
```
Expected: mode read from body, `SyncRunMode.INCREMENTAL` used when `body.mode === 'incremental'`.

### 7. UpdateSchemaColumnsDto defined
```
grep -n "UpdateSchemaColumnsDto\|SchemaColumnUpdateDto" roya-ai-dynamo-api/src/modules/data/dto/dataset.dto.ts
```
Expected: both classes present with proper validators.

### 8. column-identify.md prompt exists
```
ls roya-ai-dynamo-api/src/integrations/ai/prompts/column-identify.md
```

## Frontend Checks

### 9. DiscoveredColumn has isPrimaryKey
```
grep -n "isPrimaryKey" roya-ai-dynamo-frontend/src/app/core/models/data.models.ts
```
Expected: `isPrimaryKey?: boolean;` in `DiscoveredColumn`.

### 10. DataService.triggerSync accepts mode
```
grep -n "triggerSync" roya-ai-dynamo-frontend/src/app/core/services/data.service.ts
```
Expected: `triggerSync(id: string, mode: 'full' | 'incremental' = 'full')`.

### 11. DataService.updateSchemaColumns exists
```
grep -n "updateSchemaColumns" roya-ai-dynamo-frontend/src/app/core/services/data.service.ts
```
Expected: method calling `PATCH /data/datasets/:id/schema-columns`.

### 12. Dataset detail page — dual sync buttons
```
grep -n "triggerFullSync\|triggerIncrementalSync" roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/dataset-detail.page.html
```
Expected: both methods referenced.

### 13. Dataset detail page — schema editor
```
grep -n "editableSchema\|schema-table\|saveSchemaColumns" roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/dataset-detail.page.html
```
Expected: `editableSchema()` iterated in a p-table with description input and PK checkbox.

### 14. Data sources page — dual sync buttons
```
grep -n "triggerFullSync\|triggerIncrementalSync" roya-ai-dynamo-frontend/src/app/pages/data/data-sources/data-sources.page.html
```
Expected: both buttons present in dataset card actions.

### 15. i18n keys present (en.json)
```
grep -n "FULL_SYNC\|INCREMENTAL_SYNC\|SCHEMA_COLS_TITLE\|PRIMARY_KEY\|SAVE_SCHEMA" roya-ai-dynamo-frontend/public/i18n/en.json
```
Expected: all keys present.

## Manual E2E Test Plan

1. **Full sync clears data**: Sync dataset → rows appear. Modify source (add rows). Sync again (FULL). Row count reflects *only* new data, no duplicates.
2. **identify-columns runs**: After first sync, open dataset detail → Schema Columns section shows AI-generated descriptions.
3. **PK checkbox enforcement**: Check PK on column A → verify column B's checkbox clears.
4. **Save schema**: Edit a description → Save → Reload page → verify description persists.
5. **Incremental sync enabled**: Dataset with PK → Incremental button is active. Dataset without PK → Incremental button disabled with tooltip.
6. **Scheduled sync mode**: Verify log shows `mode=incremental` for datasets with PK, `mode=full` for others.
7. **Data sources page**: Both icon buttons visible on each card; Incremental button disabled (greyed) for datasets with no PK.
