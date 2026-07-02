# Endpoints — Comments

## Module: Comments

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-083 | GET | /comments | authenticated | `?targetType,targetId,page,limit` | `200 PaginatedComments` | `CommentsService.list()` | polymorphic |
| EP-084 | POST | /comments | authenticated | `body: CreateCommentDto` | `201 CommentDto` | `CommentsService.create()` | — |
| EP-085 | PATCH | /comments/:id | authenticated | `param: id, body: UpdateCommentDto` | `200 CommentDto` | `CommentsService.update()` | author |
| EP-086 | DELETE | /comments/:id | authenticated | `param: id` | `204` | `CommentsService.delete()` | author or admin |
