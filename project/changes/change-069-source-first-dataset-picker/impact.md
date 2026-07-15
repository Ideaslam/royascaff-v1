# Impact Analysis — Source-First Dataset Picker

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Lite API | complete | EP-DATA-56 | needed `dataSourceId` + `sources[]` |
| Page | complete | project-detail | flat/grouped tables still too dense |

Feature state: **complete** (modify UX + lite enrichment)

## Plan Docs
- [x] `pages/projects.md`
- [x] `endpoints/data.md` (EP-DATA-56)

## Recommendation
- **Modify**: lite repo/controller + Project Detail two-level picker
