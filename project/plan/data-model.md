# Data Model

Database: **MongoDB** (Mongoose ODM) per `project/profile.md`.

Conventions: `_id: ObjectId` PK; `createdAt`, `updatedAt` on all collections unless noted; enums lowercase snake or camel as listed; SAR amounts as `Decimal128` or `Number` with 2 decimal precision enforced in service layer.

---

## Enums

| Enum | Values |
|------|--------|
| `AvailabilityStatus` | `available`, `busy`, `offline` |
| `GlobalRole` | `admin`, `sales`, `member` |
| `RoleScope` | `global`, `project` |
| `InvitationStatus` | `pending_approval`, `approved`, `rejected`, `accepted`, `expired` |
| `ProjectStatus` | `active`, `archived` |
| `TaskStatus` | `draft`, `offered`, `negotiating`, `accepted`, `in_progress`, `done`, `paid` |
| `TaskOfferStatus` | `pending`, `accepted`, `rejected`, `superseded` |
| `CommentTargetType` | `task`, `project`, `wallet_transaction` |
| `WalletOwnerType` | `user`, `project` |
| `WalletTransactionType` | `top_up`, `project_to_user`, `user_to_user`, `commission`, `gateway_deposit` |
| `WalletTransactionSource` | `manual`, `payment_gateway` |
| `NotificationReadStatus` | `unread`, `read` |
| `AttachmentTargetType` | `task`, `project`, `wallet_transaction` |
| `WebhookDeliveryStatus` | `pending`, `delivered`, `failed` |

---

## 1. users

Purpose: Community members — identity, profile, availability, inviter link.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `email` | String | required, unique, lowercase | — |
| `passwordHash` | String | optional (OAuth-only users) | — |
| `name` | String | required | — |
| `avatarUrl` | String | optional | — |
| `skills` | [String] | default: [] | — |
| `bio` | String | optional, max 2000 | — |
| `availabilityStatus` | Enum | required, default: `available` | AvailabilityStatus |
| `sphereVisible` | Boolean | default: true | — |
| `inviterId` | ObjectId | optional | → `users` |
| `googleId` | String | optional, unique sparse | — |
| `githubId` | String | optional, unique sparse | — |
| `isActive` | Boolean | default: true | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one user → many `userRoleAssignments`, `invitations` (as inviter), `sphereConnections`, `tasks` (assignee), `wallets` (owner), `notifications`

Indexes: unique `email`; sparse unique `googleId`, `githubId`; index `inviterId`; index `availabilityStatus`

---

## 2. userRoleAssignments

Purpose: Global and project-scoped role grants.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required | → `users` |
| `role` | Enum | required | GlobalRole + `project_manager` |
| `scope` | Enum | required | RoleScope |
| `projectId` | ObjectId | required when scope=`project` | → `projects` |
| `assignedById` | ObjectId | required | → `users` |
| `assignedAt` | Date | required | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: many assignments → one user; project-scoped → one project

Indexes: compound unique `(userId, role, scope, projectId)` where projectId null for global; index `userId`; index `projectId`

Note: `member` is implicit — do not store unless needed for audit; store `admin`, `sales`, `project_manager` only.

---

## 3. invitations

Purpose: Invite-only onboarding requests and one-time tokens.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `inviterId` | ObjectId | required | → `users` |
| `inviteeEmail` | String | required, lowercase | — |
| `token` | String | optional until approved; unique sparse | — |
| `status` | Enum | required | InvitationStatus |
| `approvedById` | ObjectId | optional | → `users` |
| `approvedAt` | Date | optional | — |
| `rejectedAt` | Date | optional | — |
| `expiresAt` | Date | optional | — |
| `acceptedAt` | Date | optional | — |
| `acceptedUserId` | ObjectId | optional | → `users` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one invitation → one `sphereConnection` on accept

Indexes: unique sparse `token`; index `inviteeEmail`; index `status`; index `inviterId`

---

## 4. sphereConnections

Purpose: Invitation-based edges in the Sphere graph.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `fromUserId` | ObjectId | required | → `users` (inviter) |
| `toUserId` | ObjectId | required | → `users` (invitee) |
| `invitationId` | ObjectId | required, unique | → `invitations` |
| `connectedAt` | Date | required | — |
| `createdAt` | Date | auto | — |

Relations: directed edge from inviter to invitee

Indexes: unique `(fromUserId, toUserId)`; index `toUserId`; index `fromUserId`

---

## 5. projects

Purpose: Project containers for tasks, collaborators, sales, and project wallet.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `name` | String | required | — |
| `description` | String | optional | — |
| `status` | Enum | required, default: `active` | ProjectStatus |
| `ownerId` | ObjectId | required | → `users` |
| `collaboratorIds` | [ObjectId] | default: [] | → `users` |
| `salesAssigneeId` | ObjectId | optional | → `users` |
| `commissionPercent` | Number | optional, 0–100 | — |
| `walletId` | ObjectId | required | → `wallets` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one project → many `tasks`, one `wallet`, optional `projectGitHubLinks`

Indexes: index `ownerId`; index `status`; index `salesAssigneeId`; index `collaboratorIds`

---

## 6. tasks

Purpose: Units of work within a project with lifecycle and board position.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `projectId` | ObjectId | required | → `projects` |
| `title` | String | required | — |
| `description` | String | optional | — |
| `scope` | String | optional | — |
| `assigneeId` | ObjectId | optional | → `users` |
| `fee` | Number | required, min 0, SAR | — |
| `deadline` | Date | optional | — |
| `status` | Enum | required, default: `draft` | TaskStatus |
| `boardColumn` | String | optional | Kanban column key |
| `boardOrder` | Number | default: 0 | — |
| `createdById` | ObjectId | required | → `users` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one task → many `taskOffers`, `comments`, `attachments`; optional link from `walletTransactions`

Indexes: index `projectId`; compound index `(projectId, status)`; index `assigneeId`; index `(projectId, boardColumn, boardOrder)`

---

## 7. taskOffers

Purpose: Offers to assign a task to a specific user.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `taskId` | ObjectId | required | → `tasks` |
| `offeredById` | ObjectId | required | → `users` |
| `offeredToId` | ObjectId | required | → `users` |
| `proposedPrice` | Number | required, SAR | — |
| `proposedDeadline` | Date | optional | — |
| `status` | Enum | required, default: `pending` | TaskOfferStatus |
| `resolvedAt` | Date | optional | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one offer → many `negotiationHistories`

Indexes: index `taskId`; index `offeredToId`; index `(taskId, status)`

---

## 8. negotiationHistories

Purpose: Counter-offer revision log per task offer.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `taskOfferId` | ObjectId | required | → `taskOffers` |
| `proposedById` | ObjectId | required | → `users` |
| `counterPrice` | Number | required, SAR | — |
| `counterDeadline` | Date | optional | — |
| `revisionNumber` | Number | required, min 1 | — |
| `createdAt` | Date | auto | — |

Relations: many revisions → one task offer

Indexes: index `taskOfferId`; compound index `(taskOfferId, revisionNumber)` unique

---

## 9. comments

Purpose: Async comments on tasks, projects, or wallet transactions.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `targetType` | Enum | required | CommentTargetType |
| `targetId` | ObjectId | required | polymorphic |
| `authorId` | ObjectId | required | → `users` |
| `text` | String | required, max 5000 | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: polymorphic — one target entity → many comments

Indexes: compound index `(targetType, targetId, createdAt)`; index `authorId`

---

## 10. wallets

Purpose: SAR balance containers for users or projects.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `ownerType` | Enum | required | WalletOwnerType |
| `ownerId` | ObjectId | required | → `users` or `projects` |
| `balance` | Number | required, default: 0, min 0 | SAR |
| `currency` | String | required, fixed: `SAR` | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one wallet → many `walletTransactions`

Indexes: unique compound `(ownerType, ownerId)`; index `ownerId`

Validation: balance updates only via atomic transaction service — no direct client writes.

---

## 11. walletTransactions

Purpose: Immutable ledger of wallet movements.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `fromWalletId` | ObjectId | optional (null = external top-up) | → `wallets` |
| `toWalletId` | ObjectId | required | → `wallets` |
| `amount` | Number | required, min 0.01 | SAR |
| `type` | Enum | required | WalletTransactionType |
| `source` | Enum | required | WalletTransactionSource |
| `relatedTaskId` | ObjectId | optional | → `tasks` |
| `relatedProjectId` | ObjectId | optional | → `projects` |
| `initiatedById` | ObjectId | required | → `users` |
| `note` | String | optional | — |
| `createdAt` | Date | auto, immutable | — |

Relations: links optional task (for `paid` transition) and project

Indexes: index `fromWalletId`; index `toWalletId`; index `relatedTaskId`; index `initiatedById`; index `createdAt` desc

Validation: append-only — no updates or deletes.

---

## 12. notifications

Purpose: In-app notifications for system events.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `recipientId` | ObjectId | required | → `users` |
| `eventType` | String | required | e.g. `offer_received`, `wallet_transfer` |
| `title` | String | required | — |
| `message` | String | required | — |
| `relatedEntityType` | String | optional | — |
| `relatedEntityId` | ObjectId | optional | — |
| `readStatus` | Enum | required, default: `unread` | NotificationReadStatus |
| `createdAt` | Date | auto | — |

Relations: many notifications → one recipient

Indexes: compound index `(recipientId, readStatus, createdAt)`; index `recipientId`

---

## 13. attachments

Purpose: Files attached to tasks, projects, or wallet transactions.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `targetType` | Enum | required | AttachmentTargetType |
| `targetId` | ObjectId | required | polymorphic |
| `fileName` | String | required | — |
| `storageKey` | String | required | R2 object key |
| `mimeType` | String | required | — |
| `sizeBytes` | Number | required, min 1 | — |
| `uploadedById` | ObjectId | required | → `users` |
| `uploadedAt` | Date | required | — |
| `createdAt` | Date | auto | — |

Relations: polymorphic attachment to task, project, or wallet transaction

Indexes: compound index `(targetType, targetId)`; index `uploadedById`

---

## 14. activityLogs

Purpose: Audit trail for significant actions.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `actorId` | ObjectId | required | → `users` |
| `action` | String | required | e.g. `task_moved`, `wallet_transfer` |
| `entityType` | String | required | — |
| `entityId` | ObjectId | required | — |
| `metadata` | Object | optional | JSON snapshot |
| `createdAt` | Date | auto, immutable | — |

Relations: many logs → one actor

Indexes: compound index `(entityType, entityId, createdAt)`; index `actorId`; index `createdAt` desc

---

## 15. githubConnections

Purpose: User's GitHub OAuth connection and encrypted tokens.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required, unique | → `users` |
| `githubUsername` | String | required | — |
| `accessTokenEnc` | String | required | encrypted |
| `refreshTokenEnc` | String | optional | encrypted |
| `tokenExpiresAt` | Date | optional | — |
| `connectedAt` | Date | required | — |
| `lastSyncedAt` | Date | optional | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one connection → one user; one user → many `projectGitHubLinks` (via authorizing user)

Indexes: unique `userId`; index `githubUsername`

---

## 16. projectGitHubLinks

Purpose: Links a project's board to GitHub repos, branches, and commits.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `projectId` | ObjectId | required | → `projects` |
| `githubConnectionId` | ObjectId | required | → `githubConnections` |
| `repositoryFullName` | String | required | e.g. `org/repo` |
| `linkedBranches` | [String] | default: [] | — |
| `linkedCommits` | [String] | default: [] | commit SHAs |
| `configuredAt` | Date | required | — |
| `updatedAt` | Date | auto | — |
| `createdAt` | Date | auto | — |

Relations: many links → one project; uses authorizing user's GitHub connection

Indexes: index `projectId`; index `githubConnectionId`

---

## 17. webhookEndpoints

Purpose: Admin-configured outbound webhook URLs.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `url` | String | required | HTTPS |
| `secret` | String | required | signing secret |
| `eventTypes` | [String] | required | subscribed events |
| `isActive` | Boolean | default: true | — |
| `createdById` | ObjectId | required | → `users` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one endpoint → many `webhookDeliveries`

Indexes: index `isActive`

---

## 18. webhookDeliveries

Purpose: Delivery log and retry state for outbound webhooks.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `webhookEndpointId` | ObjectId | required | → `webhookEndpoints` |
| `eventType` | String | required | — |
| `payload` | Object | required | — |
| `status` | Enum | required, default: `pending` | WebhookDeliveryStatus |
| `attemptCount` | Number | default: 0 | — |
| `lastAttemptAt` | Date | optional | — |
| `responseStatus` | Number | optional | HTTP status |
| `errorMessage` | String | optional | — |
| `createdAt` | Date | auto | — |

Relations: many deliveries → one endpoint

Indexes: index `webhookEndpointId`; index `(status, createdAt)` for retry queue

---

## Entity Relationship Summary

```text
users ──┬── userRoleAssignments
        ├── invitations (inviter) ──► sphereConnections
        ├── wallets (user) ──► walletTransactions
        ├── githubConnections ──► projectGitHubLinks
        └── notifications

projects ──┬── wallet (project)
           ├── tasks ──┬── taskOffers ──► negotiationHistories
           │           ├── comments, attachments
           │           └── walletTransactions (related)
           └── projectGitHubLinks

webhookEndpoints ──► webhookDeliveries
```

## Validation Rules (cross-entity)

1. `userRoleAssignments.projectId` required when `scope = project`
2. `invitations.token` set only when `status = approved`; cleared/consumed on `accepted`
3. `projects.walletId` must reference a wallet with `ownerType = project` and matching `ownerId`
4. `walletTransactions` must not drive `balance` negative — enforce in transaction service with session/transaction
5. `tasks.status = paid` requires at least one `walletTransaction` with `relatedTaskId` and `type = project_to_user`
6. `taskOffers` only one `pending` offer per task at a time
7. `githubConnections` tokens never returned to client — decrypt server-side only
