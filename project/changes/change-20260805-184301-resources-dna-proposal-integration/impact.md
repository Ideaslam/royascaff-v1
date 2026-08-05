# Impact Analysis — change-20260805-184301-resources-dna-proposal-integration

## Change Overview

Connect the Resources catalog (Part 1) into the proposal generation pipeline: project create/edit → DNA embedding → pipeline sections → template rendering.

## Classification

| Area | Verdict |
|------|---------|
| DNA schema | **Modify** — add optional `resources` block |
| DNA passthrough | **Modify** — `buildDnaSkeleton`, `reconcileDnaPassthrough`, `buildDnaSlice` |
| DNA version resolve | **Modify** — `buildDnaSnapshot`, `resolveDnaForProposal`, `mergeDnaAnalyzeSource` |
| DNA version persistence | **Modify** — add `resources[]` field to `project_dna_versions` |
| Projects data service | **Modify** — carry resources through create / DNA version / patch |
| Projects DTO | **Modify** — add `resources` field |
| Map orchestrator | **Modify** — pass resourcesCount for capacity hints |
| Section orchestrator | **Modify** — pass resources in dnaSlice for team/partners sections |
| Template catalogs | **Modify** — add `team` to pitch-landscape; add `partners` to both |
| HBS partials | **Create** — `team.hbs` for pitch-landscape; `partners.hbs` for both |
| Roya-presentation team | **Modify** — switch from AI-invented to resource-backed with AI fallback |
| Assemble service | **Modify** — enrich resource snapshots at assemble time (photo URLs) |
| AI prompt | **Modify** — `dna.core.v1.md` → declare resources as code-owned truth |
| Project create FE | **Modify** — add Resources picker step |
| Project edit FE | **Modify** — add Resources tab/section in DNA version inputs |
| DNA form FE | **Modify** — surface resources on DNA version display |
| FE models | **Modify** — add `resources` to `ProjectDnaVersion` interface |
| i18n | **Modify** — add resource picker / section labels |

## Code Reconnaissance

### Feature state: `partial`

- Part 1 (CRUD) is `merged` — catalog + types + dynamic fields fully operational
- DNA integration: **none** — no `resources` in DNA schema / skeleton / reconcile / slice
- Project create: services picker works; no resource picker step
- Templates: `team` exists only in roya-presentation (AI-invented, no catalog data)

### Ripple map

1. `dna.v2.schema.json` → schema validation in `AnalyzeOrchestratorService` (Ajv)
2. `buildDnaSkeleton` → `reconcileDnaPassthrough` → `buildDnaSlice` chain
3. `project_dna_versions` → `buildDnaSnapshot` → `proposal.dnaSnapshot` → `resolveDnaForProposal`
4. `ProjectsDataService.create` / `createDnaVersionInternal` / `patchDnaVersion`
5. `AnalyzeOrchestratorService` → `MapOrchestratorService` → `SectionOrchestratorService`
6. Template catalogs → HBS partials → `TemplateRenderService`
7. `AssembleService.buildFinancial` (pattern ref) → new `enrichResourcesFromCatalog`
8. `dna.core.v1.md` prompt — declare resources as passthrough
9. FE: `project-create.component.ts` steps, `project-edit.component.ts` fields, `AppDataService` lite endpoint usage

### Risks

- **Schema backward compat**: `resources` must be optional in DNA schema (not in `required`)
- **AI hallucination**: resources must be code-owned in prompt instructions; reconcile must lock them
- **Template fallback**: team section must work when no resources selected (AI fallback)
- **Assemble enrichment**: resource photos may have stale S3 URLs; enrich at assemble time

## Pack Blueprint Files

| Layer | Pack file | Purpose |
|-------|-----------|---------|
| data-model | `plan/data-model-delta.md` | `resources[]` on dna_versions + DNA schema |
| service | `actions/api/services/dna-passthrough.md` | skeleton / reconcile / slice modifications |
| service | `actions/api/services/dna-version-resolve.md` | snapshot / resolve / merge modifications |
| service | `actions/api/services/projects.md` | create / patch DNA version modifications |
| service | `actions/api/services/assemble.md` | resource enrichment at assemble |
| service | `actions/api/services/template-sections.md` | team + partners section defs + HBS partials |
| page | `actions/web/pages/project-create.md` | resources picker step |
| page | `actions/web/pages/project-edit.md` | resources tab in DNA version editing |

## Dependencies

- Part 1 (`change-20260805-184300`) — **merged** ✓
- Resources `/lite` endpoint — **done** (Part 1)
- `ResourceType` and `ResourceItem` FE models — **done** (Part 1)
