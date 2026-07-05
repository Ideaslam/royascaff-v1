# Impact Analysis — change-038

## Feature State
- **DiscoveredColumn.isPrimaryKey** — none (greenfield field)
- **identify-columns step** — none (greenfield step)
- **LoadStep truncate** — complete modification (bug fix + feature)
- **ScheduledSyncService smart mode** — complete modification
- **EP-DATA-20 mode param** — partial (endpoint exists; mode accepted in body but ignored)
- **EP-DATA-40** — none (greenfield endpoint)
- **Dataset Detail UI** — modify (two sync buttons + schema editing section)
- **Data Sources UI** — modify (two sync buttons on card)

## Planning Docs Updated
- `plan/data-model.md` — DiscoveredColumn.isPrimaryKey
- `actions/backend/services/pipelines.md` — identify-columns step
- `actions/backend/services/data.md` — DatasetService.updateSchemaColumns(), SyncService/Scheduled changes
- `actions/backend/endpoints/data.md` — EP-DATA-40, EP-DATA-20 note update
- `actions/customer-portal/pages/data.md` — Dataset Detail + Data Sources pages

## Code Impact Map

### Backend — Create
| File | Action |
|------|--------|
| `src/modules/pipelines/steps/identify-columns.step.ts` | Create — new AI pipeline step |
| `src/integrations/ai/prompts/column-identify.md` | Create — AI prompt template |

### Backend — Modify
| File | Change |
|------|--------|
| `src/modules/data/schemas/dataset.schema.ts` | Add `isPrimaryKey?: boolean` to `DiscoveredColumn` |
| `src/modules/pipelines/pipeline-type.registry.ts` | Add `identify-columns` at order 15 in ingest pipeline |
| `src/modules/pipelines/pipelines.module.ts` | Register `IdentifyColumnsStep` provider |
| `src/modules/pipelines/steps/load.step.ts` | Drop+create table on FULL sync before insert |
| `src/modules/data/services/scheduled-sync.service.ts` | Use INCREMENTAL when dataset has PK column |
| `src/modules/data/dto/dataset.dto.ts` | Add `UpdateSchemaColumnsDto` + `SchemaColumnUpdateDto` |
| `src/modules/data/services/dataset.service.ts` | Add `updateSchemaColumns()` method |
| `src/modules/data/controllers/datasets.controller.ts` | Add EP-DATA-40 route; accept `mode` in EP-DATA-20 body |

### Frontend — Modify
| File | Change |
|------|--------|
| `src/app/core/models/data.models.ts` | Add `isPrimaryKey?: boolean` to `DiscoveredColumn` |
| `src/app/core/services/data.service.ts` | Add `updateSchemaColumns()`; update `triggerSync(id, mode)` |
| `public/i18n/en.json` | Add DATASET.FULL_SYNC, INCREMENTAL_SYNC, SCHEMA_COLUMNS, PRIMARY_KEY keys |
| `public/i18n/ar.json` | Arabic translations for new keys |
| `src/app/pages/data/dataset-detail/dataset-detail.page.ts` | Two sync signals + schema editing logic |
| `src/app/pages/data/dataset-detail/dataset-detail.page.html` | Two sync buttons + schema columns editor section |
| `src/app/pages/data/dataset-detail/dataset-detail.page.scss` | Styles for schema editor + sync buttons |
| `src/app/pages/data/data-sources/data-sources.page.ts` | Two sync methods |
| `src/app/pages/data/data-sources/data-sources.page.html` | Two icon buttons on dataset card |

## Ripple Effects
- `DataSyncProcessor` — no change needed; already passes `mode` through
- All connectors — no change needed; truncate is at load layer
- `DedupeStep` — unchanged; already handles exact dedup within batch
- All setup pages (Salla, Zid, Shopify, etc.) — no change; they call `triggerSync()` which defaults to FULL
