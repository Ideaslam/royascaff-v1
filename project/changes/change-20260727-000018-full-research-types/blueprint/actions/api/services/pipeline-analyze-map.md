# Services — Pipeline Analyze + Map (change-20260727-000018 after-state)

> Touches: `ResearchModuleRunner`, `research-coverage.gate`, prompts, `ModelResolver`, map max hint.
> Reuse existing AnalyzeOrchestrator / MapOrchestrator wiring unchanged.

## Delta

- **Complete** SVC-PIPE-AM-02 / AM-04 / AM-05 for all 8 research options
- **Modify** ModelResolver — add dedicated `research.*` request types for the five new keys (strong)
- **Modify** map prompt + orchestrator hint — max sections 28; name new primary keys

---

### SVC-PIPE-AM-02 · ResearchModuleRunner [domain, internal, PipelineV3]
- Status: planned
- Methods: `runModule(key, context)` for **all** UI keys:
  `market` | `competitor` | `audience` | `trends` | `benchmarks` | `case-studies` | `social-analysis` | `action-plan`
- Deps: Claude, `prompts/research.{key}.v1.md`, traces, ModelResolver
- Side effects: external API
- Rules:
  - MODULE_META maps each key → prompt file, requestType, recommendedSectionKeys
  - Store under `research.modules[key]` using **UI key** (same as today)
  - Depth extras per design doc §9.5:
    - trends ≥5 trends with impact + response
    - benchmarks table-ready industry vs target
    - case-studies ≥2 analogous playbooks (no fake client brands)
    - social-analysis one finding per digitalPresence URL + quick wins
    - action-plan phases across duration + first-30-days
  - Unknown key still throws (fail closed)

| UI key | Prompt | requestType | recommendedSectionKeys |
|--------|--------|-------------|------------------------|
| market | research.market.v1.md | research.market | market_analysis |
| competitor | research.competitor.v1.md | research.competitor | competitor_analysis |
| audience | research.audience.v1.md | research.audience | audience_insights |
| trends | research.trends.v1.md | research.trends | market_trends |
| benchmarks | research.benchmarks.v1.md | research.benchmarks | benchmarks |
| case-studies | research.case-studies.v1.md | research.case-studies | case_studies |
| social-analysis | research.social-analysis.v1.md | research.social-analysis | social_audit |
| action-plan | research.action-plan.v1.md | research.action-plan | action_plan |

### SVC-PIPE-AM-04 · ResearchCoverageGate [domain, internal, PipelineV3]
- Status: planned
- Methods: `assertResearchCoverage`, `deriveRequiredSectionKeys` (unchanged signatures)
- Deps: none
- Side effects: none
- Rules — `COVERAGE` after-state:

| Option | primary | alsoGood |
|--------|---------|----------|
| market | market_analysis | opportunities, positioning, swot |
| competitor | competitor_analysis (×N, 1–3) | positioning, swot |
| audience | audience_insights | channel_strategy, opportunities |
| trends | market_trends | opportunities, executive_summary |
| benchmarks | benchmarks | objectives_kpis |
| case-studies | case_studies | testimonial |
| social-analysis | social_audit | channel_strategy |
| action-plan | action_plan | timeline, next_steps, methodology |

- Template must ship primaries so `template-lacks:*` does not fire for the full set on pitch-landscape

### SVC-PIPE-AM-05 · Prompt packs [domain, internal, PipelineV3]
- Status: planned
- Create prompts (mirror audience/market structure: Role / Mission / Grounding / Depth / Output contract):
  - `research.trends.v1.md`
  - `research.benchmarks.v1.md`
  - `research.case-studies.v1.md`
  - `research.social-analysis.v1.md`
  - `research.action-plan.v1.md`
- Modify `map.plan.v1.md`: Max **28** sections; list new research primary keys in grounding

### ModelResolver (shared)
- Status: planned
- Add to `PipelineRequestType` + strong preference:
  `research.trends` | `research.benchmarks` | `research.case-studies` | `research.social-analysis` | `research.action-plan`
- Keep `research.other` for future/fallback

### MapOrchestrator hint
- Status: planned
- Replace `"max 22 sections…"` user/system hint with **max 28**
