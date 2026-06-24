# Change Request — Resend workspace invitation

## metadata
- **change-id**: change-007
- **change-type**: modify-feature
- **target-app**: customer-portal
- **priority**: medium
- **status**: confirmed

## scope
- **affected-repos**: roya-ai-dynamo-frontend (primary), roya-ai-dynamo-api (no changes — endpoint exists)

## description
Workspace owners/admins can revoke pending invitations but cannot resend the email from the UI. Backend already supports resend; add a **Resend** button to the pending invitations table on Workspace Settings → Invitations.

## acceptance-criteria
1. Pending invitation rows show a **Resend** action (icon button with tooltip) next to Revoke.
2. Clicking Resend calls `PATCH /workspaces/:workspaceId/invitations/:invitationId/resend`.
3. Success shows a toast "Invitation resent"; button shows loading while in flight.
4. Resend is only shown for `status === 'pending'`.
5. Errors display a toast with the API message.

## notes
- Out of scope: onboarding wizard, admin panel, new backend endpoints.
