# Impact Analysis — 078 Client Notification Tenant Isolation

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete (leaky) | `notifications/schemas/notification.schema.ts` | no `workspaceId`; lean docs expose `metadata` + email internals |
| Repository | complete (user-only) | `notifications/repositories/notification.repository.ts` | queries keyed by `userId` only; `create` accepts any string as `userId` |
| Service | complete (user-only) | `notifications/services/notifications.service.ts` | `list` / unread / mark-read ignore JWT workspace; no safe DTO; `notify` has no workspace |
| Controller | complete | `notifications/controllers/notifications.controller.ts` | JWT only; never passes `currentWorkspaceId` |
| Retirement writer | complete | `subscription-lifecycle.service.ts:712-738` | has `subscription.workspaceId` but does not persist it on the notice |
| Sync writer | complete (unsafe) | `data/processors/data-sync.processor.ts:320-348` | `ownerId ?? workspaceSlug` as `userId`; embeds raw error / column list |
| Sync copy | complete (unsafe) | `data/utils/notification-i18n.util.ts` | interpolates `errorSnippet` and `driftDetail` into customer text |
| Scheduled sync | complete | `data/services/scheduled-sync.service.ts` | hourly/daily fan-out over **all** workspaces → each failure notifies that owner (then mixes in one inbox) |
| Page | complete | `customer-portal/.../notifications.page.ts` | renders API `title`/`message` as-is — no FE change required |
| FE service | complete | `customer-portal/.../core/services/notifications.service.ts` | list/unread/mark-read already exist |

**Feature state: complete** — inbox and sync notices exist end-to-end. This change **modifies** isolation + copy. It does not add a new inbox.

---

## Plan-vs-code drift found

1. Specs say EP-NOTIF-01 is “User-scoped only” and “email delivery state … never exposed”. Code list returns **lean documents**, so `metadata`, `emailStatus`, `emailLastErrorCode` can reach the client. Plan over-claims safety.
2. SVC-NOTIF-SYNC documents `message includes dataset name and error summary` and `message lists affected columns` — that is the leak. Plan must flip to safe templates; raw diagnostics stay on `SyncRun`.
3. `relatedEntityType` in `data-model.md` omits `dataset`; sync notices set `actionUrl` to `/app/data/datasets/:id` but often omit `relatedEntityType`/`relatedEntityId`.
4. Frontend unread badge reads `res.data.count`; API returns `{ unreadCount }`. **Noted, not in scope** (pre-existing; inbox page does not use it for this bug).

---

## Ripple / Impact Map

| # | Consumer | File | Today | Action |
|---|----------|------|-------|--------|
| R1 | Inbox list / unread / mark-read | `notifications.controller.ts` + service + repo | filter `userId` only | **Modify** — require JWT `currentWorkspaceId`; filter `{ userId, workspaceId }`; empty inbox if no workspace; membership or owner check |
| R2 | Safe DTO | repository `findPaginated` lean | full document | **Create** mapper — allowlisted fields only |
| R3 | `notify()` | `notifications.service.ts` | no workspace | **Modify** — require `workspaceId`; reject slug-as-userId |
| R4 | Sync notify | `data-sync.processor.ts` `notifyUser` | `ownerId ?? workspaceSlug` | **Modify** — persist workspace `_id`; notify only resolved `ownerId`; skip + log otherwise |
| R5 | Sync customer copy | `notification-i18n.util.ts` | raw error + column names | **Modify** — dataset display name only |
| R6 | Schema-drift trigger | `data-sync.processor.ts:127-147` | builds `Removed: col, col` into message | **Modify** — do not pass column lists into notify text (still store report on `SyncRun`) |
| R7 | Retirement notice | `notifyPlanRetirement` + lifecycle `processRetirementNotifications` | has workspace, does not store it | **Modify** — pass `workspaceId` from `subscription.workspaceId` |
| R8 | Retirement spec | `notifications-retirement.spec.ts` | no workspace on create | **Modify** — expect `workspaceId` |
| R9 | Historical leaky rows | existing `notifications` docs | raw bodies, no `workspaceId` | **Create** migration `002` backfill where deterministic; **read-time sanitize**; hide unattributed (fail closed) |
| R10 | Customer Notifications page | `notifications.page.ts` | displays API strings | **No change** — safer strings flow through |
| R11 | AppShell bell | `NotificationsService.getUnreadCount` | same user-wide count | inherits R1 automatically |
| R12 | `WorkspaceRoleGuard` admin bypass | `workspace-role.guard.ts` | admins skip membership | **Do not rely on guard alone** — service still scopes by `userId` + `workspaceId` |
| R13 | Dataset / SyncRun error UI | data pages | already workspace-scoped | **No change** — internals stay there, not in inbox |

---

## Affected Modules

- **Notifications** — schema, repo, service, controller, DTO, tests
- **Data** — `DataSyncProcessor.notifyUser` + `notification-i18n.util` (copy + recipient)
- **Subscriptions** — pass `workspaceId` into `notifyPlanRetirement` (ripple, small)
- **Workspace** — reuse `WorkspaceRepository` + `WorkspaceMembershipRepository` for inbox access check (no schema change)

---

## Plan Docs to Update

- [x] `.ai-control/project/plan/modules.md` — In-App Notification Center: workspace-scoped inbox + safe customer copy
- [x] `.ai-control/project/plan/data-model.md` — `notifications.workspaceId`, indexes, `relatedEntityType` includes `dataset`
- [x] `.ai-control/project/rules.md` — `RULE-NOTIF-002` tenant isolation + no diagnostic copy in customer inbox
- [x] `.ai-control/project/actions/backend/services/notifications.md` — workspace-scoped methods, required `workspaceId`, safe DTO, read-time sanitize
- [x] `.ai-control/project/actions/backend/endpoints/notifications.md` — EP-NOTIF-01..04 workspace + membership; safe DTO contract
- [x] `.ai-control/project/actions/backend/services/data.md` — SVC-NOTIF-SYNC / drift caller: safe templates; ownerId only; persist workspaceId
- [x] `.ai-control/project/actions/customer-portal/pages/notifications.md` — inbox is current-workspace only
- [x] `.ai-control/project/description.md` — Feature 14 / Entity 11: workspace-scoped, no internal diagnostics
- [ ] `_index.md` registries — no new files/IDs
- [ ] `project/profile.md` — unchanged

---

## Files to Create / Modify

### Backend — `roya-ai-dynamo-api`

**Create**

| File | Purpose |
|------|---------|
| `src/modules/notifications/utils/sync-copy.util.ts` | safe bilingual sync templates + dataset-name extract (single writer for new rows and read-time sanitize) |
| `src/modules/notifications/dto/notification-inbox.dto.ts` | allowlisted customer DTO + `toInboxDto()` including read-time sanitize for `sync_failed` / `sync_schema_drift` |
| `src/database/migrations/002-notification-workspace-backfill.ts` | idempotent `workspaceId` backfill (retirement via subscription; sync via `actionUrl` dataset id × `ws_{slug}_datasets`); unattributed left null (hidden) |
| `src/modules/notifications/services/notifications-inbox.spec.ts` | workspace isolation, membership, sanitize, DTO strip |

**Modify**

| File | Purpose |
|------|---------|
| `src/modules/notifications/schemas/notification.schema.ts` | `workspaceId`; indexes `{ workspaceId, userId, createdAt }` and `{ workspaceId, userId, isRead }` |
| `src/modules/notifications/repositories/notification.repository.ts` | create requires `workspaceId`; list/count/mark-read filter `{ userId, workspaceId }` |
| `src/modules/notifications/services/notifications.service.ts` | `notify` / `notifyPlanRetirement` require `workspaceId`; inbox methods take workspace + assert member/owner; map through DTO |
| `src/modules/notifications/controllers/notifications.controller.ts` | pass `user.currentWorkspaceId`; empty when missing |
| `src/modules/notifications/notifications.module.ts` | import `WorkspaceModule` (exports membership + workspace repos; no cycle — Workspace does not import Notifications) |
| `src/modules/notifications/services/notifications-retirement.spec.ts` | expect `workspaceId` on create |
| `src/modules/data/utils/notification-i18n.util.ts` | safe bilingual templates (dataset name only) |
| `src/modules/data/processors/data-sync.processor.ts` | resolve owner + workspace `_id`; never slug fallback; no raw error/column list in notify |
| `src/modules/subscriptions/services/subscription-lifecycle.service.ts` | pass `workspaceId: subscription.workspaceId` |

**No change**

| File | Why |
|------|-----|
| Customer-portal notification page / models | already bind API title/message |
| `scheduled-sync.service.ts` | fan-out is correct; isolation is on write + read |
| `schema-drift.service.ts` | report still stored on `SyncRun` |

---

## Impact Classification

| Item | Verdict |
|------|---------|
| `workspaceId` on notifications | **Modify** data model (new field on existing entity) |
| EP-NOTIF-01..04 | **Modify** — same routes, stricter scope + safe DTO |
| SVC-NOTIF inbox / notify | **Modify** |
| SVC-NOTIF-SYNC copy + recipient | **Modify** |
| Retirement writer | **Modify** (ripple) |
| Customer Notifications page | **No change** |
| Migration 002 | **Create** |

---

## Risk

- **Complexity:** M (isolation + sanitize + backfill; no new HTTP surface)
- **Cross-module:** Y (Notifications, Data, Subscriptions, Workspace read)
- **Migration:** Y — `002-notification-workspace-backfill` via existing `schema_migrations` runner; fail-closed for rows that cannot be attributed
- **Auth:** inbox becomes workspace-bound; missing JWT workspace → empty list/count (not a dump)
- **Circular imports:** Notifications `@Global` already consumed by Subscriptions; Workspace does not import Notifications — `NotificationsModule` → `WorkspaceModule` is safe

## Recommendation

- **Create:** inbox DTO + sanitize mapper, migration 002, inbox isolation tests
- **Modify:** notification schema/repo/service/controller; sync notify + i18n; retirement `workspaceId` pass-through
- **Ripple:** retirement spec; plan/action docs listed above
- **Do not:** change FE layout; put column lists or HTTP errors in the inbox; use `workspaceSlug` as `userId`
