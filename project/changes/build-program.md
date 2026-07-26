# Build Program

- **request-id**: REQ-R
- **Source**: Phase R.Done
- **Created**: 2026-07-26
- **Last updated**: 2026-07-26

## Slice rules

- Security gaps first (web auth → API permission parity)
- Config onboarding (env example) can run in parallel with security packs
- Product refactors (pipeline v3 / PDF) are **not** in this program — use new Phase 5 requests
- Shared `request-id`: REQ-R

## Packs (ordered)

| Part | Pack folder | Module / scope | Depends on | Target apps | Pack status | Notes |
|------|-------------|----------------|------------|-------------|-------------|-------|
| 1/3 | `change-001-r-enable-web-auth-guard/` | Auth (web routes) | — | web | drafted | uncomment authGuard |
| 2/3 | `change-002-r-api-permission-parity/` | Clients/Proposals/Roles/Services/… | change-001 | api | blocked | PermissionGuard on mutations |
| 3/3 | `change-003-r-env-example/` | Config / ops | — | api | drafted | .env.example only |

## Progress

| Metric | Value |
|--------|-------|
| Packs total | 3 |
| Merged | 0 |
| In flight | 0 |
| Blocked / drafted | 3 |
| Deferred | 0 (OpenAI/PDF tracked in status.md Deferred, not packs) |

## Next pack

- **Default**: `change-001-r-enable-web-auth-guard`
- **Resume**: read `change-log.md`, then this file, then open that pack folder
- **Implement via**: `/change-mode` from Step 5.4
