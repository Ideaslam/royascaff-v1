# Impact Analysis — Change 049: Canonical Dashboard Templates

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema — template catalog (Industry / IndustryField / DashboardTemplate) | none | — (new `src/modules/templates/schemas/`) | Entirely greenfield; follow `datasource_type_meta` global-collection pattern |
| Schema — canonical dictionary | partial | `src/modules/data/config/canonical-fields.config.ts` | Has `arbitrary/orders/products/customers`; missing `marketing_spend` (+ synonyms) |
| Service(s) — template catalog | none | — (new `IndustryService`, `TemplateCatalogService`) | Greenfield |
| Service(s) — dashboards | complete | `src/modules/dashboards/services/dashboards.service.ts` | `createDashboard()` exists; needs new `createDashboardFromTemplate()` (same enqueue pattern, different pipeline type) |
| Service(s) — canonical views | **partial (infra only)** | `src/modules/analytics-store/analytics-store.service.ts` → `createCanonicalView()`; engines implement it (ClickHouse UNION ALL / BigQuery / Mongo `$unionWith`) | **No application caller anywhere** — cross-source canonical views are never created today. Template instantiation must create/refresh `cv_{workspaceSlug}_{semanticFlag}` views from the selected datasets |
| Repository — datasets by semanticFlag | partial | `src/modules/data/repositories/dataset.repository.ts` (index `{ semanticFlag: 1 }` exists) | No `findBySemanticFlag` query method — needed by the customer template picker |
| Pipeline — engine/step/type registries | complete | `src/modules/pipelines/` (`PipelineEngine`, `StepRegistry`, `PipelineTypeRegistry`) | Extension-ready: new action = new steps + one type registration; no engine changes needed |
| Pipeline — dashboard steps | complete | `src/modules/pipelines/steps/dashboard/` | Reusable as-is: `gather-dataset-schemas`, `build-filters`, `save-widgets`, `invalidate-widget-cache`. New steps needed: `instantiate-template-widgets`, `adapt-template-widgets-ai` |
| Worker — generation queue | complete | `src/modules/ai-processing/processors/dashboard-generation.processor.ts` | Runs fixed `pipelineType: 'dashboard-generate'`; needs to read pipeline type from job payload (template vs free-form) |
| Endpoint(s) — admin catalog CRUD | none | — (new `admin-template-catalog.controller.ts`) | Greenfield; follow `admin-datasource-types.controller.ts` (`@Roles(ADMIN)`, global guards) |
| Endpoint(s) — customer browse + from-template | none | — | New `GET /templates/industries`, `GET /templates` (active only) + `POST /dashboards/from-template` |
| Seed | none | — (new `src/database/seeds/template-catalog.seed.ts`) | Follow `datasource-type-meta.seed.ts` pattern (idempotent upsert, package.json script) |
| Admin pages | none | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/` | Follow `data-source-types.page.ts` pattern: standalone page(s), inline template, `core/services/*-admin.service.ts`, route in `app.routes.ts`, nav item in `app-shell.ts`. Admin app has **no ngx-translate** — bilingual via `*En`/`*Ar` form fields |
| Customer pages | partial | `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts` | Create-dashboard is a 2-step dialog wizard here (no dedicated page). Add "Start from template" path; dataset select currently filters only `analyticsTable != null` — template path must also match `semanticFlag` per required model |

Feature state: **none** (new module) with **partial** foundations (canonical dictionary, pipeline registries, view infra).

## Affected Modules

- **NEW: Templates (Canonical Template Catalog)** — backend module `src/modules/templates/` (schemas, repos, services, admin + public controllers, seed), registered in `app.module.ts` (pattern: `ColorTemplatesModule` — global collections, not workspace-prefixed).
- **Data** — add `marketing_spend` to `canonical-fields.config.ts` (+ `CANONICAL_SYNONYMS` entries); add `DatasetRepository.findBySemanticFlags(workspaceSlug, flags[])`.
- **Dashboards** — `POST /dashboards/from-template` endpoint + `createDashboardFromTemplate()` service method (validates template, datasets per required model, enqueues job with `pipelineType: 'dashboard-from-template'`).
- **Pipelines** — register `dashboard-from-template` type: `gather-dataset-schemas (10) → ensure-canonical-views (15, new) → instantiate-template-widgets (20, new) → adapt-template-widgets-ai (30, new) → build-filters (35) → save-widgets (40) → invalidate-widget-cache (50)`.
- **Analytics Store** — no interface change; `ensure-canonical-views` step calls existing `createCanonicalView()` with view name `cv_{workspaceSlug}_{semanticFlag}` (first real caller).
- **AI Processing** — `DashboardGenerationProcessor` reads pipeline type from job payload (default `dashboard-generate` — backward compatible).
- **AI Provider (prompts)** — new prompt template `adapt-template-widgets.md` for the AI adaptation step.
- **Admin Panel** — new `/app/template-catalog` page(s) (industries, fields, templates + blueprint JSON editor), new `template-catalog-admin.service.ts`, route + nav item.
- **Customer Portal** — extend `ProjectDetailPage` create wizard with "Start from template" branch (browse industries/fields/templates → dataset-per-required-model selection → create); new `templates.service.ts`; `DashboardsService.createFromTemplate()`; reuse `/app/dashboards/:id/generating` polling unchanged; i18n keys en/ar.

## Ripple / Impact Map

| Item | Classification | Action |
|------|----------------|--------|
| `canonical-fields.config.ts` | modify | Add `marketing_spend` fields + synonyms; existing mapping UI picks it up automatically (dictionary-driven) |
| `dashboard-generation.processor.ts` | modify | Payload-driven pipeline type; default preserves current behavior |
| `dataset.repository.ts` | modify | Add semanticFlag query (additive) |
| `pipeline-type.registry.ts` | modify | Register new type (additive) |
| `pipelines.module.ts` | modify | Register 3 new step providers (additive) |
| `dashboards.controller.ts` / `dashboards.service.ts` / `dashboard.dto.ts` | modify | New endpoint + method + DTO (additive; EP-DASH-01 unchanged) |
| `app.module.ts` | modify | Import new `TemplatesModule` |
| `project-detail.page.ts/html` | modify | New wizard branch; existing free-form path unchanged |
| Mapping UI (schema-review step) | none | Dictionary-driven — no code change for `marketing_spend` |
| Existing dashboards/widgets/viewer | none | From-template dashboards produce standard `ChartWidget` docs with `querySpec`; viewer path unchanged |

## Plan Docs to Update

- [ ] `plan/modules.md` — new module **22. Canonical Templates** (+ note under Dashboards feature 1, Data module canonical dictionary)
- [ ] `plan/data-model.md` — new collections `template_industries`, `template_industry_fields`, `dashboard_templates`; note `marketing_spend` in canonical/enum reference
- [ ] `actions/backend/services/` — new `templates.md` (+ `_index.md` row); update `dashboards.md` (new method), `pipelines.md` (new type + steps), `data.md` (repo method)
- [ ] `actions/backend/endpoints/` — new `templates.md` EP-TPL-01.. (+ `_index.md` row); update `dashboards.md` (EP-DASH-16 from-template)
- [ ] `actions/admin-panel/pages/` — new `template-catalog.md` (+ `_index.md` row)
- [ ] `actions/customer-portal/pages/` — update `projects.md` (create wizard template branch) + `_index.md` if needed
- [ ] `project/description.md` — new module summary
- [ ] `project/rules.md` — canonical view naming rule (`cv_{ws}_{flag}`), template catalog is global/admin-owned

## Architecture Review (part of this change)

Deliverable: `architecture-review.md` in this change folder. Recon verdicts to elaborate there:
- **a. Datasource engine** — clean: connectors + registry + sync queue + OLAP load are isolated; adding a source = connector + registry line. No refactor needed.
- **b. Pipeline engine** — clean: engine/step/type registries generic. Light refactor: worker's hardcoded pipeline type (see ripple) so any action can be queued through the same worker.
- **c. Processing actions** — pattern proven (`dashboard-generate`, widget CRUD); this change adds `dashboard-from-template` as the template for future `data-clean` / `forecast` actions. Gap being closed: canonical views never materialized (infra without caller).

## Risk

- Complexity: **H** (new module across 3 repos + first canonical-view wiring), cross-module: **Y**, migration: **N** (new collections only; seed is idempotent).
- Notable risk: canonical union views require consistent column mapping across selected datasets — `ensure-canonical-views` must validate each dataset's `columnMapping` covers the template's required fields and fail with a clear error otherwise.

## Recommendation

- **Create**: `TemplatesModule` (schemas/repos/services/controllers/seed) · `dashboard-from-template` pipeline type + 3 steps (`ensure-canonical-views`, `instantiate-template-widgets`, `adapt-template-widgets-ai`) · `adapt-template-widgets.md` prompt · `POST /dashboards/from-template` · admin template-catalog pages + service · customer template-picker wizard branch + `templates.service.ts` · seed script `seed:template-catalog`.
- **Complete**: canonical-view wiring (infra exists, no caller) · `marketing_spend` canonical model (dictionary is extensible by design).
- **Modify (ripple)**: `dashboard-generation.processor.ts` (payload pipeline type) · `dataset.repository.ts` (semanticFlag query) · `pipeline-type.registry.ts` / `pipelines.module.ts` (registrations) · dashboards controller/service/DTO · `app.module.ts` · `project-detail.page` (wizard branch).
