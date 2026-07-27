# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: low
- **request-id**: REQ-DNA-VER
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Projects · Pipeline v3 (Analyze / create-from-project)
- Feature(s): DNA versions as first-class project snapshots; remove full Edit Project; create-proposal DNA picker
- Endpoint(s): new DNA CRUD + generate + list; migrate create-project / create-proposal / analyze pin; retire or narrow project PATCH-as-edit
- Page(s)/View(s): `web`: project workspace DNA list; DNA create/edit full page (renamed from project create/edit form); create-proposal DNA picker; remove `/projects/:id/edit` as full form
- Service(s): Projects data service · DNA versions repository · Analyze orchestrator · proposal create-from-project

## Description

Users often change palette, images, RFP, research, or services and need a **new analysis** while still generating proposals from an **older** DNA. Today `projects.dna` is a single mutable blob (regenerate overwrites).

**Model (recommended & confirmed):**

1. **Thin project shell** — project keeps identity fields only: `name`, `clientId`/`clientName`, `type`, `status`, timestamps. Inline rename / client change on workspace header (small dialog). No full Edit Project page.
2. **DNA versions collection** — `project_dna_versions` (not embedded): each row is a full **snapshot** of inputs (`info`, services/financial, RFP, images, `colorPalette`, research options, …) **plus** generated `dna` (`schemaVersion`, `data`, `generatedAt`, `runId`, `regenerating?`) and a required **title**.
3. **Create Project** — creates shell + **first DNA** (same form, renamed to DNA; auto title e.g. `DNA v1`, editable before save).
4. **DNA list** on `/projects/:id` — rows with title, status (empty / generating / ready / failed), actions: View/Edit, Generate, Rename, Delete, Create DNA (blank or copy-from chosen).
5. **Edit DNA** — full page (reuse current create/edit project form, renamed): edit **inputs** and **generated DNA content** (structured + AJV `dna.v2` on save). Per-row **Generate** uses that version’s inputs; if `data` already present → confirm → overwrite. Generate failure keeps version with empty/`failed` status (no restore of prior data after confirmed overwrite starts — last good may be cleared when regen begins; document clearly).
6. **Hard delete** DNA — allowed even if proposals reference it; **no** minimum versions. Proposals must remain usable via **frozen `dnaSnapshot`** (and optional `dnaVersionId` for traceability) copied at create/map time.
7. **Create proposal** — user picks DNA version (title + status); default = latest **ready**; pipeline Analyze/Map pins `dnaVersionId` and uses that snapshot’s DNA + services.
8. **Migration** — existing `projects.dna` (+ current project inputs) → first `project_dna_versions` doc titled `DNA v1` (or similar); backfill proposal pin where possible.
9. **Concurrency** — per-version `regenerating` / `runId` lock; second Generate on same version → 409.
10. **Permissions** — list/view: `projects.view`; create/edit/rename/generate/save content: `projects.edit`; delete: `projects.delete`.
11. Duplicate titles allowed. No max versions.

**Out of scope:** DNA diff/compare UI; soft-delete; separate permission keys beyond existing `projects.*`; embedding versions on the project document.

## Acceptance Criteria
1. Project has a DNA versions list on `/projects/:id` with title, status, and per-row Generate / Edit / Rename / Delete; Create DNA supports blank or copy-from.
2. Full `/projects/:id/edit` project form is removed; shell fields (name/client) editable from workspace; DNA form is the renamed create/edit form at DNA routes.
3. Each DNA version persists its own inputs + generated DNA in `project_dna_versions`; title required.
4. Generate for a version uses that version’s inputs only; confirm before overwrite if data exists; concurrent generate on same version returns 409; failure leaves version empty/failed (not a silent rollback UX).
5. Editing generated DNA content validates against AJV `dna.v2` before save.
6. Create proposal requires selecting a DNA version (default latest ready); proposal stores `dnaVersionId` + immutable `dnaSnapshot` (and uses version services for financials as applicable).
7. Hard-deleting a DNA version does not break existing proposals that already snapped that DNA.
8. Migration creates one DNA version from legacy `projects.dna` + project inputs for existing projects.
9. Permissions: view vs edit vs delete mapped as above.
10. Duplicate titles allowed; zero DNA versions allowed after deletes.

## Notes (optional)
- Priority: nice-to-have / low — one pack `REQ-DNA-VER`.
- Analyze worker must load DNA version by id (not only `projects.dna`).
- Legacy numeric `dna.version` may remain as a monotonic counter on the version doc or be replaced by `_id`; proposals should prefer `dnaVersionId` + snapshot.
- FE: PrimeNG cards, breadcrumbs, RTL — same patterns as current project form.
