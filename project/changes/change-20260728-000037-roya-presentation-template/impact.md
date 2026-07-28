# Impact Analysis — Roya Presentation Template (`roya-presentation`)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Catalog / schema | partial | `catalog-registry.ts`; pitch/website/formal catalogs; `SHARED_SECTION_KEYS` (21) | no `roya-presentation` builder; no `team` / `risks` defs |
| Disk assets | none | `templates/pitch-landscape/v1/`, `templates/website-template/v1/` | no `templates/roya-presentation/v1/` |
| Bootstrap / seed | partial | `pipeline-v3-bootstrap.service.ts` `CANONICAL_TEMPLATES` (3); `scripts/seed-templates.js` | new key would be **deactivated** if not added; seed asserts all catalogs == `SHARED_SECTION_KEYS.length` |
| Assemble theme | complete* | `assemble.service.ts` merges DNA + `proposal.themeOverrides` | *always applies overrides — need palette-lock skip for this key |
| Render | complete | `template-render.service.ts` + asset resolver | themeOverrides win over catalog tokens; fixture allowlist needs new key |
| Map / section AI | complete* | `map-orchestrator.service.ts` uses `getTemplateSections(templateKey)` | *auto-picks up new catalog keys once registered; fixtures need `team`/`risks` content |
| Coverage gate | complete | `research-coverage.gate.ts` | no change required for optional commercial sections |
| Fixture | partial | `fixtures/fixture-content.ts`; `FIXTURE_TEMPLATE_KEYS` in controller | no roya-presentation content; allowlist missing key |
| Endpoint(s) | complete | `GET /api/data/templates`; fixture-render with `templateKey` | allowlist update only |
| Page(s) FE | complete | create/gallery `listTemplates()` | auto-lists active keys |

Feature state: **none** for `roya-presentation` (engine ready; fourth design + 2 template-local sections greenfield)

## Affected Modules

- **Templates** — new catalog builder, disk pack (23 partials), bootstrap/seed canonical list, fixture content + allowlist, theme `lockPalette` flag
- **Assemble** — skip DNA / proposal themeOverrides when template has palette lock
- **Pipeline map/section (light)** — no structural change; per-template catalog already drives map/AJV; new optional keys appear for this template only
- **Projects FE** — none

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Templates slice: `roya-presentation` + local `team`/`risks`
- [ ] `blueprint/plan/data-model.md` — template key + section key list (23) + `theme.lockPalette`
- [ ] `blueprint/actions/api/services/templates.md` — catalog/seed/render/fixture deltas
- [ ] `blueprint/actions/api/services/pipeline-assemble.md` — palette-lock behavior
- [ ] `blueprint/actions/api/endpoints/templates.md` — fixture allowlist
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

**Create**
- `templates/roya-presentation/v1/` — `layout.hbs`, `theme.css`, `README.md`, `partials/*.hbs` for **23** keys (HAIA visual language)
- `roya-presentation.catalog.ts` — `buildRoyaPresentationTemplateDoc()`, sections = clone(pitch) + `team` + `risks`, `theme.lockPalette: true`, locked tokens from reference
- Fixture sections for `team` + `risks` (AR + EN)

**Modify**
- `catalog-registry.ts` — register sections + `buildRoyaPresentationTemplateDoc` in `buildAllTemplateDocs`
- `pipeline-v3-bootstrap.service.ts` — add `{ key: "roya-presentation", version: 1 }` to `CANONICAL_TEMPLATES`
- `scripts/seed-templates.js` — keep-list + per-template expected section counts (21 vs 23)
- `assemble.service.ts` — if `tplDoc.theme.lockPalette` (or equivalent), do not pass DNA/`proposal.themeOverrides`
- `templates.controller.ts` — add `roya-presentation` to `FIXTURE_TEMPLATE_KEYS`
- `fixtures/fixture-content.ts` — support new key + extra sections

**Do not change (unless verify forces)**
- Pitch / formal / website disk or schemas
- FE create/gallery components
- Research options / DNA modules
- Standalone financial-document template

## Ripple effects

| Risk | Level | Notes |
|------|:-----:|-------|
| Canonical deactivate | **H** | Forgetting `roya-presentation` in `CANONICAL_TEMPLATES` / seed keep wipes it on boot |
| Seed count assert | **H** | Current seed expects all catalogs == shared length — must relax for 23-key template |
| Palette lock miss | **H** | If assemble still merges DNA colors, locked HAIA look breaks (user requirement) |
| Disk partial miss | M | Missing `team.hbs` / `risks.hbs` or any of 21 → render fail loud |
| Map optional extras | L | `team`/`risks` optional; map may omit until content warrants — OK |
| maxSections 28 | L | 23 defs still under cap |
| Formal/website untouched | L | Template-local extras avoid forcing 2 new partials × 3 templates |

## Reuse

- `cloneSections(PITCH_LANDSCAPE_SECTIONS)` then append `team` + `risks` (website pattern)
- Existing layout CSS-var injection; locked template simply omits overrides so catalog tokens win
- Client-first cover / `about_workspace` / footer chrome from change-20260728-000036
- Fixture render already accepts `templateKey`

## Risk: complexity **M–H**, cross-module **Y** (Templates + Assemble), migration **N** (upsert seed)

## Recommendation

- **Create**: `roya-presentation` disk + catalog (23 sections) + fixture content; palette-lock flag
- **Modify**: registry/bootstrap/seed; assemble skip overrides when locked; fixture allowlist
- **Do not**: add `team`/`risks` to shared pitch/website catalogs in this pack

## Status target (per artifact in the pack after implement)

- `buildRoyaPresentationTemplateDoc` + registry/bootstrap/seed → planned → done
- Disk `templates/roya-presentation/v1/` (23 partials + theme) → planned → done
- `team` + `risks` schemas + partials + fixtures → planned → done
- Assemble palette lock → planned → done
- Fixture allowlist / seed count validation → planned → done
- FE pages → deferred (not needed)

## Dependencies

- **depends-on**: — (change-20260726-000005/023/025/036 patterns already in code; 036 verified for client-first)
- Current pack-status of deps: N/A
