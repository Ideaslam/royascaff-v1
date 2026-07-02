## Module: Workspace

`@Controller('workspaces')` · Onboarding routes under `@Controller('onboarding')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-WS-01 | POST | /api/v1/workspaces | JWT | `{ name }` | 201 `WorkspaceDto` | SVC-WS.create() | Max 10 owned workspaces |
| EP-WS-02 | GET | /api/v1/workspaces/me | JWT | none | 200 `WorkspaceDto[]` | SVC-WS.listMine() | |
| EP-WS-03 | GET | /api/v1/workspaces/slug-availability | JWT | query: slug | 200 `{ available }` | SVC-WS.checkSlug() | |
| EP-WS-04 | GET | /api/v1/workspaces/:id | JWT+WS-member | `:id` param | 200 `WorkspaceDto` | SVC-WS.getById() | |
| EP-WS-05 | PATCH | /api/v1/workspaces/:id | JWT+WS-role | `:id` · `{ name?, slug? }` | 200 `WorkspaceDto` | SVC-WS.update() | Owner or admin |
| EP-WS-06 | DELETE | /api/v1/workspaces/:id | JWT+WS-role | `:id` · `{ confirmName }` | 204 | SVC-WS.delete() | Owner only; confirmName must match |
| EP-WS-07 | POST | /api/v1/workspaces/switch | JWT | `{ workspaceId }` | 200 `AuthResponseDto` | SVC-WS.switch() | Re-issues tokens with new WS context |
| EP-WS-08 | GET | /api/v1/workspaces/:id/members | JWT+WS-member | `:id` param | 200 `MemberDto[]` | SVC-WS.listMembers() | |
| EP-WS-09 | DELETE | /api/v1/workspaces/:id/members/:userId | JWT+WS-role | `:id`, `:userId` params | 204 | SVC-WS.removeMember() | Owner or admin |
| EP-WS-10 | PATCH | /api/v1/workspaces/:id/members/:userId/role | JWT+WS-role | `:id`, `:userId` · `{ role: WorkspaceRole }` | 200 `MemberDto` | SVC-WS.changeMemberRole() | Owner or admin |
| EP-WS-11 | POST | /api/v1/workspaces/:id/invite | JWT+WS-role | `:id` · `{ email, role: WorkspaceRole }` | 200 `{ direct, paymentId?, invitation? }` | SVC-WS.invite() | |
| EP-WS-12 | GET | /api/v1/workspaces/:id/invitations | JWT+WS-member | `:id` param | 200 `InvitationDto[]` | SVC-WS.listInvitations() | |
| EP-WS-13 | POST | /api/v1/workspaces/invitations/:invitationId/resend | JWT+WS-role | `:invitationId` param | 200 `{ message }` | SVC-WS.resendInvitation() | Owner or admin |
| EP-WS-14 | DELETE | /api/v1/workspaces/invitations/:invitationId | JWT+WS-role | `:invitationId` param | 204 | SVC-WS.revokeInvitation() | Owner or admin |
| EP-WS-15 | GET | /api/v1/workspaces/invitation/accept | public | query: token | 200 `{ workspaceId, workspaceName }` | SVC-WS.acceptInvitation() | Creates WorkspaceMembership |
| EP-WS-16 | GET | /api/v1/workspaces/:id/branding | JWT+WS-member | `:id` param | 200 `BrandingDto` | SVC-WS.getBranding() | |
| EP-WS-17 | POST | /api/v1/workspaces/:id/branding/logo | JWT+WS-role | `:id` · `multipart/form-data` file | 200 `BrandingDto` | SVC-WS.uploadLogo() | Uploads to R2 |
| EP-WS-18 | DELETE | /api/v1/workspaces/:id/branding/logo | JWT+WS-role | `:id` param | 200 `BrandingDto` | SVC-WS.deleteLogo() | |
| EP-WS-19 | PATCH | /api/v1/workspaces/:id/branding/color-template | JWT+WS-role | `:id` · `{ colorTemplateId }` | 200 `BrandingDto` | SVC-WS.selectColorTemplate() | |
| EP-WS-20 | GET | /api/v1/onboarding/progress | JWT | none | 200 `OnboardingProgressDto` | SVC-WS.getOnboardingProgress() | Active workspace context |
| EP-WS-21 | PATCH | /api/v1/onboarding/progress | JWT | `{ workspaceCreated?, brandingDone?, invitesDone?, experimentDone? }` | 200 `OnboardingProgressDto` | SVC-WS.updateOnboardingProgress() | |

**Notes:**
- [EP-WS-06] Workspace-owner only (not admin). Body `confirmName` must match the workspace name exactly.
- [EP-WS-07] Switches active workspace. Re-issues JWT tokens with new workspace context (workspaceSlug). Returns `AuthResponseDto` with new tokens + updated user.
- [EP-WS-11] Checks free user limits. Within limit → creates invitation as `pending`, sends email. Limit reached → creates invitation as `pending-payment`, generates PayUp payment, returns checkout info (`paymentId`).
- [EP-WS-15] Public endpoint. Accepts invitation token, creates WorkspaceMembership. Redirects to portal login (or dashboard if already authenticated).
