# Impact Analysis — Create Project form parity with Creative

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / DNA | partial | `dna.v2.schema.json`, `dna-passthrough.ts` | Supports `digitalPresence`, `competitors[{url}]`, `budget`, `duration`, `summaryUser`; create form does not send them correctly |
| Service(s) | complete | `projects.data.service.ts` create/update | Accepts free-form `info` + services; no field-level validation beyond competitors max 3 |
| Endpoint(s) | complete | projects controllers (existing) | No new endpoints required |
| Page(s) | partial | `project-create.component.ts` | Missing digital presence, separate competitors, description/KPIs/budget/duration, catalog services, create-client, upload UX |
| Reference UI | complete | `creative.component.ts` + `creative-form-options.ts` + `CreateClientDialogComponent` | Patterns to reuse |

Feature state: **partial**

## Affected Modules
- **Projects (web)** — rewrite Create Project wizard UX + payload
- **Projects (api)** — small DNA skeleton mapping (KPIs seed, description → summaryUser; ensure digitalPresence passthrough already OK)
- **Creative** — read-only reference (no product changes)

## Pack blueprint files to create
- [ ] `blueprint/actions/web/pages/projects.md` — PG-PROJECTS-02 after-state
- [ ] `blueprint/plan/data-model.md` — `projects.info` delta fields
- [ ] `blueprint/actions/api/services/projects.md` — DNA skeleton mapping notes
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files to modify (implement later)
| App | Path | Action |
|-----|------|--------|
| web | `pages/projects/project-create/project-create.component.ts` | Major UI + form model + submit payload |
| web | `assets/i18n/en.json`, `ar.json` | Keys for new fields / validation (reuse `creative.*` where possible) |
| web | reuse `shared/create-client-dialog`, `core/constants/creative-form-options.ts`, `AppDataService.listServices*` | No/low change |
| api | `pipeline-v3/analyze/dna-passthrough.ts` | Map `info.kpis` / description into skeleton; keep digitalPresence/competitors |
| api | `services/data/projects.data.service.ts` | Optional: normalize competitors to `{url}`; accept richer `info` (likely already OK) |

## Ripple effects
- Analyze/Map quality improves when competitors URLs + digital presence + description are present
- Existing projects without new fields still valid (optional fields except description required on create)

## Risk
- Complexity: **M** (large FE component rewrite)
- Cross-module: **Y** (FE + DNA mapping)
- Migration: **N**

## Recommendation
- **Modify**: Create Project page + DNA passthrough mapping
- **Reuse**: Creative form options, create-client dialog, services catalog loading patterns from Creative
- **Fix**: competitors payload `{url}` (critical bug)

## Status target (after implement)
- PG-PROJECTS-02 → done
- DNA info mapping → done
`)