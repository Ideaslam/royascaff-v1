# Services — Safqa API · Projects (Phase 2)

### SVC-PROJECTS-01 · ProjectsDataService [domain, internal, Projects]
- Status: planned
- Methods:
  - `create(workspaceId, userId, dto)` — validate competitors ≤3; compute financials in code from services; default status active
  - `list(workspaceId, query)`, `get(workspaceId, id)`, `update(workspaceId, id, patch)`, `archive(workspaceId, id)`
- Deps: ProjectsRepository, ClientsRepository (hydrate name)
- Side effects: none
- Rules: tenant-scoped; never let AI write financials; researchOptions may include only launch keys at validate time (market|competitor|audience) or allow store-all / enforce subset on analyze

### SVC-PROJECTS-02 · ProjectRfpService [domain, internal, Projects]
- Status: planned
- Methods:
  - `uploadAndParse(workspaceId, projectId, file)` — multipart buffer → S3 `projects/{id}/rfp/` → parse PDF/DOCX/TXT → store extracted text to S3 → update `project.rfp`
- Deps: S3Service, pdf-parse, mammoth
- Side effects: file (S3)
- Rules: no 8k truncation; on parse fail set `rfp.status=failed` with message

### SVC-PROJECTS-03 · ProjectImagesService [domain, internal, Projects]
- Status: planned
- Methods:
  - `upload(workspaceId, projectId, files[], notes?)` — S3 `projects/{id}/images/` → append `images[]` with ids/urls
- Deps: S3Service
- Side effects: file (S3)
- Rules: no dataURLs in later AI payloads; return stored metadata

### SVC-PROJECTS-04 · ProjectDnaService [domain, internal, Projects]
- Status: planned
- Methods:
  - `getDna(workspaceId, projectId)`
  - `enqueueRegenerateDna(workspaceId, projectId, proposalId?)` — set generation/dna pending; enqueue `pipeline.analyze`
- Deps: ProjectsRepository, PipelineQueueService
- Side effects: async
- Rules: fail-closed analyze (no stub DNA written on failure)
