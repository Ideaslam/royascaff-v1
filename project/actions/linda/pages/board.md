# Pages — Board

## Module: Board

### Project Board Page

- Route: `/projects/:id/board`
- Components: `KanbanBoardComponent`, `BoardColumnComponent`, `TaskCardComponent`, `BoardFiltersComponent`
- Service: `BoardApiService` → EP-068, EP-069; `TasksApiService` → EP-052
- Guard: `AuthGuard`
- UI states: drag-drop loading per card; empty column messages; GitHub flags on cards
- Notes: RULE-012 one board per project; columns map to task lifecycle statuses
