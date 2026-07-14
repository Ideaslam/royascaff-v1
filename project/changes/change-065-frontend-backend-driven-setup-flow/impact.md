# Impact Analysis — Frontend backend-driven setup flow (cleanup)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| FE wizard shell | complete | `pages/data/setup/dataset-setup-wizard.page.ts` (+`.html`) | re-injects choose-connection; `isCsv`/`!== 'csv'` hardcoding; hardcoded error fallback; csv-based mount |
| FE source registry | complete | `pages/data/setup/source-connect.registry.ts` | fine (loader + styling); dual-metadata w/ backend meta — out of scope |
| FE step components | complete | `shared/components/{choose-connection,entity-select,schema-review,schedule,schema-discovery-status}` | shared + reused — no change |
| FE models | complete | `core/models/data.models.ts` | `WizardStepMeta` needs optional `config?` |
| FE reporting | complete | `core/services/{dashboards,filter,export}.service.ts`, `shared/widgets/widget-registry.ts` | already isolated/extensible — no change |
| BE setup-flow | complete | `engine-core/pipeline.interface.ts`, `modules/data/pipeline/data-source-pipeline.service.ts` | add optional `WizardStepMeta.config`; set `allowPolicy` on schedule step |

Feature state: **complete** (behavior-neutral cleanup of a working, mostly-backend-driven wizard).

## Affected Modules
- **customer-portal `pages/data/setup`** — `dataset-setup-wizard.page.ts`: drop csv flow logic + choose-connection injection; flow-driven connect mount; `allowPolicy` from backend; error→retry. `.html`: add Retry action to the error banner.
- **customer-portal `core/models`** — mirror `WizardStepMeta.config?`.
- **backend `engine-core`** — `WizardStepMeta.config?: Record<string, unknown>` (generic, neutral).
- **backend `modules/data`** — `DataSourcePipelineService.getSetupFlow` attaches `config: { allowPolicy: !oneShot }` to the schedule step.

## Plan Docs to Update
- [ ] `project/actions/customer-portal/pages.md` — update the setup-wizard page entry: fully backend-driven flow, no source-type hardcoding (if such an entry exists; else note in the data pages section).
- [ ] `project/actions/backend/services/pipelines.md` — note the schedule step's `config.allowPolicy` signal on `SVC-DATA-PIPELINE.getSetupFlow`.
- [ ] `project/rules.md` — RULE-DATA-004 already says the flow is backend-driven; extend to state the frontend must not re-derive/hardcode per-source flow.
- No data-model / endpoint / new-service changes.

## Ripple / callers
- `WizardStepMeta.config?` is additive/optional — existing consumers (`source-detail`, `data-sources`, `connections` pages) unaffected.
- Connect-mount timing: CSV connect now mounts after `getSetupFlow` resolves (one GET) instead of at view-init — near-instant; OAuth-resume immediate mount retained.

## Risk: complexity **L–M**, cross-module **Y** (FE wizard + BE flow), migration **N**
- Main risk: connect-mount timing + flow parity across 7 sources — mitigated by exact flow mapping + build/boot verification and a manual flow-parity check per source category.

## Recommendation
- **Modify**: FE `dataset-setup-wizard.page.{ts,html}`, FE `data.models.ts`; BE `pipeline.interface.ts`, `data-source-pipeline.service.ts`.
- **Keep**: shared step components, source registry loader, `addingTables` mode, OAuth-resume mount.
