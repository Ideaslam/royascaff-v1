# Services — Pipeline Sections Engine (change-20260727-000018 after-state)

> Touches: `section/dna-slice.ts` only (orchestrator already uses `isResearchSectionKey` / full module path).

## Delta

- **Modify** SVC-PIPE-S3-02 DnaSliceBuilder — expand research section set + moduleKey resolution

---

### SVC-PIPE-S3-02 · DnaSliceBuilder [domain, internal, PipelineV3]
- Status: planned
- Methods: `buildDnaSlice(sectionKey, mapEntry, dna, competitorIndex?)`, `isResearchSectionKey(key)`
- Deps: none (pure)
- Side effects: none
- Rules — `RESEARCH_SECTION_KEYS` after-state:

| Section key | Default module UI key |
|-------------|------------------------|
| market_analysis | market |
| competitor_analysis | competitor |
| audience_insights | audience |
| market_trends | trends |
| benchmarks | benchmarks |
| case_studies | case-studies |
| social_audit | social-analysis |
| action_plan | action-plan |

- Prefer `mapEntry.researchModuleKey` when present
- Research pages receive **full** `research.modules[moduleKey]`; non-research pages keep headlines-only
- Competitor focus logic unchanged (perCompetitor / competitors index)
