# Modules & Features

## Short Summary

Linda is an invite-only internal community tool for remote collaborators. Modules cover authentication, invitation-based onboarding, the Sphere network graph, project and task management with offer negotiation, per-project board and mind-map views, SAR wallets, notifications, attachments, GitHub linking, and admin operations.

## Business Modules

## 1. Auth

- Scope: BE `linda-api/src/modules/auth/` + FE `linda-web/src/app/features/auth/`
- Audience: public (login/register) and authenticated users
- Entities: `users`
- Depends on: `Invitations` (register), `Users`

### Features

1. **Email Login** [both] — authenticate with email/password, issue JWT
2. **Social Login** [both] — Google OAuth and GitHub OAuth login (single GitHub app)
3. **Invite-Only Registration** [both] — register only with valid approved one-time invite token
4. **Password Reset** [both] — request and complete password reset via email
5. **Session Management** [both] — logout, token refresh, protected route guards
6. **JWT Validation** [backend-only] — global auth guard on all non-public API routes

### Notes

- Auth pages use auth layout, not the main app shell
- GitHub OAuth doubles as login and repo-access authorization (see GitHub module)

---

## 2. Invitations

- Scope: BE `linda-api/src/modules/invitations/` + FE `linda-web/src/app/features/invitations/`
- Audience: members (request), admin (approve)
- Entities: `invitations`, `sphereConnections`
- Depends on: `Users`, `Wallets`, `Admin`

### Features

1. **Invitation Request** [both] — member submits invite request for a new email
2. **Admin Approval Queue** [both] — admin approves or rejects pending requests
3. **One-Time Invite Link** [both] — issue single-use token after approval; expire unused links
4. **Invitation Delivery** [backend-only] — send invite via pluggable provider (MCP initial)
5. **Sphere Connection on Accept** [backend-only] — create `sphereConnection` between inviter and new user on registration
6. **Wallet on Registration** [backend-only] — create personal SAR wallet when invited user registers

---

## 3. Users

- Scope: BE `linda-api/src/modules/users/` + FE `linda-web/src/app/features/profile/`
- Audience: authenticated members
- Entities: `users`
- Depends on: `Auth`, `Wallets`

### Features

1. **User Profile** [both] — edit name, bio, avatar, skills
2. **Availability Status** [both] — set available / busy / offline; visible in Sphere
3. **Sphere Visibility** [both] — control discoverability within the network
4. **Profile View** [both] — view another member's public profile from Sphere or task context
5. **Personal Wallet Summary** [both] — view balance and link to transaction history

---

## 4. Sphere

- Scope: BE `linda-api/src/modules/sphere/` + FE `linda-web/src/app/features/sphere/`
- Audience: authenticated members
- Entities: `sphereConnections`, `users`
- Depends on: `Users`, `Invitations`, `Projects`, `Tasks`

### Features

1. **Network Graph Data** [both] — nodes (users) and edges (invitation-based connections)
2. **Explore Connections** [both] — traverse who invited whom and related members
3. **Node Flags** [both] — surface availability, role hints, and cross-links on graph nodes
4. **Graph Navigation** [both] — navigate from Sphere to user profile, project, or task
5. **Sphere Graph API** [backend-only] — aggregate connection data for mind-map Sphere mode

---

## 5. Roles

- Scope: BE `linda-api/src/modules/roles/` + FE `linda-web/src/app/features/admin/roles/` (admin UI)
- Audience: admin (assign); all users (enforced)
- Entities: `userRoleAssignments`
- Depends on: `Users`, `Projects`, `Admin`

### Features

1. **Global Role Assignment** [both] — admin assigns `admin` or `sales` globally
2. **Project Manager Assignment** [both] — admin assigns `project_manager` scoped to a project
3. **Role Enforcement** [backend-only] — `RolesGuard` on endpoints; role checks on wallet and project actions
4. **Member Default Role** [backend-only] — every user is `member` by default; extra roles via assignments
5. **Effective Permissions** [both] — UI hides actions the current user cannot perform

---

## 6. Projects

- Scope: BE `linda-api/src/modules/projects/` + FE `linda-web/src/app/features/projects/`
- Audience: members, sales, project managers, admin
- Entities: `projects`, `wallets`
- Depends on: `Users`, `Roles`, `Wallets`, `Sales`

### Features

1. **Create Project** [both] — create project container; auto-create project SAR wallet
2. **Edit & Archive Project** [both] — update metadata; archive when complete
3. **Project Collaborators** [both] — owner adds/removes collaborators
4. **Sales Assignee** [both] — assign sales contact on project; commission % set by admin
5. **Project Summary** [both] — overview of tasks, collaborators, wallet balance, GitHub links
6. **Project List & Filter** [both] — list projects visible to current user by role and membership

---

## 7. Tasks

- Scope: BE `linda-api/src/modules/tasks/` + FE `linda-web/src/app/features/tasks/`
- Audience: authenticated members on permitted projects
- Entities: `tasks`
- Depends on: `Projects`, `Users`, `Offers & Negotiation`

### Features

1. **Create Task** [both] — title, description, scope, initial fee, deadline within a project
2. **Task Lifecycle** [both] — statuses: `draft` → `offered` → `negotiating` → `accepted` → `in_progress` → `done` → `paid`
3. **Assignee Management** [both] — single assignee per task; set on offer acceptance
4. **Board Column Position** [both] — Kanban ordering within project board columns
5. **Task Detail** [both] — full task view with offers, comments, attachments, GitHub refs

---

## 8. Offers & Negotiation

- Scope: BE `linda-api/src/modules/offers/` + FE `linda-web/src/app/features/offers/`
- Audience: authenticated members in Sphere / project context
- Entities: `taskOffers`, `negotiationHistories`
- Depends on: `Tasks`, `Users`, `Notifications`, `Comments`

### Features

1. **Send Task Offer** [both] — offer task to a user in Sphere with proposed price and deadline
2. **Accept / Reject Offer** [both] — assignee resolves pending offer
3. **Counter-Offer** [both] — revise price and deadline; no live chat — field-based negotiation only
4. **Negotiation History** [both] — revision log per offer (price, deadline, proposer, timestamp)
5. **Offer to Sphere User** [both] — restrict offers to connected/network-visible members
6. **Offer Notifications** [backend-only] — emit in-app (and optional email) events on offer actions

---

## 9. Board

- Scope: BE `linda-api/src/modules/board/` + FE `linda-web/src/app/features/board/`
- Audience: project members and project managers
- Entities: `tasks` (column position, status)
- Depends on: `Tasks`, `Projects`, `GitHub`

### Features

1. **Per-Project Kanban** [both] — one board per project; no global cross-project board
2. **Drag-and-Drop Columns** [both] — move tasks across lifecycle-aligned columns
3. **Board Filters & Sort** [both] — filter/sort tasks within the project board
4. **Cross-Entity Flags** [both] — icons linking assignee, Sphere connection, GitHub refs on cards
5. **Status Sync** [backend-only] — persist column moves and status transitions with permission checks

---

## 10. Mind Map

- Scope: BE `linda-api/src/modules/mindmap/` + FE `linda-web/src/app/features/mindmap/`
- Audience: authenticated members
- Entities: `users`, `sphereConnections`, `projects`, `tasks` (read aggregates)
- Depends on: `Sphere`, `Projects`, `Tasks`

### Features

1. **Sphere Mode** [both] — mind-map visualization of people and invitation connections
2. **Project Mode** [both] — project breakdown with tasks as nodes and relationships
3. **Mode Toggle** [both] — switch Sphere / Project mode in one interface
4. **Node Flags** [both] — user status, task state, wallet indicators on nodes
5. **Graph Layout API** [backend-only] — serve node/edge payloads for Cytoscape.js rendering

---

## 11. Wallets

- Scope: BE `linda-api/src/modules/wallets/` + FE `linda-web/src/app/features/wallets/`
- Audience: all members; project managers and admin for project wallet ops
- Entities: `wallets`, `walletTransactions`
- Depends on: `Users`, `Projects`, `Tasks`, `Roles`

### Features

1. **User Wallet** [both] — personal SAR balance and transaction history
2. **Project Wallet** [both] — project-level SAR balance; created with project
3. **Manual Top-Up** [both] — admin or project manager tops up project wallet (v1)
4. **Project-to-User Transfer** [both] — pay assignee on task completion; link to `paid` status
5. **User-to-User Transfer** [both] — any member transfers SAR to another member
6. **Sales Commission Payout** [both] — admin-only transfer from project wallet using configured %
7. **Transaction Ledger** [backend-only] — immutable transaction records with type and source enums
8. **Payment Gateway Interface** [backend-only] — pluggable provider; manual source in v1

---

## 12. Comments

- Scope: BE `linda-api/src/modules/comments/` + FE shared comment component in task/project/wallet views
- Audience: authenticated members with access to target entity
- Entities: `comments`
- Depends on: `Tasks`, `Projects`, `Wallets`

### Features

1. **Task Comments** [both] — async discussion on tasks during negotiation and execution
2. **Project Comments** [both] — comments on project records
3. **Wallet Transaction Comments** [both] — notes on wallet transactions
4. **Comment Thread API** [backend-only] — polymorphic target type/id with author and timestamps

---

## 13. Notifications

- Scope: BE `linda-api/src/modules/notifications/` + FE `linda-web/src/app/features/notifications/`
- Audience: authenticated members
- Entities: `notifications`
- Depends on: `Users`, all event-emitting modules

### Features

1. **In-App Notification List** [both] — read/unread state; filter by type
2. **Event Types** [backend-only] — invites, offers, counter-offers, task status, wallet transfers, comments, GitHub
3. **Mark Read** [both] — single and bulk mark-as-read
4. **Critical Email Delivery** [backend-only] — Mailjet for select events (invites, password reset); in-app remains primary

---

## 14. Attachments

- Scope: BE `linda-api/src/modules/attachments/` + FE shared upload/download components
- Audience: authenticated members with entity access
- Entities: `attachments`
- Depends on: `Tasks`, `Projects`, `Wallets`, `Comments`

### Features

1. **Upload Attachment** [both] — attach files to task, project, or wallet transaction
2. **Download Attachment** [both] — presigned URL flow via API
3. **Attachment Metadata** [both] — name, size, mime, uploader, timestamp
4. **R2 Storage Integration** [backend-only] — Cloudflare R2 via presigned URLs; no direct client-to-R2

---

## 15. Activity Log

- Scope: BE `linda-api/src/modules/activity-log/` + FE `linda-web/src/app/features/activity/`
- Audience: members (scoped); admin (global filter)
- Entities: `activityLogs`
- Depends on: all mutating modules

### Features

1. **Audit Trail** [backend-only] — log significant mutations (projects, tasks, roles, wallets, GitHub)
2. **Activity Feed** [both] — filter by project, user, or entity type
3. **Actor & Metadata** [backend-only] — store actor, action, entity ref, JSON change snapshot

---

## 16. GitHub

- Scope: BE `linda-api/src/modules/github/` + FE `linda-web/src/app/features/settings/github/` + board/task surfaces
- Audience: authenticated members; project managers configure project links
- Entities: `githubConnections`, `projectGitHubLinks`
- Depends on: `Auth`, `Projects`, `Board`, `Tasks`

### Features

1. **Connect GitHub Account** [both] — OAuth2 via single GitHub app; encrypted token storage
2. **Project Repo Linking** [both] — link repos, branches, commits to a project board
3. **Read-Focused Sync** [both] — display commit/branch refs on board cards and task details (v1)
4. **GitHub Activity Notifications** [backend-only] — optional in-app events when linkage updates
5. **Token Refresh** [backend-only] — manage encrypted access/refresh tokens server-side

---

## Shared / Infrastructure Modules

## 17. Admin

- Scope: BE `linda-api/src/modules/admin/` + FE `linda-web/src/app/features/admin/`
- Audience: admin only
- Entities: `invitations`, `userRoleAssignments`, `webhookEndpoints` (config)
- Depends on: `Invitations`, `Roles`, `Wallets`, `Webhooks`

### Features

1. **Invitation Approval** [both] — approve/reject member-submitted invitation requests
2. **Role Management** [both] — assign/revoke admin, sales, project manager roles
3. **Commission Configuration** [both] — set sales commission % per project
4. **System Settings** [both] — global Linda configuration (admin-only)
5. **Admin Wallet Override** [both] — top-up any wallet; commission payouts from any project wallet

---

## 18. Webhooks

- Scope: BE `linda-api/src/modules/webhooks/`
- Audience: admin configures; external systems consume
- Entities: `webhookEndpoints`, `webhookDeliveries` (delivery log)
- Depends on: `Admin`, event bus from business modules

### Features

1. **Webhook Endpoint CRUD** [backend-only] — admin registers outbound URLs and event filters
2. **Event Emission** [backend-only] — fire on invitation approved, task status change, wallet transfer, project completion
3. **Delivery Retry** [backend-only] — async delivery via BullMQ with retry policy
4. **Webhook Signing** [backend-only] — sign payloads for receiver verification

---

## Module Priority

### Phase 1: Core Required

- Auth
- Invitations
- Users
- Roles
- Projects
- Tasks
- Offers & Negotiation
- Wallets
- Sphere

### Phase 2: Collaboration & Views

- Board
- Mind Map
- Comments
- Notifications
- Attachments

### Phase 3: Integrations & Ops

- GitHub
- Activity Log
- Admin
- Webhooks

## Module Dependency Summary

- `Auth` → depends on `Invitations`, `Users`
- `Invitations` → depends on `Users`, `Wallets`, `Admin`
- `Sphere` → depends on `Users`, `Invitations`, `Projects`, `Tasks`
- `Projects` → depends on `Users`, `Roles`, `Wallets`
- `Tasks` → depends on `Projects`, `Offers & Negotiation`
- `Offers & Negotiation` → depends on `Tasks`, `Comments`, `Notifications`
- `Board` → depends on `Tasks`, `GitHub`
- `Mind Map` → depends on `Sphere`, `Projects`, `Tasks`
- `Wallets` → depends on `Roles`, `Tasks`
- `GitHub` → depends on `Auth`, `Projects`
- `Admin` → depends on `Invitations`, `Roles`, `Webhooks`
- `Webhooks` → depends on events from all mutating modules
