# Verification — Banner / Full-bleed / Images Gallery sections

## Plan Consistency
- [x] Pack modules: 24/26 section counts, maxSections 32, visual keys template-local
- [x] Pack templates service: catalogs + partials + fixture + seed counts
- [x] Pack map service: prompt + strip-when-insufficient-images + availableImages
- [x] Pack sections service: imageRef validation + tests
- [x] `SHARED_SECTION_KEYS` unchanged (21); no shared visual defs on clone source

## Code Verification
- [x] `createVisualSectionDefs` / `insertVisualSectionsAfterDivider` in `shared/visual-sections.ts`
- [x] Pitch / formal / website catalogs = **24**; roya = **26** (team+risks+3 visual)
- [x] `rules.maxSections: 32` on all four template docs
- [x] Partials on pitch / website / roya disks for `banner`, `full_bleed_banner`, `images_gallery`
- [x] Formal shares pitch disk (existing architecture)
- [x] Theme CSS additions for visual layouts on three disks
- [x] Fixture injects visual sections + `images` map for all templates
- [x] `seed-templates.js` expectedByKey = shared+3 / shared+2+3
- [x] Map prompt documents visual keys; orchestrator strips when images insufficient
- [x] Section validate requires `imageRef` ∈ available ids; translate preserves source ids
- [x] `section-schema.spec.ts` — **15** tests PASS
- [x] Catalog load smoke: counts + SHARED excludes banner
- [x] No FE changes

## Acceptance criteria
1. All four catalogs include template-local visual defs (not in SHARED) — **PASS**
2. Disk partials per owning template — **PASS** (formal via shared pitch disk)
3. Baseline schemas match contracts; gallery 2–6 — **PASS**
4. Seed expected counts 24 / 26 — **PASS** (script updated; Mongo after seed/boot)
5. Map skips visual keys without usable images — **PASS** (strip guard)
6. Section AI / validation only accepts known image ids — **PASS**
7. Fixture includes visual sections + images for smoke — **PASS**
8. No FE code changes — **PASS**

## Result: **PASS**

## Notes
- Run `npm run seed:templates` (or API boot) to upsert Mongo catalogs.
- Full Puppeteer PDF smoke not run in this verify; HTML fixtures + unit tests covered.
- Main blueprint merge pending Step 5.6 confirmation.
