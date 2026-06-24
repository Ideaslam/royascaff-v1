# Code Reconnaissance — Change #008 Workspace Management and Switching

**Date**: 2026-06-24
**Target app(s)**: customer-portal, backend
**Scope under review**: Workspace switcher dropdown (AppShell), Workspace management panel (Workspace Settings), default workspace setting, limit of 10 workspaces.
**Repos scanned**: roya-ai-dynamo-api, roya-ai-dynamo-frontend

## 1. Existing Implementation Found

| Layer | State | Location (path) | Notes / gaps |
|-------|:-----:|-----------------|--------------|
| Schema / data model | partial | `roya-ai-dynamo-api/src/modules/auth/schemas/user.schema.ts` | Needs `defaultWorkspaceId: Types.ObjectId` field on the User schema. |
| Repository | complete | `roya-ai-dynamo-api/src/modules/auth/repositories/user.repository.ts`, `roya-ai-dynamo-api/src/modules/workspace/repositories/workspace.repository.ts` | Existing repository methods (updateById, findByOwnerId) are sufficient. |
| Service(s) | partial | `roya-ai-dynamo-api/src/modules/auth/services/auth.service.ts`, `src/modules/workspace/services/workspace.service.ts` | `AuthService.login` must prioritize `defaultWorkspaceId` over `currentWorkspaceId` on login. `WorkspaceService.createWorkspace` needs to check user doesn't own >= 10 workspaces. |
| Endpoint(s) / controller | partial | `roya-ai-dynamo-api/src/modules/workspace/controllers/workspace.controller.ts` | Missing a `POST /workspaces` creation endpoint (currently only auto-created in register). |
| Frontend service | partial | `roya-ai-dynamo-frontend/src/app/core/services/workspace.service.ts`, `auth.service.ts` | `WorkspaceService` has `switchWorkspace` and `getMyWorkspaces` but lacks `createWorkspace(dto)`. `AuthService` needs a helper to update the local session. |
| Page(s) / component(s) | partial | `roya-ai-dynamo-frontend/src/app/layouts/app-shell/app-shell.ts`, `workspace-settings.page.ts` | `AppShell` needs topbar dropdown menu to switch workspaces. `WorkspaceSettingsPage` needs a "My Workspaces" tab to list, set default, switch, and create workspaces. |
| Route registration | complete | `roya-ai-dynamo-frontend/src/app/app.routes.ts` | No new routes needed. |

## 2. Feature State Verdict

**State**: partial — exists but incomplete

If **partial**, list precisely what is implemented vs. what is missing, so Step 5.2 **completes it in place** instead of creating a duplicate:
- Implemented: Workspace schema, memberships schema, list workspaces by user (`GET /workspaces/me`), switch workspace logic (`POST /workspaces/switch`), frontend routing.
- Missing: `POST /workspaces` creation endpoint, owned workspace limits, default workspace field, topbar switcher menu UI, settings management tab for workspaces.

## 3. Plan vs. Code Drift

- Code that exists but is **not** in the plan docs: None.
- Plan entries with **no** code yet: Exposing a public workspace creation endpoint and switching workspaces inside customer portal topbar dropdown was planned but not fully implemented in code.

## 4. Ripple / Impact Map

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| `AuthService.login` | backend service | caller of `issueTokens` | yes | Prioritize default workspace when issuing initial token. |
| `AuthService.refresh` | backend service | caller of `issueTokens` | yes | Return updated user profile in response body. |
| `WorkspaceService.createWorkspace` | backend service | workspace creation | yes | Add check for maximum of 10 owned workspaces. |
| `UserProfile` | frontend interface | user profile shape | yes | Add `defaultWorkspaceId` field. |
| `WorkspaceSettingsPage` | frontend page | settings page | no | Add "My Workspaces" tab panel. |
| `AppShell` | frontend layout | main shell navigation | no | Replace simple text display with dropdown trigger for switching. |

- Shared DTOs / schemas touched: `User` Schema, `UserProfileDto`, `UpdateProfileDto`, `UserProfile` (frontend).
- Auth / role implications: Switched tokens contain target workspace roles/claims.
- Async jobs / queues / webhooks involved: None.
- Data migration required? No (new schema fields are optional/nullable, defaulting to null).

## 5. Reuse Opportunities

We can reuse:
- `WorkspaceService.getMyWorkspaces()` to fetch the list of workspaces.
- `WorkspaceService.switchWorkspace(id)` to trigger switching on both backend and frontend.

## 6. Recommendation for Impact Analysis (Step 5.1)

- **Create new**:
  - `POST /workspaces` endpoint in `WorkspaceController`.
  - `WorkspaceService.createWorkspace(dto)` in frontend service.
  - Dialog component/modal inside settings for creating a workspace.
- **Complete in place** (partial):
  - `User` schema (`defaultWorkspaceId`).
  - `AuthService` token generation (`defaultWorkspaceId` priority).
  - `AppShell` topbar workspace pill (convert to dropdown).
  - `WorkspaceSettingsPage` (add "My Workspaces" tab panel).
- **Modify** (ripple):
  - `UserProfileDto` to include `defaultWorkspaceId`.
  - `UpdateProfileDto` to include `defaultWorkspaceId`.
- **Out of scope / deferred**: None.

## Open Questions
- None.
