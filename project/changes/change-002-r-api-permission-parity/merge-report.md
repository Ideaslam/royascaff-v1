# Merge Report — change-002-r-api-permission-parity

- **Merged date**: 2026-07-28
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS (+ user PASS)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/roles-and-authorization.md` | in-place: PermissionGuard matrices; authGuard on; services/contracts note |
| `project/actions/api/endpoints/clients.md` | Auth columns → client.* |
| `project/actions/api/endpoints/proposals.md` | Auth columns → proposal.* |
| `project/actions/api/endpoints/roles.md` | Auth columns → roles.manage |
| `project/actions/api/endpoints/permissions.md` | Auth columns → roles.manage |
| `project/status.md` | REQ-R complete; remove permission-parity partial |

## Code (already shipped)

| Path | Action |
|------|--------|
| `clients.controller.ts` | PermissionGuard |
| `proposals-data.controller.ts` / `proposals-operations.controller.ts` | PermissionGuard |
| `roles.controller.ts` / `permissions.controller.ts` | PermissionGuard |

## Skipped

- Services / contracts dedicated permission keys (deferred — no seed keys)

## Post-merge checks

- [x] Main files updated in-place
- [x] `change-log.md` → Completed
- [x] Pack status + change-request → `merged`
