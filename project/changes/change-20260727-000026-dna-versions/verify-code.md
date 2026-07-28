# Verification — DNA Versions (change-20260727-000026)

## Plan Consistency (pre-build)
- [x] Endpoints in pack blueprint (EP-PROJECTS-12..22 + 01/04/10 deltas)
- [x] Services in pack (Projects DNA + pipeline analyze/resolve)
- [x] Data model: `project_dna_versions` + proposal `dnaVersionId` / `dnaSnapshot`
- [x] Routes: workspace DNA list; `/dna/new`, `/dna/:vid`
- [x] Auth: `projects.view|edit|delete|create` as declared
- [x] Recon findings reflected (collection, not embed; snapshot-first pipeline)

## Code Verification (post-build)

### Endpoints / services
- [x] DNA version CRUD + generate + content + version-scoped RFP/images under `/api/data/projects/:id/dna-versions…`
- [x] Permission guards applied per action
- [x] Layering: controller → ProjectsDataService → ProjectDnaVersionsRepository
- [x] Create project creates first DNA; create proposal pins `dnaVersionId` + `dnaSnapshot`
- [x] Analyze writes version; map/section/assemble/regen use `resolveDnaForProposal` (snapshot-first)
- [x] Backfill script `scripts/backfill-project-dna-versions.js`

### Pages / FE
- [x] `/projects/:id` DNA versions table: title, status, Generate / Edit / Rename / Delete; Create blank|copy-from
- [x] Create proposal dialog: DNA select (default latest ready) + `appendTo="body"`
- [x] DNA form at `/projects/:id/dna/:vid` (reuses edit form); create via `/dna/new`
- [x] FE calls app API only (no hardcoded external URLs)
- [x] API `tsc --noEmit` clean; FE `ng build` clean

### Acceptance criteria
| # | Criterion | Result |
|---|-----------|--------|
| 1 | DNA list + per-row actions + create blank/copy | **PASS** |
| 2 | Retire full Edit Project; shell edit on workspace | **PARTIAL** — DNA routes are primary; `/projects/:id/edit` still exists; workspace header shell dialog not added (name/client still editable via DNA form) |
| 3 | Versions in `project_dna_versions`, title required | **PASS** |
| 4 | Per-version generate; confirm overwrite; 409 if regenerating; fail → failed/empty | **PASS** |
| 5 | Edit generated DNA + AJV `dna.v2` | **PARTIAL** — `PUT …/content` validates; FE structured content editor not shipped (inputs form only) |
| 6 | Create proposal picks DNA; snapshot pin | **PASS** |
| 7 | Hard delete; proposals keep snapshot | **PASS** |
| 8 | Migration script | **PASS** |
| 9 | Permissions mapping | **PASS** |
| 10 | Duplicate titles; zero versions allowed | **PASS** |

### Deferred / follow-ups (explicit)
- Workspace inline shell rename/client dialog (retire `/edit` fully)
- Structured generated-DNA content editor UI on DNA page

## Result: **PASS**

User confirmed verified 2026-07-28. Partials deferred above do not block pack `verified`.
