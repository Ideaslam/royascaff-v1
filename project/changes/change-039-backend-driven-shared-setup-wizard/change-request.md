# Change Request

## Metadata
- **date**: 2026-07-05
- **change-type**: refactor + new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, Pipelines
- Feature(s): Backend-driven data-source setup wizard; shared, reusable pipeline-step UI components
- Endpoint(s): EP-DATA-41 (new) `GET /data/source-types/:type/setup-flow`
- Page(s)/View(s): Generic `DatasetSetupWizardPage` (`/app/data/connect/:type`), Data Sources Page
- Component(s): `SchemaReviewStepComponent`, `ScheduleStepComponent`, `PageLoaderComponent`, per-source connect components
- Service(s): PipelineTypeRegistry, PipelineEngine, DataSyncProcessor, DatasetService

## Description

Every data source previously shipped its own bespoke setup wizard page, duplicating
the schema-review and schedule steps; only CSV had the new AI-description + primary-key
schema-review UI. This change makes the whole setup flow **backend-driven and shared**:
only the source-specific *extract/connect* step is unique per source; every other step
is a shared component whose presence and order are dictated by the backend pipeline.

### Backend
1. **Per-source pipeline resolution** — `PipelineStepConfig` gains an optional `ui`
   descriptor (`{ kind: 'connect' | 'schema-review' | 'schedule', label, order }`).
   The registry defines one base ingest pipeline plus per-source overrides
   (`SOURCE_INGEST_OVERRIDES`) that enable/disable/reorder steps. `resolveIngestForSource()`
   is the single source of truth for both the runtime pipeline and the setup wizard.
2. **PipelineEngine** now resolves ingest steps per `sourceType`; `DataSyncProcessor`
   passes `connection.sourceType` so each source runs its own step set (e.g. databases
   and e-commerce sources skip `apply-mapping`).
3. **EP-DATA-41** `GET /data/source-types/:type/setup-flow` returns the ordered shared
   wizard steps for a source type, derived from the resolved pipeline.

### Frontend
4. **Generic wizard shell** `DatasetSetupWizardPage` at `/app/data/connect/:type` fetches
   the setup flow, dynamically mounts the source's connect component from a registry, then
   renders the shared `SchemaReviewStepComponent` (looping over datasets) and
   `ScheduleStepComponent` in backend order. It owns the shared `app-page-loader`.
5. **Shared step components** — `SchemaReviewStepComponent` (AI descriptions + PK toggle +
   optional semantic mapping) and `ScheduleStepComponent` (sync cadence + first sync),
   reused by every source.
6. **Thin connect components** — each source (`csv`, `google_sheets`, `shopify`, `salla`,
   `zid`, `sql_server`, `mongodb_atlas`) implements a small `SourceConnectComponent`
   contract emitting created `datasetIds`. OAuth sources resume via
   `?connectionId=` after the provider redirect.
7. **Source registry** (`SOURCE_DEFINITIONS`) — the one place to register a new source; the
   Data Sources page and the wizard both derive from it. Old per-source wizard pages removed.
8. OAuth callback redirects updated to `/app/data/connect/{type}?connectionId=…`.

## Acceptance Criteria
1. Every data source (CSV, Google Sheets, Shopify, Salla, Zid, SQL Server, MongoDB Atlas)
   shows the AI-generated column descriptions + primary-key selector during setup — not just CSV.
2. The setup wizard's steps and their order come from the backend `setup-flow` endpoint.
3. Adding a new data source requires only a connect component + a registry entry; no new
   schema-review or schedule UI.
4. `GET /data/source-types/:type/setup-flow` returns an ordered list of shared steps.
5. Each source's runtime ingest pipeline is resolved per source (e.g. databases/e-commerce
   skip `apply-mapping`) and existing syncs still succeed with no row duplication.
6. OAuth sources resume into the shared schema-review/schedule steps after the provider redirect.
7. The full-page loader appears consistently across all sources during upload/connect/analyze/sync.
8. Frontend builds and backend type-checks with no errors.
