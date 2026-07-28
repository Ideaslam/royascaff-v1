# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-TEMPLATE
- **part**: 2/2
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Templates (Pipeline v3)
- Feature(s): New design-first template `roya-presentation` styled from HAIA × Roya Branding Proposal; locked theme palette (no client DNA color override for now)
- Endpoint(s): none new (existing `listActive` / fixture-render pick up seeded template)
- Page(s)/View(s): none (FE gallery already lists active templates)
- Service(s): catalog seed builders, bootstrap upsert, assemble theme merge, fixture content; TemplateRenderService contract extended only if needed for palette lock

## Description

Add a fourth proposal template **`roya-presentation`** whose **visual language** is derived from the reference file:

`HAIA x Roya l Branding Proposal (2).html` (pdf2htmlEX export of the HAIA branding pitch).

**Not a port of the PDF HTML** — extract tokens/motifs/section layouts, then rebuild all Pipeline v3 section partials as clean Handlebars + CSS (same pattern as `website-template` ← smart-watch).

### Style extraction (from reference)

| Role | Hex | Notes |
|------|-----|-------|
| Deep canvas / dark text | `#1A1533` | Cover & dark panels (`rgb(26,21,51)`) |
| Primary accent (red) | `#FF3B2F` | CTAs, highlights (`rgb(255,59,47)`) |
| Gold accent | `#C9A24B` | Stats / premium markers (`rgb(201,162,75)`) |
| Purple accent | `#7B5CFF` / `#4B2ECF` | Secondary highlights |
| Teal accent | `#2FC2AE` | Occasional positive markers |
| Light lavender surface | `#EFECRB` / `#E7E2F6` | Light page backgrounds |
| Muted purple text | `#6F6796` / `#9A90C2` | Secondary copy |
| White | `#FFFFFF` | Text on dark / cards |

Motifs: dark-first cover with bold stacked titles; eyebrow labels (`BRAND · IDENTITY · …`); gold/red accent bars; large number/stat callouts; service grids; audience persona cards; phased timeline; pricing line-item tables; “BY ROYA” chrome on inner pages.

### Template contract

- **Key**: `roya-presentation`
- **Display name**: `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }`
- **Type**: `presentation`, landscape 16:9 (same page mm / safe area as `pitch-landscape`)
- **Own disk**: `templates/roya-presentation/v1/` (`layout.hbs`, `theme.css`, one partial per shared section key)
- **Section keys + `contentSchema`**:
  - Base parity with current shared set (**21** keys including `about_workspace` / `testimonial`)
  - Plus **two new keys owned by this template only**: `team`, `risks` → **23** sections total for `roya-presentation`
  - Pitch / formal / website catalogs unchanged (no new shared keys forced onto them)
- **Rules**: same `requiredKeys` (`cover`, `financial`, `about_workspace`, `footer`); `team` + `risks` optional (map may include when relevant); research coverage required; `maxSections` still ≥ 28
- **Seed**: bootstrap + `scripts/seed-templates.js` keep-list; seed validation allows per-template section counts

### Section design mapping (reference → keys)

| Reference slide(s) | Section key | Approach |
|--------------------|-------------|----------|
| Cover / “Building HAIA…” | `cover` | Rebuild client-first dark cover |
| Agency intro + track-record numbers | `about_workspace` + `executive_summary` | Dark/light agency intro + stats strip |
| Nine core services | `services` | Service grid matching reference |
| Clients & partners | `case_studies` / `testimonial` | Logo/name proof layouts |
| Client context + challenge | `client_context` | Fact rows + challenge callout |
| Audiences (six) | `audience_insights` | Persona cards |
| Objectives / 0→100% | `objectives_kpis` | KPI progress / metric table |
| Scope of work (weeks) | `action_plan` | Phased work packages |
| Methodology | `methodology` | Stage cards + parallel note |
| Timeline phases | `timeline` | Horizontal/phased timeline |
| Creative team / roles | **`team`** *(new)* | Role cards (title, focus, deliverables) |
| Risks & Assumptions | **`risks`** *(new)* | Risk cards + assumptions list |
| Pricing / one-time + retainer | `financial` | Line-item commercial table |
| Let’s / next steps + contact | `next_steps` + `footer` | CTA + contact chrome |
| *(not in PDF)* market / competitor / trends / benchmarks / social_audit / insights_divider / etc. | remaining shared keys | **Generate** layouts in the same visual language |

### New section schemas (this template)

**`team`**
- purpose: Delivery team / roles for the engagement
- content: `title`, `intro?`, `members[]` (`role`, `focus`, `deliverables?`)

**`risks`**
- purpose: Risks & assumptions (clear-eyed delivery)
- content: `title`, `risks[]` (`title`, `mitigation`), `assumptions[]` (strings)

### Palette lock (critical for this pack)

- Template catalog theme tokens = reference palette above.
- **Assemble must NOT apply client/DNA `colorPalette` / `colorRoles` theme overrides** for `roya-presentation`.
- Optional `proposal.themeOverrides` also ignored for this template (until a future pack decides DNA injection points).
- Implementation: catalog flag e.g. `theme.lockPalette: true` (or equivalent) checked in `AssembleService` / render path so tokens come only from catalog/disk CSS.
- Document that future work will selectively wire DNA colors into specific surfaces — **out of scope now**.

### Out of scope

- Shipping the pdf2htmlEX HTML / embedded fonts / absolute-positioned PDF markup
- New FE pages or picker UI (gallery already dynamic)
- Adding `team` / `risks` to pitch / formal / website (this pack is template-local only)
- Changing AI map/section prompts beyond what is required for the new schemas to validate / map
- Selective DNA color injection (future pack)
- Financial standalone `financial-document` redesign

## Acceptance Criteria

1. Mongo has active `roya-presentation` v1 with `assets.basePath` `templates/roya-presentation/v1`, display names above, and **23** section defs (21 shared parity + `team` + `risks`) with full `contentSchema`.
2. Disk under `templates/roya-presentation/v1/` contains `layout.hbs`, `theme.css`, and a partial for every registered section key including `team.hbs` and `risks.hbs`; visual language clearly reflects the HAIA reference (deep purple canvas, red/gold accents, eyebrow labels, bold hierarchy).
3. Sections present in the reference are rebuilt as clean HBS/CSS (not PDF dump); sections missing from the reference still exist and match the same style language.
4. Rendering `roya-presentation` **ignores** project DNA palette / client-derived colors and `proposal.themeOverrides` — output always uses the locked catalog/disk palette.
5. Bootstrap / `seed-templates.js` upserts `roya-presentation` in the canonical keep-list; `listActive` returns it; seed validation accepts the 23-key catalog for this template without breaking the other three.
6. Fixture HTML/PDF path renders `roya-presentation` for AR and EN (including `team` + `risks`) without page-contract failures.
7. Existing `pitch-landscape` / `pitch-landscape-formal` / `website-template` still have 21 keys and still receive DNA theme overrides as today.
8. Map/section AI for `roya-presentation` can produce `team` and `risks` when relevant (optional; not in `requiredKeys`).
9. No FE code changes required for the template to appear in create/gallery picker.

## Notes

- Pattern: reference HTML = **style source only** → tokens + motifs → redesign all proposal partials.
- Client-first cover / `about_workspace` behavior from change-036 should apply (client on cover; agency intro in `about_workspace`; workspace chrome on footer).
- Palette lock is intentional temporary product decision; leave a clear code comment + catalog flag for the future DNA wiring pack.
- `team` / `risks` are **template-local** extras (not added to `SHARED_SECTION_KEYS`); registry resolves them via `getTemplateSections("roya-presentation")`.
- Reference file path (workspace root): `HAIA x Roya l Branding Proposal (2).html`
