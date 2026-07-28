# Verification — change-002-r-api-permission-parity

## Code Verification

| Check | Result |
|-------|--------|
| Clients mutations → `client.create/edit/delete` | PASS |
| Proposals data create/edit/delete → `proposal.*` | PASS |
| Proposals ops info/docs/send/s3 → `proposal.edit` | PASS |
| Roles + permissions mutations → `roles.manage` | PASS |
| Settings `settings.manage` untouched | PASS |
| Services/contracts left authenticated (no seed keys) | PASS (choice a) |
| Reads stay authenticated | PASS |
| API `tsc --noEmit` | PASS |

## Acceptance Criteria

1. Client create/edit/delete (+ logo) — PASS  
2. Proposal create/edit/delete / send — PASS (`send` → `proposal.edit`)  
3. Roles & permissions mutations → `roles.manage` — PASS  
4. Settings intact — PASS  
5. Reads authenticated — PASS  
6. Unauthorized → 403 — PASS (PermissionGuard existing behavior)  

## Result: **PASS**

## Manual smoke
- [ ] Sales user without `roles.manage` → roles POST returns 403  
- [ ] User without `client.delete` → client DELETE 403  
- [ ] User with `proposal.edit` can save technical HTML  
