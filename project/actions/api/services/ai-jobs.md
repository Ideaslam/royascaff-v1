# Services — Safqa API · AI Jobs

### SVC-AIJOBS-01 · AiJobsService [domain, internal, AIJobs]
- Status: done
- Methods: create job; stream path; get job; get HTML result; enqueue
- Deps: AiJobsRepository, QueueGateway, Claude*, CreativePromptService, creative pipeline
- Side effects: async job, external API, file

### SVC-AIJOBS-02 · CreativePipelineOrchestrator [domain, internal, AIJobs]
- Status: done
- Methods: advance creative pipeline phases (sections batch → final HTML → S3); shared by proposal-backed v2 path
- Deps: Claude batches, S3, proposals, creative-pipeline prompts, PipelineTraceService (unified path)
- Side effects: async, external API, file, traces

### SVC-AIJOBS-03 · JobsService [domain, internal, AIJobs]
- Status: done
- Methods: poll aiJobQueue (~5s) and Claude batches (~60s); **dual** pending sources — legacy aiJobs + proposal-backed v2
- Deps: QueueGateway, orchestrator, ProposalsRepository, PipelineTraceService
- Side effects: async
