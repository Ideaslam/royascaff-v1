# Services — Invitations

## Module: Invitations

### SVC-006 · InvitationsService [domain, internal, Invitations]

- Methods:
  - `requestInvitation(userId, dto): Invitation` — create `pending_approval` record
  - `listPending(query): PaginatedResponse` — admin queue
  - `listMine(userId, query): PaginatedResponse` — inviter's requests
  - `approve(adminId, id): Invitation` — set approved, generate token, set expiry, trigger delivery
  - `reject(adminId, id): Invitation`
  - `consumeToken(token, userId): Invitation` — mark accepted; used by AuthService.register
  - `expireStale(): number` — cron: expire unused approved invites
- Deps: `InvitationsRepository`, `InvitationDeliveryProvider`, `NotificationsService`, `ActivityLogService`
- Side effects: email/invite delivery on approve; notification to inviter
- Rules: RULE-001, RULE-002, RULE-009

### SVC-007 · SphereConnectionService [domain, internal, Invitations]

- Methods:
  - `createFromInvitation(invitation, inviteeUserId): SphereConnection`
  - `listForUser(userId): SphereConnection[]`
- Deps: `SphereConnectionsRepository`
- Side effects: none
- Rules: RULE-002 one connection per accepted invitation

### SVC-008 · InvitationDeliveryProvider [integration, external, Invitations]

- Methods:
  - `sendApprovedInvite(invitation, inviteUrl): DeliveryResult`
- Deps: MCP adapter (initial), env config
- Side effects: outbound invite message
- Rules: RULE-009 pluggable interface; MCP initial implementation
