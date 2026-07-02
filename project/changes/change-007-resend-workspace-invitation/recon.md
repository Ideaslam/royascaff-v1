# Recon — change-007: Resend workspace invitation

## Feature state: **partial**

| Layer | Status |
|-------|--------|
| Backend `PATCH /workspaces/:workspaceId/invitations/:invitationId/resend` | ✅ Complete |
| `WorkspaceInvitationService.resendInvite()` | ✅ Complete (Mailjet + frontend accept URL) |
| Frontend `WorkspaceService.resendInvitation()` | ❌ Missing |
| Workspace Settings — resend button in pending table | ❌ Missing |
| Onboarding wizard invite step | No resend needed (inline send only) |

## Reuse
- Reuse existing `resendInvite` service and controller endpoint — no new backend routes.

## Ripple
- `workspace-settings.page.ts/html` — add resend action
- `workspace.service.ts` — add HTTP method

## Risks
- None — workspace owner/admin guard already on endpoint.
