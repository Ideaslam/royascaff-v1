# Impact Analysis — Project image purpose + pitch workspace branding

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | partial | `projects.images[]` = `{ id, url, name, userNote }`; `plan/data-model.md` §15 | No `purpose` enum; `userNote` unused in UI |
| Service(s) images | partial | `ProjectsDataService.uploadImages` always sets `userNote: ""` | No purpose/note on upload; no patch-images metadata method |
| Endpoint(s) images | partial | `POST …/projects/:id/images` (EP-PROJECTS-07) multipart `files` only | No purpose fields; no PATCH images |
| DNA passthrough | partial | `dna-passthrough.ts` maps `id,url,name,userNote` | Omit `purpose` today |
| Assemble | partial | `AssembleService` maps `images[id]→url` only; **no** Settings load | No `workspace_*` / `client_logo` aliases; no branding inject |
| Template render | partial | `TemplateRenderService` partial context: `content`, `images`, `financial`, `meta` | No root `workspace_*` / `client_*`; helpers only `resolveImage` by id |
| Templates HBS | partial | `templates/pitch-landscape/v1/partials/*` | Cover hardcodes `رويا صفقة · Roya Safqa`; ~15 partials hardcode brand-mark `Safqa`; footer has no workspace block |
| Page(s) | partial | `project-create` image thumbs only | No purpose select / note; `project-edit` has **no** images step |
| Settings logo | complete (020) | `settings.logoUrl` + company fields via `SettingsDataService.getPublicSettings` | Ready to consume in assemble |

Feature state: **partial** (images + template shell exist; purpose + workspace branding missing)

## Affected Modules
- **Projects (api)** — `purpose` (+ persist `userNote`) on upload; optional PATCH image metadata
- **Projects (web)** — Create Project images UI: per-image purpose (+ note); i18n
- **Pipeline v3 Assemble / Template render** — load settings; inject root `workspace_*` + `client_name` / `client_logo`; alias image map
- **pitch-landscape templates** — remove Safqa hardcodes; use workspace/client vars on cover, footer, section brand-marks
- **DNA Analyze passthrough** — include `purpose` on skeleton images

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — `projects.images[]` after-state + `## Delta` (`purpose`)
- [ ] `blueprint/plan/modules.md` — image purpose + pitch branding slice
- [ ] `blueprint/actions/api/services/projects.md` — uploadImages + patchImageMeta
- [ ] `blueprint/actions/api/endpoints/projects.md` — EP-PROJECTS-07 extend; EP-PROJECTS-11 PATCH images (if chosen)
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — AssembleService branding inject
- [ ] `blueprint/actions/api/services/templates.md` — TemplateRenderService root context + HBS contract
- [ ] `blueprint/actions/web/pages/projects.md` — PG-PROJECTS-02 images purpose UX
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely modified (implement step)
| Repo | File | Change |
|------|------|--------|
| api | `services/data/projects.data.service.ts` | Accept purpose/userNote on upload; optional `patchImages` |
| api | `modules/data/projects.controller.ts` | Multipart fields / new PATCH route |
| api | `dtos/data/projects.dto.ts` | Purpose enum DTO if PATCH JSON |
| api | `pipeline-v3/analyze/dna-passthrough.ts` | Pass `purpose` |
| api | `pipeline-v3/assemble/assemble.service.ts` | Inject Settings; build `workspace_*` + `client_logo` |
| api | `pipeline-v3/templates/template-render.service.ts` | Root branding vars into every partial (+ layout) |
| api | `templates/pitch-landscape/v1/partials/cover.hbs` | Remove Safqa; workspace + client logos |
| api | `templates/pitch-landscape/v1/partials/footer.hbs` | Workspace logo + contacts |
| api | `templates/pitch-landscape/v1/partials/*.hbs` | Replace `Safqa` brand-marks with `workspace_name` / logo |
| api | fixtures (if any) | Supply sample workspace_* so fixture-render still works |
| web | `project-create.component.ts` | Purpose select (+ note) per thumb; send with upload |
| web | `projects.service.ts` | Extend `uploadImages` FormData (purposes/notes) |
| web | `assets/i18n/en.json` + `ar.json` | Purpose labels |

## Risk: **M**, cross-module **Y** (Projects + Assemble + Templates + FE), migration **N** (optional field; default `other`)

## Recommendation
- **Modify**: uploadImages + EP-PROJECTS-07 (multipart `purposes[]` / `notes[]` parallel to `files`); AssembleService; TemplateRenderService; all pitch-landscape brand-mark partials; create form images UI; DNA passthrough
- **Create**: optional `PATCH /api/data/projects/:id/images` (EP-PROJECTS-11) to update purpose/note on existing rows without re-upload — **recommended** for post-create fixes
- **Complete**: wire Settings → template (change-020 left this out of scope)
- **Scope note**: Project Edit has no images UI today → purpose UX on **Create** (PG-PROJECTS-02); edit of purpose later via PATCH or future edit-images (defer full edit-page images unless needed)
- **Ripple**: fixture-render admin tool must get dummy `workspace_*` so pages don’t blank

## Template variable contract (locked)
| Var | Source |
|-----|--------|
| `workspace_name` | settings.companyName |
| `workspace_logo` | settings.logoUrl |
| `workspace_email` | settings.email |
| `workspace_phone` | settings.phone |
| `workspace_address` | settings.address |
| `client_name` | proposal/project clientName (alias alongside `content.clientName`) |
| `client_logo` | first `images[]` with `purpose === 'client_logo'` → url |

Remove hardcoded `رويا صفقة · Roya Safqa` and section `Safqa` marks — no product-name fallback.

## Status target (per artifact in the pack after implement)
- projects.images.purpose (data-model) → done
- SVC-PROJECTS-03 upload + patch → done
- EP-PROJECTS-07 (+11) → done
- Assemble branding inject → done
- TemplateRender root vars → done
- pitch-landscape HBS cover/footer/brand-marks → done
- PG-PROJECTS-02 image purpose UI → done
- DNA purpose passthrough → done

## Dependencies
- depends-on: **change-020** (soft) — pack-status: `in-progress` 6/6 artifacts; `settings.logoUrl` already in code
- Soft reuse: `SettingsDataService.getPublicSettings`
