# Services — Safqa API · Regen / Translate / Sibling (Phase 4)

> Reuse: Map/Section/Assemble/Export orchestrators, PipelineQueueService, feature flag, traces.

## Delta

- **Create** SVC-PIPE-RT-01..05
- **Modify** ProjectsDataService.createProposalFromProject — sibling/map-only + dnaVersion
- **Optional** formal template bootstrap — partial OK

---

### SVC-PIPE-RT-01 · ProposalRegenerateService [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `regenerate(workspaceId, proposalId, { useLatestDna?: boolean })` — require flag; archive revision; new runId; clear sections/rendered/sectionMap (keep templateKey); enqueue map (DNA must exist); status `mapping`
  - `rerender(workspaceId, proposalId)` — require ready sections for generation.language; enqueue assemble only
- Deps: ProposalsRepository, ProjectsRepository, Queue, flag
- Side effects: async
- Rules: HTTP 202; never block on Claude; revisions capped at 5

### SVC-PIPE-RT-02 · RevisionArchive [domain, internal, PipelineV3]
- Status: planned
- Methods: `archive(proposal, reason): revisions[]`
- Deps: none (pure + write via caller)
- Side effects: none
- Rules: snapshot sectionMap/sections/renderedByLang/runId/language

### SVC-PIPE-RT-03 · TranslateOrchestrator [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `startTranslate(workspaceId, proposalId, targetLang)` — set generation language/status `generating_sections` (translate mode); enqueue per ready source section a translate unit job
  - `runTranslateSection(job)` — source contentByLang[src] → AI translate → validate schema → write contentByLang[target]; fan-in → assemble→export for target lang
- Deps: Claude (fast/repair), section schema, traces, Assemble/Export via fan-in
- Side effects: async, external API
- Rules: glossary — do not translate brand/client/legal names / service product names when marked; money/dates left for code helpers; skip failed source sections

### SVC-PIPE-RT-04 · SiblingProposalService [domain, internal, Projects]
- Status: planned
- Methods:
  - extend `createProposalFromProject(..., { templateKey, language, themeOverrides?, fromStep?: "map" })` — if DNA present always map-only (already); ensure new proposal id; pin dnaVersion; never overwrite sibling
- Deps: existing create path
- Side effects: async
- Rules: templateKey must exist/active (or known disk catalog); flag required

### SVC-PIPE-RT-05 · Translate prompt pack [domain, internal, PipelineV3]
- Status: planned
- Methods: N/A — `section.translate.v1.md`
- Deps: loadPipelinePrompt
- Side effects: none
- Rules: Role/Mission/Grounding/Output; preserve schema shape; fast model via ModelResolver `repair` or dedicated if added

### SVC-PIPE-RT-06 · Formal template (optional) [domain, Templates]
- Status: planned
- Methods: bootstrap `pitch-landscape-formal` v1 — may clone pitch-landscape with formal theme tokens
- Deps: TemplateAssetResolver, TemplatesRepository
- Side effects: disk + Mongo seed
- Rules: if not shipped → status `deferred`/`partial`; sibling API still works for `pitch-landscape`
