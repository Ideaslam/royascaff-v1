# Services — Tasks

## Module: Tasks

### SVC-021 · TasksService [domain, internal, Tasks]

- Methods:
  - `create(userId, projectId, dto): TaskDto`
  - `listByProject(userId, projectId, query): PaginatedResponse`
  - `findOne(userId, taskId): TaskDetailDto`
  - `update(userId, taskId, dto): TaskDto`
  - `transitionStatus(userId, taskId, status): TaskDto` — enforce lifecycle RULE-005
  - `delete(userId, taskId): void` — only draft; soft or hard per policy
- Deps: `TasksRepository`, `RolesGuardHelper`, `ActivityLogService`, `NotificationsService`
- Side effects: notifications on status change
- Rules: RULE-005 lifecycle; `paid` only via WalletsService

### SVC-022 · TasksRepository [domain, internal, Tasks]

- Methods: CRUD, list by project/assignee, update board position
- Deps: MongoDB `tasks`

### SVC-023 · TaskLifecycleService [domain, internal, Tasks]

- Methods:
  - `assertTransition(from, to): void`
  - `markPaid(taskId, transactionId): TaskDto`
- Deps: `TasksRepository`, `WalletTransactionsRepository`
- Side effects: none
- Rules: RULE-005, RULE-006
