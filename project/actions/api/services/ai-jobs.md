# Services — Safqa API · AI Jobs

### SVC-AIJOBS-01 · AiJobsService [domain, internal, AIJobs]
- Status: done
- Methods: create job; stream path; get job; get HTML result; enqueue
- Deps: AiJobsRepository, QueueGateway, Claude*, CreativePromptService, creative pipeline
- Side effects: async job, external API, file

### SVC-AIJOBS-02 · CreativePipelineOrchestrator [domain, internal, AIJobs]
- Status: done
- Methods: advance creative pipeline phases (sections batch → final HTML → S3)
- Deps: Claude batches, S3, proposals, creative-pipeline prompts
- Side effects: async, external API, file

### SVC-AIJOBS-03 · JobsService [domain, internal, AIJobs]
- Status: done
- Methods: poll aiJobQueue (~5s) and Claude batches (~60s); drive processing
- Deps: QueueGateway, orchestrator
- Side effects: async
