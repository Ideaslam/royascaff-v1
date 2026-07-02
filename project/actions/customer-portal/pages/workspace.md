## Module: Workspace & Onboarding

### Onboarding Wizard Page
- Route: `/onboarding`
- Components: OnboardingPage (two-column Cisco-style wizard with step progress indicator — Left: step form, Right: illustration + description, Bottom: Back/Skip/Continue)
- Service: WorkspaceService.createWorkspace(); WorkspaceService.updateOnboardingProgress() → `PATCH /api/v1/onboarding/progress`; WorkspaceService.uploadLogo(); WorkspaceService.selectColorTemplate(); WorkspaceMembersService.invite() → `POST /api/v1/workspaces/:id/invitations`
- Guard: authGuard (not onboardingGuard — this IS the onboarding page)
- Notes: Full-page layout (no AppShell). Step 1: Create Workspace (mandatory) — name + auto-generated slug with inline availability check (debounced 400ms). Step 2: Branding (optional) — logo upload + color template picker with palette cards. Step 3: Invite Team (optional) — email + role, "Add another" list. Step 4: Try It Out (optional) — tips with links to upload/sample CSV/create dashboard. Brand colors: `#5922ea` primary, `#ff6043` accent.

### Workspace Settings Page
- Route: `/app/settings/workspace`
- Components: WorkspaceSettingsPage (workspace name field, slug field with inline availability check, save button, Danger Zone with "Delete Workspace" confirmation dialog requiring typed workspace name)
- Service: WorkspaceService.updateWorkspace() → `PATCH /api/v1/workspaces/:id`; WorkspaceService.deleteWorkspace() → `DELETE /api/v1/workspaces/:id`
- Guard: authGuard + onboardingGuard

### Members & Invitations Page
- Route: `/app/settings/members`
- Components: MembersPage (current members table with Name/Email/Role/Joined/Actions, pending invitations table with Email/Role/Sent Date/Status/Actions, invite form with email + role select + Invite button)
- Service: WorkspaceMembersService.listMembers(); WorkspaceMembersService.changeRole(); WorkspaceMembersService.removeMember(); WorkspaceMembersService.listInvitations(); WorkspaceMembersService.invite() → `POST /api/v1/workspaces/:id/invitations`; WorkspaceMembersService.resend(); WorkspaceMembersService.revoke()
- Guard: authGuard + onboardingGuard
- Notes: Change role and remove are owner-only actions.

### Workspace Branding Page
- Route: `/app/settings/branding`
- Components: BrandingPage (logo section with current preview/upload/delete, color template section with palette card grid showing active templates + apply button)
- Service: WorkspaceService.getBranding() → `GET /api/v1/workspaces/:id/branding`; WorkspaceService.uploadLogo() → `POST /api/v1/workspaces/:id/branding/logo`; WorkspaceService.deleteLogo() → `DELETE /api/v1/workspaces/:id/branding/logo`; WorkspaceService.selectColorTemplate() → `PATCH /api/v1/workspaces/:id/branding/color-template`; WorkspaceService.getColorTemplates() → `GET /api/v1/color-templates?activeOnly=true`
- Guard: authGuard + onboardingGuard
