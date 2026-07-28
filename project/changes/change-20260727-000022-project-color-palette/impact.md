# Impact Analysis — Project Color Palette

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / DTO | none | `api` `projects.dto.ts`; Mongo Mixed `strict:false` | no `colorPalette`; no migration needed |
| Service(s) | none | `projects.data.service.ts` create/update; `dna-passthrough.ts`; `analyze-orchestrator`; `assemble.service.ts` | create ignores unknown fields; branding stub `{}`; assemble uses proposal `themeOverrides` only |
| Endpoint(s) | partial | `POST/PATCH /api/data/projects`; `POST …/regenerate-dna` | extend create/patch body only — no new routes |
| Template CSS | partial | `templates/pitch-landscape/v1/theme.css` + `layout.hbs`; `template-render.service.ts` | CSS vars ready; not driven from project/DNA palette |
| Page(s) | none | `project-create`, `project-edit`, `project-detail` | no Branding card; no palette component; no DNA-stale badge |
| FE model/service | none | `app.models.ts`, `projects.service.ts` | no `colorPalette` on create/patch |

Feature state: **none** (theme CSS plumbing + regenerate-dna UX exist; product behavior greenfield)

## Affected Modules

- **Projects (API + Web)** — persist `colorPalette`; Branding card; reusable palette component; DNA-stale badge after edit save
- **Pipeline v3 Analyze / DNA** — inject `dna.branding.colors` from palette; else client_logo extraction (post-021); else Roya defaults; force passthrough so AI merge cannot drop colors
- **Pipeline v3 Assemble / Template render** — map `branding.colors[i]` → `themeOverrides` (primary/secondary/accent…) for `pitch-landscape`

## Pack blueprint files to create

- [ ] `blueprint/plan/data-model.md` — Project.`colorPalette`; DNA `branding.colors`
- [ ] `blueprint/plan/modules.md` — slice: palette + branding + assemble theme map
- [ ] `blueprint/actions/api/services/projects.md` — create/patch + DNA inject + logo/Roya fallback
- [ ] `blueprint/actions/api/services/pipeline-assemble.md` — themeOverrides from DNA colors
- [ ] `blueprint/actions/api/endpoints/projects.md` — create/patch I/O delta (no new EP)
- [ ] `blueprint/actions/web/pages/projects.md` — Branding card + shared component + stale badge
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

**Create**
- `roya-sales-ai-frontend/src/app/shared/color-palette/` — reusable full-mock palette (simplest custom impl)
- Small API helper: hex normalize/validate + `colors[]` → themeOverrides map

**Modify**
- API: `projects.dto.ts`, `projects.data.service.ts`, `dna-passthrough.ts` (+ reconcile), analyze branding fallback, `assemble.service.ts` / `template-render.service.ts` as needed, optionally `dna.v2.schema.json`
- FE: `project-create.component.ts`, `project-edit.component.ts`, `project-detail.component.ts`, `projects.service.ts`, `app.models.ts`, `en.json` / `ar.json`

## Ripple effects

| Risk | Level | Notes |
|------|:-----:|-------|
| Hard dep change-20260727-000021 | H | `purpose: client_logo` required for logo-color fallback |
| Assemble surface overlap w/ 021 | M | Same assemble/render path as workspace/client logo inject |
| DNA AI overwrite of `branding` | M | Must force-reconcile `branding.colors` after core DNA |
| `themeOverrides` precedence | M | Proposal overrides vs DNA palette vs catalog — DNA palette should win when set unless proposal explicitly overrides |
| Stale-badge state | M | Client flag and/or server hint after any successful Edit save |

## Reuse

- Pitch CSS vars + `themeOverrides` pipeline already wired
- `BRAND.colors` / catalog tokens as Roya defaults
- `shared/` for one palette component used by Create + Edit
- Existing `regenerateDna` endpoint + Workspace button (badge only)
- Schema-less Mongo — add field without migration

## Risk: complexity **M**, cross-module **Y**, migration **N**

## Recommendation

- **Create**: shared color-palette component; `colorPalette` field + validation; DNA branding.colors inject; assemble theme map; DNA-stale badge
- **Complete**: branding stub in `dna-passthrough` → real colors contract
- **Modify**: create/edit project pages; assemble themeOverrides source; analyze fallback chain

## Status target (per artifact in the pack after implement)

- Project.`colorPalette` → planned → done
- DNA `branding.colors` inject + fallbacks → planned → done
- Assemble themeOverrides from DNA → planned → done
- Shared ColorPalette component → planned → done
- PG Create/Edit Branding card → planned → done
- PG Workspace DNA-stale badge → planned → done
- Logo color extraction lib → planned (simplest: vision/prompt or cheap extract; no heavy dep preferred) → done or deferred with Roya-only interim only if 021 logo path blocked

## Dependencies

- **depends-on**: change-20260727-000021 — current pack-status: **drafted** (not verified/merged)
- This pack remains **blocked** for code until 021 is verified/merged
- Impact + blueprint drafting may proceed for planning
