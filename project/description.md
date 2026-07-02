# Product Description

## 1. Product Summary

- **Name**: Linda
- **Type**: Internal tool
- **Audience**: Remote collaborators in a developer community — primarily developers, designers, and photographers, plus other laptop-based workers invited into the network
- **Summary**: Linda is an internal tool to manage teams and projects through visual mind-map and board spaces. Shows connections between collaborators in a Sphere network graph, tracks status, assigns tasks, negotiates task offers, and records task-fee payments as SAR wallet transactions.

## 2. Core Workflow

1. An existing member submits an invitation request for a new user; **Admin** approves before a one-time invite link is sent
2. The invited user **registers** (email/password or Google/GitHub OAuth); a personal SAR wallet is created; they connect to the inviter in the **Sphere**
3. The user sets **profile, skills, and availability status** visible in the network
4. The user either **receives a task offer** from someone in their Sphere or **creates a project** (with a project wallet) and **offers tasks** to others
5. The offer is **negotiated** via counter-offer fields (price, deadline) and async comments until accepted or rejected
6. Accepted work is tracked on separate **board** (Kanban per project) and **mind-map** views (Sphere mode or Project mode)
7. On completion, the **project owner / Project Manager / Admin** tops up the project wallet and **transfers SAR credits** to the assignee's user wallet; members may also transfer credits user-to-user

## 3. Core Features

- **Sphere (Network Graph)**: user nodes and invitation-based edges; explore who invited whom; status/role/availability flags; navigate to profiles, projects, and tasks
- **Invitation & Onboarding**: invite-only registration; member requests invite → admin approval → one-time link; auto Sphere connection to inviter; personal SAR wallet on registration; expire/reject invalid invites
- **User Profile & Status**: name, role, skills, bio, avatar; availability (available, busy, offline); Sphere visibility; personal wallet balance and transaction history
- **Projects**: create, edit, archive; owner and collaborators; auto project wallet (SAR); sales assignee and commission percentage; project summary with tasks and wallet balance
- **Tasks & Offers**: tasks within projects with title, description, scope, fee, deadline; offer to Sphere users; accept/reject; counter-offer negotiation (not live chat); async comments; lifecycle `draft` → `offered` → `negotiating` → `accepted` → `in_progress` → `done` → `paid`
- **Board View**: one Kanban board per project; drag-and-drop columns aligned to task lifecycle; flags/icons for related users, projects, Sphere links; filter and sort within project
- **Mind Map View**: toggle **Sphere mode** (people and invitation connections) and **Project mode** (project/task node graph); cross-entity flags on nodes
- **Wallets & Transfers**: SAR user and project wallets; project top-up; project-to-user and user-to-user transfers; transaction history; link payments to tasks (`paid` status)
- **Authentication**: invite-only email/password; Google OAuth and GitHub OAuth login; session management; password reset; all routes and API endpoints protected
- **Notifications**: in-app list (read/unread) for invites, offers, counter-offers, task status, wallet transfers, comments, GitHub activity; optional email for critical events (future)
- **Attachments**: upload/download on tasks, projects, and wallet transactions; file metadata; link to comments
- **Activity Log**: audit trail for project changes, task moves, role assignments, wallet operations; filter by project, user, or entity type
- **Negotiation History**: revision log of counter-offers (price, deadline, proposer, timestamp) per task offer
- **GitHub Integration**: single GitHub OAuth app for login and repo access; per-project board links to repos, branches, and commits; surface linkage on board cards and task details (read-focused)

## 4. Key Entities

- **User**: email, password hash, name, avatar, skills, bio, availability status, inviter reference, base role `member`, timestamps
- **UserRoleAssignment**: user, role (`admin` | `project_manager` | `sales` | `member`), scope (`global` | `project`), project reference (when project-scoped), assigned by, assigned at
- **Invitation**: inviter, invitee email, one-time token, status (`pending_approval` | `approved` | `accepted` | `rejected` | `expired`), approved by, approved at, expires at, accepted at
- **SphereConnection**: from user (inviter), to user (invitee), invitation reference, connected at
- **Project**: name, description, status (active, archived), owner, collaborators, sales assignee, commission percentage, wallet reference, timestamps
- **Task**: project, title, description, scope, assignee, fee (SAR), deadline, status (`draft` | `offered` | `negotiating` | `accepted` | `in_progress` | `done` | `paid`), board column position, created by, timestamps
- **TaskOffer**: task, offered by, offered to, proposed price, proposed deadline, status (`pending` | `accepted` | `rejected` | `superseded`), created at, resolved at
- **NegotiationHistory**: task offer, proposed by, counter price, counter deadline, revision number, created at
- **Comment**: target type (`task` | `project` | `wallet_transaction`), target id, author, text, timestamps
- **Wallet**: owner type (`user` | `project`), owner id, balance (SAR decimal), currency `SAR`, timestamps
- **WalletTransaction**: from wallet (nullable for external top-up), to wallet, amount (SAR), type (`top_up` | `project_to_user` | `user_to_user` | `commission` | `gateway_deposit`), source (`manual` | `payment_gateway`), related task, related project, initiated by, created at
- **Notification**: recipient, event type, title, message, related entity type and id, read status (`unread` | `read`), created at
- **Attachment**: target type (`task` | `project` | `wallet_transaction`), target id, file name, storage key/url, mime type, size, uploaded by, uploaded at
- **ActivityLog**: actor, action, entity type, entity id, metadata (JSON), created at
- **GitHubConnection**: user, GitHub username, encrypted access/refresh tokens, token expires at, connected at, last synced at
- **ProjectGitHubLink**: project, GitHub connection, repository full name, linked branches, linked commits, configured at, updated at

## 5. User Roles

- **Member** (all users): can view/participate in Sphere, request invitations (pending admin approval), receive/create task offers, negotiate via counter-offers and comments, transfer SAR user-to-user, connect personal GitHub, view own notifications and activity; cannot approve invitations, assign roles, manage system settings, or top up/transfer from project wallets unless also Project Manager or Admin
- **Project Manager** (per-project, Admin-assigned): can manage assigned project (tasks, board, mind map, collaborators), top up and transfer from project wallet, move board tasks, configure project GitHub links; cannot assign Project Manager role, access unassigned projects, or change global settings
- **Sales** (global, Admin-assigned): can register new projects, be assigned as sales contact, earn commission on assigned projects; cannot manage project tasks or project wallet transfers unless also Project Manager on that project; cannot assign roles or approve invitations
- **Admin** (global): full system access — approve/reject invitation requests, assign/revoke Project Manager and Sales roles, set per-project sales commission %, top up any wallet, transfer from any project wallet (including sales commission before or after project ends), manage system settings and webhooks
- **Auth**: required for all users; methods — email/password (invite-only after admin-approved invitation), Google OAuth, GitHub OAuth (single OAuth app for login and repo linking)

## 6. Integrations

- **Google OAuth**: social login and account linking for invite-only members
- **GitHub OAuth** (single app): social login plus authorized access to repos, branches, and commits for project board linking
- **Payment Gateway** (interface only, v1): pluggable provider interface; manual wallet top-up as initial implementation; future providers without changing wallet business logic
- **Cloudflare R2**: attachment storage; secure upload/download URLs via backend API (no direct client-to-R2 except presigned flows initiated by API)
- **Mailjet**: transactional email at launch — invitation emails (after admin approval), password reset, critical notification emails
- **Webhooks**: outbound events (invitation approved, task status changes, wallet transfers, project completion); admin-configurable endpoints
- **Invitation Delivery Providers** (MCP, extensible): pluggable delivery interface with MCP as initial channel; supports future providers without changing core invitation workflow

## 7. Tech & Constraints

- **Backend**: REST API; JWT session auth; OAuth2 (Google, GitHub); SAR wallet ledger with decimal precision; webhook emitter; presigned file URLs; pluggable payment and invitation-delivery provider interfaces; provider logic isolated behind interfaces
- **Frontend**: Web SPA; per-project Kanban with drag-and-drop; graph/mind-map visualization (Sphere and Project modes); in-app notifications; flags/icons for cross-entity navigation
- **DB**: Document/relational store for users, graph connections, projects, tasks, wallet transactions, audit logs, and encrypted OAuth tokens
- **Currency**: SAR (Saudi Riyal) only; fixed currency on all wallets
- **Security**: invite-only registration; admin-approved invitations; encrypted GitHub tokens; all routes authenticated; audit log for significant actions
- **i18n**: EN primary UI; additional languages and RTL TBD in profile

## 8. Business Rules

1. Every user is a `member` by default; additional roles assigned via `UserRoleAssignment`
2. Invitation requests require **Admin approval** before a one-time invite link is issued; links are single-use and expire
3. On invite acceptance, a **SphereConnection** is created between inviter and invitee; a personal SAR wallet is created on registration
4. A **project wallet** is created automatically when a project is created
5. Task negotiation uses **counter-offer fields and comments** — no live chat
6. Task lifecycle statuses: `draft` → `offered` → `negotiating` → `accepted` → `in_progress` → `done` → `paid`
7. **User → User** wallet transfers: any member may initiate
8. **External/manual top-up → Project wallet**: Admin or Project Manager on that project
9. **Project wallet → User wallet** (task payment): Admin or Project Manager on that project
10. **Project wallet → User wallet** (sales commission): Admin only; commission % set per project; payable before or after project ends
11. Board view is **per project only** — no global cross-project board
12. Mind-map has two modes: **Sphere** (network graph) and **Project** (task breakdown)
13. GitHub uses a **single OAuth application** for both authentication and repo linking
14. Payment gateway and invitation delivery must use **provider interfaces** so implementations can be swapped without changing core business logic
15. Attachments served via backend-initiated presigned R2 flows — clients do not call R2 directly

## 9. Out of Scope

1. Public/open self-registration without an approved invitation
2. Live chat or real-time messaging for task negotiation (async comments only)
3. Payment gateway deposit implementation in v1 (interface + manual top-up only)
4. Global cross-project Kanban board
5. Multi-currency wallets (SAR only)
6. Direct client-to-storage uploads bypassing the API
7. Full bidirectional GitHub sync (read-focused commit/branch display only in v1)
8. Email as the primary notification channel (in-app primary; email for critical events only)

## 10. Success Criteria

1. Members can visualize invitation-based connections in the Sphere and navigate to related people, projects, and tasks
2. Invite-only onboarding works end-to-end: request → admin approval → one-time link → registration → Sphere connection → wallet creation
3. Projects support task offers, counter-offer negotiation, board tracking, and mind-map exploration in both Sphere and Project modes
4. SAR wallet operations (top-up, project-to-user, user-to-user, commission) are recorded with full transaction history and enforce role-based transfer rules
5. Task lifecycle reaches `paid` status when linked wallet transfers complete
6. GitHub OAuth connects accounts and surfaces linked repos/branches/commits on project boards
7. Significant actions are captured in the activity log; attachments are stored and retrievable via R2
8. All authenticated users can access the system only through approved invitations and protected routes

## 11. Additional Context

- Internal community tool — not a public SaaS product
- Sales role earns commission on assigned projects; Admin configures commission percentage per project
- Future: optional email delivery for notifications; additional invitation delivery providers beyond MCP; custom payment providers plugged into the wallet interface
