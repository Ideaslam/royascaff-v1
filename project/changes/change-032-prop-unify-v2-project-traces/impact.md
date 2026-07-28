# Impact Analysis — change-032-prop-unify-v2-project-traces

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Data model | partial | `proposals.generation` (v3); `aiJobs.creativePipeline` (v2) | No `pipelineVersion:"2"` generation contract; list shell OK (031) |
| Service(s) | partial | `prepareCreativeSectionBatch`, `processCreativePipelineAfterBatch`, `ProjectsDataService.create`, `PipelineTraceService` | v2 never creates project/DNA; state on aiJobs; no traces |
| Endpoint(s) | partial | `POST /ai-jobs` creative **403** when v3 on; no unified v2 create | Need new create route allowed with flag on |
| Poller | partial | `runPollBatchJobs` → aiJobs pending batches | Must also poll v2 proposals |
| Page(s) | partial | `/creative`, `CreativeProposalGenerationService`, archive job poll | Soft-retired; jobId-centric |
| Scripts | partial | `backfill-legacy-proposals-to-projects.js`, `backfill-project-dna-versions.js` | No `pipelineVersion:"2"` / DNA pin for orphans |

Feature state: **partial**

## Affected Modules
- **Creative Pipeline v2** — keep section→HTML; re-home state to proposal + traces
- **Projects** — create from creative input
- **Proposals** — `pipelineVersion:"2"` + `generation.creativePipeline`
- **Jobs poller** — dual-mode
- **Pipeline Traces** — wrap v2 AI
- **Web Creative / archive regenerate** — new API, no aiJobs create

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — v2 `generation` shape
- [ ] `blueprint/actions/api/services/creative-v2-unify.md`
- [ ] `blueprint/actions/api/endpoints/creative-v2-unify.md`
- [ ] `blueprint/actions/web/pages/creative.md`
- [ ] `blueprint/plan/scripts-backfill.md` (or notes in data-model)
- [ ] `blueprint/_index.md` + pack `status.md`

## Risk
- **Complexity:** H (poller dual-mode + FE progress + S3 key root)
- **Cross-module:** Y
- **Migration:** Y (one-time backfill script; no forced in-flight migrate)

## Recommendation
- **Create**: BE `createCreativeV2Proposal` (project+DNA+proposal+batch submit); new HTTP route
- **Modify**: `processCreativePipelineAfterBatch` + poller → proposal-centric (+ keep aiJobs branch)
- **Modify**: inject `PipelineTraceService` at repair + batch boundaries
- **Modify**: FE creative generate + archive pending poll
- **Create/extend**: backfill script for shell fields
- **Keep**: chat aiJobs; soft-block creative `/ai-jobs`; no BullMQ for v2

## Code files likely touched

| Area | Files |
|------|--------|
| BE create | new service + projects/proposals controller |
| BE engine | `processCreativePipelineAfterBatch.ts`, maybe prepare helpers (proposalId for S3) |
| BE poller | `poll-batch-jobs.ts`, `jobs.service.ts`, proposals repo list pending v2 |
| BE traces | inject `PipelineTraceService` |
| FE | `creative-proposal-generation.service.ts`, `creative.component.ts`, archive poll bits |
| Scripts | extend or add backfill under `roya-sales-ai-api-v2/scripts/` |

## Dependencies
- depends-on: **change-031** — pack-status: **merged**
