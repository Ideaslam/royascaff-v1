# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: change-20260727-000024
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline v3 — one catalog per template + section validation / generation
- Feature(s): Per-template section `contentSchema` / length budgets
- Endpoint(s): — (no HTTP contract change)
- Page(s)/View(s): —
- Service(s): catalog registry, `getSectionDef`, section/translate orchestrators, seed builders

## Description

### Current problem
`src/pipeline-v3/templates/pitch-landscape.catalog.ts` owns **all** templates today:
- section schemas (`PITCH_LANDSCAPE_SECTIONS`)
- `buildPitchLandscapeTemplateDoc`
- `buildPitchLandscapeFormalTemplateDoc`
- `buildWebsiteTemplateDoc` (reuses the same sections)

Disk layout assets already split by template (`templates/pitch-landscape/v1`, `templates/website-template/v1`), but **length/schema truth does not**. Generation/validation ignore `templateKey`.

### Revised design (per-template catalogs)

Keep TypeScript catalogs under Nest `src/` (compilable), **one folder/file per template key**, matching the disk template names:

```text
src/pipeline-v3/templates/
  shared/
    section-schema-helpers.ts     # textSchema / listSchema / shared types
    catalog-registry.ts           # getTemplateSections / getSectionDef / listTemplateKeys
  pitch-landscape/
    pitch-landscape.catalog.ts    # sections + buildPitchLandscapeTemplateDoc (+ formal if thin sibling)
  pitch-landscape-formal/
    pitch-landscape-formal.catalog.ts  # own tokens; sections may import pitch or define own lengths
  website-template/
    website-template.catalog.ts   # OWN full section list + contentSchema lengths for landing layout
```

**Why not put `.ts` next to HBS under repo `templates/<key>/v1/`?**  
Those folders are render assets (handlebars/css). Nest compiles from `src/`. Catalogs belong in `src/pipeline-v3/templates/<templateKey>/` so they ship in `dist` and stay typed. Asset path (`assets.basePath`) still points at `templates/<key>/v1`.

### Runtime rules
1. `getSectionDef(sectionKey, templateKey)` → section from **that template’s catalog** (default `pitch-landscape`).
2. Section generate / translate / validate / clamp all pass `proposal.templateKey`.
3. Seed/bootstrap register each `build*TemplateDoc()` from its own catalog file.
4. `website-template` lengths are authored in its own catalog (not a patch map on pitch) — competitor (and others) can differ freely.
5. Map orchestrator uses the active template’s section key set when available (fallback: union/pitch).

Out of scope: HBS/CSS redesign; frontend; new section keys (unless already shared).

## Acceptance Criteria
1. `pitch-landscape.catalog.ts` no longer builds website/formal docs or owns website section lengths.
2. `website-template.catalog.ts` defines its own `sections` with `contentSchema` (at least `competitor_analysis` differs from pitch).
3. `getSectionDef('competitor_analysis', 'website-template')` ≠ `getSectionDef('competitor_analysis', 'pitch-landscape')` for maxLength on a prose field (e.g. `howWeWin`).
4. Section generate + translate + clamp use template-resolved schema via `proposal.templateKey`.
5. Seed script imports builders from each template catalog / registry (not one mega-file).
6. Unit tests: per-template resolve + missing `templateKey` → pitch default.

## Notes (optional)
- Depends on change-20260727-000024 (verified) soft-max + clamp-first.
- Formal: own catalog file; may re-export pitch sections initially if lengths stay identical — still a separate file for future divergence.
- After implement: re-run `npm run seed:templates` so Mongo docs pick up website schemas.
- Exact website max numbers set in pack blueprint (option A tighter cards by default unless you specify).
