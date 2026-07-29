# Services — Safqa API · Templates

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/templates/`. Disk: `templates/pitch-landscape/v1/` + `templates/website-template/v1/` + `templates/roya-presentation/v1/`.

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
  - `themeOverrides` → layout `:root` `--color-primary|secondary|accent|surface|text` (omitted when template `theme.lockPalette`)
  - **Client-first placement:** cover + interior chrome use `client_*`; workspace logo/name only in `about_workspace` + footer; website sticky header uses client branding
  - pitch-landscape theme: headings/brand → primary; cards/stats/persona → surface / soft primary tint; accent-bar primary→accent; cover/footer/`.page--brand-band` use CSS-var gradients (no hard-coded Roya navy/sky fills)
  - roya-presentation: HAIA compositions (`.hp-*`); locked catalog tokens win
  - No hardcoded Safqa / رويا صفقة / Roya Safqa on pitch / website / roya disk
  - Fixtures supply sample workspace + client branding; include `about_workspace`; `getFixtureProposal(lang, templateKey?)`; all templates include visual sections + `images` map; roya also includes `team` + `risks`
  - Visual partials: `banner` / `full_bleed_banner` / `images_gallery` on pitch / website / roya disks (formal shares pitch)

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
- Rules: `status: active`; shared base **21** + local visual **3** = **24** section defs; `maxSections` **32**; requiredKeys cover/financial/about_workspace/footer; **owns** pitch `contentSchema` lengths; visual keys not in `SHARED_SECTION_KEYS`

### SVC-TPL-05 · Fixture render [domain, internal, Templates]
- Status: done
- Methods: via TemplateRenderService fixture helpers
- Deps: fixture-content.ts
- Side effects: PDF optional
- Rules: AR + EN fixtures for shared shippable sections; `templateKey` selects catalog + disk; all templates inject `banner` / `full_bleed_banner` / `images_gallery` + `images` id→url map; `roya-presentation` also injects `team` + `risks` (26 total)

### SVC-TPL-06 · pitch-landscape-formal catalog seed [domain, internal, Templates]
- Status: done
- Methods: `buildPitchLandscapeFormalTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository; `.../pitch-landscape-formal/pitch-landscape-formal.catalog.ts`
- Side effects: Mongo upsert on boot
- Rules: active; shares pitch-landscape disk `basePath` (incl. visual partials); own catalog file with local visual defs (**24**); `maxSections` **32**; formal theme tokens; `requiredKeys` include `about_workspace`

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
  - Local visual section defs + partials (**24** total); `maxSections` **32**
  - Tokens black/mint/gray; Mona Sans + Cairo/Tajawal
  - `requiredKeys` include `about_workspace`; sticky header = client branding; footer = workspace
  - Canonical keep-list includes website (bootstrap + `seed-templates.js` via `buildAllTemplateDocs`)

### SVC-TPL-09 · Catalog registry [domain, internal, Templates]
- Status: done
- Methods: `getSectionDef(key, templateKey)`, `getTemplateSections`, `normalizeTemplateKey`, `buildAllTemplateDocs`
- Deps: per-template catalogs under `src/pipeline-v3/templates/<templateKey>/`; `shared/visual-sections.ts` factories
- Side effects: none
- Rules: default `pitch-landscape`; unknown templateKey falls back to pitch; section gen/translate/map resolve schemas by `proposal.templateKey`; registered keys include `roya-presentation`; `SHARED_SECTION_KEYS` stays 21 (visuals are per-catalog locals)

### SVC-TPL-10 · roya-presentation catalog + disk [domain, internal, Templates]
- Status: done
- Methods: `buildRoyaPresentationTemplateDoc` + bootstrap/seed upsert
- Deps: TemplatesRepository; disk `templates/roya-presentation/v1/`; `.../roya-presentation/roya-presentation.catalog.ts`
- Side effects: Mongo upsert on boot
- Rules:
  - key `roya-presentation`; name `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }`
  - presentation landscape 16:9; HAIA-from-scratch partials (not recolored pitch)
  - `theme.lockPalette: true`; locked tokens primary `#FF3B2F`, secondary `#1A1533`, accent `#C9A24B`, surface `#EFEBFB`, text `#1A1533`
  - sections = clone(pitch base) + local `team` + `risks` + visual dividers (**26**); `maxSections` **32**
  - Canonical keep-list includes roya-presentation (bootstrap + `seed-templates.js`); seed expects 24 vs 26 per key
