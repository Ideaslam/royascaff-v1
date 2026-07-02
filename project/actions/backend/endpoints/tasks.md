# Endpoints — Tasks

## Module: Tasks

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-050 | GET | /projects/:projectId/tasks | authenticated | `param: projectId, ?page,limit,status` | `200 PaginatedTasks` | `TasksService.listByProject()` | done | — |
| EP-051 | POST | /projects/:projectId/tasks | authenticated | `param: projectId, body: CreateTaskDto` | `201 TaskDto` | `TasksService.create()` | done | — |
| EP-052 | GET | /tasks/:id | authenticated | `param: id` | `200 TaskDetailDto` | `TasksService.findOne()` | done | — |
| EP-053 | PATCH | /tasks/:id | authenticated | `param: id, body: UpdateTaskDto` | `200 TaskDto` | `TasksService.update()` | done | — |
| EP-054 | POST | /tasks/:id/status | authenticated | `param: id, body: { status }` | `200 TaskDto` | `TasksService.transitionStatus()` | done | — |
| EP-055 | DELETE | /tasks/:id | authenticated | `param: id` | `204` | `TasksService.delete()` | done | — |
