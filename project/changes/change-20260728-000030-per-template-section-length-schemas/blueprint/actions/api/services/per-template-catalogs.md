# Service — per-template section catalogs

**Status**: done

## After-state
- `src/pipeline-v3/templates/shared/` — helpers + `catalog-registry.ts` + `isLandingTemplate`
- `pitch-landscape/pitch-landscape.catalog.ts` — pitch sections + buildPitchLandscapeTemplateDoc only
- `pitch-landscape-formal/...` — formal tokens; sections from pitch (or own later)
- `website-template/...` — own section schemas with tighter card lengths + buildWebsiteTemplateDoc
- `getSectionDef(key, templateKey)` / `getTemplateSections(templateKey)`
- Section + translate use `proposal.templateKey`
- Seed/bootstrap import from registry / per-template builders

## Delta
- Split mega `pitch-landscape.catalog.ts`
- Wire templateKey through validation/generation
