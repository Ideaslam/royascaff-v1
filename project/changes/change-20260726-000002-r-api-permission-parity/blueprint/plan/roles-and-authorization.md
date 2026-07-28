# Roles & Authorization (delta)

## Delta
Server-side `PermissionGuard` must match seeded keys for mutations on clients, proposals, roles, permissions, services, and contracts. FE `*appHasPermission` is not sufficient alone.

### Target mapping (mutations)
| Area | create | edit/patch | delete | other |
|------|--------|------------|--------|-------|
| clients | client.create | client.edit | client.delete | logo → edit |
| proposals | proposal.create | proposal.edit | proposal.delete | send → edit or create |
| roles/permissions | roles.manage | roles.manage | roles.manage | batch → manage |
| services / categories | authenticated OR extend seed later | same | same | [INFERRED] no dedicated service.* keys in seed — choose: keep authenticated OR add keys |
| contracts | proposal.edit or authenticated | same | same | send/upload — document choice in impl |

## Note on services/contracts
Seed has no `service.*` / `contract.*` keys. **Choice (a):** leave authenticated-only (+ ownership where present). Focus pack on client / proposal / roles.manage.
