# Services — Safqa API · Projects

### SVC-PROJECTS-01 · ProjectsDataService [domain, internal, Projects]
- Status: done
- Methods:
  - `create(workspaceId, userId, dto)` — richer `info` (digitalPresence, summary, kpis, budget, duration); optional `colorPalette` (normalize/validate 1–5 `#RRGGBB`, empty → null); normalize competitors to `{ url }` (max 3); `normalizeServiceLines` → plain objects then compute financials; default status active
  - `list(workspaceId, query)`, `get(workspaceId, id)`, `update(workspaceId, id, patch)`, `archive(workspaceId, id)` — update re-normalizes competitors + service lines; same `colorPalette` rules on patch
  - DTO: `ProjectServiceLineDto` + `@ValidateNested`/`@Type` on create/patch so `enableImplicitConversion` does not turn service objects into empty arrays; `colorPalette?: string[]` (`ArrayMaxSize(5)`)
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

### SVC-PROJECTS-03 · ProjectImagesService (via ProjectsDataService) [domain, internal, Projects]
- Status: done
- Methods:
  - `uploadImages(workspaceId, projectId, files, meta?)` — S3 `projects/{id}/images/` → append `images[]` with `{ id, url, key, name, purpose, userNote }`; parallel `purposes`/`notes` (default purpose `other`)
  - `patchImages(workspaceId, projectId, updates[])` — merge purpose/userNote by id; 404 unknown id
- Deps: S3Service, ProjectsRepository
- Side effects: file (S3) on upload only
- Rules: purpose enum `client_logo`\|`product`\|`reference`\|`other`; invalid → 400; no dataURLs in later AI payloads; multiple `client_logo` allowed (assemble uses first)

### SVC-PROJECTS-04 · ProjectDnaService (via ProjectsDataService) [domain, internal, Projects]
- Status: done
- Methods:
  - `getDna(workspaceId, projectId)`
  - `enqueueRegenerateDna` — bump `dna.version`, clear `data`, enqueue `pipeline.analyze`
- Deps: ProjectsRepository, PipelineQueueService
- Side effects: async
- Rules: fail-closed analyze (no stub DNA written on failure); does not mutate existing proposals until explicit regenerate
- Notes: `buildDnaSkeleton` / reconcile map `info` → DNA (`digitalPresence`, competitor urls, summaryUser, kpis seed, budget/duration); skeleton `images[]` includes `purpose` + `userNote`; `resolveBrandingColors` → `dna.branding.colors` + `source` (palette → client_logo URL derive → Roya defaults); force-reconcile after AI merge so branding colors cannot be dropped
