# Custom Feature Rules

Project-specific rules for Linda. Generic backend/frontend conventions remain in `engine/rules/`.

---

## RULE-001 · Invite-Only Registration

- Module: Invitations
- Feature: Invite-Only Registration
- Type: Security, Business Logic
- Must: Reject registration without valid approved one-time invite token; require admin approval before link issuance
- Provider: N/A
- Must not: Allow public self-registration; reuse consumed invite tokens

## RULE-002 · Sphere Connection on Onboarding

- Module: Invitations
- Feature: Sphere Connection on Accept
- Type: Business Logic
- Must: Create `sphereConnection` from inviter to new user on successful registration
- Provider: N/A
- Must not: Create connections without a valid accepted invitation

## RULE-003 · Wallet Creation

- Module: Invitations, Wallets
- Feature: Wallet on Registration / Create Project
- Type: Business Logic
- Must: Create personal SAR user wallet on registration; create project SAR wallet on project creation; currency fixed to `SAR`
- Provider: N/A
- Must not: Multi-currency wallets; wallets without an owner

## RULE-004 · Task Negotiation (No Live Chat)

- Module: Offers & Negotiation
- Feature: Counter-Offer
- Type: Business Logic
- Must: Negotiate via counter-offer fields (price, deadline) and async comments only; persist full negotiation history
- Provider: N/A
- Must not: Implement live chat or real-time messaging for negotiation

## RULE-005 · Task Lifecycle

- Module: Tasks
- Feature: Task Lifecycle
- Type: Business Logic
- Must: Enforce status flow `draft` → `offered` → `negotiating` → `accepted` → `in_progress` → `done` → `paid`; transition to `paid` only when linked wallet transfer completes
- Provider: N/A
- Must not: Skip lifecycle states; mark `paid` without a related transaction

## RULE-006 · Wallet Transfer Permissions

- Module: Wallets
- Feature: Project-to-User Transfer, User-to-User Transfer, Sales Commission Payout
- Type: Security, Business Logic
- Must: Enforce transfer matrix in `roles-and-authorization.md`; record immutable ledger entries
- Provider: N/A
- Must not: Allow members to top up or transfer from project wallets without PM/Admin role; allow non-admin commission payouts

## RULE-007 · Payment Gateway Isolation

- Module: Wallets
- Feature: Payment Gateway Interface
- Type: Integration
- Must: Define `PaymentProvider` interface; v1 uses `source: manual` only; all deposits through backend service
- Provider: Pluggable — `src/integrations/payment/` (manual implementation v1)
- Must not: Call payment providers from frontend; hardcode provider logic in wallet service

## RULE-008 · Attachment Storage Isolation

- Module: Attachments
- Feature: R2 Storage Integration
- Type: Integration, Storage
- Must: Upload/download via backend presigned URLs only
- Provider: Cloudflare R2 via `src/integrations/storage/`
- Must not: Direct client-to-R2 uploads except presigned flows initiated by API

## RULE-009 · Email Delivery

- Module: Notifications, Invitations, Auth
- Feature: Critical Email Delivery, Invitation Delivery
- Type: Integration
- Must: Send invitation, password reset, and critical notification emails server-side; in-app notifications remain primary channel
- Provider: Mailjet via `src/integrations/mail/`; invitation delivery via `InvitationDeliveryProvider` (MCP initial) — `src/integrations/invitations/`
- Must not: Send email from frontend; bypass admin approval before invite email

## RULE-010 · GitHub Single OAuth App

- Module: GitHub, Auth
- Feature: Social Login, Connect GitHub Account
- Type: Integration, Security
- Must: Use one GitHub OAuth application for login and repo linking; encrypt tokens at rest
- Provider: GitHub OAuth via `src/integrations/oauth/github/`
- Must not: Store plaintext tokens; create separate OAuth apps for auth vs repo access

## RULE-011 · GitHub Read-Focused v1

- Module: GitHub
- Feature: Read-Focused Sync
- Type: Integration
- Must: Display linked repos, branches, commits on board/task UI; fetch via backend using stored tokens
- Provider: GitHub API via `src/integrations/oauth/github/`
- Must not: Full bidirectional sync or write operations to GitHub in v1

## RULE-012 · Per-Project Board Only

- Module: Board
- Feature: Per-Project Kanban
- Type: Business Logic
- Must: One Kanban board per project; columns aligned to task lifecycle
- Provider: N/A
- Must not: Global cross-project board view

## RULE-013 · Webhook Isolation

- Module: Webhooks
- Feature: Event Emission
- Type: Integration, Async Job
- Must: Emit outbound webhooks asynchronously via BullMQ; admin-configured endpoints only; sign payloads
- Provider: `src/integrations/webhooks/` + BullMQ
- Must not: Call webhook URLs synchronously from request handlers; allow non-admin endpoint configuration

## RULE-014 · Activity Audit

- Module: Activity Log
- Feature: Audit Trail
- Type: Security
- Must: Log project changes, task moves, role assignments, wallet operations, GitHub connections with actor and metadata
- Provider: N/A (internal `ActivityLog` collection)
- Must not: Skip audit on admin wallet or role mutations

## RULE-015 · Third-Party Isolation (Global)

- Module: All integration modules
- Type: Security
- Must: Frontend calls Linda API only; all third-party access through `src/integrations/*` adapters
- Provider: N/A
- Must not: Call R2, Mailjet, GitHub API, or payment providers directly from `linda-web`

## RULE-016 · Role Assignment Authority

- Module: Roles
- Feature: Project Manager Assignment
- Type: Security
- Must: Only `admin` assigns `project_manager` and global `sales`/`admin` roles
- Provider: N/A
- Must not: Allow members or sales to self-assign or assign PM roles

## RULE-017 · Sales Commission

- Module: Projects, Wallets
- Feature: Sales Commission Payout
- Type: Business Logic
- Must: Store commission % on project; only admin initiates commission transfer from project wallet; payable before or after project ends
- Provider: N/A
- Must not: Auto-deduct commission without admin action in v1
