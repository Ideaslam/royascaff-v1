# Blueprint Index — change-20260729-113947-banner-gallery-sections

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact. Isolation: do not edit main plan/actions until merge.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/modules.md` | Templates 4–5; Creative 8,10 | done | 1/1 | counts 24/26, maxSections 32, visual keys |
| service | `actions/api/services/templates.md` | SVC-TPL catalogs/disk/fixture/seed | done | 1/1 | local defs + partials + fixture images |
| service | `actions/api/services/pipeline-map.md` | Map prompt + strip guard | done | 1/1 | visuals only when images exist |
| service | `actions/api/services/pipeline-sections.md` | imageRef validation | done | 1/1 | refs ∈ available ids |

**Pack Done/Total**: 4/4

## Out of pack

- FE create/gallery UI
- New image upload / purpose enums
- Adding keys to `SHARED_SECTION_KEYS`
- Splitting `pitch-landscape-formal` onto its own disk
- Other deferred keys (comparison, toc, …)
