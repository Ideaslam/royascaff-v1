# Services — Projects · DNA versions (pack after-state)

### SVC-PROJECTS-01 · ProjectsDataService [domain, internal, Projects]
- Status: planned
- Methods (after-state):
  - `create(workspaceId, userId, dto)` — create **shell** (`name`, `clientId`, `type`, …) + **first DNA version** from dto inputs (`title?`, `info`, `services`, `colorPalette`, …). Auto title `DNA vN` (N = count+1) if missing. Does not write inputs onto project doc.
  - `list` / `get` / `archive` — unchanged tenant rules; `get` may include `dnaVersionCount` / `latestDnaStatus` (optional denorm or join).
  - `updateShell(workspaceId, id, { name?, clientId?, type? })` — only shell fields; refresh `clientName` when client changes.
  - `createProposalFromProject(..., { templateKey, language, dnaVersionId?, themeOverrides?, fromStep?, sourceProposalId? })`:
    - Resolve DNA version: explicit `dnaVersionId` or **latest ready** for project; 400 if none ready (unless analyze-first path for empty version — prefer require ready for map-only; fresh generate path: allow enqueue analyze on chosen version).
    - Freeze `dnaSnapshot` from version; set `dnaVersionId`; copy `services`/`financial` from version onto proposal.
    - Sibling/map-only when snapshot has `dna.data`; else enqueue analyze with `dnaVersionId` then map.
- Deps: ProjectsRepository, **ProjectDnaVersionsRepository**, ClientsRepository, ProposalsRepository, TemplatesRepository, PipelineQueueService, …
- Rules: tenant-scoped; v3 flag; never invent money from AI

### SVC-PROJECTS-02 · RFP on DNA version
- Status: planned
- Methods: `uploadRfp(workspaceId, projectId, dnaVersionId, file)` → update **version.rfp** (S3 path may stay `projects/{projectId}/…` or `projects/{projectId}/dna/{vid}/…`)
- Rules: same parse behavior as today

### SVC-PROJECTS-03 · Images on DNA version
- Status: planned
- Methods: `uploadImages` / `patchImages` scoped to `dnaVersionId`
- Rules: purpose enum unchanged

### SVC-PROJECTS-04 · ProjectDnaVersionsService (via ProjectsDataService or dedicated)
- Status: planned
- Methods:
  - `list(workspaceId, projectId)` — light rows: id, title, status, generatedAt, updatedAt, regenerating
  - `get(workspaceId, projectId, vid)` — full snapshot
  - `create(workspaceId, projectId, userId, { title?, copyFromVersionId?, …inputs? })` — blank or deep-copy from chosen version (new ids for image rows if needed; same S3 keys OK for copy-on-write v1); title required after trim (auto if blank)
  - `updateInputs(workspaceId, projectId, vid, patch)` — info/services/palette/…; does not auto-generate
  - `rename(workspaceId, projectId, vid, title)` — required non-empty; duplicates OK
  - `delete(workspaceId, projectId, vid)` — **hard delete**; allowed if proposals reference it; no minimum versions; 409 if regenerating
  - `enqueueGenerate(workspaceId, projectId, vid, { confirmOverwrite? })` — if ready and !confirm → 409/400 needing confirm; if regenerating → 409; set regenerating, clear data (overwrite path), enqueue analyze with `dnaVersionId`
  - `putContent(workspaceId, projectId, vid, dnaData)` — AJV `dna.v2`; set ready; reject invalid 400
- Deps: ProjectDnaVersionsRepository, PipelineQueueService, validate dna.v2, branding resolve on generate path
- Side effects: async analyze; hard delete
- Rules: branding inject/force-reconcile still applies on generate write; fail-closed (no stub DNA on AI failure → status `failed`)

### Legacy
- `getDna(projectId)` / `enqueueRegenerateDna(projectId)` — retire or shim to latest version; prefer new methods only.

## Delta

- **Add** ProjectDnaVersionsRepository + SVC DNA version methods
- **Change** create → shell + first version
- **Change** update → shell-only
- **Change** createProposalFromProject → `dnaVersionId` + `dnaSnapshot`
- **Move** RFP/images to version scope
- **Retire** project-level regenerate as primary API
