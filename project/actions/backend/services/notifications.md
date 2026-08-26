## Module: Notifications

### SVC-NOTIF · NotificationsService [internal, domain, Notifications]
Creates in-app notifications (with optional email) and serves the user's notification inbox.

**Methods:**
- `notify(data): Promise<void>` — ordinary in-app notification with optional best-effort email
- `createPlanRetirementNotice(data)` — create/reuse one bilingual owner notice by retirement-schedule dedupe key and mark email pending
- `deliverPendingRetirementEmails(now, limit)` — bounded retry with persisted status/attempt/backoff and allowlisted error code
- `listNotifications(userId, filters): Promise<PaginatedResponseDto>` — paginated inbox
- `markAsRead(id, userId)` — marks one notification read
- `markAllAsRead(userId)` — marks all user's notifications read
- `countUnread(userId)` — returns { unreadCount }

**Deps:** NotificationRepository · MAIL_PROVIDER
**Side effects:** notification writes · ordinary best-effort email · durable retirement email
**Rules:** inbox scoped to user · retirement email never runs synchronously in admin request · exactly one row/email per owner/schedule · failure retries/audits but never blocks Plan retirement · no provider payload/secrets persisted

---

### SVC-NOTIF-SYNC — Notifications sync extensions *(change-029)*

**New notification types added to `NotificationType`:**
- `SYNC_FAILED` — fired by `DataSyncProcessor` when a sync run reaches `status = failed`; title = "Sync Failed", message includes dataset name and error summary; `actionUrl` = `/app/data/datasets/:id`
- `SYNC_SCHEMA_DRIFT` — fired when breaking schema drift (removed/retyped columns) is detected during a re-sync; title = "Schema Changed", message lists affected columns; `actionUrl` = `/app/data/datasets/:id`

**Trigger point:** `DataSyncProcessor.process()` catch block calls `NotificationsService.notify()` after `syncRunRepo.markFailed()`; drift notification called after `SchemaDriftService.detect()` returns breaking changes.
