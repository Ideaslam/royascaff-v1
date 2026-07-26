# Services — Safqa API · Pipeline Analyze + Map

> Under `src/pipeline-v3/analyze/`, `map/`, workers wired into `PipelineQueueService`.
> Reuse: `callClaude` / SettingsService, `resolveModel`, `PipelineTraceService`, `validate('dna.v2'|'map.v1')`, pitch-landscape catalog.

### SVC-PIPE-AM-01 · AnalyzeOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runAnalyze(job)` — passthrough DNA skeleton; parallel 1a + 1d×selected; AJV+depth gate; repair ≤2; write `projects.dna` or fail
- Deps: ProjectsRepository, ClientsRepository, Claude, ModelResolver, PipelineTraceService, SchemaRegistry, S3
- Side effects: async, external API, file read
- Rules: research launch subset only; never invent URLs/money; fail-closed; trace AI + validation

### SVC-PIPE-AM-02 · ResearchModuleRunner [domain, internal, PipelineV3]
- Status: done
- Methods: `runModule(key, context)` for market|competitor|audience
- Deps: Claude, prompts `research.{key}.v1.md`, traces
- Side effects: external API
- Rules: competitor per-URL findings; `recommendedSectionKeys` + `suggestedMapBrief`; depth contract

### SVC-PIPE-AM-03 · MapOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runMap(job)` — DNA + abstract catalog; AI map; validate map.v1 + researchCoverageGate; inject/repair; write `proposal.sectionMap`; status `mapped`
- Deps: ProposalsRepository, ProjectsRepository, catalog, Claude, traces
- Side effects: async, external API
- Rules: cover first, footer last, financial present; competitor → N instances; fail closed on template gap

### SVC-PIPE-AM-04 · ResearchCoverageGate [domain, internal, PipelineV3]
- Status: done
- Methods: `assertResearchCoverage`, `deriveRequiredSectionKeys`
- Deps: none (pure)
- Side effects: none
- Rules: market→`market_analysis`, competitor→`competitor_analysis`×N, audience→`audience_insights`

### SVC-PIPE-AM-05 · Prompt packs (files) [domain, internal, PipelineV3]
- Status: done
- Methods: N/A — file content via `loadPipelinePrompt`
- Deps: `dna.core.v1.md`, `research.*.v1.md`, `map.plan.v1.md`, shared voice/anti-hallucination/depth
- Side effects: none

### SVC-PIPE-AM-06 · Queue processors + ProposalPipelineService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `pipeline.analyze` → AnalyzeOrchestrator → enqueue map when `proposalId`
  - `pipeline.map` → MapOrchestrator
  - `isStepAlreadyDone` from Mongo
  - create-from-project + generation status via ProjectsDataService / proposals status route
- Deps: PipelineQueueService, repos, orchestrators
- Side effects: async
- Rules: HTTP returns quickly; never block on Claude; tenant ALS in workers

### SVC-PIPE-AM-07 · VisionAnalyze (1b) [domain, internal, PipelineV3]
- Status: partial
- Methods: skipped with traced note (`vision.1b.partial`); DNA keeps image URLs
- Deps: — (full vision later)
- Side effects: none
- Rules: partial OK for Phase 2; prefer real vision in a later pack
