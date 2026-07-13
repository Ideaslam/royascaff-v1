# Bug #030 — MongoDB OLAP Engine Not Default

## Status
**DONE** — Fix confirmed by user

**Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: high
- **Affected area**: backend/workspace, analytics-store, dashboards, data sync, AI pipelines

## Description
New workspaces and analytics operations default to **ClickHouse** as the OLAP/analytical engine, but MongoDB OLAP (`mongodb`, added in change-030) should be the default choice.

## Expected Behavior
- New workspaces get `olapEngine = 'mongodb'` by default
- All code-path fallbacks when `workspace.olapEngine` is unset use `mongodb` (not `clickhouse`)
- Widget catalog resolution defaults to MongoDB OLAP for OLAP datasets

## Steps to Reproduce
1. Register a new user / create a new workspace
2. Connect a data source and sync data
3. Observe analytics load/sync/dashboard generation uses ClickHouse engine (requires ClickHouse to be running) instead of MongoDB OLAP

## Root Cause
Multiple hardcoded defaults point to ClickHouse:

1. **`workspace.schema.ts`** — `olapEngine` field default is `OlapEngineId.CLICKHOUSE`
2. **Runtime fallbacks** — `?? 'clickhouse'` or `?? OlapEngineId.CLICKHOUSE` in:
   - `dashboards.service.ts` (3×)
   - `filter-values.service.ts` (2×)
   - `data-sync.processor.ts`
   - `dashboard-generation.processor.ts`
   - `load-widget-catalog.step.ts`
3. **`widget-catalog.service.ts`** — `resolveEngineId()` returns `'clickhouse'` when workspace engine is unset
4. **`anthropic.provider.ts`** — AI prompt dialect defaults to `'clickhouse'`

MongoDB OLAP engine exists and is registered (`MongoOlapEngine`, `engineId = 'mongodb'`) but is never chosen unless explicitly set on the workspace.

## Fix Applied

1. Changed `Workspace.olapEngine` schema default from `OlapEngineId.CLICKHOUSE` to `OlapEngineId.MONGODB`
2. Updated all runtime fallbacks (`?? 'clickhouse'` / `?? OlapEngineId.CLICKHOUSE`) to `mongodb` / `OlapEngineId.MONGODB` in dashboards, filter-values, data-sync, dashboard-generation, and load-widget-catalog
3. Updated `WidgetCatalogService.resolveEngineId()` to default to `'mongodb'`
4. Updated `anthropic.provider.ts` AI dialect default to `'mongodb'`
5. Updated `data-model.md` — enum includes `mongodb`, default `mongodb`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (build passes)
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/workspace/schemas/workspace.schema.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/services/dashboards.service.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/services/filter-values.service.ts`
- `roya-ai-dynamo-api/src/modules/data/processors/data-sync.processor.ts`
- `roya-ai-dynamo-api/src/modules/ai-processing/processors/dashboard-generation.processor.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/dashboard/load-widget-catalog.step.ts`
- `roya-ai-dynamo-api/src/integrations/ai/widget-catalogs/widget-catalog.service.ts`
- `roya-ai-dynamo-api/src/integrations/ai/anthropic.provider.ts`
- `.ai-control/project/plan/data-model.md`
