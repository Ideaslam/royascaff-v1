# Services — Safqa API · Pipeline Analyze + Map

> Under `src/pipeline-v3/analyze/`, `map/`, workers wired into `PipelineQueueService`.
> Reuse: `callClaude` / SettingsService, `resolveModel`, `PipelineTraceService`, `validate('dna.v2'|'map.v1')`, pitch-landscape catalog.

### SVC-PIPE-AM-01 · AnalyzeOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runAnalyze(job)` — job may include `dnaVersionId`; load version inputs when set; passthrough DNA skeleton; parallel 1a + 1d×selected; AJV+depth gate; repair ≤2; write **DNA version** (+ mirror `projects.dna`) or mark version `failed`; refresh proposal `dnaSnapshot` when `proposalId`
- Deps: ProjectsRepository, ClientsRepository, Claude, ModelResolver, PipelineTraceService, SchemaRegistry, S3
- Side effects: async, external API, file read
- Rules: research full 8 options; never invent URLs/money; fail-closed; trace AI + validation

### SVC-PIPE-AM-02 · ResearchModuleRunner [domain, internal, PipelineV3]
- Status: done
- Methods: `runModule(key, context)` for market|competitor|audience|trends|benchmarks|case-studies|social-analysis|action-plan
- Deps: Claude, prompts `research.{key}.v1.md`, ModelResolver request types, traces
- Side effects: external API
- Rules: competitor per-URL findings; `recommendedSectionKeys` + `suggestedMapBrief`; depth contract; unknown key throws

### SVC-PIPE-AM-03 · MapOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runMap(job)` — DNA + abstract catalog; AI map; validate map.v1 + researchCoverageGate; inject/repair; **ensure `about_workspace`** before footer; **strip visual keys** when usable images insufficient; write `proposal.sectionMap`; status `mapped`
- Deps: ProposalsRepository, ProjectsRepository, catalog, Claude, traces
- Side effects: async, external API
- Rules: cover first, footer last, financial + **about_workspace** present (inject if AI omits); competitor → N instances; max **32** sections; pass `availableImages` (id/purpose) into map AI; omit/strip `banner` / `full_bleed_banner` / `images_gallery` when usable image count &lt; 1 (banner/full-bleed) or &lt; 2 (gallery); fail closed on template gap

### SVC-PIPE-AM-04 · ResearchCoverageGate [domain, internal, PipelineV3]
- Status: done
- Methods: `assertResearchCoverage`, `deriveRequiredSectionKeys`
- Deps: none (pure)
- Side effects: none
- Rules:
  - market→`market_analysis`
  - competitor→`competitor_analysis`×N
  - audience→`audience_insights`
  - trends→`market_trends`
  - benchmarks→`benchmarks`
  - case-studies→`case_studies`
  - social-analysis→`social_audit`
  - action-plan→`action_plan`

### SVC-PIPE-AM-05 · Prompt packs (files) [domain, internal, PipelineV3]
- Status: done
- Methods: N/A — file content via `loadPipelinePrompt`
- Deps: `dna.core.v1.md`, `research.*.v1.md` (all 8), `map.plan.v1.md` (visual dividers + max 32 + `availableImages`), shared voice/anti-hallucination/depth
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
