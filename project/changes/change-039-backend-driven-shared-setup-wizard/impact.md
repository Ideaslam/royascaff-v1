# Impact Analysis — change-039

## Feature State
- **Per-source pipeline resolution** — none previously (single flat `DEFAULT_INGEST_STEPS`); new
- **PipelineStepConfig.ui / WizardStepMeta / SetupFlow** — greenfield types
- **EP-DATA-41 setup-flow endpoint** — none (greenfield)
- **Generic setup wizard shell** — greenfield (`/app/data/connect/:type`)
- **Shared SchemaReviewStep / ScheduleStep** — extracted from CSV wizard; reused everywhere
- **Per-source connect components** — refactor of old bespoke connect/setup pages into thin components
- **Source registry** — greenfield single source of truth for adding sources
- **Old per-source wizard pages** — removed

## Planning Docs (to update)
- `actions/backend/services/pipelines.md` — per-source resolution + `ui` metadata + `getSetupFlow`
- `actions/backend/endpoints/data.md` — EP-DATA-41
- `actions/customer-portal/pages/data.md` — generic setup wizard + shared step components + registry

## Code Impact Map

### Backend — Modify
| File | Change |
|------|--------|
| `src/modules/pipelines/pipeline.interface.ts` | Add `WizardStepKind`, `WizardStepMeta`, `SetupFlow`; add `ui?` to `PipelineStepConfig` |
| `src/modules/pipelines/pipeline-type.registry.ts` | Add `ui` to ingest steps; `SOURCE_INGEST_OVERRIDES`; `resolveIngestForSource()`; `getSetupFlow()` |
| `src/modules/pipelines/pipeline.engine.ts` | Resolve ingest steps per `sourceType` (new `sourceType` option) |
| `src/modules/data/processors/data-sync.processor.ts` | Pass `sourceType: connection.sourceType` to the engine |
| `src/modules/data/services/dataset.service.ts` | Inject `PipelineTypeRegistry`; add `getSetupFlow()` |
| `src/modules/data/controllers/datasets.controller.ts` | Add EP-DATA-41 route |
| `src/modules/data/controllers/google-oauth.controller.ts` | Redirect to `/app/data/connect/google_sheets?connectionId=` |
| `src/modules/data/controllers/shopify.controller.ts` | Redirect to `/app/data/connect/shopify?connectionId=` |
| `src/modules/data/controllers/salla.controller.ts` | Redirect to `/app/data/connect/salla?connectionId=` |
| `src/modules/data/controllers/zid.controller.ts` | Redirect to `/app/data/connect/zid?connectionId=` |

### Frontend — Create
| File | Action |
|------|--------|
| `src/app/pages/data/setup/dataset-setup-wizard.page.{ts,html,scss}` | Generic backend-driven wizard shell |
| `src/app/pages/data/setup/source-connect.contract.ts` | `SourceConnectComponent` + `ConnectResult` |
| `src/app/pages/data/setup/source-connect.registry.ts` | `SOURCE_DEFINITIONS` + lazy connect loaders |
| `src/app/pages/data/setup/connect/*.component.ts(+html)` | Thin connect components for all 7 sources |
| `src/app/pages/data/setup/connect/connect-shared.scss` | Shared connect styles |
| `src/app/pages/data/setup/connect/oauth-resume.util.ts` | Shared e-commerce OAuth resume |
| `src/app/shared/components/schema-review-step/*` | Shared schema-review step |
| `src/app/shared/components/schedule-step/*` | Shared schedule step |

### Frontend — Modify
| File | Change |
|------|--------|
| `src/app/core/models/data.models.ts` | Add `WizardStepKind`, `WizardStepMeta`, `SetupFlow` |
| `src/app/core/services/data.service.ts` | Add `getSetupFlow(type)` |
| `src/app/app.routes.ts` | Replace per-source routes with `data/connect/:type` |
| `src/app/pages/data/data-sources/data-sources.page.ts` | Derive source cards from `SOURCE_DEFINITIONS` |

### Frontend — Remove
- `pages/data/{csv-upload, google-sheets-connect, google-sheets-setup, shopify-connect, shopify-setup, salla-connect, salla-setup, zid-connect, zid-setup, sql-server-connect, mongodb-atlas-connect}/`

## Ripple Effects
- Runtime sync behaviour unchanged except `apply-mapping` now skipped for DB/e-commerce sources (they arrive canonical / schema-authoritative). CSV + Google Sheets keep the full pipeline.
- OAuth callback URLs changed — provider redirect_uri config is unchanged (still hits backend); only the *frontend* landing URL changed, which the backend controls.
- Connectors unchanged. `PageLoaderComponent` unchanged (now hosted by the shell).
- Verified: `tsc --noEmit` (backend) exit 0; `ng build` (frontend) success.
