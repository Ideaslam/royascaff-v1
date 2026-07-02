# Services — Board

## Module: Board

### SVC-027 · BoardService [application, internal, Board]

- Methods:
  - `getBoard(userId, projectId): BoardDto` — columns from task statuses + tasks with order
  - `moveTask(userId, taskId, dto): TaskDto` — update `boardColumn`, `boardOrder`, optional status
- Deps: `TasksService`, `TasksRepository`, `RolesGuardHelper`, `ActivityLogService`
- Side effects: activity log on move
- Rules: RULE-012 per-project board only; status sync with lifecycle
