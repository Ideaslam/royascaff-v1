# Endpoints — Notifications

## Module: Notifications

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-088 | GET | /notifications | authenticated | `?page,limit,readStatus` | `200 PaginatedNotifications` | `NotificationsService.list()` | paginated |
| EP-089 | PATCH | /notifications/:id/read | authenticated | `param: id` | `200 NotificationDto` | `NotificationsService.markRead()` | — |
| EP-090 | POST | /notifications/read-all | authenticated | — | `204` | `NotificationsService.markAllRead()` | — |
