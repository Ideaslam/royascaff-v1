# Impact Analysis Template

Code recon + impact analysis in one artifact. Step 5.0b — before planning endpoints/pages. Saved as `impact.md`.

> Verbose guidance → `references/impact-template-guide.md`

## Schema

```md
# Impact Analysis — [Change Name]

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none/partial/complete | path | |
| Service(s) | none/partial/complete | path | |
| Endpoint(s) | none/partial/complete | path | |
| Page(s) | none/partial/complete | path | |

Feature state: none | partial | complete

## Affected Modules
- [name] — changes needed

## Plan Docs to Update
- [ ] endpoints, services, pages, data-model, rules — as needed

## Risk: complexity (L/M/H), cross-module (Y/N), migration (Y/N)

## Recommendation
- **Create**: [new items] — **Complete**: [partial] — **Modify**: [ripple]

## Status target (per artifact after this change)
- [ID/name] → planned | partial | done | deferred (reason if deferred)
```

`State` (none/partial/complete) maps to the artifact **status** in the specs: `none`→`planned`, `partial`→`partial`, `complete`→`done`. Record the intended end status per artifact so nothing is left ambiguous — see `engine/conventions.md`.

## Example

```md
# Impact Analysis — Bulk CSV Delete

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Service(s) | partial | data.service.ts | single-delete only |
| Endpoint(s) | partial | data.controller.ts | no bulk endpoint |
| Page(s) | complete | pages/data/files-list/ | no multi-select |

Feature state: partial

## Affected Modules
- Data — add bulk-delete endpoint, service method, multi-select UI

## Risk: low, no cross-module, no migration

## Recommendation
- **Create**: bulk-delete endpoint + method — **Complete**: files-list (multi-select)
```
