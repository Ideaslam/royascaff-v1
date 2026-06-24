# Change Request

## Metadata

- **date**: 2026-06-23
- **change-type**: general
- **target-app**: all-apps
- **affected-repos**: all
- **priority**: high

---

## Scope

- **App(s)**: backend, customer-portal, admin-panel
- **Module(s)**: New — Workspace, Onboarding; Modified — Auth, Subscriptions, Payments, Data (CSV Management), Dashboards, AI Processing, Background Jobs
- **Feature(s)**: Workspace creation on registration, workspace slug management, workspace membership + roles, workspace invitation flow, multi-workspace switching, data isolation (workspace-scoped collections), subscription billing per-workspace, workspace branding + color templates, 4-step onboarding wizard, admin workspace management, admin color-template management
- **New entities**: Workspace, WorkspaceMembership, WorkspaceInvitation, WorkspaceBranding, ColorTemplate, OnboardingProgress
- **Modified entities**: User (+currentWorkspaceId), UserSubscription (userId → workspaceId), Payment (+workspaceId), CsvFile/Dashboard/ColumnMetadata/ChartWidget/ChartDataCache/DashboardDatasource (workspace-prefixed dynamic collections)
- **New endpoints**: workspace CRUD, slug availability check, member management, invitation accept, workspace switch, onboarding progress, color template CRUD
- **Modified endpoints**: POST /auth/register (auto-create workspace + onboarding), POST /subscriptions/subscribe (per-workspace)
- **New pages**: customer-portal /onboarding (4-step wizard), workspace settings, members & invitations, branding settings; admin-panel /app/workspaces, /app/color-templates

---

## Description

### Core — Workspace Module (multi-tenancy)

Every company is a **Workspace**. One NestJS deployment serves all workspaces.

**Workspace entity:**
- `slug` — auto-generated `{word}-{word}-{4digits}` (e.g. `horizon-data-4821`), user-editable with availability check, unique index
- `name` — human-readable display name
- `ownerId` — user who created it
- `status` — `active` | `suspended` | `deleted`

**Registration flow change:** `POST /auth/register` auto-creates a workspace owned by the new user, creates a `WorkspaceMembership` with `role: workspace-owner`, creates an `OnboardingProgress` record at step 1, and returns `{ redirectTo: '/onboarding' }` in the auth response so the portal redirects to the onboarding wizard.

**Multi-workspace:** A user can belong to multiple workspaces. `User.currentWorkspaceId` tracks the active context. JWT payload carries `currentWorkspaceId`. `POST /workspaces/switch` re-issues tokens with the new workspace context.

**Workspace roles** (new, workspace-level — coexist with system `admin/editor/viewer`):

| Role | Permissions |
|------|------------|
| `workspace-owner` | Full control — settings, billing, delete workspace, transfer ownership |
| `workspace-admin` | Invite/remove members, manage branding + settings |
| `workspace-member` | Use platform features (upload, dashboards) |

System `admin` role is unchanged — cross-workspace super-admin access.

---

### Data Isolation — Hybrid Model

**Option B (workspace-prefixed dynamic collections)** for data-intensive collections only:

| Dynamic collection pattern | Content |
|---------------------------|---------|
| `ws_{slug}_csvfiles` | CSV file records |
| `ws_{slug}_column_metadata` | Column metadata |
| `ws_{slug}_dashboards` | Dashboards |
| `ws_{slug}_chart_widgets` | Chart widgets |
| `ws_{slug}_chart_data_cache` | Chart data cache |
| `ws_{slug}_dashboard_datasources` | Dashboard ↔ file links |

All repositories and services that access these collections receive `workspaceSlug` from the request context (extracted from the JWT's `currentWorkspaceId` → workspace slug lookup). The `WorkspaceContextService` provides the active slug to all services via DI.

**Option A (workspaceId field + index)** for shared collections:

| Collection | Change |
|-----------|--------|
| `users` | Add `currentWorkspaceId` (ref to Workspace) |
| `user_subscriptions` | Replace `userId` with `workspaceId` — billing per-workspace |
| `payments` | Add `workspaceId` |
| `audit_logs` | Add `workspaceId` (optional — for workspace-scoped audit queries) |

Admin panel queries for audit, payments, subscriptions, and settings remain cross-workspace (no automatic scoping).

---

### Subscription Billing — Per-Workspace

`UserSubscription.workspaceId` replaces `userId` as the primary billing key. The workspace owner initiates the PayUp checkout. Only workspace owners can trigger `POST /subscriptions/subscribe`. The existing PayUp checkout flow is reused — only the subscription record binding changes.

---

### Branding and Color Templates

- **Logo**: workspace owner uploads via `POST /workspaces/branding/logo` → stored in R2, URL saved on `WorkspaceBranding`.
- **Color templates**: predefined palettes managed by super-admin in the admin panel. Each palette: `name`, `primary`, `secondary`, `accent`, `chartColors[5]`, `isActive`.
- A workspace selects one template (stored on `WorkspaceBranding.colorTemplateId`). Applied to chart widget renders and exports — the 5 chart colors replace the default Chart.js color cycle. System alert/warning/danger colors are never overridden.

---

### Onboarding Wizard — `/onboarding` (customer-portal)

Dedicated full-page route. DB-tracked via `OnboardingProgress`. If `OnboardingProgress.workspaceCreated === false`, every authenticated portal route redirects to `/onboarding`.

**Layout** (reference: Cisco-style wizard screenshot):
- Two-column layout: left = form content, right = step illustration + contextual description
- Top: numbered step progress indicator (circles + connecting lines)
- Bottom: Back / Skip / Continue buttons
- Brand: `#5922ea` primary, `#ff6043` accent, white background

**Steps:**

| # | Name | Mandatory | Content |
|---|------|-----------|---------|
| 1 | Create Workspace | Yes | Workspace name (required). Slug auto-generated (shown, editable + availability check inline). |
| 2 | Branding | No (skip) | Upload logo (optional). Select a color template from palette cards. |
| 3 | Invite Team | No (skip) | Add email + assign role (workspace-admin / workspace-member). Add multiple. Sends invite emails on Continue. |
| 4 | Try It Out | No (skip) | Tips with action links: "Upload a file" → /data/upload, "Create a dashboard" → /dashboards/create. Sample CSV available as a button. |

After Step 1 completes, the wizard can be dismissed. Each optional feature remains accessible: branding → Workspace Settings, invitations → Members & Invitations page, onboarding experiment → normal portal pages.

---

### Admin Panel Additions

1. **Workspaces page** (`/app/workspaces`): paginated list, columns: Name, Slug, Owner, Members, Plan, Status, Created. Actions: view, suspend, delete.
2. **Color Templates page** (`/app/color-templates`): CRUD for palettes. Fields: name, primary, secondary, accent, chart colors 1–5, isActive toggle. Live preview swatch.

---

### Customer Portal Additions (settings area)

1. **Workspace Settings** — name, slug (editable + check), logo upload, color template selection, danger zone (delete workspace with confirmation).
2. **Members & Invitations** — list members + roles, invite by email, remove members, resend invite.
3. **Workspace Switcher** — dropdown in the top navigation showing all workspaces the user belongs to + "Create new workspace" link.

---

## Acceptance Criteria

1. `POST /auth/register` creates the user, auto-creates a workspace, creates `WorkspaceMembership` with `workspace-owner` role, creates `OnboardingProgress`, and returns `redirectTo: '/onboarding'` in the response.
2. Customer portal redirects to `/onboarding` on any route if the workspace has not been created (step 1 incomplete). Once step 1 is done, all routes are accessible.
3. The workspace slug is auto-generated as `{word}-{word}-{4digits}`, unique. `GET /workspaces/slug-availability?slug=x` returns `{ available: boolean }`. The user can update their slug via `PATCH /workspaces/:id` if the new value is available.
4. JWT payload carries `{ sub, email, role, currentWorkspaceId, workspaceSlug, workspaceRole }`. `POST /workspaces/switch` accepts `{ workspaceId }` and re-issues tokens scoped to the new workspace.
5. All data queries for CSV files, dashboards, widgets, and column metadata automatically use workspace-prefixed collection names derived from `workspaceSlug` in the JWT.
6. Subscriptions and payments carry `workspaceId`. Only `workspace-owner` role can initiate a subscription checkout. The existing PayUp checkout flow works with workspace billing.
7. `POST /workspaces/invite` sends an invitation email with an accept link. `GET /workspaces/invitation/accept?token=x` registers the invitee into the workspace with the assigned role. If the invitee is not yet registered, they must register first (linked to the invitation token), and they are added to the workspace as a member — not as the workspace owner of a new workspace.
8. A user can belong to multiple workspaces. The workspace switcher in the customer portal header shows all workspaces and allows switching. Switching re-issues tokens and scopes all subsequent data queries to the new workspace.
9. Workspace deletion (owner-only) deletes all workspace-prefixed collections, all memberships, all invitations, the branding record, and the workspace document. A typed-name confirmation dialog is required before deletion.
10. The onboarding wizard at `/onboarding` has 4 steps with a two-column layout. Step 1 is mandatory; Steps 2–4 have a working Skip button.
11. Color templates are managed by super-admin at `/app/color-templates`. A workspace's selected palette replaces the default Chart.js color cycle for widget renders and exports. System alert/danger/warning colors are unaffected.
12. Admin panel `/app/workspaces` lists all workspaces with name, slug, owner, member count, subscription plan, and status. Admin can suspend or delete a workspace.
13. Sample CSVs are seeded at startup (`SampleCsvSeeder`). During onboarding step 4, a "Use sample CSV" button creates a CSV file record in the workspace and navigates to the column definition page.

---

## Notes

- No data migration. All collections are dropped and recreated with the new schema.
- System super-admin (`role: admin`) bypasses workspace scoping entirely in the admin panel.
- The `WorkspaceContextService` is a request-scoped provider that resolves `workspaceSlug` from the JWT for every guarded request. Repositories inject it to build dynamic collection names.
- Workspace roles are stored on `WorkspaceMembership`, not on the `User` document. JWT carries both the system role and the workspace role for the active workspace.
- Invite emails use the existing `MAIL_PROVIDER` (Mailjet).
- The existing onboarding wizard is one-time only. Re-entry is blocked; settings pages serve as the persistent management surface.
- Reference screenshot provided (Cisco-style wizard): two-column, numbered steps, right-side illustration panel.
