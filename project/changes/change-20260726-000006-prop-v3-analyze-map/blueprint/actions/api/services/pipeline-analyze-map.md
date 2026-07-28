# Services — Safqa API · Pipeline Analyze + Map (Phase 2)

> Under `src/pipeline-v3/analyze/`, `map/`, workers wired into `PipelineQueueService`.
> Reuse: `callClaude` / SettingsService, `resolveModel`, `PipelineTraceService`, `validate('dna.v2'|'map.v1')`, pitch-landscape catalog.

## Delta

- **Create** SVC-PIPE-AM-01..07 below
- **Modify** `PipelineQueueService` to dispatch analyze/map; implement `isStepAlreadyDone` from Mongo truth
- **Replace** prompt placeholders with real packs

---

### SVC-PIPE-AM-01 · AnalyzeOrchestrator [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `runAnalyze(job: { workspaceId, projectId, proposalId?, runId })` — load project+client; passthrough DNA skeleton; parallel 1a + 1d×selected; optional 1b vision; merge; AJV+depth gate; repair ≤2; write `projects.dna` or fail
- Deps: ProjectsRepository, ClientsRepository, Claude, SettingsService, ModelResolver, PipelineTraceService, SchemaRegistry, prompt loader, S3 (RFP text fetch)
- Side effects: async, external API, file read
- Rules:
  - Research launch subset: only run 1d for `market`, `competitor`, `audience` when selected
  - Never invent competitor URLs / social URLs / money
  - On failure: no stub DNA; set proposal.generation / project error; status `failed`
  - Trace every AI call (and validation)

### SVC-PIPE-AM-02 · ResearchModuleRunner [domain, internal, PipelineV3]
- Status: planned
- Methods: `runModule(key, context): ResearchModule` for market|competitor|audience
- Deps: Claude, prompts `research.{key}.v1.md`, traces
- Side effects: external API
- Rules: competitor returns per-URL findings array; each module includes `recommendedSectionKeys` + `suggestedMapBrief`; depth contract enforced

### SVC-PIPE-AM-03 · MapOrchestrator [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `runMap(job: { workspaceId, projectId, proposalId, runId })` — require DNA; load template abstract sections + rules; AI map call; validate map.v1 + **researchCoverageGate**; repair ≤1 injecting missing primary sections; write `proposal.sectionMap`; set generation map done / status `mapped`
- Deps: ProposalsRepository, ProjectsRepository, TemplatesRepository/catalog, Claude, traces, SchemaRegistry
- Side effects: async, external API
- Rules:
  - cover first, footer last, financial present
  - every selected research option → ≥1 primary/also-good section from §5.6.1
  - competitor → N `competitor_analysis` instances matching competitor count
  - fail closed if template cannot satisfy coverage

### SVC-PIPE-AM-04 · ResearchCoverageGate [domain, internal, PipelineV3]
- Status: planned
- Methods: `assertCoverage(dna, sectionMap, templateKeys): { ok, missing[] }`
- Deps: none (pure)
- Side effects: none
- Rules: launch map for market→`market_analysis`, competitor→`competitor_analysis`×N, audience→`audience_insights`

### SVC-PIPE-AM-05 · Prompt packs (files) [domain, internal, PipelineV3]
- Status: planned
- Methods: N/A — file content
- Deps: `loadPipelinePrompt`
- Side effects: none
- Rules: fill `dna.core.v1.md`, `research.market|competitor|audience.v1.md`, `map.plan.v1.md`, shared voice/anti-hallucination/depth with Role/Mission/Grounding/Output-contract blocks suitable for production use

### SVC-PIPE-AM-06 · Queue processors + ProposalPipelineService [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - Wire `pipeline.analyze` → AnalyzeOrchestrator; on success enqueue `pipeline.map` if proposalId present
  - Wire `pipeline.map` → MapOrchestrator
  - `isStepAlreadyDone(proposalId|projectId, step)` reads Mongo
  - `createProposalFromProject(...)` — create proposal doc with generation queued; enqueue analyze (or map-only if DNA already done and regenerate not requested)
  - `getGenerationStatus(proposalId)`
- Deps: PipelineQueueService, ProposalsRepository, ProjectsRepository, orchestrators
- Side effects: async
- Rules: HTTP returns 201/202 quickly; never block on Claude

### SVC-PIPE-AM-07 · VisionAnalyze (optional) [domain, internal, PipelineV3]
- Status: planned
- Methods: `analyzeImage(url): visionMeta` — 1b
- Deps: Claude vision-capable model via ModelResolver `vision`
- Side effects: external API
- Rules: may ship as **partial** (skip images with note) if blocked; preferred done
