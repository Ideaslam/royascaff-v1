# Impact Analysis — REQ-PROP-V3 Phase 1 Template System

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Templates collection / repo | partial | `mongodb-templates.repository.ts`; bootstrap seeds draft shell | `sections: []`; no active catalog |
| Disk assets | partial | `templates/pitch-landscape/v1/README.md` only | Missing layout.hbs, theme.css, partials |
| Handlebars engine | none | — | Add `handlebars` dep + TemplateRenderService |
| TemplateAssetResolver | none | — | Disk strategy from project root |
| Overflow / page CSS | none | smoke.html has basic @page | Need `.page { overflow:hidden; break-after:page }` contract |
| Section catalog / contentSchema | none | slot JSON schemas exist under `pipeline-v3/schemas/slots/` | No section defs on template doc; no partials |
| PdfRenderService | complete | `pipeline-v3/pdf/pdf-render.service.ts` | Reuse as-is for fixture HTML→PDF |
| Legacy HTML proposals | complete | creative-pipeline + proposals ops | **Do not modify** |

**Feature state:** none (Phase 1 missing; Phase 0 foundations ready)

**Plan-vs-code:** Main blueprint already documents Templates/PDF modules as partial after change-20260726-000004 merge.

## Affected Modules

- **Templates** — disk assets + DB section definitions + asset resolver + Handlebars render
- **PDF Export** — consume rendered HTML (no rewrite of PdfRenderService required unless overflow needs evaluate hooks)
- **Pipeline v3** — new render services registered on `PipelineV3Module`
- **Creative v2** — untouched

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Templates/PDF feature completion notes
- [ ] `blueprint/actions/api/services/templates.md` — SVC-TPL-* (resolver, render, overflow, catalog seed)
- [ ] `blueprint/actions/api/endpoints/templates.md` — optional thin preview EP (or deferred)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main plan/actions until merge.

## Code impact (likely)

### Create
- `src/pipeline-v3/templates/template-asset-resolver.ts`
- `src/pipeline-v3/templates/template-render.service.ts` + helpers
- `src/pipeline-v3/templates/overflow-guard.ts` (CSS contract + optional post-measure)
- `src/pipeline-v3/templates/fixtures/` AR/EN structured content
- `templates/pitch-landscape/v1/layout.hbs`, `theme.css`, `partials/*.hbs`
- Section definition seed data (TS or JSON) for bootstrap upsert

### Modify
- `package.json` — `handlebars`
- `pipeline-v3.module.ts` — register services
- `pipeline-v3-bootstrap.service.ts` — full sections + `status: active`
- Optional: thin `GET`/`POST` preview under admin or `data/templates` for smoke

### Do not touch
- creative-pipeline HTML batch, proposals document-html, FE

## Recommended section subset for `pitch-landscape` (shippable)

**Required commercial:** `cover`, `executive_summary`, `client_context`, `objectives_kpis`, `services`, `methodology`, `timeline`, `financial`, `next_steps`, `footer`  
**Research (launch):** `insights_divider`, `market_analysis`, `competitor_analysis`, `audience_insights`  
**Optional extras if time:** `banner`, `comparison`, `risks_assumptions`  
**Deferred catalog keys:** toc, gallery, testimonial, case_studies, remaining research keys not in launch subset — list explicitly as deferred in blueprint

## Risk

| Factor | Level | Notes |
|--------|:-----:|-------|
| Complexity | **H** | Many partials + design quality bar |
| Cross-module | **Y** | Templates + PDF + bootstrap |
| Migration | **N** | Additive |
| Design | **M** | Design-first: CSS/partials are product UI |

## Recommendation

- **Create**: resolver, renderer, overflow contract, full disk template, section catalog subset, fixtures
- **Complete**: template shell from Phase 0 → active with sections
- **Modify**: bootstrap, module wiring, package.json
- **Verdict**: Create template render layer; leave pipeline AI steps for change-20260726-000006

## Status target (after implement)

| Artifact | Target |
|----------|--------|
| SVC-TPL-01 TemplateAssetResolver | done |
| SVC-TPL-02 TemplateRenderService + helpers | done |
| SVC-TPL-03 Overflow / page CSS contract | done |
| SVC-TPL-04 pitch-landscape disk assets + section defs | done |
| SVC-TPL-05 Fixture render → PDF AR/EN | done |
| EP-TPL preview (optional) | deferred or partial |
| Remaining §5.6 keys | deferred |

## Dependencies

- **depends-on:** change-20260726-000004 — **merged** ✓
