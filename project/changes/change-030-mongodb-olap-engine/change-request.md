# Change Request 030 — MongoDB as OLAP Storage Engine + Type-Coercion Encapsulation

## Metadata

| Field | Value |
|-------|-------|
| Change # | 030 |
| Date | 2026-07-03 |
| Type | new-feature + refactor |
| Target app | backend |
| Author | AI-Control |

## Scope

- **Backend**: Add MongoDB as a third OLAP engine option (alongside ClickHouse and BigQuery). Move all DB-specific data type coercion out of the generic pipeline steps and into each OLAP engine's own files.
- **Frontend**: No changes needed — the frontend receives normalised data regardless of the underlying engine.

## Description

### Problem
1. `LoadStep` contained ClickHouse-specific date coercion (`YYYY-MM-DD HH:MM:SS` format) that leaked DB knowledge into the generic pipeline.
2. There was no MongoDB OLAP engine option, despite the architecture supporting pluggable engines.
3. `WidgetCatalogService.resolveEngineId()` hardcoded `'clickhouse'` for all OLAP data sources, ignoring the workspace's configured engine.
4. AI mode determination (`useOlap`) in pipeline steps relied on `engineId !== 'mongodb'` — breaking when MongoDB is the OLAP engine.

### Desired Behaviour
- Each OLAP engine handles its own type coercion in `insertRows()` — no DB-specific logic outside `integrations/olap/`.
- MongoDB can be selected as the workspace OLAP engine (`workspace.olapEngine = 'mongodb'`) using a separate connection URI (`MONGODB_OLAP_URI`).
- The ingest pipeline, dashboard generation, filter values, and AI widget prompts all work correctly when switching between ClickHouse, BigQuery, and MongoDB.

## Acceptance Criteria

1. `OlapEngineId.MONGODB` exists and can be set on a workspace.
2. `MONGODB_OLAP_URI` and `MONGODB_OLAP_DATABASE` env vars configure a separate MongoDB connection for OLAP storage.
3. Ingest pipeline completes successfully with MongoDB as the OLAP engine: data is stored as BSON documents with native Date objects.
4. `LoadStep` no longer contains any date formatting code — that logic lives in `ClickHouseEngine.insertRows()`.
5. `BigQueryEngine.insertRows()` accepts schema parameter (no-op, BigQuery handles ISO strings natively).
6. `MongoOlapEngine.insertRows()` converts canonical ISO-string dates to BSON Date objects before insert.
7. Dashboard widget AI generation uses `querySpec` format (not `queryDefinition.pipeline`) when MongoDB is the OLAP engine.
8. `WidgetCatalogService.resolveEngineId()` respects the workspace's configured engine, not hardcoding ClickHouse.
9. Frontend receives the same data structure regardless of which OLAP engine is used.
