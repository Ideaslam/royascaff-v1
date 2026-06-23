# Change Request — Workspace Management and Switching

## Metadata
- **Change Number**: 008
- **Date**: 2026-06-24
- **Change Type**: new-feature
- **Target App**: all-apps
- **Affected Repos**: roya-ai-dynamo-api, roya-ai-dynamo-frontend

## Scope
- Backend API (`roya-ai-dynamo-api`): Expose workspace creation endpoint, enforce a maximum limit of 10 workspaces per owner, add default workspace setting to User model, update login/registration logic to auto-route to default/current workspace.
- Frontend Client (`roya-ai-dynamo-frontend`): Implement a sleek topbar workspace switcher dropdown component inside the customer portal AppShell, create a "My Workspaces" tab in the Workspace Settings page to list workspaces, choose the default workspace, and create new workspaces (up to 10).

## Description
1. **Default Workspace Support**:
   - Add `defaultWorkspaceId` to User Schema.
   - Update auth login flow to resolve the login workspace priority: `defaultWorkspaceId` -> `currentWorkspaceId` -> first member workspace.
   - Add profile PATCH endpoint to allow users to update their `defaultWorkspaceId`.
   - Update `AuthService.refresh` to return the updated user profile in the payload.
2. **Workspace Creation & Limit**:
   - Expose `POST /workspaces` endpoint to allow logged-in users to create a workspace.
   - In `WorkspaceService.createWorkspace`, verify the user doesn't already own >= 10 workspaces. If they do, throw a `BadRequestException`.
3. **Workspace Switch Dropdown (AppShell)**:
   - Add an interactive dropdown inside the topbar next to the workspace name pill.
   - List other workspaces the user belongs to. Clicking a workspace switches the active workspace instantly and reloads the current route (`/app/projects`).
4. **My Workspaces Panel**:
   - Add a tab named "My Workspaces" in `WorkspaceSettingsPage` (`/app/settings/workspace`).
   - List all workspaces (name, slug, member role, checks for active and default workspaces).
   - Allow setting a workspace as the "Default Workspace" (persisted to backend profile).
   - Allow switching active workspaces.
   - Allow creating a new workspace directly via a premium dialog modal (with 10 workspaces limit enforcement).

## Acceptance Criteria
1. Users can switch workspaces via the topbar dropdown in the customer portal AppShell.
2. Users can view all workspaces they belong to and set one of them as their default workspace in Workspace Settings -> My Workspaces.
3. Logging in automatically routes users to their default workspace (if set) or their last active workspace.
4. Users can create a new workspace as OWNER from the settings tab (up to 10 workspaces max).
5. Attempting to create an 11th workspace returns a clean validation error in the UI and a `400 Bad Request` from the API.
6. The register page continues to refuse existing emails (no duplicate registrations) and behaves normally.
