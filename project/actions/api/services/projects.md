# Services — Safqa API · Projects

### SVC-PROJECTS-01 · ProjectsDataService [domain, internal, Projects]
- Status: done
- Methods:
  - `create` — project + **first DNA version** (`dnaTitle` or `DNA v1`); returns project with `dnaVersion`
  - `list` / `get` / `update` / `archive` / `updateShell`
  - `createProposalFromProject` — resolve `dnaVersionId` (or latest ready); pin `dnaVersionId` + `dnaSnapshot`; services from version; enqueue analyze (with `dnaVersionId`) or map
  - DNA versions: `listDnaVersions`, `getDnaVersion`, `createDnaVersion` (blank|copyFrom), `updateDnaVersionInputs`, `renameDnaVersion`, `deleteDnaVersion` (hard; 409 if generating), `enqueueGenerateDnaVersion` (confirmOverwrite / 409), `putDnaVersionContent` (AJV dna.v2)
  - Version media: `uploadRfpForDnaVersion`, `uploadImagesForDnaVersion`, `patchImagesForDnaVersion` (mirror onto project)
  - Legacy: `getDna` (latest ready), `enqueueRegenerateDna` (ensure version → generate), project-level RFP/images
- Deps: ProjectsRepository, **ProjectDnaVersionsRepository**, ClientsRepository, ProposalsRepository, TemplatesRepository, S3Service, PipelineQueueService, …
- Side effects: async analyze; S3; hard delete DNA
- Rules: tenant-scoped; v3 flag; snapshot-first for proposals; branding inject on generate path

### SVC-PROJECTS-02 · ProjectRfpService (via ProjectsDataService)
- Status: done
- Methods: project-level `uploadRfp` + version-scoped `uploadRfpForDnaVersion`
- Deps: S3Service, RfpParseService
- Side effects: file (S3)

### SVC-PROJECTS-03 · ProjectImagesService (via ProjectsDataService)
- Status: done
- Methods: project-level upload/patch + version-scoped upload/patch
- Rules: purpose enum `client_logo`\|`product`\|`reference`\|`other`

### SVC-PROJECTS-04 · ProjectDna / versions (via ProjectsDataService)
- Status: done
- Methods: see DNA methods on SVC-PROJECTS-01; branding resolve still via `resolveBrandingColors` on analyze write
- Notes: `dna-version-resolve.ts` — `deriveDnaStatus`, `buildDnaSnapshot`, `resolveDnaForProposal` (snapshot → version → legacy project.dna)
