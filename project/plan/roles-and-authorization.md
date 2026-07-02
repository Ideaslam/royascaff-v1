# Roles & Authorization

## Overview

Linda uses a **two-layer role model**:

1. **System layer** — global roles stored in `userRoleAssignments` with `scope: global` (`admin`, `sales`, or implicit `member` for all users)
2. **Project layer** — project-scoped roles with `scope: project` (`project_manager` on a specific project)

Every authenticated user is a **member** by default. Additional capabilities come from role assignments. Project membership (owner, collaborator) is separate from the `project_manager` role.

---

## Authentication

| Method | Flow | Notes |
|--------|------|-------|
| Email/password | Login → JWT issued | Registration requires approved one-time invite token |
| Google OAuth | OAuth callback → link or create user → JWT | Invite token required for new accounts |
| GitHub OAuth | Single app for login + repo scope | Same invite rule for new accounts; tokens encrypted server-side |
| JWT | `Authorization: Bearer` on API; stored client-side for web | All routes protected except public auth endpoints |

**Public endpoints** (no JWT): login, register (with invite token), password reset request/confirm, OAuth callbacks.

**All other API routes** require valid JWT + role checks where applicable.

---

## System Roles (Global)

| Role | Scope | Description |
|------|-------|-------------|
| `member` | global (implicit) | Default for every user — Sphere, offers, user-to-user transfers |
| `admin` | global | Full system access |
| `sales` | global | Register projects, assigned as sales contact, earns commission |

### Member (all users)

| Can | Cannot |
|-----|--------|
| View and participate in Sphere | Approve invitations |
| Request invitations (pending admin approval) | Assign roles |
| Receive and create task offers | Manage system settings |
| Negotiate via counter-offers and comments | Top up or transfer from project wallets (unless PM/Admin) |
| Transfer SAR user-to-user | Override admin decisions |
| Connect personal GitHub | Access admin-only routes |

### Sales (global assignment)

| Can | Cannot |
|-----|--------|
| Register new projects on behalf of community | Manage project tasks (unless also PM on that project) |
| Be assigned as sales contact on projects | Transfer from project wallets (unless also PM) |
| Earn commission on assigned projects | Assign roles or approve invitations |

### Admin (global)

| Can | Cannot |
|-----|--------|
| All actions across the system | — |
| Approve/reject invitation requests | |
| Assign/revoke `sales` and `project_manager` roles | |
| Set per-project sales commission % | |
| Top up any wallet; transfer from any project wallet | |
| Manage system settings and webhook endpoints | |

---

## Project Roles (Scoped)

| Role | Scope | Assigned by |
|------|-------|-------------|
| `project_manager` | per project | Admin only |

### Project Manager (per-project)

| Can | Cannot |
|-----|--------|
| Manage assigned project (tasks, board, mind map, collaborators) | Assign `project_manager` role |
| Top up and transfer from **that project's** wallet | Access projects not assigned to them |
| Move tasks on project board | Change global system settings |
| Configure project GitHub links | |

### Project ownership (not a role assignment)

- **Owner** — user who created the project; full project edit rights on owned project
- **Collaborator** — user added to `project.collaborators`; read/participate based on task assignments
- Owner + collaborators are **project membership**, enforced separately from `UserRoleAssignment`

---

## Wallet Transfer Authorization

| Transfer type | Who can initiate |
|---------------|------------------|
| User wallet → User wallet | Any `member` |
| External/manual top-up → Project wallet | `admin` or `project_manager` on that project |
| Project wallet → User wallet (task payment) | `admin` or `project_manager` on that project |
| Project wallet → User wallet (sales commission) | `admin` only; % set per project |

---

## Invitation Authorization

| Action | Who |
|--------|-----|
| Submit invitation request | Any `member` |
| Approve/reject request | `admin` only |
| Register with invite link | Invitee (public with valid token) |

On acceptance: create `sphereConnection` (inviter → invitee) and personal SAR wallet.

---

## API Guard Model

| Guard | Applied when |
|-------|--------------|
| `JwtAuthGuard` | Global default on `/api/v1/*` except public auth routes |
| `RolesGuard` | Endpoints requiring `admin`, `sales`, or global role checks |
| `ProjectManagerGuard` | Endpoints mutating a specific project wallet, board, or PM-only settings |
| `ProjectMemberGuard` | Endpoints requiring owner, collaborator, or PM access to a project |

Decorators: `@Roles('admin')`, `@ProjectRoles('project_manager')`, `@ProjectAccess()`.

---

## Frontend Guard Model

| Guard | Route pattern |
|-------|---------------|
| `AuthGuard` | All app routes except `/auth/*` |
| `GuestGuard` | `/auth/*` — redirect to dashboard if logged in |
| `AdminGuard` | `/admin/*` |
| `ProjectManagerGuard` | Project wallet and PM settings routes |

UI hides actions the current user cannot perform (offer project wallet transfer, approve invite, etc.).

---

## Role Assignment Storage

```
userRoleAssignments
  userId → User
  role: admin | sales | project_manager | member
  scope: global | project
  projectId → Project (required when scope = project)
  assignedBy → User
  assignedAt
```

- A user may hold multiple assignments (e.g. `member` + `sales`, or `member` + `project_manager` on Project A)
- `admin` implies all permissions — no separate PM assignment required for admin override paths
