# Services — Safqa API · Pipeline v3 Foundations

> Layout: `roya-sales-ai-api-v2/src/pipeline-v3/`. Additive to v2; Mongo `JobsService` poller and creative orchestrator remain for legacy.

### SVC-PIPEV3-01 · PipelineQueueService / BullMQ [infrastructure, internal, PipelineV3]
- Status: done
- Methods:
  - `enqueue(queueName, payload): Job`
  - workers on OnModuleInit for five queues
  - health/no-op job; `isStepAlreadyDone` reads Mongo (`projects.dna` / `generation.steps` / `sectionMap`); dispatches analyze/map orchestrators
- Deps: Redis (`config.redisUrl`), bullmq
- Side effects: async (Redis)
- Rules: queues `pipeline.analyze|map|section|assemble|export`; Redis = work, Mongo = truth; fail-soft if Redis down

### SVC-PIPEV3-02 · ProjectsRepository [domain, internal, Projects]
- Status: done
- Methods: `create`, `getById`, `updateById`, `listPage`, `setById`
- Deps: Mongo persistence token `PROJECTS_REPOSITORY`
- Side effects: none
- Rules: tenant-scoped; competitors max 3 on create

### SVC-PIPEV3-03 · TemplatesRepository [domain, internal, Templates]
- Status: done
- Methods: `upsertByKeyVersion`, `findByKey`, `listActive`
- Deps: `TEMPLATES_REPOSITORY`
- Side effects: none
- Rules: bootstraps `pitch-landscape` v1 shell; disk `templates/pitch-landscape/v1/`

### SVC-PIPEV3-04 · PipelineTraceService [domain, internal, PipelineTraces]
- Status: done
- Methods: `traceAiCall`, `completeAiCall`, `traceValidation`, `traceAction`, `getById`, `getWorkspaceTraces`, `getRunTrace`, `getProposalSummary`, `getCostSummary` (aggregates also documented as SVC-TRACES-01..02)
- Deps: `PIPELINE_TRACES_REPOSITORY`, `computeCost`
- Side effects: none
- Rules: full JSON I/O; strip error.stack in production responses

### SVC-PIPEV3-04b · cost.util [infrastructure, internal, PipelineTraces]
- Status: done
- Methods: `computeCost(model, usage)`
- Deps: MODEL_PRICING table
- Side effects: none
- Rules: include rates for seeded models — Opus 5 ($5/$25), Sonnet 5 ($3/$15), Haiku 4.5 ($1/$5); no Fable; unknown models fall back to Sonnet 5 rates

### SVC-PIPEV3-05 · SchemaRegistry (AJV) [domain, internal, PipelineV3]
- Status: done
- Methods: `compile`, `validate`, `assertSchemasLoadable`
- Deps: ajv, `pipeline-v3/schemas/*`
- Side effects: none
- Rules: `dna.v2`, `map.v1`, slot library with min/max

### SVC-PIPEV3-06 · PromptPackLoader + ModelResolver [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `loadPipelinePrompt` (unchanged)
  - `resolveModel(requestType): Promise<string>` — async; loads `pipelineModelRouting` via cached config reader
- Deps: filesystem prompt pack; **config `pipelineModelRouting`** (not workspace model fields)
- Side effects: none (read-only config)
- Rules:
  - Prefer `byRequestType[requestType]` → else `defaultModel` (medium) → else hardcoded defaults when config missing/unloadable
  - Hardcoded fallbacks mirror seed: research* / section.research → Opus 5; dna/map/section/vision → Sonnet 5; translate/repair → Haiku 4.5; unknown → Sonnet 5
  - Do **not** use workspace `model` / `strongModel` / `fastModel` for v3 routing
  - Workspace settings still supply Claude API key only
  - Do **not** use Claude Fable models
  - Skeleton prompts under `src/pipeline-v3/prompts/`

### SVC-PIPEV3-07 · PdfRenderService [infrastructure, external, PDF]
- Status: done
- Methods: `renderHtmlToPdf(html, options?)`, `smokeRender`, `measurePageOverflows`
- Deps: puppeteer-core + Chromium (`PUPPETEER_EXECUTABLE_PATH`)
- Side effects: browser process
- Rules: Docker image includes Chromium + Arabic fonts; smoke fixture only until assemble pack
- `renderHtmlToPdf` options (REQ-CONTRACT-TEMPLATE, backward compatible — all optional, default `displayHeaderFooter: false` preserves original Pipeline v3 callers): `displayHeaderFooter`, `headerTemplate`, `footerTemplate`, `margin: { top?, bottom?, left?, right? }` — Puppeteer's native repeating header/footer, the only reliable way to get real page numbers in Chromium's print-to-PDF path (CSS `counter(page)` doesn't work). Consumed by `ContractPdfService` (see `contracts.md` SVC-CONTRACTS-02); Pipeline v3 proposal PDFs still render via CSS-driven fixed `.page` slides and don't set these options.
