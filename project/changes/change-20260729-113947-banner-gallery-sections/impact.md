# Impact Analysis — Banner / Full-bleed / Images Gallery Sections

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Catalog helpers | complete | `src/pipeline-v3/templates/shared/section-schema-helpers.ts` | `SHARED_SECTION_KEYS` must stay unchanged; no helpers for visual sections yet |
| Per-template catalogs | partial | `pitch-landscape/`, `pitch-landscape-formal/`, `website-template/`, `roya-presentation/*.catalog.ts` | No `banner` / `full_bleed_banner` / `images_gallery` defs; pattern exists via roya `team`/`risks` |
| Catalog registry | complete | `shared/catalog-registry.ts` | No code change unless counts/docs helpers need notes |
| Disk partials | none | `templates/<key>/v1/partials/` | Missing 3 partials × templates that own disk; formal **shares** pitch disk |
| Theme CSS | partial | `templates/*/v1/theme.css` | Need layout classes for image banner / gallery grids per visual language |
| Seed / bootstrap | partial | `scripts/seed-templates.js`, `pipeline-v3-bootstrap.service.ts` | `expectedByKey` hard-codes 21 / 23 — must become 24 / 26 (+3 each) |
| Fixture content | partial | `templates/fixtures/fixture-content.ts` | No fixture rows/images for new keys; smoke render needs them |
| Map orchestrator | partial | `map/map-orchestrator.service.ts` | Passes through `imageRefs` if present; **no** rule to skip visual keys when DNA has no images |
| Map prompt | none | `prompts/map.plan.v1.md` | No guidance for visual sections / `imageRefs` / “only when images exist” |
| Section DNA slice | partial | `section/dna-slice.ts` | Already includes `dna.images` for all sections |
| Section schema validation | none | `section/section-schema.ts` | No check that `imageRef` ∈ available project image ids |
| Assemble / render | complete | `assemble.service.ts`, `template-render.service.ts` | `images[id]=url` + `resolveImage` already work |
| Endpoints | complete | fixture-render / listActive | No new routes |
| FE | complete | create/gallery | Out of scope — no change |

Feature state: **none** (keys deferred since Phase 1 template pack; image plumbing partial)

## Affected Modules
- **Templates** — per-template catalog extras + disk partials/CSS + fixture + seed counts
- **Pipeline Map** — prompt (+ light guard) so visual sections only when project images exist; optional `imageRefs` on map entries
- **Pipeline Section** — writers already get `images`; add soft/hard validation that content `imageRef`(s) resolve to known ids

## Pack blueprint files to create
- [ ] `blueprint/plan/modules.md` — Templates feature after-state (section counts, local keys, maxSections)
- [ ] `blueprint/actions/api/services/templates.md` — catalog + disk + fixture + seed delta
- [ ] `blueprint/actions/api/services/pipeline-map.md` — map prompt + no-images guard
- [ ] `blueprint/actions/api/services/pipeline-sections.md` — imageRef validation (or fold into templates if thin)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Architecture notes (recon)

### Not shared
- Do **not** add keys to `SHARED_SECTION_KEYS`.
- Do **not** append visual defs onto `PITCH_LANDSCAPE_SECTIONS` in a way that website/formal/roya silently inherit one schema.
- Each of the four catalogs appends its **own** local defs (clone of schema OK at ship if capacity identical; partials must be per-disk).

### Disk ownership caveat
| Template | Disk `basePath` | Unique partials? |
|----------|-----------------|------------------|
| `pitch-landscape` | `templates/pitch-landscape/v1` | yes |
| `pitch-landscape-formal` | **same as pitch** (existing) | **no** — reuses pitch HBS/CSS; catalog schema may still be a formal-local copy |
| `website-template` | `templates/website-template/v1` | yes |
| `roya-presentation` | `templates/roya-presentation/v1` | yes |

Formal unique *design* for these sections would require a future disk split — **out of scope** here; document as known constraint.

### Section counts after change
| Template | Today | After (+3 local) |
|----------|------:|-----------------:|
| pitch / formal / website | 21 | **24** |
| roya-presentation | 23 | **26** |

### `maxSections`
Today `rules.maxSections: 28`. With repeatable visual dividers + research ×N, 28 is tight. **Recommend bump to 32** on all four catalogs + map prompt “Max N sections”.

### Image refs
- Assemble indexes images by **`id` → url** (not purpose). Content/schema should use those ids as `imageRef`.
- Map should only emit visual keys when `dna.images` (or project images) has ≥1 usable url; gallery needs ≥2 for schema min.
- Section validation: reject or repair refs not in available id set (prefer fail soft → regenerate / strip invalid like other section repair paths — detail in pack blueprint).

## Risk: **M**, cross-module **Y** (Templates + Map + Section), migration **N** (catalog upsert only)

- Medium: 12 new partials (3×3 disks) + 4 catalog edits + prompt/guard + seed/fixture.
- Formal sharing pitch disk may surprise if user expected 4 unique designs — call out at gate.
- Repeatable + maxSections interaction.

## Recommendation
- **Create**: template-local section defs ×4 catalogs; partials+CSS on pitch / website / roya disks; fixture content + sample image ids; map prompt rules; seed `expectedByKey` updates; optional `maxSections` → 32
- **Complete**: imageRef validation against available ids (gap)
- **Modify**: map orchestrator guard when no images; map prompt max count
- **Do not**: touch `SHARED_SECTION_KEYS`; FE; new image purposes; split formal disk

## Status target (per artifact in the pack after implement)
- Templates modules slice → `planned` → `done`
- SVC templates (catalogs/disk/fixture/seed) → `planned` → `done`
- SVC map → `planned` → `done`
- SVC sections (imageRef validate) → `planned` → `done`
- Endpoints / FE → N/A (omit or note no change)

## Dependencies
- depends-on: — (REQ-TEMPLATE prior packs already merged)
- Reuses: `team`/`risks` local-append pattern; `resolveImage`; DNA `images` in section slice

## Code files likely touched (preview for 5.2 / 5.4)

**Create**
- `templates/pitch-landscape/v1/partials/{banner,full_bleed_banner,images_gallery}.hbs`
- `templates/website-template/v1/partials/{banner,full_bleed_banner,images_gallery}.hbs`
- `templates/roya-presentation/v1/partials/{banner,full_bleed_banner,images_gallery}.hbs`

**Modify**
- `src/pipeline-v3/templates/pitch-landscape/pitch-landscape.catalog.ts` (append local defs; maxSections)
- `src/pipeline-v3/templates/pitch-landscape-formal/pitch-landscape-formal.catalog.ts` (append formal-local defs; maxSections)
- `src/pipeline-v3/templates/website-template/website-template.catalog.ts` (append website-local defs; maxSections)
- `src/pipeline-v3/templates/roya-presentation/roya-presentation.catalog.ts` (append + keep team/risks; maxSections)
- `templates/*/v1/theme.css` (pitch, website, roya — gallery/banner layout)
- `src/pipeline-v3/templates/fixtures/fixture-content.ts`
- `scripts/seed-templates.js` (`expectedByKey`)
- `src/pipeline-v3/prompts/map.plan.v1.md`
- `src/pipeline-v3/map/map-orchestrator.service.ts` (strip/skip visual keys when insufficient images)
- `src/pipeline-v3/section/section-schema.ts` or section orchestrator (imageRef ∈ available ids)
- READMEs that hard-code “21” / “23” section counts
