# Change Request

## Metadata
- **date**: 2026-07-29
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: low
- **request-id**: REQ-TEMPLATE
- **part**: 3
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Templates (Pipeline v3)
- Feature(s): Template-local visual divider sections — `banner`, `full_bleed_banner`, `images_gallery` — on all four proposal templates
- Endpoint(s): none new
- Page(s)/View(s): none
- Service(s): per-template catalogs + disk partials/CSS; map/section AI consume new keys; seed/bootstrap upsert; `resolveImage` for project image refs

## Description

Add **visual proof / divider** sections so pitches can break long proposals with strong imagery.

### Motivation / outcome
Sales needs image banners and galleries as visual dividers and proof. After this ships, map may place repeatable visual sections that pull **only** from available project images, each rendered in that template’s existing visual language.

### Templates (all four)
- `pitch-landscape`
- `pitch-landscape-formal`
- `website-template`
- `roya-presentation`

### Isolation rule (critical)
These keys are **template-local extras** — **not** added to `SHARED_SECTION_KEYS`.

Each template owns:
- its own catalog section defs (may diverge in `contentSchema` / capacity / whenToUse copy)
- its own disk partials (`banner.hbs`, `full_bleed_banner.hbs`, `images_gallery.hbs`)
- styling that follows that template’s existing theme (pitch chrome, website landing, Roya HAIA style, formal sibling)

Same key **names** across catalogs for map clarity; schemas/partials are **not** shared.

### Section contracts

| Key | Purpose | Content schema (baseline; templates may tighten copy/capacity) | Repeatable | Required |
|-----|---------|----------------------------------------------------------------|------------|----------|
| `banner` | Image-only divider | `{ imageRef }` (string key into project images map) | yes | optional |
| `full_bleed_banner` | Full-bleed visual with copy | `{ title, subtitle?, imageRef }` | yes | optional |
| `images_gallery` | Visual proof grid | `{ title, intro?, images: imageRef[] }` — **min 2 / max 6** | yes | optional |

### Image source
- AI (map + section writer) picks `imageRef` values **only** from available project DNA / project images exposed to the pipeline (existing `resolveImage` path).
- No new image purposes, no new upload API.

### Happy path
1. Project has usable images → map may select one or more of these sections (repeatable).
2. Section AI fills the schema with valid `imageRef`s from that set.
3. Assemble/render uses the template’s own partial + theme CSS.
4. HTML/PDF shows the banners / gallery.

### No project images
If the project has **no** usable images for these sections, **map must not select** `banner` / `full_bleed_banner` / `images_gallery`.

### Out of scope
- Frontend editor / gallery picker UI changes
- New image upload endpoints or new `purpose` enum values
- Adding these keys to `SHARED_SECTION_KEYS` or a single shared partial
- Comparison / TOC / other deferred catalog keys
- Changing DNA color / theme override behavior

## Acceptance Criteria

1. All four templates’ catalogs include template-local defs for `banner`, `full_bleed_banner`, and `images_gallery` (repeatable, not in `requiredKeys`, not in `SHARED_SECTION_KEYS`).
2. Each template disk tree has matching partials (`banner.hbs`, `full_bleed_banner.hbs`, `images_gallery.hbs`) styled to that template’s existing visual language.
3. Baseline schemas match the contracts above (`images_gallery` items 2–6); per-template capacity may differ but required fields stay compatible.
4. Seed / bootstrap upserts updated section catalogs for all four templates without breaking existing keys (`team` / `risks` remain on `roya-presentation`).
5. Map can plan these sections when project images exist; when no usable images exist, map does **not** include them.
6. Section AI / validation only accepts `imageRef` values that resolve against available project images; render uses `resolveImage`.
7. Fixture / render path can smoke-render each new partial for AR and EN on each template without page-contract failures when fixture images are present.
8. No FE code changes required for this pack.

## Notes
- Pattern mirrors `team` / `risks` on `roya-presentation` (catalog-local extras), but applied to **all** templates for these three keys.
- Priority low — keep schemas and layouts simple; prefer reuse of existing chrome/page patterns over new design systems.
- Formal pitch may clone pitch-landscape schemas initially and diverge only in partials/CSS if schemas stay identical at ship time.
