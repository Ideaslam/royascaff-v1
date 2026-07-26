# Impact Analysis — API permission parity

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | permissions seed | keys exist |
| Service(s) | complete | PermissionGuard, PermissionCheckerService | unused on many controllers |
| Endpoint(s) | partial | data/*.controller.ts | missing PermissionGuard |
| Page(s) | complete | *appHasPermission | FE already gated |

Feature state: partial

## Affected Modules
- Clients, Proposals, Roles, Permissions, Services, Contracts controllers

## Pack blueprint files
- [x] endpoints slices for clients, proposals, roles, permissions, services, contracts
- [x] roles-and-authorization excerpt

## Risk: complexity (M), cross-module (Y), migration (N)

## Recommendation
- **Modify**: controller guards only; update endpoint Auth column on merge
