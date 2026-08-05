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
  - **DNA `services.financial` is code-owned:** `buildDnaSkeleton` / `reconcileDnaPassthrough` set totals via `computeServicesFinancial` (excludes ratio); AI merge cannot keep invented money totals

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
- **Presentation gate:** `const presentation = isPresentationTemplateKey(templateKey)`; landing: `"renderMode": "landing", listSplit.enabled: false`
- **List-split payload (presentation only) — catalog-attribute-driven:**
  ```
  splittableDefs = catalogSections.filter(s => s.repeatable === true)
                                  .filter(s => !ENTITY_DRIVEN_REPEAT_KEY_SET.has(s.key))
  splittableKeys = splittableDefs.map(s => s.key)        // e.g. ["timeline","action_plan","services","social_audit","financial_part"]
  catalogCapacity = deriveArrayCapacityHints(splittableDefs) // derived from contentSchema, not a static map
  ```
  User payload sent to map AI:
  ```json
  {
    "renderMode": "presentation",
    "listSplit": {
      "enabled": true,
      "keys": ["timeline", "action_plan", "services", "social_audit", "financial_part"],
      "softPreferMaxInstances": 3,
      "catalogCapacity": {
        "timeline.phases.maxItems": 5,
        "action_plan.phases.maxItems": 6,
        "services.items.maxItems": 6,
        "social_audit.channels.maxItems": 6
      },
      "financialSplit": {
        "singleKey": "financial",
        "partKey": "financial_part",
        "fullKey": "financial_full",
        "rule": "one financial OR financial_part*(N-1)+financial_full; never multi financial"
      }
    }
  }
  ```
  `listSplit.keys` / `catalogCapacity` are a **function of the active template's catalog**, not a static constant — future repeatable keys appear automatically with zero further code change.
- **Prompt rules (map.plan.v1.md) — generalized wording:** "Any key in `abstractCatalog` with `repeatable: true` may be emitted as multiple consecutive instances of the same key (own `pages.max` ceiling) when a single slide would overflow. Use `listSplit.keys`/`listSplit.catalogCapacity` as the current template's live list — do not assume specific key names. Each instance's brief must state which subset of the data it covers; titles may use `(1/2)` style." Financial pricing rule (single `financial` vs `financial_part`×(N−1)+`financial_full`) stays as its own paragraph, unchanged.
- **Enforce `pages.max` (catalog-attribute-driven):** `clampListSplitInstances` + `validateMap` per-key count check use `getSectionDef(key, templateKey)` → `def.repeatable` / `def.pages.max` instead of static `PDF_OVERFLOW_CLAMP_KEY_SET`; `financial_full` (`repeatable: false, pages.max: 1`) enforced identically to before.
- **Structural validation extras:** `financial_part` without `financial_full` → error; `financial` together with part/full → error; unchanged from pack 4.
- **Research-coverage gate:** `assertResearchCoverage` unchanged — ≥1 hit per selected research option; doubled `social_audit` satisfies `social-analysis` without gate change.

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
- Deps: `dna.core.v1.md`, `research.*.v1.md` (all 8), `map.plan.v1.md` (visual dividers + max 32 + `availableImages`; list-split rules + financial part/full contract; generalized wording: any `repeatable: true` key, not named keys), shared voice/anti-hallucination/depth
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
