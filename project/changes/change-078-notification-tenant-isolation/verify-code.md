# Verification — 078 Client Notification Tenant Isolation

## Plan Consistency

- [x] `notifications.workspaceId` + tenant indexes match `plan/data-model.md`
- [x] EP-NOTIF-01..04 remain the same routes; specs require JWT workspace + safe DTO
- [x] SVC-NOTIF inbox methods take `workspaceId`; `notify` / `notifyPlanRetirement` require it
- [x] SVC-NOTIF-SYNC copy is dataset display name only; raw errors stay on `SyncRun`
- [x] `RULE-NOTIF-002` is implemented (isolation, no slug-as-userId, no diagnostic inbox copy)
- [x] Customer Notifications page spec: no UI change; API strings are now safe
- [x] Ripple R1–R13 from `impact.md` applied or correctly no-op (R10, R11 inherit; R13 unchanged)

## Code Verification

- [x] Endpoints: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` — JWT + RolesGuard; pass `user.currentWorkspaceId`
- [x] Controller → service → repository; no DB access in the controller
- [x] Pages: existing `/app/notifications` — no frontend change
- [x] Layering: sync writer calls `NotificationsService.notify`; copy lives in `sync-copy.util.ts`
- [x] Frontend isolation: N/A (backend-only)
- [x] Auth: inbox empty unless caller is owner or active member of JWT workspace
- [x] `npx nest build` succeeded
- [x] `npx jest src/modules/notifications src/modules/subscriptions/services/subscription-lifecycle.service.spec.ts src/database/migrations` — 33 passed
- [x] UI screenshots: skipped (no portal UI change)

### Acceptance criteria

| # | Result | Evidence |
|---:|:---:|---|
| 1 | PASS | `listNotifications` / `countUnread` require `userId` + `workspaceId` and `canAccessInbox` (membership or owner). Missing workspace → empty / `{ unreadCount: 0 }`. Specs: "empty inbox when the JWT has no workspace", "not a member or owner". |
| 2 | PASS | `markAsRead` / `markAllAsRead` use the same access check and `{ userId, workspaceId }` repo filter; other-workspace ids cannot match. |
| 3 | PASS | Query always includes `workspaceId`. Unattributed legacy rows stay hidden (fail closed). Migration 002 only sets `workspaceId` when the mapping is unique. |
| 4 | PASS | `syncFailedMessage` / `syncSchemaDriftMessage` take dataset name only. Processor no longer interpolates `message.slice(0, 200)` or column lists. Spec asserts no `401`, `deleted_client`, or `invoice_number`. |
| 5 | PASS | `toInboxDto` allowlists `_id`, `type`, `title`, `titleAr`, `message`, `messageAr`, `isRead`, `relatedEntityType`, `relatedEntityId`, `actionUrl`, `createdAt`. Spec asserts `metadata` / email fields are absent. |
| 6 | PASS | `notifyUser` requires resolved `ownerId` and `workspace._id`; logs and returns if missing. Repo `create` rejects non-24-hex `userId` / missing `workspaceId`. |
| 7 | PASS | `toInboxDto` rewrites `sync_failed` / `sync_schema_drift` from quoted dataset name or `metadata.datasetName`. Migration 002 also rewrites stored leaky bodies. |
| 8 | PASS | Customer-portal page and models unchanged; they already bind API title/message. |

### Deviations from the plan, and why

1. **No `WorkspaceModule` import.** `NotificationsModule` is `@Global` and Workspace → Subscriptions → `NotificationsService`. Importing `WorkspaceModule` into Notifications would cycle at init. Workspace + membership schemas and repositories are registered locally on the Notifications module instead (stateless mongoose wrappers).
2. **Safe-copy helper lives under Notifications.** `sync-copy.util.ts` is the source; `data/utils/notification-i18n.util.ts` re-exports so the processor import path stays stable. Avoids Notifications → Data.

## Result: PASS

**Overall: PASS**
