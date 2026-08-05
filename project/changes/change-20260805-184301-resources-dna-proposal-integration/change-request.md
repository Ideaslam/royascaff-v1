# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-CATALOG
- **part**: 2/2
- **depends-on**: change-20260805-184300
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Projects (modify), Creative/Pipeline (modify), Templates (modify), Resources (from Part 1)
- Feature(s): Resources picker in project create/edit, DNA embedding, proposal section generation
- Endpoint(s): modify project DNA endpoints, resources `/lite` for picker
- Page(s)/View(s): web: project-create (resources step), project-edit (resources tab), proposal view (resource sections)
- Service(s): ProjectsDataService (modify), Pipeline analyze/map/section (modify)

## Description

### Problem
Part 1 creates the Resource Types + Resources catalog. This part connects resources to the proposal generation pipeline — so selected team members, partners, and collaborators appear in AI-generated proposals.

### Solution — DNA Integration + Proposal Sections

#### Project Create/Edit — Resources Picker
- New step/section in project create and project-edit flows: "Resources"
- Grouped by resource type (tabs matching workspace's defined types)
- Multi-select from resources catalog via `/lite` endpoint
- Selected resources stored as embedded snapshots on `project_dna_versions.resources[]`:
  ```
  { id, typeKey, typeName, name, photo, summary, data: {…}, aiContext }
  ```
- Same snapshot pattern as services: catalog ID for later enrichment, but data is frozen at selection time

#### DNA Schema Extension
- Add `resources` block to `dna.v2.schema.json`:
  - `resources.items[]` — array of selected resource snapshots grouped by type
  - Resources are code-owned (like services.items) — AI must not invent/modify them
- `buildDnaSkeleton()` populates `dna.data.resources` from DNA version resources
- `reconcileDnaPassthrough()` locks resources (same as services)

#### Pipeline / Template Sections
- New section keys available for templates: `team`, `partners`, `collaborators` (or generic `resources` with type-based grouping)
- Section AI writers receive resource data via `buildDnaSlice('resources')` filtered by type
- Content schemas per section type (e.g., team members → name/role/focus cards; partners → logo/name/description cards)
- Existing `roya-presentation` template's `team` section becomes resource-backed instead of AI-invented

#### Proposal View
- Resource-based sections render with appropriate layouts per type (team → people cards, partners → logo grid, collaborators → portfolio cards)

## Acceptance Criteria
1. Project create/edit includes "Resources" picker step with type tabs, multi-select from catalog
2. Selected resources embedded in `project_dna_versions.resources[]` as snapshots with catalog ID
3. DNA v2 schema includes `resources` block; analyze populates it from DNA version
4. `reconcileDnaPassthrough()` locks resources (AI cannot modify)
5. Pipeline `buildDnaSlice('resources')` returns resource data filtered by section type
6. At least `team` and `partners` section keys work in `pitch-landscape` and `roya-presentation` templates
7. Proposal view renders resource-backed sections with appropriate card layouts
8. `roya-presentation` template `team` section uses real resource data when available (falls back to AI-generated if no team resources selected)

## Notes
- Depends on Part 1 for Resource Types + Resources CRUD infrastructure
- Follow existing services → DNA → proposal pattern exactly
- Resources in DNA are code-owned truth (never AI-generated), same as services.items and financial
- Template section catalog may need a way to declare which resource type(s) a section key maps to
- Assemble step should enrich resource snapshots from catalog (latest photo URL, etc.) — same as `enrichServicesFromCatalog`
