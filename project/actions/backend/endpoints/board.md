# Endpoints — Board

## Module: Board

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-068 | GET | /projects/:projectId/board | authenticated | `param: projectId` | `200 BoardDto` | `BoardService.getBoard()` | done | — |
| EP-069 | PATCH | /tasks/:id/board-position | authenticated | `param: id, body: MoveTaskDto` | `200 TaskDto` | `BoardService.moveTask()` | done | — |
