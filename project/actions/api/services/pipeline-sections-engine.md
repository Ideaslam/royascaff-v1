# Services — Safqa API · Pipeline Sections + Engine (Phase 3)

> Under `src/pipeline-v3/section/`, `assemble/`, `export/`, `reconciler/`.
> Reuse: TemplateRenderService, PdfRenderService, S3Service, callClaudeJsonTraced, ModelResolver, PipelineTraceService, pitch-landscape catalog, PipelineQueueService.

## Delta

- **Create** SVC-PIPE-S3-01..08 below
- **Modify** `PipelineQueueService` — dispatch section/assemble/export; fan-in; extend `isStepAlreadyDone`
- **Modify** `MapOrchestrator` — on map success enqueue section fan-out (when flag on / proposal v3)
- **Modify** Projects create-from-project — require `pipelineV3Enabled`
- **Replace** section prompt placeholders with production packs

---

### SVC-PIPE-S3-01 · SectionOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runSection(job: { workspaceId, proposalId, projectId, runId, instanceId, language })` — load map entry + catalog contentSchema + DNA slice; AI call; AJV + richness; repair ≤2; write `proposal.sections[i]`; update `generation.steps.sections` counters
  - `enqueueAllSections(proposalId)` — create pending section rows from sectionMap; enqueue N `pipeline.section` jobs; set status `generating_sections`
- Deps: ProposalsRepository, ProjectsRepository, catalog, Claude, traces, Schema compile from contentSchema
- Side effects: async, external API
- Rules:
  - Research keys get full `research.modules.*`; others get headlines only
  - Financial: AI fills non-money slots only; strip/ignore money table from AI
  - Failed section does not fail siblings; concurrency via worker concurrency (6–8)
  - Trace every AI + validation/richness

### SVC-PIPE-S3-02 · DnaSliceBuilder [domain, internal, PipelineV3]
- Status: done
- Methods: `buildSlice(sectionKey, mapEntry, dna): JsonObject`
- Deps: none (pure)
- Side effects: none
- Rules: competitor_analysis instance gets matching competitor index when possible

### SVC-PIPE-S3-03 · RichnessGate [domain, internal, PipelineV3]
- Status: done
- Methods: `assertRichness(sectionKey, content, capacity?): { ok, errors[] }`
- Deps: catalog capacity / depth contracts
- Side effects: none
- Rules: min lengths on primary text slots; fail closed → repair path

### SVC-PIPE-S3-04 · SectionFanInCoordinator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `onSectionTerminal(proposalId, runId)` — if all sections terminal: if zero ready → fail; else enqueue `pipeline.assemble`
- Deps: ProposalsRepository, PipelineQueueService
- Side effects: async
- Rules: idempotent; prefer FlowProducer parent **or** atomic Mongo check after each section (document choice in implement notes). Prefer FlowProducer if BullMQ version supports cleanly; else Mongo fan-in is acceptable.

### SVC-PIPE-S3-05 · AssembleService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runAssemble(job)` — load ready (+ optionally skip failed) sections; inject financials/dates/client; `TemplateRenderService.renderProposalHtml`; overflow guard (Puppeteer measure `.page`, shrink steps); PDF via PdfRenderService; stash buffers/keys temp or pass to export job payload via Mongo staging fields; set `steps.assembly` done; enqueue export
- Deps: TemplateRenderService, PdfRenderService, ProposalsRepository, ProjectsRepository
- Side effects: CPU, browser
- Rules: no AI; failed sections omitted from deck (Ready with gaps); if none ready → fail without export

### SVC-PIPE-S3-06 · ExportService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runExport(job)` — upload HTML+PDF to S3; write `renderedByLang[lang]`; set status `ready` or `partially_failed` based on section failures
- Deps: S3Service, ProposalsRepository
- Side effects: file (S3)
- Rules: retryable independently; do not re-run assemble on export retry unless artifacts missing

### SVC-PIPE-S3-07 · PipelineReconciler [infrastructure, internal, PipelineV3]
- Status: done
- Methods:
  - `sweep()` every ~60s — find proposals with non-terminal `generation.status` + `pipelineVersion: "3"` older than threshold; if no active BullMQ jobs for runId/proposal → re-enqueue current step
- Deps: ProposalsRepository, PipelineQueueService, BullMQ Queue.getJobs
- Side effects: async
- Rules: fail-soft; never duplicate if step already done; skip if flag off optional

### SVC-PIPE-S3-08 · Feature flag + ProposalPipeline helpers [domain, internal, PipelineV3/Settings]
- Status: done
- Methods:
  - `isPipelineV3Enabled(workspaceId): boolean` — settings.pipelineV3Enabled === true
  - `retrySections(workspaceId, proposalId, instanceIds[])` — reset failed → enqueue; may clear assembly/export if regenerating content
  - Wire map→sections and section→assemble→export in queue service
- Deps: SettingsService / getSettingsFromDb, ProposalsRepository, Queue
- Side effects: async
- Rules: create-from-project rejects when flag false; `/ai-jobs` v2 untouched

### SVC-PIPE-S3-09 · Section prompt packs [domain, internal, PipelineV3]
- Status: done
- Methods: N/A — files
- Deps: `section.generic.v1.md`, `section.research.v1.md`, shared anti-hallucination/depth/voice
- Side effects: none
- Rules: Role/Mission/Grounding/Output-contract; research presentation expands module, no new facts
