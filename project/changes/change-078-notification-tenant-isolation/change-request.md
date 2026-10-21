# Change Request

## Metadata
- **date**: 2026-09-03
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Notifications (primary); Data (sync notify copy + recipient); Workspace (membership check on inbox)
- Feature(s): In-App Notification Center; Sync Failed / Schema Drift notices
- Endpoint(s): EP-NOTIF-01..04 (same routes; stricter scope + safe DTO)
- Page(s)/View(s): `customer-portal: Notifications` — no UI redesign; it already renders API title/message
- Service(s): SVC-NOTIF (`NotificationsService` + repository); `DataSyncProcessor.notifyUser`; `notification-i18n.util`

## Description

### Problem

A customer-portal client inbox currently shows **platform-ops content** that must not leak to a tenant:

1. **No workspace boundary.** `notifications` is a global collection keyed only by `userId`. List / unread / mark-read ignore JWT `currentWorkspaceId`. A client who owns more than one workspace (or whose user id was used as `ownerId` on other workspaces) sees every sync event from all of them in one inbox. There is no tenant field to enforce isolation.
2. **Unsafe recipient fallback.** `DataSyncProcessor.notifyUser` does `ownerId ?? workspaceSlug`. If `ownerId` is missing, the slug is written as `userId` (`new ObjectId(slug)`), which can attach the row to the wrong user or fail silently.
3. **Information disclosure in the message body.** Sync-failed copy embeds the raw connector error (`Request failed with status code 401`, `deleted_client`). Schema-changed copy embeds the full removed/retyped column list (`invoice_number`, `customer_mobile`, `is_potential_fraud`, marketing UTM fields). That is internal schema and connector diagnostics — useful to an attacker, not to a client.
4. **Raw document leak on list.** `findPaginated` returns lean documents, so `metadata`, `emailStatus`, `emailLastErrorCode`, and other delivery internals can reach the customer API.

Hourly/daily scheduled sync already walks **every** workspace. Combined with (1)–(3), a client account can look like a system-wide ops feed.

### Desired behavior

- A client sees **only** notifications for the **current JWT workspace**, and only if they are that workspace's owner or an active member.
- Sync notices are created only for that workspace's owner (existing recipient), with a required `workspaceId`. No slug fallback. Skip notify if the owner cannot be resolved to a real user id.
- Customer copy is a **safe template**: dataset display name only. Never persist or return raw errors, HTTP status codes, internal error codes, or column-name lists.
- List/unread/mark-read return a **safe DTO** only (`_id`, `type`, `title`, `titleAr`, `message`, `messageAr`, `isRead`, `relatedEntityType`, `relatedEntityId`, `actionUrl`, `createdAt`). Email internals and `metadata` stay server-side.
- Historical leaky rows are **sanitized on read** (map `sync_failed` / `sync_schema_drift` to the safe template using stored dataset name when present, otherwise a generic line). Do not return the stored raw body to the client.
- `plan_retirement` stays user+workspace scoped the same way when a workspace id is available; copy is already safe.

### Who is affected

- Customer-portal clients (inbox + bell badge) — they lose other-workspace and internal-diagnostic text.
- Workspace owners still receive sync failed / schema-changed notices for **their** tables only, in safe language.
- Platform admins are unchanged (no admin notification inbox). Connector/schema detail remains on dataset detail / sync-run records (already workspace-scoped), not in the client inbox.

### User stories

- **Happy:** Client in workspace A opens Notifications and sees only A's events. A failed sync says the table name failed and to check the connection — not `401` or `deleted_client`. A schema change says the table structure changed and to review it — not a column dump.
- **Edge:** User switches workspace → inbox and unread count switch with JWT. Mark-read of another workspace's id is a no-op / not found. User with no workspace on the token gets an empty inbox. Notify with missing owner is skipped and logged, not written to a guess id. Old leaky rows still appear but with safe text.

### Permissions

- JWT required (unchanged). Inbox = `userId` + `currentWorkspaceId` + membership/owner check. No new public or admin endpoints.

### Data changes

- Add required-going-forward `workspaceId` (ObjectId → Workspace) on `notifications`. Index `{ workspaceId: 1, userId: 1, createdAt: -1 }` and `{ workspaceId: 1, userId: 1, isRead: 1 }`.
- Backfill: set `workspaceId` from the creating workspace when known; rows that cannot be attributed stay hidden from the customer inbox (fail closed).
- No new collections. No new endpoints.

### Out of scope

- Admin-panel notification center
- Changing dataset-detail / sync-run error display (those stay operator-facing inside the tenant)
- New notification types or email redesign beyond not sending the same raw error text
- Frontend layout/i18n redesign (page already binds API strings)

## Acceptance Criteria

1. `GET /api/v1/notifications` and `GET /api/v1/notifications/unread-count` return only rows where `userId` is the caller **and** `workspaceId` equals JWT `currentWorkspaceId`, after confirming the caller is owner or active member of that workspace.
2. `PATCH .../:id/read` and `PATCH .../read-all` apply only inside that same user+workspace scope; another workspace's id cannot be marked read.
3. A client never receives another workspace's or another tenant's notification, including via unread count.
4. New `sync_failed` and `sync_schema_drift` rows store and return safe bilingual templates that include the dataset display name only — no raw error, HTTP status, internal code, or column names.
5. Customer list/unread payloads never include `metadata`, `emailStatus`, `emailAttempts`, `emailNextAttemptAt`, `emailSentAt`, or `emailLastErrorCode`.
6. `DataSyncProcessor.notifyUser` persists `workspaceId`, notifies only a resolved workspace `ownerId`, and never uses `workspaceSlug` as `userId`.
7. Existing leaky `sync_failed` / `sync_schema_drift` rows are rewritten to the safe template on read (or omitted if they cannot be attributed to the current workspace).
8. Customer-portal Notifications page and bell badge keep working with no required UI change.

## Notes

- Security / tenant-isolation change; treat fail-closed (hide) as better than leak.
- Dataset names in the client's **own** workspace are allowed in the message; they are not a cross-tenant leak.
- Connector diagnostics remain in workspace-scoped `SyncRun.error` / logs, not in the inbox DTO.
