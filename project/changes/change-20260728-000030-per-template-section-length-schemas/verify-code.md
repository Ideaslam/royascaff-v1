# Verification — Per-template section catalogs

## Code Verification
- [x] Mega catalog split: pitch / formal / website under `src/pipeline-v3/templates/<key>/`
- [x] Shared helpers + `catalog-registry.ts`
- [x] `getSectionDef(key, templateKey)` — competitor howWeWin pitch 320 ≠ website 220
- [x] Section + translate + map use `proposal.templateKey`
- [x] Seed + bootstrap use `buildAllTemplateDocs()`
- [x] Compat re-export at old `pitch-landscape.catalog.ts` path
- [x] Unit tests **11/11 PASS**; `tsc --noEmit` clean

## Acceptance criteria
1. Pitch catalog no longer owns website/formal builders — PASS  
2. Website catalog owns section schemas — PASS  
3. competitor lengths differ by template — PASS  
4. Generate/translate/clamp template-aware — PASS  
5. Seed from registry — PASS  
6. Tests for resolve + fallback + website clamp — PASS  

## Result: PASS

**Overall: PASS**

## Follow-up
- Run `npm run seed:templates` so Mongo template docs pick up website schemas.
