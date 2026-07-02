# Endpoints — Comments

## Module: Comments

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-083 | GET | /comments | authenticated | `?targetType,targetId,page,limit` | `200 PaginatedComments` | `CommentsService.list()` | done | — |
| EP-084 | POST | /comments | authenticated | `body: CreateCommentDto` | `201 CommentDto` | `CommentsService.create()` | done | — |
| EP-085 | PATCH | /comments/:id | authenticated | `param: id, body: UpdateCommentDto` | `200 CommentDto` | `CommentsService.update()` | done | — |
| EP-086 | DELETE | /comments/:id | authenticated | `param: id` | `204` | `CommentsService.delete()` | done | — |
