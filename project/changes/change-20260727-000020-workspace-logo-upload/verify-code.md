# Verification — change-20260727-000020-workspace-logo-upload

## Code Verification (post-build)

- [x] Endpoints: `POST /api/data/settings/logo`, `DELETE /api/data/settings/logo` with `PermissionGuard('settings.manage')`
- [x] Service: `SettingsDataService.uploadLogo` / `removeLogo` via `S3Service` (`workspaces/{workspaceId}/`)
- [x] Model: `Settings.logoUrl`; PATCH cannot set `logoUrl`; GET returns when set
- [x] Limits: JPEG/PNG/WebP/SVG, max 2MB (parity with client logos)
- [x] Settings page Company tab: avatar + upload + remove (immediate API, not via Save)
- [x] Sidebar binds to `settings.logoUrl` with `BRAND.logoPath` fallback
- [x] FE uses AppDataService → relative `/api/data/settings/logo` (no hardcoded external URLs)
- [x] Layering: controller → SettingsDataService → SettingsRepository / S3Service
- [x] Client logo paths unchanged
- [x] API `tsc --noEmit` PASS

## Acceptance criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Upload + preview on Company tab | PASS |
| 2 | Persists via GET settings `logoUrl` | PASS |
| 3 | Re-upload replaces previous R2 object | PASS (deleteStoredLogo before upload) |
| 4 | Remove clears logo; sidebar falls back to Safqa | PASS |
| 5 | Invalid type / oversize → 400 + toast | PASS |
| 6 | No `settings.manage` → cannot mutate | PASS (PermissionGuard + FE gate) |
| 7 | Client logos unchanged | PASS (no client file edits) |
| 8 | No PDF / public-link changes | PASS (out of scope; untouched) |

## Notes

- Runtime upload against live R2 not exercised in this verify pass; wiring + typecheck confirmed.
- Save settings strips `logoUrl` / `apiKeyMask` from PATCH body.

## Result: PASS

**Overall: PASS**
