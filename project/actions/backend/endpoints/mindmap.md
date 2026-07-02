# Endpoints — Mind Map

## Module: Mind Map

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-071 | GET | /mindmap/sphere | authenticated | `?rootUserId` | `200 MindMapGraphDto` | `MindMapService.getSphereMode()` | done | — |
| EP-072 | GET | /mindmap/projects/:projectId | authenticated | `param: projectId` | `200 MindMapGraphDto` | `MindMapService.getProjectMode()` | done | — |
