# Verification — Website template + shared testimonial

## Plan Consistency
- [x] Pack modules: website-template feature + 20-key catalog + canonical seed
- [x] Pack data-model: `website-template` key + `testimonial` in section list
- [x] Pack services: SVC-TPL-04/05/06/08 (catalog, disk, fixture, seed)
- [x] Pack endpoints: EP-TPL-01 `templateKey` body param
- [x] Recon risks addressed: canonical keep-list includes website-template

## Code Verification
- [x] Shared catalog has **20** keys including `testimonial` with contentSchema (`title`, `quotes[]`)
- [x] `buildWebsiteTemplateDoc()` — key/name/tokens; `assets.basePath` = `templates/website-template/v1`
- [x] Disk website pack: `layout.hbs`, `theme.css` (page contract), README, **20** partials matching catalog
- [x] Pitch disk: `partials/testimonial.hbs` (formal shares pitch basePath)
- [x] Bootstrap + `seed-templates.js` upsert all three; canonical keep includes website
- [x] Fixture includes testimonial (AR/EN); `getFixtureProposal(lang, templateKey?)`
- [x] `TemplateRenderService.renderFixtureHtml/Pdf(language, templateKey?)`
- [x] EP-TPL-01 accepts `templateKey`; validates allowed keys + active Mongo doc; rethrows HttpException
- [x] Smoke render (disk Handlebars): website EN/AR + pitch EN — 20 pages each; page-contract PASS; testimonial quote present
- [x] No FE changes required (gallery lists active templates)
- [x] Map/AJV continue using shared `PITCH_LANDSCAPE_SECTIONS` (schema-identical templates)

## Acceptance criteria
1. Active `website-template` v1 own basePath + 20 section defs — **PASS** (builder + disk; Mongo after boot/seed)
2. Disk layout/theme/partials for every key — **PASS**
3. Visual language black/mint/gray + website motifs (not landing clone) — **PASS** (theme.css + redesigned cover/footer/testimonial/divider/callout)
4. Pitch + formal catalogs include `testimonial`; pitch partial exists — **PASS**
5. Bootstrap/seed upsert three templates; listActive will return website — **PASS** (code path; seed script updated)
6. Fixture HTML path for website AR+EN with testimonial, page-contract OK — **PASS** (local smoke)
7. Pitch/formal still render; branding/themeOverrides unchanged contract — **PASS**
8. No FE code changes — **PASS**

## Result: **PASS**

## Notes
- Mongo upsert not executed in this verify environment; run API boot or `npm run seed:templates` to activate in DB.
- PDF Chromium path not exercised; HTML page-contract verified.
- **Post-verify redesign (2026-07-27):** First pass used fixed 16:9 pages; user required a real website.
- **Landing rewrite:** `type: website`, `page.renderMode: landing`, continuous scroll HTML (sticky header, hero, ticker, stacked `lp-section`s). Presentation page-contract skipped; assemble uses A4 portrait PDF optionally. Smoke: landing contract PASS; no 338×190mm slide CSS.
- Main blueprint merge pending Step 5.6 confirmation.
