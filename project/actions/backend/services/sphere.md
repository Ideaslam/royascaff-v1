# Services — Sphere

## Module: Sphere

### SVC-014 · SphereGraphService [domain, internal, Sphere]

- Status: planned

- Methods:
  - `getGraphForUser(userId, depth?): SphereGraphDto` — nodes (users) + edges (connections) visible to user
  - `getNodeDetail(userId, targetUserId): SphereNodeDto` — flags: availability, roles hint, project/task counts
  - `getNeighborhood(userId, centerUserId, hops): SphereGraphDto`
- Deps: `SphereConnectionsRepository`, `UsersRepository`, `ProjectsRepository`, `TasksRepository`
- Side effects: none
- Rules: respect `sphereVisible`; only show connected/network-visible members

### SVC-015 · SphereNavigationService [application, internal, Sphere]

- Status: planned

- Methods:
  - `resolveLinks(userId, nodeId): NavigationLinksDto` — profile, projects, open tasks URLs/ids
- Deps: `SphereGraphService`, `ProjectsService`, `TasksService`
- Side effects: none
- Rules: permission-filter links
