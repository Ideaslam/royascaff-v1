# Pages — Invitations

## Module: Invitations

### Request Invitation Page

- Route: `/invitations/request`
- Status: partial
- Components: `RequestInvitationFormComponent`, `MyInvitationsTableComponent`
- Service: `InvitationsApiService` → EP-013 (POST), EP-014 (GET mine)
- Guard: `AuthGuard`
- UI states: pending approval badge; success toast on submit
- Notes: member submits email for admin approval

### Admin Invitation Queue Page

- Route: `/admin/invitations`
- Status: partial
- Components: `InvitationQueueTableComponent`, `ApproveRejectDialogComponent`
- Service: `InvitationsApiService` → EP-015, EP-016, EP-017
- Guard: `AdminGuard`
- UI states: empty queue message; paginated table
- Notes: approve triggers invite delivery (email/MCP)
