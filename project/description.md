# Product Description

## 1. Product Summary

### What is this product?

**Brief description (1-2 sentences):**

Team Circle Tracking is an internal tool for the developer community to manage teams and projects through visual mind-map and board spaces. It shows connections between collaborators (developers, designers, photographers, and other remote workers), tracks status, assigns tasks, negotiates task offers, and records task-fee payments as wallet transactions.

**Product type:**

Internal tool for a developer community (not a public SaaS product).

**Target audience:**

All community members who work remotely on a laptop — primarily developers, designers, and photographers, plus any other remote collaborators invited into the network.

---

## 2. Primary User and Workflow

### Who is the primary user?

A **remote collaborator** (developer, designer, photographer, or similar laptop-based worker) who:

- Joins the community via **invitation** from an existing member
- Connects to the inviter in the **Sphere** — the product's network graph of people and relationships
- Maintains a **status** and profile that affects task visibility and offers
- **Receives** task offers from others or **creates projects** and offers tasks to people in the Sphere
- **Accepts, rejects, or negotiates** task offers (fee, scope, timeline)
- Manages work through separate **mind-map** and **board** views
- Holds a personal **wallet** and participates in project-level wallet funding and transfers

### What is the core workflow?

Describe the primary user journey from start to finish:

1. An existing member **invites** a new user into the system
2. The new user **registers**; a personal wallet is created automatically; they connect to the inviter in the **Sphere**
3. The user sets or updates their **status**, skills, and visibility in the network
4. The user either:
   - **Receives** a task offer from someone in their Sphere, or
   - **Creates a new project** (which creates a project wallet) and **offers tasks** to others
5. The task offer is **negotiated** (fee, scope, timeline) until accepted or rejected
6. Accepted work is tracked on **board** and **mind-map** views (separate views; flags/icons surface related people, projects, or tasks)
7. When work completes, the **project owner** funds the project wallet (top-up) and **transfers credits** from the project wallet to the assignee's user wallet; users may also **transfer credits** directly to other users

### What is the desired outcome?

Collaborators can see who is connected to whom in the Sphere, manage projects and tasks visually across dedicated board and mind-map spaces, negotiate and track work to completion, and settle task fees through wallet top-ups and transfers between project wallets and user wallets.

---

## 3. Core Features

### Feature 1: Sphere (Network Graph)

**Description:**

The Sphere is the product's primary network view — a visual graph showing people and invitation-based connections between community members.

**Key capabilities:**

- Display users as nodes and invitation links as edges in the Sphere
- Explore who invited whom and how members are connected
- Surface user status, role, and availability via flags/icons on nodes
- Navigate from the Sphere to a user's profile, projects, or tasks

### Feature 2: Invitation & Onboarding

**Description:**

Invite-only registration ensures every new member enters through an existing community member and is immediately linked in the Sphere.

**Key capabilities:**

- Existing members send invitations (email or invite link) — **requires admin approval** before the invite is sent
- Invited users register and automatically connect to their inviter in the Sphere
- Create a personal wallet (SAR) on user registration
- One-time invite links; reject or expire invalid or unused invitations

### Feature 3: User Profile & Status

**Description:**

Each member maintains a profile and status that drives discoverability and task matching within the Sphere.

**Key capabilities:**

- Edit profile (name, role, skills, bio, avatar)
- Set availability/status (e.g. available, busy, offline)
- Control visibility within the Sphere network
- View personal wallet balance and transaction history

### Feature 4: Projects

**Description:**

Members create and manage projects as containers for tasks, collaborators, and project-level funding.

**Key capabilities:**

- Create, edit, and archive projects
- Assign a project owner and add collaborators
- Automatically create a project wallet (SAR) when a project is created
- View project summary, linked tasks, and wallet balance

### Feature 5: Tasks & Offers

**Description:**

Tasks are units of work within projects. Members can offer tasks to others, negotiate terms, and track tasks through a defined lifecycle.

**Key capabilities:**

- Create tasks within a project (title, description, scope, initial fee, deadline)
- Send task offers to users in the Sphere
- Accept or reject offers
- Negotiate via **counter-offer fields** (price, deadline) — not a live chat
- Add **comments** on tasks/offers for async discussion during negotiation and execution
- Task lifecycle statuses: `draft` → `offered` → `negotiating` → `accepted` → `in_progress` → `done` → `paid`

### Feature 6: Board View

**Description:**

A per-project Kanban board for tracking task progress through workflow columns.

**Key capabilities:**

- One board per project (not a global cross-project board)
- Drag-and-drop tasks across status columns aligned with the task lifecycle
- Show flags/icons linking to related users, projects, or Sphere connections
- Filter and sort tasks within the project board

### Feature 7: Mind Map View

**Description:**

A visual mind-map with two toggle modes for exploring relationships and project structure.

**Key capabilities:**

- **Sphere mode:** people and invitation-based connections in the network graph
- **Project mode:** project breakdown with tasks as nodes and relationships between them
- Toggle between Sphere and Project modes in the same mind-map interface
- Flags/icons on nodes to surface cross-entity information (user status, task state, wallet indicators)

### Feature 8: Wallets & Transfers

**Description:**

Real-money wallet system denominated in **SAR (Saudi Riyal)** for funding projects and paying collaborators.

**Key capabilities:**

- Personal user wallet created on registration
- Project wallet created on project creation
- Project owner can top up the project wallet
- Transfer funds from project wallet to user wallets (e.g. on task completion)
- User-to-user transfers between personal wallets
- Transaction history and balance tracking per wallet
- Link payments to tasks (transition to `paid` status after transfer)

### Feature 9: Authentication

**Description:**

Secure login and session management for invite-only community members.

**Key capabilities:**

- Email/password registration (via approved invitation only)
- Social login via **Google OAuth** and **GitHub OAuth** (in addition to email/password)
- Login, logout, and session management
- Password reset flow
- Protect all routes and API endpoints behind authentication

### Feature 10: Notifications

**Description:**

In-app notifications alert members to important events across invitations, tasks, negotiations, payments, and GitHub activity.

**Key capabilities:**

- Notification events for invites, offers, counter-offers, task status changes, wallet transfers, and comments
- In-app notification list with read/unread state
- Optional email delivery for critical events (future)

### Feature 11: Attachments

**Description:**

Members can attach files to support task work, project documentation, and financial records.

**Key capabilities:**

- Upload and download attachments on tasks, projects, and wallet transactions
- Track file metadata (name, size, uploader, timestamp)
- Link attachments to comments where relevant

### Feature 12: Activity Log

**Description:**

An audit trail records significant actions across the system for transparency and debugging.

**Key capabilities:**

- Log user actions (project changes, task moves, role assignments, wallet operations)
- Associate log entries with the acting user, target entity, and timestamp
- Filter activity by project, user, or entity type

### Feature 13: Negotiation History

**Description:**

A dedicated history of counter-offers preserves the full negotiation record for each task offer.

**Key capabilities:**

- Store each counter-offer revision (price, deadline, proposed by, timestamp)
- Link negotiation entries to the parent task offer
- Display history alongside comments during negotiation

### Feature 14: GitHub Integration

**Description:**

Each project task board can connect to GitHub via OAuth2 to link repositories, branches, and commits to project work.

**Key capabilities:**

- Connect GitHub account via OAuth2 in user/project settings
- Per project board: select linked GitHub repos, branches, and commits
- Surface GitHub linkage on board cards and task details via flags/icons
- Sync or display commit/branch references on tasks (read-focused integration)

---

## 4. Key Entities and Data

### Entity 1: User

**Description:**

A community member who can hold multiple roles and participate in the Sphere, projects, tasks, and wallets.

**Key fields:**

- email (unique), password hash, name, avatar
- skills, bio, availability status (available, busy, offline)
- inviter reference (who invited this user)
- base role: all users are `member`
- created at, updated at

### Entity 2: UserRoleAssignment

**Description:**

Assigns additional roles to users. Every user is a `member`; other roles are granted per user or per project.

**Key fields:**

- user reference
- role: `admin` | `project_manager` | `sales` | `member`
- scope: `global` (admin, sales) or `project` (project_manager on a specific project)
- project reference (required when role is project-scoped)
- assigned by, assigned at

### Entity 3: Invitation

**Description:**

A one-time invite link sent by an existing member to onboard a new user.

**Key fields:**

- inviter (user reference)
- invitee email
- one-time token (single use, issued after admin approval)
- status: `pending_approval` | `approved` | `accepted` | `rejected` | `expired`
- approved by (admin user reference), approved at
- expires at, accepted at

### Entity 4: SphereConnection

**Description:**

An edge in the Sphere graph representing an invitation-based link between two users.

**Key fields:**

- from user (inviter)
- to user (invitee)
- invitation reference
- connected at

### Entity 5: Project

**Description:**

A container for tasks, collaborators, project wallet, and board/mind-map views.

**Key fields:**

- name, description, status (active, archived)
- owner (user reference)
- collaborators (user references)
- sales assignee (user with `sales` role — earns commission on registration)
- commission percentage (set by admin per project; % of project wallet releases)
- wallet reference
- created at, updated at

### Entity 6: Task

**Description:**

A unit of work within a project with a single assignee and a defined lifecycle.

**Key fields:**

- project reference
- title, description, scope
- assignee (one user reference)
- fee (SAR), deadline
- status: `draft` | `offered` | `negotiating` | `accepted` | `in_progress` | `done` | `paid`
- board column position (for Kanban ordering)
- created by, created at, updated at

### Entity 7: TaskOffer

**Description:**

An offer to assign a task to a specific user, initiating negotiation.

**Key fields:**

- task reference
- offered by (user reference)
- offered to (user reference)
- proposed price (SAR), proposed deadline
- status: `pending` | `accepted` | `rejected` | `superseded`
- created at, resolved at

### Entity 8: NegotiationHistory

**Description:**

A revision record for each counter-offer during task negotiation.

**Key fields:**

- task offer reference
- proposed by (user reference)
- counter price (SAR), counter deadline
- revision number
- created at

### Entity 9: Comment

**Description:**

Async comments on tasks, projects, and wallet transactions.

**Key fields:**

- target type: `task` | `project` | `wallet_transaction`
- target id (reference to the parent entity)
- author (user reference)
- text content
- created at, updated at

### Entity 10: Wallet

**Description:**

A SAR-denominated balance container owned by either a user or a project.

**Key fields:**

- owner type: `user` | `project`
- owner id (reference)
- balance (SAR, decimal)
- currency: `SAR` (fixed)
- created at, updated at

### Entity 11: WalletTransaction

**Description:**

A record of money movement between wallets, including manual top-ups and future payment-gateway deposits.

**Key fields:**

- from wallet reference (nullable for external top-up)
- to wallet reference
- amount (SAR)
- type: `top_up` | `project_to_user` | `user_to_user` | `commission` | `gateway_deposit`
- source: `manual` | `payment_gateway`
- related task reference (optional — links payment to task `paid` status)
- related project reference (optional)
- initiated by (user reference)
- created at

### Entity 12: Notification

**Description:**

An in-app notification delivered to a user for a system event.

**Key fields:**

- recipient (user reference)
- event type (e.g. `invite_sent`, `offer_received`, `counter_offer`, `task_status_changed`, `wallet_transfer`, `comment_added`, `github_linked`)
- title, message
- related entity type and id
- read status: `unread` | `read`
- created at

### Entity 13: Attachment

**Description:**

A file attached to a task, project, or wallet transaction.

**Key fields:**

- target type: `task` | `project` | `wallet_transaction`
- target id
- file name, file url/storage key, mime type, size
- uploaded by (user reference)
- uploaded at

### Entity 14: ActivityLog

**Description:**

An audit log entry for significant system actions.

**Key fields:**

- actor (user reference)
- action (e.g. `project_created`, `task_moved`, `role_assigned`, `wallet_transfer`, `github_connected`)
- entity type, entity id
- metadata (JSON snapshot of change details)
- created at

### Entity 15: GitHubConnection

**Description:**

A user's OAuth2 connection to GitHub, configured in settings.

**Key fields:**

- user reference
- GitHub username, access token (encrypted), refresh token
- token expires at
- connected at, last synced at

### Entity 16: ProjectGitHubLink

**Description:**

Links a project's task board to specific GitHub repositories, branches, and commits.

**Key fields:**

- project reference
- GitHub connection reference (user who authorized)
- repository full name (e.g. `org/repo`)
- linked branches (array of branch names)
- linked commits (array of commit SHAs or refs)
- configured at, updated at

---

## 5. User Roles and Permissions

### What user roles exist?

Every user is a **Member** by default. Additional roles are assigned on top of membership. A user may hold multiple roles simultaneously (e.g. Member + Sales, or Member + Project Manager on specific projects).

**Role 1: Member** (all users)

- Can: view and participate in the Sphere; request invitations (pending admin approval); receive and create task offers; negotiate via counter-offers and comments; transfer SAR from personal wallet to any other user; connect personal GitHub via OAuth2; view own notifications and activity
- Cannot: approve invitations; assign roles; manage system settings; top up or transfer from project wallets (unless also Project Manager or Admin)

**Role 2: Project Manager** (per-project assignment by Admin only)

- Can: manage assigned project (tasks, board, mind map, collaborators); top up and transfer funds from the **project wallet** to user wallets; move tasks on the project board; configure project GitHub links
- Cannot: assign Project Manager role (Admin only); access projects not assigned to them; change global system settings; override Admin decisions

**Role 3: Sales** (global assignment by Admin)

- Can: register new projects on behalf of the community; be assigned as sales contact on projects; earn commission on assigned projects
- Cannot: manage project tasks or project wallet transfers (unless also Project Manager on that project); assign roles; approve invitations

**Role 4: Admin** (global — super permission)

- Can: all actions across the system; approve or reject member invitation requests; assign and revoke Project Manager and Sales roles; set per-project sales commission percentage; top up any wallet; transfer funds from any project wallet (including sales commission payouts before or after project ends); manage system settings
- Cannot: N/A (full system access)

### Wallet transfer rules

| Transfer type | Who can initiate |
|---------------|------------------|
| User wallet → User wallet | Any member |
| External/manual top-up → Project wallet | Admin or Project Manager (on their project) |
| Project wallet → User wallet (task payment, developer payout) | Admin or Project Manager (on their project) |
| Project wallet → User wallet (sales commission) | Admin only; percentage set per project; payable before or after project ends |

### Invitation rules

- Any **Member** may submit an invitation request for a new user
- **Admin** must approve the request before a one-time invite link is issued
- On acceptance, the new user connects to the inviter in the Sphere

### Does the product require authentication?

**Yes.** Authentication is required for all users.

**Auth methods:**

- Email and password (invite-only registration after admin-approved invitation)
- Google OAuth (social login)
- GitHub OAuth (social login and repo access — **single GitHub OAuth app**)

---

## 6. Integrations and External Services

### Does the product integrate with external services or APIs?

**Yes.** The system integrates with several third-party services. Provider-specific logic must be isolated behind interfaces so implementations can be swapped or extended without changing business logic.

**Integration 1: Google OAuth**

- Purpose: Social login and account linking
- Usage: Allow users to register (via approved invitation) or log in with Google; link Google identity to user profile

**Integration 2: GitHub OAuth (single app)**

- Purpose: Social login and GitHub project/board linking
- Usage: One GitHub OAuth application handles both authentication (login/signup) and authorized access to repositories, branches, and commits for project board linking

**Integration 3: Payment Gateway (interface only — v1)**

- Purpose: Future wallet top-ups via external payment providers
- Usage: Define a **payment provider interface** in v1; use manual wallet top-up as the initial implementation; custom payment providers will be plugged in later without changing wallet business logic

**Integration 4: Cloudflare R2**

- Purpose: File storage for attachments
- Usage: Store and serve files attached to tasks, projects, and wallet transactions; generate secure upload/download URLs via backend (no direct client-to-R2 calls except presigned flows initiated by the API)

**Integration 5: Mailjet**

- Purpose: Transactional email (required at launch)
- Usage: Send invitation emails (after admin approval), password reset emails, and critical notification emails; in-app notifications remain the primary real-time channel

**Integration 6: Webhooks**

- Purpose: Outbound event notifications to external systems
- Usage: Emit webhook events for key actions (invitation approved, task status changes, wallet transfers, project completion); configurable webhook endpoints (admin-managed)

**Integration 7: Invitation Delivery Providers (MCP — extensible)**

- Purpose: Scalable, pluggable channels for sending and managing invitations
- Usage: Build an **invitation delivery provider interface** with MCP as the initial channel; architecture must support adding new providers in the future without changing core invitation workflow (admin approval → deliver invite → track acceptance)

---
