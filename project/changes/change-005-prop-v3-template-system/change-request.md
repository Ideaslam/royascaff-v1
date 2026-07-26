# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 2/8
- **depends-on**: change-004
- **blocks**: change-006 (planned — Steps 1–2)
- **pack-status**: merged

## Scope
- Module(s): Templates, PDF Export, Pipeline v3 (render path only)
- Feature(s): Phase 1 — Handlebars template engine + design-first `pitch-landscape` + PDF smoke with fixture content
- Endpoint(s): optional thin preview/render helper (internal or admin) if needed to verify; no full Projects/Proposals pipeline HTTP yet
- Page(s)/View(s): none (FE later)
- Service(s): TemplateAssetResolver (disk), Handlebars renderer + helpers, overflow guard, section partials for `pitch-landscape`, template DB doc with full section defs

## Description

Implement **Phase 1 — Template system** of Pipeline v3 per `docs/refactor-proposal-generator.md` §5 (and Phase 1 row in §15).

**Depends on** merged `change-004` (BullMQ, schemas, PdfRenderService, templates collection shell).

**This pack delivers:**

1. **Handlebars render engine** — layout + one partial per section; helpers: `money`, `dir`, `t`, `resolveImage`, `pageNumber` (and any minimal extras needed).
2. **TemplateAssetResolver (disk)** — resolve `templates/<key>/v<version>/` from API project root (`theme.css`, `layout.hbs`, `partials/*.hbs`, fonts).
3. **Template `#1` `pitch-landscape`** — presentation / landscape 16:9; **design-first on disk** so editing CSS/partials changes HTML/PDF output; Roya brand tokens; RTL + LTR via `dir`/`lang` + logical CSS.
4. **Section catalog subset** for this template — core/commercial required keys (`cover`, `financial`, `footer` + enough commercial pages for a real deck) **plus** research showcase partials for launch research options: `market_analysis`, `competitor_analysis`, `audience_insights` (and shared helpers like `insights_divider` if useful). Abstract + full `contentSchema` on each section definition in the Mongo/template document.
5. **Overflow guard** — measure/shrink or hard `overflow:hidden` / capacity rules so fixed pages do not break in PDF.
6. **PDF verification path** — render fixture structured content (AR + EN) through Handlebars → `PdfRenderService`; confirm fixed-page breaks (no mid-section split).

**Out of scope for this pack:**
- Pipeline steps 1–3 AI (DNA/map/sections) — change-006+
- Assemble/export workers wiring into BullMQ — change-007
- Second template `pitch-landscape-formal` — change-008
- Frontend gallery / create flow — change-009
- Admin template editor / S3 asset strategy — post-launch

**Locked decisions (from REQ-PROP-V3 discovery):** design-first disk assets; only `pitch-landscape` now; research launch subset market/competitor/audience; code owns money slots; AI never writes HTML.

## Acceptance Criteria

1. `handlebars` is a dependency; a `TemplateRenderService` (or equivalent) can render a full proposal HTML document from `{ templateKey, language, sectionContents, themeOverrides?, imageResolver? }` with zero AI.
2. `TemplateAssetResolver` loads layout, CSS, and partials from disk under `templates/pitch-landscape/v1/`; changing a partial or `theme.css` changes the next render output.
3. Template document for `pitch-landscape` v1 is stored/updated with `status: active` (or draft→active), full section definitions (abstract fields + `contentSchema`), and rules (`requiredKeys` include cover/financial/footer; research coverage keys for market/competitor/audience present in catalog).
4. Disk assets include `layout.hbs`, `theme.css`, and partials for every section key registered on the template (core + market/competitor/audience research at minimum).
5. Helpers correctly format money (code-injected financials), set direction for `ar`/`en`, and resolve image refs from a fixture map.
6. Overflow guard prevents content from spilling across fixed page boundaries in a way that breaks `break-after: page` (verified via fixture + PDF or HTML page roots).
7. Fixture render produces PDF via existing `PdfRenderService` for Arabic and English (or one bilingual fixture covering both directions) without runtime errors when Chromium is available.
8. No changes to legacy creative pipeline v2 behavior; no FE changes.

## Notes

- Source: `docs/refactor-proposal-generator.md` §5, §5.6–5.7, Phase 1.
- Full §5.6 catalog (all 32 keys) may be **partially** implemented: must cover a shippable `pitch-landscape` subset (required commercial + launch research). Remaining catalog keys can be stub partials or deferred with explicit list in pack blueprint.
- Visual design should look intentional (Roya colors/fonts), not placeholder grey boxes — design-first means the shipped CSS/partials are the product look for this template.
