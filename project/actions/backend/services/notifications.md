## Module: Notifications

### SVC-NOTIF · NotificationsService [internal, domain, Notifications]
Creates in-app notifications (with optional email) and serves the user's notification inbox.

**Methods:**
- `notify(data): Promise<void>` — creates notification and, if userEmail given, sends email (best-effort) — currently not called by processors
- `listNotifications(userId, filters): Promise<PaginatedResponseDto>` — paginated inbox
- `markAsRead(id, userId)` — marks one notification read
- `markAllAsRead(userId)` — marks all user's notifications read
- `countUnread(userId)` — returns { unreadCount }

**Deps:** NotificationRepository · MAIL_PROVIDER
**Side effects:** notification writes · optional email (best-effort)
**Rules:** Email only sent when userEmail provided; failures swallowed · Inbox queries scoped to requesting user · notify() wired into endpoints but not yet triggered by background processors
