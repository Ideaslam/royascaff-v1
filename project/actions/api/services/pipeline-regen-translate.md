# Services — Safqa API · Regen / Translate / Sibling (Phase 4)

> Reuse: Map/Section/Assemble/Export orchestrators, PipelineQueueService, feature flag, traces.
> Code: `roya-sales-ai-api-v2/src/pipeline-v3/regen/*`, `translate/*`.

### SVC-PIPE-RT-01 · ProposalRegenerateService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `regenerate(workspaceId, proposalId, { useLatestDna?: boolean })` — require flag; archive revision; new runId; clear sections/sectionMap; strip **only** regenerated language from `renderedByLang` + tech/fin URL maps; enqueue map
  - `rerender(workspaceId, proposalId, { lang? })` — require ready content for language; enqueue assemble
- Deps: ProposalsRepository, ProjectsRepository, Queue, flag
- Side effects: async
- Rules: never block on Claude; revisions capped at 5; other language dual docs remain openable from list

### SVC-PIPE-RT-02 · RevisionArchive [domain, internal, PipelineV3]
- Status: done
- Methods: `archiveRevision(proposal, reason): revisions[]`
- Deps: none (pure + write via caller)
- Side effects: none
- Rules: snapshot sectionMap/sections/renderedByLang/URL maps/runId/language

### SVC-PIPE-RT-03 · TranslateOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `startTranslate(workspaceId, proposalId, targetLang)` — archive; enqueue per ready source section (`step: translate`); do not clear source-lang URL maps
  - `runTranslateSection(job)` — AI translate → validate → `contentByLang[target]`; fan-in → assemble→export (dual docs for target lang)
- Deps: Claude (`requestType: translate` → fast), section schema, traces, Queue
- Side effects: async, external API
- Rules: glossary — brand/client/legal/service names stay; skip missing source sections; source language dual docs retained

### SVC-PIPE-RT-04 · Sibling create (ProjectsDataService) [domain, internal, Projects]
- Status: done
- Methods: `createProposalFromProject(..., { templateKey, language, themeOverrides?, fromStep?, sourceProposalId? })` — active template required; pin `dnaVersion`; map-only when DNA present / sibling; proposal `type: 'creative'`
- Deps: TemplatesRepository, Queue, flag
- Side effects: async
- Rules: never overwrite source proposal

### SVC-PIPE-RT-05 · Translate prompt pack [domain, internal, PipelineV3]
- Status: done
- Methods: N/A — `section.translate.v1.md`
- Deps: loadPipelinePrompt
- Side effects: none
- Rules: Role/Mission/Grounding/Output; preserve schema shape

### SVC-PIPE-RT-06 · Formal template bootstrap [domain, Templates]
- Status: done
- Methods: `buildPitchLandscapeFormalTemplateDoc` + bootstrap upsert
- Deps: TemplatesRepository
- Side effects: Mongo seed
- Rules: shares `templates/pitch-landscape/v1` disk assets; distinct formal theme tokens
