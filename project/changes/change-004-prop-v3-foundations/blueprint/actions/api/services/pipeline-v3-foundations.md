# Services — Safqa API · Pipeline v3 Foundations

> Phase 0 only. Layout under `roya-sales-ai-api-v2/src/pipeline-v3/` (or equivalent) + infrastructure queue/pdf modules.
> **Do not** modify `creativePipelineOrchestrator` or Mongo `JobsService` poller behavior.

## Delta

- **Create** all SVC-PIPEV3-* below
- Legacy SVC-AIJOBS-* remain `done` and untouched

---

### SVC-PIPEV3-01 · PipelineQueueModule / BullMQ [infrastructure, internal, PipelineV3]
- Status: planned
- Methods:
  - `enqueue(queueName, payload): Job` — enqueue work; HTTP callers of later packs return 202 after this
  - `registerWorkers()` — OnModuleInit workers for the five queues
  - `processHealthJob(job): void` — no-op/idempotent smoke job for AC
  - `isStepAlreadyDone(proposalId, step): boolean` — stub reading Mongo truth later; Phase 0 may no-op return false
- Deps: Redis URL from `config.redisUrl` (shared with cache; separate BullMQ connection options OK); ioredis/BullMQ
- Side effects: async (Redis)
- Rules:
  - Queues: `pipeline.analyze`, `pipeline.map`, `pipeline.section`, `pipeline.assemble`, `pipeline.export`
  - **Redis holds work; Mongo holds truth** (truth wiring in later packs)
  - Jobs idempotent when truth says step done
  - Per-workspace concurrency target 6–8 (config); never reject — only queue
  - Legacy Mongo `aiJobQueue` poller stays running for v2

### SVC-PIPEV3-02 · ProjectsRepository [domain, internal, Projects]
- Status: planned
- Methods:
  - `create(doc)`, `findById(workspaceId, id)`, `update(workspaceId, id, patch)`, `list(workspaceId, query)`
- Deps: Mongo persistence token pattern
- Side effects: none
- Rules: tenant-scoped; enforce competitors length ≤ 3 at write when validation is applied; financials never AI-written

### SVC-PIPEV3-03 · TemplatesRepository [domain, internal, Templates]
- Status: planned
- Methods:
  - `upsertByKeyVersion(doc)`, `findByKey(key, version?)`, `listActive()`
- Deps: Mongo persistence
- Side effects: none
- Rules: seed shell doc for `pitch-landscape` v1 (metadata + `assets.basePath`); sections may be empty until Phase 1; disk path convention `templates/pitch-landscape/v1/`

### SVC-PIPEV3-04 · PipelineTracesRepository + PipelineTraceService [domain, internal, PipelineTraces]
- Status: planned
- Methods:
  - `traceAiCall(params): Trace` — create in-progress AI trace (seq++)
  - `completeAiCall(traceId, result): Trace` — attach output, usage, cost, status
  - `traceValidation(params): Trace`
  - `traceAction(params): Trace`
  - `getById(workspaceId, id): Trace`
  - `getWorkspaceTraces(workspaceId, filters, pagination)`
  - `getRunTrace(runId)` / `getProposalTraces(proposalId)` — implement for later packs; OK if used only internally in Phase 0
  - `getProposalSummary` / `getCostSummary` — **deferred** stubs or omit until part 7
- Deps: PipelineTracesRepository, `computeCost` (SVC-PIPEV3-04b)
- Side effects: none
- Rules: full parsed JSON never truncated; strip `error.stack` on prod API responses; workspace isolation on reads

### SVC-PIPEV3-04b · cost.util [infrastructure, internal, PipelineTraces]
- Status: planned
- Methods:
  - `computeCost(model, usage): { inputCost, outputCost, cacheCost?, totalCost, currency }`
- Deps: MODEL_PRICING table (Anthropic rates; updateable)
- Side effects: none

### SVC-PIPEV3-05 · SchemaRegistry (AJV) [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `compile(schemaId): ValidateFn`
  - `validate(schemaId, data): { ok, errors }`
- Deps: `ajv` / `ajv-formats` (existing)
- Side effects: none
- Rules: ship versioned JSON Schema files:
  - `schemas/dna.v2.schema.json` — Project DNA after-state (doc §6.1); required/optional per plan; depth/minLength gates where specified
  - `schemas/map.v1.schema.json` — section map (§6.2)
  - `schemas/slots/*.schema.json` — slot library with **min/max** (§5.5); `$ref` / `x-slotType`
  - Load at boot without runtime errors; mirror style of `creative-pipeline/validate/ajv.ts`

### SVC-PIPEV3-06 · PromptPackLoader + ModelResolver [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `loadPrompt(relativePath): string` — read markdown prompt file
  - `resolveModel(requestType, workspaceSettings): string` — model id by request type
- Deps: workspace settings (API key path unchanged); filesystem
- Side effects: none
- Rules:
  - Prompt tree (skeleton files with Role/Mission/Grounding/Output-contract headings):
    ```text
    src/pipeline-v3/prompts/
      dna.core.v1.md
      research.market.v1.md
      research.competitor.v1.md
      research.audience.v1.md
      map.plan.v1.md
      section._example.v1.md
      shared/voice.ar.v1.md
      shared/voice.en.v1.md
      shared/anti-hallucination.v1.md
      shared/depth-contracts.v1.md
    ```
  - Placeholders OK; full prompt copy in Phase 2–3
  - Request types at minimum: `dna.core`, `research.*`, `map`, `section`, `section.research`, `repair` → map to workspace model list / defaults (stronger model for research/exec when configured)

### SVC-PIPEV3-07 · PdfRenderService [infrastructure, external, PDF]
- Status: planned
- Methods:
  - `renderHtmlToPdf(html, options?): Buffer` — Puppeteer; `preferCSSPageSize`, `printBackground`, wait for fonts
  - `smokeRender(): Buffer` — render bundled minimal AR/EN fixture
- Deps: puppeteer or `@sparticuz/chromium` + compatible browser; Arabic fonts in image
- Side effects: file/process (browser)
- Rules:
  - Singleton browser + semaphore preferred (document for later hardening)
  - Update `Dockerfile.build` for Chromium + Arabic fonts (Cairo/Tajawal or Noto Naskh)
  - No production proposal PDF generation yet — smoke path only

---

## Nest wiring

- New Nest module(s) imported from `AppModule` (e.g. `PipelineV3Module` exporting queue, schemas, pdf, traces)
- Persistence: register three repositories in `PersistenceModule` + tokens
- Optional internal smoke: unit/integration test or admin-only ping — not required if AC verified manually
