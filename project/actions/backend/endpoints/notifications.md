## Module: Notifications

`@Controller('notifications')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-NOTIF-01 | GET | /api/v1/notifications | JWT | query: page, limit, isRead | 200 `Paginated<NotificationDto>` | SVC-NOTIF.listNotifications() | |
| EP-NOTIF-02 | GET | /api/v1/notifications/unread-count | JWT | none | 200 `{ unreadCount }` | SVC-NOTIF.countUnread() | |
| EP-NOTIF-03 | PATCH | /api/v1/notifications/:id/read | JWT | `:id` param | 200 | SVC-NOTIF.markAsRead() | |
| EP-NOTIF-04 | PATCH | /api/v1/notifications/read-all | JWT | none | 200 | SVC-NOTIF.markAllAsRead() | |
