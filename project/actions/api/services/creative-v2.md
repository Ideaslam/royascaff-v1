# Services — Safqa API · Creative v2 (unified)

> REQ-PROP-UNIFY part 2 — v2 engine on shared project/DNA/proposal + `pipelineTraces`.

### SVC-CREATIVE-V2-01 · CreativeV2CreateService [domain, Projects/Proposals]
- Status: done
- Methods: `createFromCreativeInput(workspaceId, userId, input)` → project + DNA v1 + proposal `pipelineVersion: "2"` + section batch submit
- Deps: ProjectsDataService, ProposalsRepository, CreativePromptService, CreativeConfigService, SettingsService, PipelineTraceService, `prepareCreativeSectionBatch`
- Side effects: Claude batch, Mongo writes, `pipelineTraces` (AI call + actions)
- Rules: allowed with `pipelineV3Enabled` true; **no** aiJobs write; `jobId: null`

### SVC-CREATIVE-V2-02 · Process after batch (proposal-centric) [domain, Creative]
- Status: done
- Methods: `processCreativePipelineAfterBatch` reads/writes `generation.creativePipeline` on proposal; completes AI traces + validations; upload URL maps
- Deps: Claude batches, S3, ProposalsService/Repo, PipelineTraceService, creative-pipeline validate/repair
- Side effects: async batch complete, S3, traces

### SVC-CREATIVE-V2-03 · Dual poller [infrastructure, Jobs]
- Status: done
- Methods: `runPollBatchJobs` — legacy aiJobs pending + `listPendingCreativeV2BatchJobs` (proposal-backed)
- Deps: AiJobsService, ProposalsRepository, PipelineTraceService, creative-v2-poll-bridge
- Side effects: async; chat queue unchanged

### SVC-CREATIVE-V2-04 · Backfill v2 proposal shell [ops]
- Status: done
- Methods: `scripts/backfill-v2-proposal-shell.js` (dry-run / `--apply` / `--workspaceId`)
- Side effects: Mongo updates — `projectId`, DNA pin, `pipelineVersion: "2"` for legacy non-v3
