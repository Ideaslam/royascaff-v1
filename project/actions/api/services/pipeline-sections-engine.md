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
- Methods: `buildDnaSlice(sectionKey, mapEntry, dna, competitorIndex?)`, `isResearchSectionKey(key)`
- Deps: none (pure)
- Side effects: none
- Rules: full module DNA for research keys `market_analysis`, `competitor_analysis`, `audience_insights`, `market_trends`, `benchmarks`, `case_studies`, `social_audit`, `action_plan`; competitor_analysis instance gets matching competitor index when possible

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
  - `runAssemble(job)` — load ready (+ optionally skip failed) sections; inject financials/dates/client; load workspace Settings + resolve branding; map DNA `branding.colors` → `themeOverrides`; `TemplateRenderService.renderProposalHtml` with root branding + theme; overflow guard (Puppeteer measure `.page`, shrink steps); PDF via PdfRenderService; stash buffers/keys temp or pass to export job payload via Mongo staging fields; set `steps.assembly` done; enqueue export
- Branding resolution (root Handlebars):
  | Key | Source |
  |-----|--------|
  | `workspace_name` | settings.companyName |
  | `workspace_logo` | settings.logoUrl |
  | `workspace_email` / `workspace_phone` / `workspace_address` | settings |
  | `client_name` | proposal/project clientName |
  | `client_logo` | first `project.images` with `purpose === 'client_logo'` |
- Theme colors (`themeOverrides` → `--color-primary|secondary|accent`):
  | Index | theme key | Source |
  |------:|-----------|--------|
  | 0 | `primary` | `dna.data.branding.colors[0]` |
  | 1 | `secondary` | `dna.data.branding.colors[1]` |
  | 2 | `accent` | `dna.data.branding.colors[2]` |
  - Missing slots → catalog / Roya fallbacks in TemplateRenderService
  - Precedence: DNA colors fill slots; explicit non-empty `proposal.themeOverrides` key wins; surface/text stay catalog unless overridden
- Deps: TemplateRenderService, PdfRenderService, ProposalsRepository, ProjectsRepository, SettingsDataService
- Side effects: CPU, browser
- Rules: no AI; missing logos → empty string (templates `{{#if}}`); never inject product “Safqa” fallback; failed sections omitted from deck (Ready with gaps); if none ready → fail without export

### SVC-PIPE-S3-06 · ExportService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runExport(job)` — promote assemble staging into `renderedByLang[lang]`; upload standalone **financial.html** (builder from proposal/project services+totals); upsert `technical*Url*` + `financial*Url*` for that lang; set `type: 'creative'`; status `ready` or `partially_failed`
- Deps: S3Service, ProposalsRepository, ProjectsRepository, `financial-html.builder`
- Side effects: file (S3)
- Rules: retryable independently; do not re-run assemble on export retry unless artifacts missing; merge URL maps per-lang (do not wipe other languages); financial upload required for creative list/send parity

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
