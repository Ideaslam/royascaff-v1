# Blueprint Index — change-20260726-000007-prop-v3-sections-engine

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: `docs/refactor-proposal-generator.md` §6.3–6.5, §7, §9.7–9.8, §15 Phase 3.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Creative Steps 3–5, Proposals, Settings | done | 1/1 | feature after-state |
| plan | `plan/data-model.md` | sections, renderedByLang, generation, flag | done | 1/1 | additive fields |
| service | `actions/api/services/pipeline-sections-engine.md` | SVC-PIPE-S3-01..09 | done | 9/9 | Mongo fan-in (not FlowProducer) |
| service | `actions/api/services/settings-flag.md` | SVC-SETTINGS-FLAG-01 | done | 1/1 | pipelineV3Enabled |
| service | `actions/api/services/projects-gate.md` | SVC-PROJECTS-GATE-01 | done | 1/1 | enqueue gate |
| endpoint | `actions/api/endpoints/proposals-pipeline.md` | EP-PROP-PIPE-01,03,04 | done | 3/3 | status, retry, rendered |

**Pack Done/Total**: 16/16

## Deferred

- Regenerate/translate/template-switch — change-20260726-000008
- FE stepper / PDF download / AI Requests UI — change-20260726-000009/010
- Full vision 1b, Bull Board, admin template editor
- FlowProducer optional if Mongo fan-in chosen (document in implement)
