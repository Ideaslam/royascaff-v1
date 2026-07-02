# Endpoints — Tasks

## Module: Tasks

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-050 | GET | /projects/:projectId/tasks | authenticated | `param: projectId, ?page,limit,status` | `200 PaginatedTasks` | `TasksService.listByProject()` | paginated |
| EP-051 | POST | /projects/:projectId/tasks | authenticated | `param: projectId, body: CreateTaskDto` | `201 TaskDto` | `TasksService.create()` | — |
| EP-052 | GET | /tasks/:id | authenticated | `param: id` | `200 TaskDetailDto` | `TasksService.findOne()` | — |
| EP-053 | PATCH | /tasks/:id | authenticated | `param: id, body: UpdateTaskDto` | `200 TaskDto` | `TasksService.update()` | — |
| EP-054 | POST | /tasks/:id/status | authenticated | `param: id, body: { status }` | `200 TaskDto` | `TasksService.transitionStatus()` | RULE-005 |
| EP-055 | DELETE | /tasks/:id | authenticated | `param: id` | `204` | `TasksService.delete()` | draft only |
