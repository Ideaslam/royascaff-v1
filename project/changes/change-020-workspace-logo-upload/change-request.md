# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-SETTINGS-LOGO
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: drafted

## Scope
- Module(s): Workspace Settings
- Feature(s): Workspace / company logo upload + display
- Endpoint(s): new POST/DELETE `/api/data/settings/logo` (mirror client logo); GET/PATCH settings return `logoUrl`
- Page(s)/View(s): `web`: Settings → Company tab; Sidebar chrome (workspace logo with Safqa fallback)
- Service(s): SettingsDataService (+ S3); AppDataService; Settings page; Sidebar

## Description

Let each workspace upload its company logo from **Settings → Company**, store it on workspace settings (S3/R2), and show it in the app chrome.

**Today:** Company tab has name / email / phone / address only. No `logoUrl` on settings. Client logos already work via base64 → R2. Sidebar always shows the product brand logo (`assets/logo.svg`).

**Deliver:**

1. **Data** — Add `logoUrl` (and optional storage key if needed for delete) on `settings`.
2. **API** — `POST /api/data/settings/logo` and `DELETE /api/data/settings/logo` with the same rules as client logos: JPEG/PNG/WebP/SVG, max 2MB, base64 body, `settings.manage`. Replace previous object on re-upload; delete clears field + R2 object.
3. **Settings UI** — On Company tab, above company name: avatar/preview + Upload + Remove (reuse create-client-dialog logo UX / copy pattern).
4. **Chrome** — Sidebar uses workspace `logoUrl` when present; otherwise keep Safqa brand logo.

**Out of scope (this pack):**
- Pitch / PDF / proposal HTML branding with workspace logo
- Public proposal link pages
- Theme & Branding tab redesign
- Changing product favicon / auth screens

**Locked decisions (defaults — correct if wrong):**
- Permission: existing `settings.manage` (no new permission)
- Storage: Cloudflare R2 via existing `S3Service`, folder e.g. `workspaces/{workspaceId}/`
- UX placement: Company tab, above “Company name”
- Sidebar shows workspace logo; Safqa logo remains fallback
- Client logo flows unchanged
- Priority: medium

## Acceptance Criteria

1. User with `settings.manage` can upload a workspace logo from Settings → Company and see an immediate preview.
2. Uploaded logo persists across reload (`GET /api/data/settings` includes `logoUrl`).
3. Re-upload replaces the previous logo (old R2 object removed when possible).
4. Remove clears `logoUrl` and removes the stored object; Settings preview and sidebar fall back to Safqa brand.
5. Invalid type / oversize (>2MB) returns 400 with a clear message; UI shows toast/error.
6. Users without `settings.manage` cannot upload/remove (same write gate as Save settings).
7. Client logo upload/delete continues to work unchanged.
8. Pitch PDFs / public proposal links do **not** change in this pack.

## Notes

- Reuse: `ClientsDataService.uploadLogo` / create-client-dialog logo panel.
- Schema-driven settings fields are text/email/number/color/select/secret — logo is a special Company-tab control (not a new schema field type unless cleaner).
- Screenshot reference: Company Settings tab (PayUp company fields).
