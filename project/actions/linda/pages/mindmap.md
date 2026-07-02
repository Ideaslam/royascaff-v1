# Pages — Mind Map

## Module: Mind Map

### Mind Map Page

- Route: `/mindmap`
- Components: `MindMapComponent` (Cytoscape), `MindMapModeToggleComponent`, `MindMapNodePanelComponent`, `ProjectSelectorComponent`
- Service: `MindMapApiService` → EP-071, EP-072; `ProjectsApiService` → EP-039 (project picker)
- Guard: `AuthGuard`
- UI states: loading graph; Sphere vs Project mode toggle; node flags for status/wallet/task
- Query: `?mode=sphere|project&projectId=` deep link
- Notes: shared graph component patterns with Sphere page
