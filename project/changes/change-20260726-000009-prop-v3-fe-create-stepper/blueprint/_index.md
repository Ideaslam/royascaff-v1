# Blueprint Index — change-20260726-000009-prop-v3-fe-create-stepper

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: `docs/refactor-proposal-generator.md` §14, §15 Phase 5.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Projects, Proposals, Templates, Creative (FE) | done | 1/1 | feature after-state |
| page | `actions/web/pages/projects.md` | PG-PROJECTS-01..03 | done | 3/3 | list / create+gallery / workspace |
| page | `actions/web/pages/proposals.md` | PG-PROP-V3-01..02 | done | 2/2 | stepper + v3 view/actions |
| page | `actions/web/pages/creative.md` | PG-CREATIVE dual-path | done | 1/1 | keep v2 when flag off |
| endpoint | `actions/api/endpoints/templates.md` | EP-TPL-02 | done | 1/1 | list active templates |
| service | `actions/api/services/templates.md` | SVC-TPL-07 | done | 1/1 | listActive facade |

**Pack Done/Total**: 9/9

## Deferred

- AI Requests / cost dashboard — change-20260726-000010
- Cutover / retire v2 — change-20260726-000011
- Structured section editor
- MainLayout authGuard — REQ-R change-20260726-000001
