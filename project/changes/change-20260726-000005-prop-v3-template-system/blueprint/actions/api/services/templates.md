# Services — Safqa API · Templates (Phase 1)

> Code under `roya-sales-ai-api-v2/src/pipeline-v3/templates/`.
> Disk assets: `roya-sales-ai-api-v2/templates/pitch-landscape/v1/`.
> Reuse `PdfRenderService` from Phase 0. Do not touch creative-pipeline HTML.

## Delta

- **Create** SVC-TPL-01..05
- **Modify** bootstrap to upsert active template with full `sections[]`
- **Add** npm dep `handlebars`

---

### SVC-TPL-01 · TemplateAssetResolver [infrastructure, internal, Templates]
- Status: planned
- Methods:
  - `resolveRoot(templateKey, version): absolutePath` — `path.join(process.cwd(), assets.basePath)` (or config override)
  - `readLayout(key, version): string`
  - `readThemeCss(key, version): string`
  - `readPartial(key, version, sectionKey): string`
  - `listPartialKeys(key, version): string[]`
- Deps: TemplatesRepository (for `assets` metadata) or direct disk convention matching seed
- Side effects: none (filesystem read)
- Rules: disk-only strategy; design-first — no compile step; missing partial → fail loud

### SVC-TPL-02 · TemplateRenderService [domain, internal, Templates]
- Status: planned
- Methods:
  - `renderProposalHtml(input): string` where input includes:
    - `templateKey`, `templateVersion?`, `language: 'ar'|'en'`
    - `sections: { instanceId, key, order, content }[]` (content already schema-shaped)
    - `themeOverrides?`, `images?: Record<id, url>`, `financial?` (code-owned)
    - `meta?: { title, clientName, date }`
  - registers Handlebars helpers once:
    - `money(value, currency?)` — SAR formatting
    - `dir` / `lang` from language
    - `t(ar, en)` or `t(key)` from tiny dict / dual fields
    - `resolveImage(ref)` — lookup images map
    - `pageNumber` — index among page roots
- Deps: TemplateAssetResolver, handlebars
- Side effects: none
- Rules:
  - AI never called; HTML only from templates + JSON content
  - Layout wraps each section partial in `.page` root
  - Inject compiled `theme.css` into layout `<style>` (or link file:// for PDF — prefer inlined CSS for Puppeteer)
  - Financial section merges `financial` / services from input (code), not from AI inventing totals
  - Escape by default (`{{ }}`); use triple-stash only for trusted richtext blocks if schema allows structured richtext → sanitized HTML helper later; Phase 1 prefer plain text / list slots

### SVC-TPL-03 · Overflow / page CSS contract [domain, internal, Templates]
- Status: planned
- Methods: enforced primarily via `theme.css` + partial structure; optional `assertPageContract(html): void` checks for `.page` + `@page`
- Deps: none
- Side effects: none
- Rules (must match doc §11):
  ```css
  @page { size: 338mm 190mm; margin: 0; } /* pitch-landscape */
  .page {
    width: 338mm; height: 190mm;
    overflow: hidden;
    break-after: page; break-inside: avoid;
    position: relative;
  }
  ```
  - Absolute mm units; CSS logical properties for RTL/LTR
  - Partials must fit capacity (min/max from section defs); no mid-page bleed

### SVC-TPL-04 · pitch-landscape catalog + disk assets [domain, internal, Templates]
- Status: planned
- Methods: seed/upsert via bootstrap (or `pitch-landscape.v1.catalog.ts`)
- Deps: TemplatesRepository, disk files
- Side effects: Mongo upsert on boot
- Rules:

**Disk tree (required):**
```text
templates/pitch-landscape/v1/
  layout.hbs
  theme.css
  partials/
    cover.hbs
    executive_summary.hbs
    client_context.hbs
    objectives_kpis.hbs
    services.hbs
    methodology.hbs
    timeline.hbs
    insights_divider.hbs
    market_analysis.hbs
    competitor_analysis.hbs
    audience_insights.hbs
    financial.hbs
    next_steps.hbs
    footer.hbs
  preview.png          # optional placeholder
```

**DB document after-state:**
- `key: pitch-landscape`, `version: 1`, `status: active`
- `engine: handlebars.v1`, type/orientation/page/theme/assets as Phase 0 shell
- `sections[]`: one Section Definition per key above with:
  - `key`, `name {ar,en}`, `purpose`, `whenToUse`, `researchKeys?`, `repeatable`, `pages`, `images?`, `capacity`
  - `contentSchema` (JSON Schema object of slots; `$ref` / align with `pipeline-v3/schemas/slots` where practical)
- `rules.requiredKeys`: `["cover","financial","footer"]`; `coverAlwaysFirst` / `footerAlwaysLast` true; `researchCoverageRequired` true

**Visual bar:** Roya brand (`#47B5E6`, `#114261`, Cairo/Tajawal); intentional presentation look — not grey wireframes. Prefer `@font-face` with system/Noto fallbacks if woff2 not bundled yet; document font path for Puppeteer.

### SVC-TPL-05 · Fixture render → PDF [domain, internal, Templates]
- Status: planned
- Methods:
  - `renderFixtureHtml(lang: 'ar'|'en'): string` — load fixture JSON content for all shippable sections
  - `renderFixturePdf(lang): Buffer` — `renderProposalHtml` → `PdfRenderService.renderHtmlToPdf`
- Deps: TemplateRenderService, PdfRenderService
- Side effects: browser (PDF)
- Rules: fixtures under `src/pipeline-v3/templates/fixtures/`; AR RTL + EN LTR both succeed when Chromium available; pages use `.page` roots (no `page-break: auto` overrides)

---

## Nest wiring

- Register SVC-TPL-* on `PipelineV3Module`; export TemplateRenderService for later assemble pack
- Update `PipelineV3BootstrapService` to call catalog upsert (replace empty `sections: []`)
