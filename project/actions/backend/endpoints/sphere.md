# Endpoints — Sphere

## Module: Sphere

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-030 | GET | /sphere/graph | authenticated | `?depth,rootUserId` | `200 SphereGraphDto` | `SphereGraphService.getGraphForUser()` | — |
| EP-031 | GET | /sphere/nodes/:userId | authenticated | `param: userId` | `200 SphereNodeDto` | `SphereGraphService.getNodeDetail()` | — |
| EP-032 | GET | /sphere/neighborhood/:userId | authenticated | `param: userId, ?hops` | `200 SphereGraphDto` | `SphereGraphService.getNeighborhood()` | — |
| EP-033 | GET | /sphere/nodes/:userId/links | authenticated | `param: userId` | `200 NavigationLinksDto` | `SphereNavigationService.resolveLinks()` | — |
