# Impact Analysis — Client-first pitch branding (bug-014)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Templates (pitch disk) | partial | `templates/pitch-landscape/v1/partials/*.hbs` | Workspace logo/name on every `brand-mark`; cover still leads with workspace chrome |
| Templates (website disk) | partial | `templates/website-template/v1/layout.hbs`, `partials/footer.hbs`, `cover.hbs` | Sticky header = workspace; footer already workspace; no `about_workspace` |
| Catalog / seed | partial | `pitch-landscape.catalog.ts`, `website-template.catalog.ts`, `pitch-landscape-formal.catalog.ts`, `catalog-registry.ts`, `pipeline-v3-bootstrap.service.ts` | No `about_workspace`; `requiredKeys` = cover/financial/footer only; bootstrap upserts on boot |
| Assemble branding | partial | `assemble.service.ts` | `client_logo` from images only; no `clients.logoUrl` fallback; no ClientsRepo inject |
| Project / DNA seed | partial | `projects.data.service.ts` (`create`, `createDnaVersionInternal`) | `images: []`; client `logoUrl` never seeded as `client_logo` |
| Map enforcement | partial | `map-orchestrator.service.ts` | Hardcodes cover/financial/footer; does not enforce catalog `requiredKeys` generically |
| Fixtures | partial | `fixture-content.ts` | Needs `about_workspace` sample + client-first cover expectations |
| FE | complete (N/A) | — | Out of scope |

Feature state: **partial** (workspace/client vars exist from change-021; placement + client logo wiring incomplete for product intent)

## Affected Modules

- **Templates / pitch-landscape (+ formal via shared partials)** — remove per-page workspace brand-marks; client-first cover; new `about_workspace` partial; footer keeps workspace
- **Templates / website-template** — header → client branding; add `about_workspace` section; footer stays workspace
- **Catalog + bootstrap** — new section def; `requiredKeys` includes `about_workspace`; formal clones pitch sections
- **Map** — ensure `about_workspace` present (validate + inject before footer)
- **Assemble** — ClientsRepo fallback for `client_logo`
- **Projects** — seed `client_logo` image from `clients.logoUrl` on create / DNA create when missing

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Assemble branding placement + Templates section inventory delta
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — Assemble branding table after-state
- [ ] `blueprint/actions/api/services/templates.md` — catalog/`about_workspace`/disk partials after-state
- [ ] `blueprint/actions/api/services/projects.md` — logo seed on create/DNA
- [ ] `blueprint/actions/api/services/pipeline-map.md` — requiredKeys / inject for `about_workspace` (if main slice exists; else fold into sections-engine or templates)
- [ ] `blueprint/_index.md` + update pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely to modify (implement step)

| Area | Files |
|------|--------|
| Pitch partials | All `templates/pitch-landscape/v1/partials/*.hbs` with brand-mark; especially `cover.hbs`, `footer.hbs`; **new** `about_workspace.hbs` |
| Pitch CSS | `templates/pitch-landscape/v1/theme.css` (client cover emphasis if needed) |
| Website | `templates/website-template/v1/layout.hbs`, `partials/cover.hbs`, `partials/footer.hbs`; **new** `about_workspace.hbs` |
| Catalogs | `pitch-landscape.catalog.ts`, `website-template.catalog.ts`, `pitch-landscape-formal.catalog.ts` (`requiredKeys`) |
| Fixtures | `fixture-content.ts` |
| Assemble | `assemble.service.ts` (+ ClientsRepo) |
| Projects | `projects.data.service.ts` |
| Map | `map-orchestrator.service.ts` (require/inject `about_workspace`) |
| Specs (if any) | section-schema / fixture tests touching section keys |

## Risk

- **Complexity**: M — many partials, new section key, map inject
- **Cross-module**: Y — templates + assemble + projects + map
- **Migration**: N — no DB schema migration; template re-seed on boot; existing proposals need regenerate to see changes
- **Ripple**: `pitch-landscape-formal` shares disk partials + clones sections — covered by pitch catalog change + formal `requiredKeys` update

## Recommendation

- **Modify**: pitch/website branding placement; assemble client_logo resolution; project/DNA image seed; map required section inject
- **Create**: `about_workspace` section (catalog + partials + fixture); optional small CSS for client-first cover
- **Complete**: client logo end-to-end (Clients → DNA images → assemble → cover)

## Status target (per artifact after implement)

| Artifact | Target |
|----------|--------|
| Assemble branding | done |
| Templates catalog + disk | done |
| Projects logo seed | done |
| Map about_workspace inject | done |
| Modules plan slice | done (at pack draft) |

## Dependencies

- depends-on: — (change-021 / change-020 already merged)
- bug: bug-014
