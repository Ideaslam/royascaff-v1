## Module: Notifications

`@Controller('notifications')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-NOTIF-01 | GET | /api/v1/notifications | JWT | query: page, limit, isRead | 200 `Paginated<NotificationInboxDto>` (allowlisted fields; localized `plan_retirement` + sanitized sync rows) | SVC-NOTIF.listNotifications() | `userId` + JWT `currentWorkspaceId`; empty if no workspace or not member/owner |
| EP-NOTIF-02 | GET | /api/v1/notifications/unread-count | JWT | none | 200 `{ unreadCount }` | SVC-NOTIF.countUnread() | same workspace scope |
| EP-NOTIF-03 | PATCH | /api/v1/notifications/:id/read | JWT | `:id` param | 200 | SVC-NOTIF.markAsRead() | no-op if id is outside user+workspace |
| EP-NOTIF-04 | PATCH | /api/v1/notifications/read-all | JWT | none | 200 | SVC-NOTIF.markAllAsRead() | current workspace only |

**Contract rules:** inbox is tenant-scoped to the JWT workspace *(change-078)*. Retirement notifications are created by the subscription lifecycle with that subscription's `workspaceId`, deduplicated per owner and retirement schedule, and remain as inbox history when a retirement is cancelled. Email delivery state, provider errors, `metadata`, raw connector errors, HTTP statuses, and schema column lists are never exposed by these customer endpoints.
