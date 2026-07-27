# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-TEMPLATE
- **part**: 1/1
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Templates (Pipeline v3)
- Feature(s): New design-first template `website-template` + shared optional section `testimonial` across all active templates
- Endpoint(s): none new (existing `listActive` / render paths pick up seeded template)
- Page(s)/View(s): none (FE gallery already lists active templates)
- Service(s): catalog seed builders, bootstrap upsert, fixture content; TemplateRenderService unchanged contract

## Description

Add a third proposal template **`website-template`** whose **visual language** is derived from the `05.smart-watch` landing page (Sellsmart) — not a port of that landing’s sections.

**Style extraction (reference only):**
- Tokens: primary `#000000`, secondary/mint `#D6E3E1`, surface/bg `#F7F7F7` / white, text `#2C2C2C`
- Typography: Mona Sans (EN) + Cairo / Tajawal (AR); bold large titles, airy hierarchy
- Motifs: soft mint panels, pill accents, icon+label rows, clean card grids, strong centered openers — adapted to fixed 16:9 pitch pages

**Template contract (parity with `pitch-landscape`):**
- Key: `website-template`
- Display name: `{ ar: "عرض تقديمي — موقع", en: "Pitch — Website" }`
- Orientation: landscape presentation 16:9 (same page mm / safe area)
- Own disk: `templates/website-template/v1/` (`layout.hbs`, `theme.css`, one partial per section key)
- Same section keys + **identical `contentSchema`** for all existing 19 sections
- Same rules: `requiredKeys` cover/financial/footer; `maxSections` 28; research coverage required
- Theme tokens from smart-watch defaults; still overridable by project palette / branding at render
- Seed on bootstrap + `scripts/seed-templates.js`

**New shared section (all templates):**
- Key: **`testimonial`** (matches existing `alsoGood` in research-coverage gate for `case-studies`)
- Commercial/social-proof page: quote cards (quote, author, optional role/company)
- Add catalog def + disk partial to:
  - `pitch-landscape`
  - `pitch-landscape-formal` (shares pitch disk → one partial)
  - `website-template` (own styled partial)
- Update fixtures (AR + EN) and raise shippable section count **19 → 20**

**Out of scope:**
- Cloning/shipping the smart-watch HTML landing page or its product-specific blocks
- New FE pages or gallery UI beyond listing the new active template
- Admin template editor / S3 asset strategy
- New research *options* (only the optional `testimonial` section type)
- Changing map/section AI prompts beyond what is required for the new schema to validate

## Acceptance Criteria

1. Mongo has active `website-template` v1 with own `assets.basePath` `templates/website-template/v1`, display names above, and all **20** section defs (19 parity + `testimonial`) with full `contentSchema`.
2. Disk under `templates/website-template/v1/` contains `layout.hbs`, `theme.css`, and a partial for every registered section key; changing CSS/partials changes next render.
3. Visual design of `website-template` clearly reflects smart-watch style language (mint/black/gray, bold titles, soft panels/cards) while binding the same content fields as pitch sections — not landing-page markup.
4. `pitch-landscape` and `pitch-landscape-formal` catalogs include `testimonial` with the same schema; pitch disk has `partials/testimonial.hbs`.
5. Bootstrap / `seed-templates.js` upserts all three templates; `listActive` returns `website-template`.
6. Fixture HTML/PDF path renders `website-template` for AR and EN including `testimonial` without page-contract failures.
7. Existing `pitch-landscape` / formal renders still work; project palette / workspace branding still apply via theme overrides + branding context.
8. No FE code changes required for the template to appear in the create/gallery picker.

## Notes

- Pattern for future templates: drop a landing folder as **style reference** → extract tokens/motifs → redesign all proposal section partials; never ship the landing page itself.
- `testimonial` is optional (not in `requiredKeys`); research gate already lists it as `alsoGood` for `case-studies`.
- Formal continues sharing pitch disk assets; only `website-template` gets a new basePath.
