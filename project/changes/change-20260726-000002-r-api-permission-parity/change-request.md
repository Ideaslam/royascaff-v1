# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: bug-fix
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-R
- **part**: 2/3
- **depends-on**: change-20260726-000001
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Clients, Proposals, Roles, Permissions, Services, Contracts (mutations)
- Feature(s): RBAC server enforcement
- Endpoint(s): mutating EP-* for those modules
- Page(s)/View(s): —
- Service(s): existing data services (no logic change expected)

## Description
Frontend gates actions with `*appHasPermission` for keys like `client.create`, `proposal.*`, `roles.manage`, but most Nest data controllers only use `WorkspaceAuthGuard`. Any authenticated user can call mutate APIs directly. Add `PermissionGuard` to create/update/delete (and send where applicable) to match seeded permissions and FE.

## Acceptance Criteria
1. Client create/edit/delete (+ logo mutate) require `client.create` / `client.edit` / `client.delete` as appropriate
2. Proposal create/edit/delete / send require `proposal.create` / `proposal.edit` / `proposal.delete` / `proposal.view` as appropriate
3. Roles & permissions mutations require `roles.manage`
4. Settings already has `settings.manage` — leave intact
5. Read/list endpoints remain authenticated (or view permission if product chooses — default: keep authenticated reads)
6. Unauthorized calls return 403

## Notes
Align with `scripts/config-seed-data.js` permission keys. Soft depends-on change-20260726-000001 for program order only.
