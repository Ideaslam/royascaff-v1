# Bug #004 — Workspace logo URL and members list display

## Status
**DONE** — Fix confirmed

**Confirmed**: 2026-06-24

## Reported
- **Date**: 2026-06-23
- **Severity**: medium
- **Affected area**: backend/workspace, customer-portal/settings

## Description
Workspace branding returns a storage key as `logoUrl` instead of a full R2 public URL, so the logo image fails to load. The members table shows empty name, email, and joined date.

## Expected Behavior
- Logo `logoUrl` should be a full HTTPS URL (e.g. `https://<r2-public-base>/workspaces/.../logo/...`)
- Members list should show user name, email, role, and joined date

## Steps to Reproduce (if applicable)
1. Upload a workspace logo in Settings → Branding
2. Reload the page — logo appears broken
3. Open Settings → Members — owner row shows "—" and no email/joined date

## Root Cause
- `R2StorageProvider.upload()` returned the object key; branding stored that key as `logoUrl` without resolving `R2_PUBLIC_BASE_URL`
- `WorkspaceMemberService.listMembers()` returned `name`, `email`, and `joinedAt` while the frontend expects `userName`, `userEmail`, and `createdAt`

## Fix Applied
- Added `getPublicUrl()` to the storage provider; branding service resolves logo URLs on read and write using `logoStorageKey` / `R2_PUBLIC_BASE_URL`
- Member service DTO aligned to frontend: `userName`, `userEmail`, `joinedAt`, `createdAt`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/integrations/storage/storage.interface.ts`
- `roya-ai-dynamo-api/src/integrations/storage/r2-storage.provider.ts`
- `roya-ai-dynamo-api/src/modules/workspace/services/workspace-branding.service.ts`
- `roya-ai-dynamo-api/src/modules/workspace/services/workspace-member.service.ts`
- `roya-ai-dynamo-frontend/src/app/pages/settings/workspace/workspace-settings.page.html`
- `roya-ai-dynamo-frontend/src/app/core/models/workspace.models.ts`
