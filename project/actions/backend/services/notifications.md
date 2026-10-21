## Module: Notifications

### SVC-NOTIF · NotificationsService [internal, domain, Notifications]
Creates in-app notifications (with optional email) and serves the **current-workspace** notification inbox *(change-078)*.

**Methods:**
- `notify(data): Promise<void>` — ordinary in-app notification; **requires** `userId` + `workspaceId` (never a slug as `userId`); optional best-effort email uses the same safe title/message
- `createPlanRetirementNotice(data)` / `notifyPlanRetirement(data)` — create/reuse one bilingual owner notice by retirement-schedule dedupe key; **requires** `workspaceId` from the subscription's workspace
- `deliverPendingRetirementEmails(now, limit)` — bounded retry with persisted status/attempt/backoff and allowlisted error code
- `listNotifications(userId, workspaceId, filters): Promise<PaginatedResponseDto>` — paginated inbox; empty if `workspaceId` missing or caller is not owner/member; items mapped through `NotificationInboxDto`
- `markAsRead(id, userId, workspaceId)` — marks one notification read inside that user+workspace scope
- `markAllAsRead(userId, workspaceId)` — marks all of the caller's notifications in that workspace read
- `countUnread(userId, workspaceId)` — returns `{ unreadCount }` for that workspace only

**Deps:** NotificationRepository · MAIL_PROVIDER · WorkspaceRepository · WorkspaceMembershipRepository
**Side effects:** notification writes · ordinary best-effort email · durable retirement email
**Rules:** inbox scoped to `userId` + `workspaceId` + membership/owner · customer DTO allowlists `_id`, `type`, `title`, `titleAr`, `message`, `messageAr`, `isRead`, `relatedEntityType`, `relatedEntityId`, `actionUrl`, `createdAt` · `sync_failed` / `sync_schema_drift` sanitized on read · retirement email never runs synchronously in admin request · exactly one row/email per owner/schedule · failure retries/audits but never blocks Plan retirement · no provider payload/secrets persisted or returned

---

### SVC-NOTIF-SYNC — Notifications sync extensions *(change-029, hardened change-078)*

**Notification types:**
- `SYNC_FAILED` — fired by `DataSyncProcessor` when a sync run reaches `status = failed`; safe bilingual template names the **dataset display name** only (no raw error / HTTP status / internal code); `relatedEntityType` = `dataset`; `actionUrl` = `/app/data/datasets/:id`; `workspaceId` = that workspace
- `SYNC_SCHEMA_DRIFT` — fired when breaking schema drift is detected; safe template says the table structure changed and to review it — **never lists column names**; same entity/url/workspace fields. Column-level report stays on `SyncRun.schemaDrift` only

**Trigger point:** `DataSyncProcessor.process()` catch block calls `NotificationsService.notify()` after `syncRunRepo.markFailed()`; drift notification called after `SchemaDriftService.detect()` returns breaking changes. Recipient is the workspace `ownerId` only — skip notify if owner cannot be resolved; never fall back to `workspaceSlug` as `userId`.
