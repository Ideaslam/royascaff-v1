# Services — Safqa API · Templates

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/templates/`. Disk: `templates/pitch-landscape/v1/`.

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
- Rules: helpers `money`, `dir`, `t`, `resolveImage`, `pageNumber`; financials code-owned; assert page contract

### SVC-TPL-03 · page-contract / overflow CSS [domain, internal, Templates]
- Status: done
- Methods: `assertPageContract(html)`
- Deps: none
- Side effects: none
- Rules: `@page` + `.page` + `overflow: hidden` required in rendered HTML

### SVC-TPL-04 · pitch-landscape catalog seed [domain, internal, Templates]
- Status: done
- Methods: `buildPitchLandscapeTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository
- Side effects: Mongo upsert on boot
- Rules: `status: active`; 19 section defs with contentSchema (commercial + all research primaries); `maxSections` 28; requiredKeys cover/financial/footer; disk partials for market_trends/benchmarks/case_studies/social_audit/action_plan

### SVC-TPL-05 · Fixture render [domain, internal, Templates]
- Status: done
- Methods: via TemplateRenderService fixture helpers
- Deps: fixture-content.ts
- Side effects: PDF optional
- Rules: AR + EN fixtures for all 19 shippable sections

### SVC-TPL-06 · pitch-landscape-formal catalog seed [domain, internal, Templates]
- Status: done
- Methods: `buildPitchLandscapeFormalTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository
- Side effects: Mongo upsert on boot
- Rules: active; shares pitch-landscape disk `basePath` + same 19 section list; formal theme tokens (design-partial OK)

### SVC-TPL-07 · List active templates [domain, internal, Templates]
- Status: done
- Methods: `listActive` via TemplatesController → slim gallery DTO
- Deps: TemplatesRepository
- Side effects: none
- Rules: latest active version per key; omit heavy `sections` / contentSchema
