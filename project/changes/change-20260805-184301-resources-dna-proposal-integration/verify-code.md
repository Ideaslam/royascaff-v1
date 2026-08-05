# Code Verification — change-20260805-184301-resources-dna-proposal-integration

## Verification Checklist

### 1. Data Model

| Check | Result |
|-------|--------|
| `dna.v2.schema.json` has optional `resources` block | PASS — added after `services`, NOT in `required` array |
| `resources.items[]` schema has `typeKey`, `name` as required | PASS |
| `project_dna_versions` persistence accepts `resources[]` | PASS — `createDnaVersionInternal` persists resources |
| `proposal.dnaSnapshot` carries `resources` | PASS — `buildDnaSnapshot` includes resources |

### 2. DNA Passthrough

| Check | Result |
|-------|--------|
| `mergeDnaAnalyzeSource()` merges resources (version > project fallback) | PASS |
| `buildDnaSkeleton()` extracts resources from project and embeds in skeleton | PASS |
| `reconcileDnaPassthrough()` locks `out.resources = skeleton.resources` | PASS — line 224 |
| AI prompt (`dna.core.v1.md`) declares resources as code-owned | PASS |

### 3. DNA Version Resolve

| Check | Result |
|-------|--------|
| `buildDnaSnapshot()` includes `resources` | PASS |
| `ResolvedDnaSource` type includes `resources: JsonObject[]` | PASS |
| `resolveDnaForProposal()` populates resources from all 4 paths | PASS |

### 4. DNA Slice

| Check | Result |
|-------|--------|
| `buildDnaSlice()` core object includes `resources: dna.resources` | PASS |
| All sections (research + non-research) receive resources in slice | PASS |

### 5. Projects Data Service

| Check | Result |
|-------|--------|
| `normalizeResourceSnapshots()` helper exists | PASS — validates + normalizes each field |
| `create()` accepts + passes resources to project + DNA version | PASS |
| `createDnaVersionInternal()` seed type includes resources | PASS |
| `updateDnaVersionInputs()` handles `patch.resources` | PASS |
| `update()` (project patch) handles `patch.resources` | PASS |

### 6. DTOs

| Check | Result |
|-------|--------|
| `UpsertProjectDto` has `resources` with `@Type(() => Object)` | PASS |
| `PatchProjectDto` has `resources` with `@Type(() => Object)` | PASS |
| `PatchDnaVersionDto` has `resources` with `@Type(() => Object)` | PASS |

### 7. Template Sections

| Check | Result |
|-------|--------|
| `pitch-landscape` has `team` section after methodology | PASS |
| `pitch-landscape` has `partners` section after team | PASS |
| `roya-presentation` `team` has `name` + `photo` + `required: ["name", "role"]` | PASS |
| `roya-presentation` has `partners` section | PASS |

### 8. HBS Partials

| Check | Result |
|-------|--------|
| `pitch-landscape/v1/partials/team.hbs` created | PASS |
| `pitch-landscape/v1/partials/partners.hbs` created | PASS |
| `roya-presentation/v1/partials/partners.hbs` created | PASS |
| `roya-presentation/v1/partials/team.hbs` updated (name + photo) | PASS |

### 9. Assemble Service

| Check | Result |
|-------|--------|
| `RESOURCES_REPOSITORY` injected | PASS |
| `enrichResourcesFromCatalog()` method added | PASS |

### 10. Frontend — Project Create

| Check | Result |
|-------|--------|
| Step labels: 5 steps (info, services, resources, files, template) | PASS |
| Resources step (step 2) with type tabs + checkbox grid + selected chips | PASS |
| Step index shifts correct (files=3, template=4) | PASS |
| `generate()` sends resources in create payload | PASS |
| CSS styles for resource picker | PASS |

### 11. Frontend — Project Edit

| Check | Result |
|-------|--------|
| Resources section in edit form | PASS |
| Hydration from DNA version / project resources | PASS |
| Resources included in both save payloads (DNA patch + project patch) | PASS |

### 12. Frontend — Service Types

| Check | Result |
|-------|--------|
| `ProjectsService.create()` accepts `resources` | PASS |
| `ProjectsService.patch()` accepts `resources` | PASS |
| `ProjectsService.patchDnaVersion()` accepts `resources` | PASS |
| `ProjectsService.createDnaVersion()` accepts `resources` | PASS |

### 13. Frontend — Models

| Check | Result |
|-------|--------|
| `ProjectDnaVersion.resources` field | PASS |
| `Project.resources` field | PASS |

### 14. i18n

| Check | Result |
|-------|--------|
| English keys: `projects.steps.resources`, `projects.resources.*` | PASS |
| Arabic keys: same structure | PASS |

### 15. Compilation

| Check | Result |
|-------|--------|
| API TypeScript compiles (`npx tsc --noEmit`) | PASS — 0 errors |
| Frontend Angular compiles (`npx ng build`) | PASS — 0 errors (1 pre-existing warning) |

### 16. Resource Types — aiContext Lite Endpoint

| Check | Result |
|-------|--------|
| `toResourceTypeLiteItem` returns `aiContext` | PASS |
| `seedForWorkspace` backfills `aiContext` on existing records missing it | PASS |

### 17. Field Hints in Snapshot

| Check | Result |
|-------|--------|
| `toggleResource()` in project-create builds `fieldHints` array from type fields | PASS |
| `toggleResource()` in project-edit builds `fieldHints` array from type fields | PASS |
| `normalizeResourceSnapshots()` preserves `fieldHints` | PASS |
| Generate payload includes `fieldHints` per resource | PASS |

### 18. buildDnaSkeleton — Structured Fields

| Check | Result |
|-------|--------|
| `buildDnaSkeleton()` builds `fields[]` with key, label, dataType, aiHint, value | PASS |
| Photo S3 URLs passed through as-is (no stripping) | PASS |
| `dna.v2.schema.json` updated with `fields` array schema | PASS |
| `dna.core.v1.md` prompt updated with field/aiHint instructions | PASS |

### 19. Dynamic Photo S3 Upload

| Check | Result |
|-------|--------|
| `uploadDynamicPhotos()` scans `data` for base64 `data:image` strings | PASS |
| Single photo fields uploaded to S3 and replaced with URL | PASS |
| Photo-list arrays: each base64 item uploaded individually | PASS |
| Upload path: `resources/{id}/data/` | PASS |
| Non-base64 values (URLs, text) left untouched | PASS |

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Project create/edit includes "Resources" picker step with type tabs, multi-select from catalog | PASS |
| 2 | Selected resources embedded in `project_dna_versions.resources[]` as snapshots with catalog ID | PASS |
| 3 | DNA v2 schema includes `resources` block; analyze populates it from DNA version | PASS |
| 4 | `reconcileDnaPassthrough()` locks resources (AI cannot modify) | PASS |
| 5 | Pipeline `buildDnaSlice()` returns resource data to section prompts | PASS |
| 6 | `team` and `partners` section keys work in `pitch-landscape` and `roya-presentation` templates | PASS |
| 7 | Proposal view renders resource-backed sections (via pre-built HTML iframe) | PASS (HBS partials created) |
| 8 | `roya-presentation` template `team` section uses resource name/photo when available | PASS |
| 9 | Resource type `aiContext` flows from catalog → lite endpoint → snapshot → DNA | PASS |
| 10 | Field-level `aiHint` values included in DNA as structured `fields[]` per resource | PASS |
| 11 | Dynamic photo fields stored as S3 URLs (not base64) in MongoDB | PASS |

## Overall: PASS
