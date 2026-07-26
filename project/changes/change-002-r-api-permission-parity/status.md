# Pack Status — change-002-r-api-permission-parity

- **pack-status**: blocked
- **request-id**: REQ-R
- **depends-on**: change-001
- **Artifacts done**: 0/2

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| Endpoint Auth columns | endpoint | planned | PermissionGuard on mutations |
| roles-and-authorization | plan | planned | document server enforcement |

## Blockers

- Program order: change-001 (can lift if implementing in parallel)

## Next action

- After change-001 verified/merged (or unblock intentionally), implement guards via /change-mode
