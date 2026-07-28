# Services — Safqa API · Templates

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/templates/`. Disk: `templates/pitch-landscape/v1/` + `templates/website-template/v1/`.

### SVC-TPL-01 · TemplateAssetResolver [infrastructure, internal, Templates]
- Status: done
- Methods: `resolveRoot`, `readLayout`, `readThemeCss`, `readPartial`, `listPartialKeys`
- Deps: filesystem under `process.cwd()`
- Side effects: none
- Rules: disk-only; missing partial fails loud

### SVC-TPL-02 · TemplateRenderService [domain, internal, Templates]
- Status: done
- Methods: `renderProposalHtml`, `renderFixtureHtml`, `renderFixturePdf`
- Deps: TemplateAssetResolver, TemplatesRepository, PdfRenderService, handlebars
- Side effects: browser when PDF
- Rules:
  - helpers `money`, `dir`, `t`, `resolveImage`, `pageNumber`; financials code-owned
  - `isLandingTemplate` → `assertRenderContract(html, 'landing'|'presentation')`
  - Landing: continuous HTML; fixture/assemble PDF uses A4 portrait
  - Presentation: landscape PDF; fixed-page contract
  - Input `branding?` merged onto **root** context for every partial + layout: `workspace_*` / `client_*`
  - `themeOverrides` → layout `:root` `--color-primary|secondary|accent|surface|text`
  - pitch-landscape theme: headings/brand-mark → primary; cards/stats/persona → surface / soft primary tint; accent-bar primary→accent; cover/footer/`.page--brand-band` use CSS-var gradients (no hard-coded Roya navy/sky fills)
  - No hardcoded Safqa / رويا صفقة / Roya Safqa on pitch or website disk
  - Fixtures supply sample workspace branding strings; `getFixtureProposal(lang, templateKey?)`

### SVC-TPL-03 · Render contracts [domain, internal, Templates]
- Status: done
- Methods: `assertPageContract`, `assertLandingContract`, `assertRenderContract`
- Deps: none
- Side effects: none
- Rules:
  - Presentation: `@page` + `.page` + `overflow: hidden`
  - Landing: `landing-page` / `landing-main` + `lp-section` / hero

### SVC-TPL-04 · pitch-landscape catalog seed [domain, internal, Templates]
- Status: done
- Methods: `buildPitchLandscapeTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository; `src/pipeline-v3/templates/pitch-landscape/pitch-landscape.catalog.ts`
- Side effects: Mongo upsert on boot
- Rules: `status: active`; **20** section defs (incl. `testimonial`); `maxSections` 28; requiredKeys cover/financial/footer; **owns** pitch `contentSchema` lengths

### SVC-TPL-05 · Fixture render [domain, internal, Templates]
- Status: done
- Methods: via TemplateRenderService fixture helpers
- Deps: fixture-content.ts
- Side effects: PDF optional
- Rules: AR + EN fixtures for all **20** shippable sections; `templateKey` selects catalog + disk

### SVC-TPL-06 · pitch-landscape-formal catalog seed [domain, internal, Templates]
- Status: done
- Methods: `buildPitchLandscapeFormalTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository; `.../pitch-landscape-formal/pitch-landscape-formal.catalog.ts`
- Side effects: Mongo upsert on boot
- Rules: active; shares pitch-landscape disk `basePath`; own catalog file (lengths currently match pitch); formal theme tokens

### SVC-TPL-07 · List active templates [domain, internal, Templates]
- Status: done
- Methods: `listActive` via TemplatesController → slim gallery DTO
- Deps: TemplatesRepository
- Side effects: none
- Rules: latest active version per key; omit heavy `sections` / contentSchema

### SVC-TPL-08 · website-template catalog + landing disk [domain, internal, Templates]
- Status: done
- Methods: `buildWebsiteTemplateDoc` + `isLandingTemplate` + bootstrap/seed upsert
- Deps: TemplatesRepository; disk `templates/website-template/v1/`; `.../website-template/website-template.catalog.ts`
- Side effects: Mongo upsert on boot
- Rules:
  - key `website-template`; name `{ ar: "موقع — صفحة هبوط", en: "Website — Landing" }`
  - `type: website`, `orientation: portrait`, `page.renderMode: landing` (fluid)
  - Continuous scrolling landing HTML from `05.smart-watch` style language (not 16:9 slides)
  - **Own** section `contentSchema` lengths (tighter research/card fields vs pitch)
  - Tokens black/mint/gray; Mona Sans + Cairo/Tajawal
  - Canonical keep-list includes website (bootstrap + `seed-templates.js` via `buildAllTemplateDocs`)

### SVC-TPL-09 · Catalog registry [domain, internal, Templates]
- Status: done
- Methods: `getSectionDef(key, templateKey)`, `getTemplateSections`, `normalizeTemplateKey`, `buildAllTemplateDocs`
- Deps: per-template catalogs under `src/pipeline-v3/templates/<templateKey>/`
- Side effects: none
- Rules: default `pitch-landscape`; unknown templateKey falls back to pitch; section gen/translate/map resolve schemas by `proposal.templateKey`
