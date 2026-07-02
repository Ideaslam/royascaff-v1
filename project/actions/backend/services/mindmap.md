# Services — Mind Map

## Module: Mind Map

### SVC-028 · MindMapService [application, internal, Mind Map]

- Status: done

- Methods:
  - `getSphereMode(userId, rootUserId?): MindMapGraphDto` — delegate to SphereGraphService with layout hints
  - `getProjectMode(userId, projectId): MindMapGraphDto` — project node + task nodes + relationships
- Deps: `SphereGraphService`, `ProjectsService`, `TasksRepository`, `WalletsRepository`
- Side effects: none
- Rules: RULE-012; node flags for status/wallet/task state
