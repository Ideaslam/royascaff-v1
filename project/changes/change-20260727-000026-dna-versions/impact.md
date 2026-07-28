# Impact Analysis — DNA Versions (change-20260727-000026)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | partial | `projects` Mongo docs (`dna` blob + inputs on project); proposals pin numeric `dnaVersion` | No `project_dna_versions` collection; no `dnaVersionId` / `dnaSnapshot` |
| Service(s) | partial | `projects.data.service.ts` (getDna, enqueueRegenerateDna, createProposalFromProject); `analyze-orchestrator.service.ts`; map/section/assemble read live `project.dna` | Per-version CRUD/generate; analyze/map from version snapshot; proposal freeze |
| Endpoint(s) | partial | `projects.controller.ts` EP-PROJECTS-01..11 | No DNA-versions routes; PATCH is full edit; proposals body has no `dnaVersionId` |
| Page(s) | none | `project-detail`, `project-edit`, `project-dna`, `project-create`, sibling dialogs | No version list/picker; edit project = full form; DNA page read-only |

Feature state: **partial** (numeric pin only; no history / picker / snapshot ownership)

## Affected Modules
- **Projects (API)** — new DNA versions repository + service methods; narrow project PATCH to shell; create project → shell + first DNA; RFP/images/palette/services move to DNA version ownership
- **Pipeline v3 Analyze / Map / Section / Assemble / Regen** — resolve DNA + inputs via `dnaVersionId` / proposal `dnaSnapshot`; job payload carries `dnaVersionId`; per-version regenerating lock (409)
- **Proposals create-from-project** — require/default `dnaVersionId`; copy immutable `dnaSnapshot` (+ services from version)
- **Projects (Web)** — workspace DNA list; DNA create/edit routes (rename form); remove full edit; create-proposal DNA picker (detail + proposal-view sibling); i18n
- **Migration** — one-off backfill script (legacy `projects.dna` + inputs → first version)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — `project_dna_versions` + project shell + proposal pin fields (`## Delta`)
- [ ] `blueprint/plan/modules.md` — Projects / Pipeline slices (`## Delta`)
- [ ] `blueprint/actions/api/services/projects.md` — DNA versions + narrowed project update
- [ ] `blueprint/actions/api/endpoints/projects.md` — new EPs + EP-PROJECTS-04/08/09/10 deltas
- [ ] `blueprint/actions/api/services/pipeline-v3.md` (or analyze slice) — job pin + snapshot read path
- [ ] `blueprint/actions/web/pages/projects.md` — PG workspace / DNA form / retire edit; create-proposal picker
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity **H**, cross-module **Y**, migration **Y**

| Risk | Mitigation |
|------|------------|
| Mongo 16MB / heavy project docs | Separate collection (confirmed) |
| Hard-delete breaks regen/translate | Freeze `dnaSnapshot` on proposal at create |
| Pipeline still reads live `project.dna` / images / services | Rewire map/section/assemble to snapshot-first |
| Concurrent generate same version | `regenerating` + 409 |
| Failed analyze leaves regenerating stuck | Clear flag / set failed status on version |
| Create/edit FE duplication (~1k lines each) | Rename/repurpose edit → DNA form; extract shared pieces only if needed |
| Numeric `dnaVersion` / `useLatestDna` | Prefer `dnaVersionId`; map “latest ready” explicitly |
| Lossy history migration | One version from current project state only (accepted) |

## Recommendation
- **Create**: `project_dna_versions` collection + repo; DNA version endpoints (list/create/get/patch/delete/generate/rename/content); FE DNA list + DNA form routes; backfill script; proposal `dnaSnapshot`
- **Modify**: Analyze/map/section/assemble/regen to resolve DNA by version/snapshot; `createProposalFromProject`; narrow `PATCH /projects/:id`; create-project to emit first DNA; project-detail / create / sibling dialogs; retire PG-PROJECTS-04 full edit + project-level regenerate
- **Complete**: N/A (history feature effectively absent)
- **Ripple**: proposal-view sibling; `dna-stale` util (per-version or drop); i18n en/ar; `TENANT_ISOLATED_COLLECTIONS`

### Code impact (primary)

**API**
- New: `project-dna-versions` repository + contract; wire persistence module / tenant list
- `projects.controller.ts`, `projects.data.service.ts`, `projects.dto.ts`
- `analyze-orchestrator.service.ts`, `dna-passthrough.ts`, `pipeline-queue.service.ts`
- `map-orchestrator.service.ts`, `section-orchestrator.service.ts`, `assemble.service.ts`, `proposal-regenerate.service.ts`
- `scripts/backfill-project-dna-versions.js` (pattern: `backfill-legacy-proposals-to-projects.js`)

**Web**
- `app.routes.ts`
- `project-detail`, `project-create`, `project-edit`→DNA form, `project-dna` (fold/redirect)
- `projects.service.ts`, `app.models.ts`
- Proposal sibling dialogs (`project-detail`, `proposal-view`)
- `en.json` / `ar.json`; `dna-stale.ts`

### Suggested routes / endpoints

```
GET/POST   /api/data/projects/:id/dna-versions
GET/PATCH  /api/data/projects/:id/dna-versions/:vid
DELETE     /api/data/projects/:id/dna-versions/:vid
POST       /api/data/projects/:id/dna-versions/:vid/generate
PATCH      /api/data/projects/:id/dna-versions/:vid/rename
PUT        /api/data/projects/:id/dna-versions/:vid/content   # AJV dna.v2

FE:
/projects/:id                      DNA list + shell header + proposals
/projects/:id/dna/new              create (blank|copyFrom)
/projects/:id/dna/:dnaVersionId    edit inputs + generated + Generate
```

## Status target (per artifact in the pack after implement)
- Data model `project_dna_versions` → planned → done
- EP DNA versions (list/create/get/patch/delete/generate/rename/content) → planned → done
- EP-PROJECTS-04 shell-only + EP-PROJECTS-10 `dnaVersionId` → planned → done
- Analyze/queue/map/assemble/regen snapshot path → planned → done
- PG workspace DNA list + DNA form + picker → planned → done
- Retire full Edit Project page → planned → done
- Migration script → planned → done

## Dependencies
- depends-on: — — none
