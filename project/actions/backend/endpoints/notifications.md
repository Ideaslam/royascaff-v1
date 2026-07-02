# Endpoints — Notifications

## Module: Notifications

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-088 | GET | /notifications | authenticated | `?page,limit,readStatus` | `200 PaginatedNotifications` | `NotificationsService.list()` | done | — |
| EP-089 | PATCH | /notifications/:id/read | authenticated | `param: id` | `200 NotificationDto` | `NotificationsService.markRead()` | done | — |
| EP-090 | POST | /notifications/read-all | authenticated | — | `204` | `NotificationsService.markAllRead()` | done | — |
