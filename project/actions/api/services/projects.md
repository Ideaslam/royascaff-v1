# Services — Safqa API · Projects

### SVC-PROJECTS-01 · ProjectsDataService [domain, internal, Projects]
- Status: done
- Methods:
  - `create(workspaceId, userId, dto)` — richer `info` (digitalPresence, summary, kpis, budget, duration); normalize competitors to `{ url }` (max 3); compute financials in code from services; default status active
  - `list(workspaceId, query)`, `get(workspaceId, id)`, `update(workspaceId, id, patch)`, `archive(workspaceId, id)` — update re-normalizes competitors
  - `createProposalFromProject(..., { templateKey, language, themeOverrides?, fromStep?, sourceProposalId? })` — active template; pin dnaVersion; sibling/map-only when DNA; **`type: 'creative'`** (not `project.type`)
  - `getProposalGenerationStatus(...)`, `regenerateProposal`, `translateProposal`, `rerenderProposal`
- Deps: ProjectsRepository, ClientsRepository, ProposalsRepository, TemplatesRepository, S3Service, RfpParseService, PipelineQueueService, regen/translate services
- Side effects: async (enqueue), file (S3 via RFP/images helpers)
- Rules: tenant-scoped; never let AI write financials; researchOptions launch subset market|competitor|audience; v3 mutations require `settings.pipelineV3Enabled`

### SVC-PROJECTS-02 · ProjectRfpService (via ProjectsDataService.uploadRfp) [domain, internal, Projects]
- Status: done
- Methods:
  - `uploadRfp` — multipart buffer → S3 → parse PDF/DOCX/TXT → store extracted text → update `project.rfp`
- Deps: S3Service, RfpParseService (pdf-parse, mammoth)
- Side effects: file (S3)
- Rules: no 8k truncation; on parse fail set `rfp.status=failed` with message

### SVC-PROJECTS-03 · ProjectImagesService (via ProjectsDataService.uploadImages) [domain, internal, Projects]
- Status: done
- Methods:
  - `uploadImages` — S3 `projects/{id}/images/` → append `images[]` with ids/urls
- Deps: S3Service
- Side effects: file (S3)
- Rules: no dataURLs in later AI payloads

### SVC-PROJECTS-04 · ProjectDnaService (via ProjectsDataService) [domain, internal, Projects]
- Status: done
- Methods:
  - `getDna(workspaceId, projectId)`
  - `enqueueRegenerateDna` — bump `dna.version`, clear `data`, enqueue `pipeline.analyze`
- Deps: ProjectsRepository, PipelineQueueService
- Side effects: async
- Rules: fail-closed analyze (no stub DNA written on failure); does not mutate existing proposals until explicit regenerate
- Notes: `buildDnaSkeleton` / reconcile map `info` → DNA (`digitalPresence`, competitor urls, summaryUser, kpis seed, budget/duration)
