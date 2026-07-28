# Impact Analysis — Status tag colors + AI Requests label

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Project Detail proposals | partial | `project-detail.component.ts` ~166 | `<p-tag>` has no `[severity]` — all default blue |
| DNA status severity | complete | same file `statusSeverity` | Used for DNA only; not wired to proposals |
| Pipeline stepper | complete | `pipeline-stepper.component.ts` | Correct generation status severities (reference) |
| AI Requests status | partial | `ai-requests.component.ts` | Shows raw `retrying`; filter label = value |

Feature state: **partial**

## Affected Modules
- Project Detail — proposals Status column
- AI Requests — status tag + filter label

## Pack blueprint files
- [x] `blueprint/actions/web/pages/projects.md`
- [x] `blueprint/actions/web/pages/ai-requests.md`
- [x] `blueprint/_index.md`

## Code files to modify

| App | Path | Action |
|-----|------|--------|
| web | `pages/projects/project-detail/project-detail.component.ts` | Bind proposal tag severity; add generation status severity helper |
| web | `pages/ai-requests/ai-requests.component.ts` | Display/filter label `inprogress` for `retrying` |

## Ripple effects
- None (display only; API status values unchanged)

## Risk
- Complexity: **L**
- Cross-module: **N**
- Migration: **N**

## Recommendation
- **Modify**: FE markup + helpers only
