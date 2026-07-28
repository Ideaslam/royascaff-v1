# Blueprint Index — change-20260727-000026-dna-versions

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (DNA versions collection + FE list/form/picker).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/data-model.md` | project_dna_versions; project shell; proposal dnaSnapshot | done | 1/1 | new collection + pins |
| plan | `plan/modules.md` | Projects + Pipeline DNA version features | done | 1/1 | feature slices |
| service | `actions/api/services/projects.md` | SVC-PROJECTS-01..04 DNA versions | done | 1/1 | CRUD/generate/proposal pin |
| service | `actions/api/services/pipeline-analyze.md` | Analyze/queue/map/assemble resolve | done | 1/1 | dnaVersionId + snapshot-first |
| endpoint | `actions/api/endpoints/projects.md` | EP-PROJECTS-01,04,10,12..22 | done | 1/1 | DNA version HTTP API |
| page | `actions/web/pages/projects.md` | PG-PROJECTS-02..05; retire edit | partial | 0/1 | list/picker/form; content editor deferred |

**Pack Done/Total**: 5/6
**Pack status**: merged (2026-07-28)

## Out of pack

- DNA diff/compare UI
- Soft-delete / version restore
- New permission keys beyond `projects.view|edit|delete|create`
- Embedding versions on project document
- Guaranteed multi-version history for pre-migration regenerations (lossy backfill accepted)
