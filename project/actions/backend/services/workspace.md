## Module: Workspace

### SVC-WS · WorkspaceService [internal, application, Workspace]
Workspace lifecycle — create, read, update (name/slug), delete, switch active workspace.

**Methods:**
- `createWorkspace(userId, name): WorkspaceDto` — transactionally creates Workspace, owner membership, branding, onboarding, and idempotently provisions the workspace's sole subscription plus first exact 30-day free period; audit log; max 10 owned workspaces. Called from signup and `POST /workspaces`.
- `getWorkspace(workspaceId): WorkspaceDto` — fetch workspace
- `updateWorkspace(workspaceId, dto, userId): WorkspaceDto` — updates name/slug, audit log
- `checkSlugAvailability(slug): { available: boolean }` — DB lookup
- `switchWorkspace(userId, workspaceId): AuthResponseDto` — re-issues JWT with new workspace context, updates user.currentWorkspaceId
- `deleteWorkspace(workspaceId, userId): void` — drops all ws_{slug}_* dynamic collections, deletes workspace/memberships/invitations/branding/onboarding, audit log
- `listUserWorkspaces(userId): WorkspaceDto[]` — joins WorkspaceMembership → Workspace
- `adminListWorkspaces(paginationDto): PaginatedResponse<WorkspaceDto>` — admin-only, no workspace scoping
- `adminUpdateStatus(workspaceId, status): WorkspaceDto` — admin suspend/unsuspend, audit log

**Deps:** WorkspaceRepository · WorkspaceMembershipRepository · WorkspaceBrandingRepository · OnboardingProgressRepository · WorkspaceInvitationRepository · UserRepository · SubscriptionsService · JwtService · AuditLogService · Mongo Connection (@InjectConnection)
**Side effects:** JWT re-issue · dynamic collection drops · audit writes
**Rules:** Max 10 owned workspaces per user · Slug must be unique and available · Delete is destructive (drops all ws_{slug}_* collections)

---

### SVC-WS-MEMBER · WorkspaceMemberService [internal, application, Workspace]
Manage workspace membership list and roles.

**Methods:**
- `listMembers(workspaceId): MemberDto[]` — list workspace members
- `removeMember(workspaceId, userId, requesterId): void` — deletes WorkspaceMembership, audit log
- `changeRole(workspaceId, userId, role, requesterId): MemberDto` — updates membership role; cannot change owner's role

**Deps:** WorkspaceMembershipRepository · AuditLogService
**Side effects:** audit writes
**Rules:** Cannot change workspace owner's role

---

### SVC-WS-INVITE · WorkspaceInvitationService [internal, application, Workspace]
Create, resend, revoke, and accept workspace invitations. Sends invitation emails via MailProvider.

**Methods:**
- `invite(workspaceId, email, role, inviterId): { direct: boolean, invoiceId?: string, invitation?: InvitationDto }` — checks current period's included-user snapshot; within limit creates invitation; otherwise creates/reuses an immutable `extra_user` BillingInvoice and returns a safe invoice reference
- `resendInvite(invitationId, requesterId): void` — re-sends email
- `revokeInvite(invitationId, requesterId): void` — sets status=revoked
- `acceptInvitation(token): { workspaceId }` — validates token/expiry, creates WorkspaceMembership, sets status=accepted
- `listInvitations(workspaceId): InvitationDto[]` — list workspace invitations

**Deps:** WorkspaceInvitationRepository · WorkspaceMembershipRepository · MAIL_PROVIDER · BillingInvoiceService · ConfigService
**Side effects:** email send · payment invoice creation · membership creation
**Rules:** Included-user limit comes from current period snapshot · invoice ownership/actionability rechecked before acceptance · starting an extra-user invoice never supersedes unrelated renewal/upgrade invoices · token expiry enforced

---

### SVC-WS-BRAND · WorkspaceBrandingService [internal, application, Workspace]
Manage workspace branding: logo upload to R2, color template selection.

**Methods:**
- `uploadLogo(workspaceId, file, userId): BrandingDto` — uploads to R2 via STORAGE_PROVIDER, deletes previous logo if exists, updates WorkspaceBranding
- `selectColorTemplate(workspaceId, colorTemplateId, userId): BrandingDto` — validates template exists + is active, updates WorkspaceBranding
- `getBranding(workspaceId): BrandingDto` — fetch branding
- `deleteLogo(workspaceId, userId): BrandingDto` — deletes from R2, clears logoUrl

**Deps:** WorkspaceBrandingRepository · STORAGE_PROVIDER · ColorTemplateRepository
**Side effects:** R2 upload/delete
**Rules:** Previous logo deleted on re-upload · Color template must exist and be active

---

### SVC-WS-ONBOARD · OnboardingService [internal, application, Workspace]
Read and update the onboarding progress record.

**Methods:**
- `getProgress(workspaceId): OnboardingProgressDto` — fetch onboarding progress
- `updateProgress(workspaceId, dto): OnboardingProgressDto` — partial update of step flags

**Deps:** OnboardingProgressRepository
**Side effects:** DB writes
**Rules:** Partial update only (merges step flags)
