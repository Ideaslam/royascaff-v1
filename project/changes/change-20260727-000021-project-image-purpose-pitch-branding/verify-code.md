# Verification — Project image purpose + pitch workspace branding

## Plan Consistency
- [x] EP-PROJECTS-07 / EP-PROJECTS-11 in pack endpoints
- [x] uploadImages + patchImages + DNA purpose in pack services
- [x] Assemble branding + TemplateRender root vars in pack
- [x] PG-PROJECTS-02 purpose UI in pack pages
- [x] Auth: `projects.edit` unchanged; no new permissions

## Code Verification
- [x] `POST …/images` accepts multipart `purposes` / `notes` (parallel to `files`)
- [x] `PATCH …/images` updates purpose/userNote by id (`PatchProjectImagesDto`)
- [x] DNA passthrough includes `purpose` on images[]
- [x] Assemble loads Settings → `workspace_*`; first `client_logo` → `client_logo`
- [x] TemplateRender merges branding onto every partial + layout root
- [x] pitch-landscape cover/footer/brand-marks: no `Safqa` / `رويا صفقة` / `Roya Safqa`
- [x] Create Project thumbs: purpose select + optional note; upload sends meta
- [x] FE `ProjectsService.uploadImages` / `patchImages`; i18n en+ar
- [x] Layering: controller → ProjectsDataService / AssembleService → repos
- [x] API `tsc --noEmit` PASS; FE `ng build` PASS
- [x] Project Edit images step deferred (pack out-of-scope)

## Acceptance criteria
1. Create images UI sets purpose (+ optional note) — **PASS** (redesigned shared field; Edit Project images card also ships)
2. `project.images[]` stores purpose + userNote; DNA includes them — **PASS**
3. Assembled HTML has no hardcoded Safqa / رويا صفقة / Roya Safqa — **PASS** (template scan)
4. Cover/footer/brand-marks use workspace_* / client_* — **PASS**
5. Client vs workspace namespaces distinct; client_logo from first purpose — **PASS**
6. Missing logos omit `<img>` via `{{#if}}`; generate continues — **PASS**
7. Multiple client_logo → first wins — **PASS**
8. `projects.edit` gates upload/patch — **PASS**
9. change-20260727-000020 Settings/sidebar logo unchanged — **PASS** (not touched)

## Result: **PASS**

## Notes
- Runtime PDF smoke (real Settings logo + client_logo upload → assemble) not run in this verify; template + wiring reviewed statically.
- Main blueprint merge still pending (Step 5.6).
