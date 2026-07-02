# Pages — Sphere

## Module: Sphere

### Sphere Graph Page

- Route: `/sphere`
- Components: `SphereGraphComponent` (Cytoscape), `SphereNodePanelComponent`, `SphereFiltersComponent`
- Service: `SphereApiService` → EP-030, EP-031, EP-033
- Guard: `AuthGuard`
- UI states: loading graph; empty network (invite CTA); node click opens side panel with navigation links
- Notes: flags for availability/status on nodes; navigate to profile/project/task
