# Services — Comments

## Module: Comments

### SVC-032 · CommentsService [domain, internal, Comments]

- Methods:
  - `list(userId, targetType, targetId, query): PaginatedResponse`
  - `create(userId, dto): CommentDto`
  - `update(userId, commentId, dto): CommentDto` — author only
  - `delete(userId, commentId): void` — author or admin
- Deps: `CommentsRepository`, `RolesGuardHelper`, `NotificationsService`
- Side effects: notification on new comment
- Rules: RULE-004 async discussion only; polymorphic target access checks
