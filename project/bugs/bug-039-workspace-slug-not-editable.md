# Bug #039 — Workspace slug should not be editable

## Status
**DONE** — **Confirmed**: 2026-07-19

## Reported
- **Date**: 2026-07-19
- **Severity**: high
- **Affected area**: customer-portal/settings/workspace (`/app/settings/workspace`)

## Description
The Workspace Settings → General tab exposes an editable "URL Slug" field. Changing the workspace slug updates the workspace document but does **not** rename the underlying per-workspace MongoDB collections (`ws_{slug}_*`) or analytics tables (`ds_{slug}_{datasetId}`). This breaks all existing data sources, datasets, dashboards, and sync pipelines tied to the original slug.

## Expected Behavior
Users should only be able to edit the workspace **name**. The slug is an immutable identifier set at workspace creation and must not be changeable from the settings UI (or via the update API).

## Steps to Reproduce
1. Go to `/app/settings/workspace`
2. On the General tab, change the "URL Slug" field
3. Click Save Changes
4. Data sources, datasets, and dashboards become inaccessible because collection/table names still use the old slug

## Root Cause
The workspace settings page includes a slug form control and sends it to `PATCH /workspaces/:id`:

- **Frontend template** (`workspace-settings.page.html` lines 39–48): renders an editable slug input inside `generalForm`
- **Frontend component** (`workspace-settings.page.ts` lines 59–62, 176–184): `generalForm` includes a `slug` control with validators; `saveGeneral()` submits the entire form (including slug) via `updateWorkspace()`
- **Backend** (`workspace.service.ts` lines 128–134): `updateWorkspace()` accepts and persists slug changes after only checking uniqueness — it does not migrate collections or analytics tables

The slug is auto-generated at creation (`generateWorkspaceSlug()`) and is used as a stable namespace key across the entire data layer. Allowing edits creates a silent data integrity break.

## Fix Applied

### Frontend
- Removed the editable slug input from the General tab (`workspace-settings.page.html`)
- Removed `slug` from `generalForm`; `saveGeneral()` now sends only `{ name }`
- Removed unused slug input styles from `workspace-settings.page.scss`
- Removed `slug` from `UpdateWorkspaceDto` interface

### Backend
- Removed `slug` from `UpdateWorkspaceDto` — API no longer accepts slug updates
- Removed slug uniqueness check from `updateWorkspace()` service method

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/settings/workspace/workspace-settings.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/settings/workspace/workspace-settings.page.ts`
- `roya-ai-dynamo-frontend/src/app/pages/settings/workspace/workspace-settings.page.scss`
- `roya-ai-dynamo-frontend/src/app/core/models/workspace.models.ts`
- `roya-ai-dynamo-api/src/modules/workspace/services/workspace.service.ts`
- `roya-ai-dynamo-api/src/modules/workspace/dto/workspace.dto.ts`
