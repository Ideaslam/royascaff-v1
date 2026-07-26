# Blueprint Index — change-004-prop-v3-foundations

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source plan: `docs/refactor-proposal-generator.md` §4, §5.5, §7.1, §7.4, §9.3, Phase 0.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Projects, Templates, Pipeline Traces, PDF, Creative/AI extend | done | 1/1 | module/feature slices for Phase 0 |
| plan | `plan/data-model.md` | projects, templates, pipelineTraces | done | 1/1 | new collections (after-state + Delta) |
| service | `actions/api/services/pipeline-v3-foundations.md` | SVC-PIPEV3-01..07 | done | 7/7 | BullMQ, repos, traces, schemas, prompts, PDF, model resolver |
| service | `actions/api/services/permissions.md` | SVC-PERMS-SEED-01 | done | 1/1 | seed keys + role grants |
| endpoint | `actions/api/endpoints/pipeline-traces.md` | EP-TRACES-01..02 | done | 2/2 | thin workspace read API to exercise traces |

**Pack Done/Total**: 12/12

## Deferred (not in this pack)

- Full Projects/Templates HTTP CRUD → later packs
- Trace cost-summary / admin cross-workspace APIs → part 7/8 (FE + later API)
- Handlebars templates / `pitch-landscape` assets → change-005
- Pipeline step workers (analyze/map/sections) → change-006+
- Web pages → change-009 / change-010
- `proposals` shape migration / backfill → change-007+ / change-011
