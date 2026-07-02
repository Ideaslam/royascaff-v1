## Modified Shared Infrastructure

### AppShell
- Workspace Switcher (topbar): dropdown showing workspace name + role, lists all workspaces, "Create new workspace" option. Switch calls `POST /api/v1/workspaces/switch` then reloads.
- Sidebar nav additions: Workspace Settings → `/app/settings/workspace`, Members → `/app/settings/members`, Branding → `/app/settings/branding`

### onboardingGuard
- Reads currentUser from AuthService, calls `GET /api/v1/onboarding/progress`
- If `workspaceCreated === false` → redirects to `/onboarding`
- All `/app/*` routes use `[authGuard, onboardingGuard]`

### Auth Models (extended)
- UserProfile gains: currentWorkspaceId, defaultWorkspaceId, workspaceSlug, workspaceRole
- New interface: WorkspaceInfo (id, name, slug, role)
- AuthResponse gains: redirectTo field

### Auth Service (modified)
- register() checks `res.data.redirectTo` and navigates there (replaces default `/app/projects`)
- New: storeWorkspaceContext() stores workspace fields in stored user object

### WorkspaceService (new)
- getMyWorkspaces() → `GET /api/v1/workspaces/me`
- getWorkspace(id) → `GET /api/v1/workspaces/:id`
- updateWorkspace(id, dto) → `PATCH /api/v1/workspaces/:id`
- checkSlugAvailability(slug) → `GET /api/v1/workspaces/slug-availability?slug=x`
- switchWorkspace(workspaceId) → `POST /api/v1/workspaces/switch`
- deleteWorkspace(id, confirmName) → `DELETE /api/v1/workspaces/:id`
- getBranding(id) → `GET /api/v1/workspaces/:id/branding`
- uploadLogo(id, file) → `POST /api/v1/workspaces/:id/branding/logo`
- deleteLogo(id) → `DELETE /api/v1/workspaces/:id/branding/logo`
- selectColorTemplate(id, templateId) → `PATCH /api/v1/workspaces/:id/branding/color-template`
- getOnboardingProgress() → `GET /api/v1/onboarding/progress`
- updateOnboardingProgress(dto) → `PATCH /api/v1/onboarding/progress`
- getColorTemplates(activeOnly?) → `GET /api/v1/color-templates?activeOnly=true`

### WorkspaceMembersService (new)
- HTTP wrapper for member + invitation endpoints
