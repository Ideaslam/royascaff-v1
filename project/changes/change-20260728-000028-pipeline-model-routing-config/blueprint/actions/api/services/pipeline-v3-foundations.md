# Services — Safqa API · Pipeline v3 Foundations (change-20260728-000028 slice)

### SVC-PIPEV3-04b · cost.util [infrastructure, internal, PipelineTraces]
- Status: planned
- Methods: `computeCost(model, usage)`
- Deps: `MODEL_PRICING` table
- Side effects: none
- Rules: include rates for seeded models — Opus 5 ($5/$25), Sonnet 5 ($3/$15), Haiku 4.5 ($1/$5); no Fable; unknown models fall back to Sonnet 5 rates

### SVC-PIPEV3-06 · PromptPackLoader + ModelResolver [domain, internal, PipelineV3]
- Status: planned
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

## Delta

- `resolveModel` signature drops workspace model overrides; becomes config-backed + async
- `claude-traced` awaits `resolveModel(requestType)` only
- `MODEL_PRICING` includes Opus 5 / Sonnet 5 / Haiku 4.5
