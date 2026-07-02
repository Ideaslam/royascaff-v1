# Services — Roles

## Module: Roles

### SVC-016 · RolesService [domain, internal, Roles]

- Status: partial

- Methods:
  - `assignGlobalRole(adminId, userId, role): UserRoleAssignment` — `admin` | `sales`
  - `assignProjectManager(adminId, userId, projectId): UserRoleAssignment`
  - `revokeAssignment(adminId, assignmentId): void`
  - `listAssignments(query): PaginatedResponse`
  - `getEffectiveRoles(userId): EffectiveRolesDto` — global + project map
  - `hasGlobalRole(userId, role): boolean`
  - `isProjectManager(userId, projectId): boolean`
  - `assertCanManageProjectWallet(userId, projectId): void`
- Deps: `UserRoleAssignmentsRepository`, `ProjectsRepository`, `ActivityLogService`
- Side effects: activity log on assign/revoke
- Rules: RULE-016 admin-only assignment; RULE-006 wallet permissions

### SVC-017 · RolesGuardHelper [application, internal, Roles]

- Status: planned

- Methods:
  - `canAccessProject(userId, projectId): ProjectAccessLevel` — owner | collaborator | pm | admin
- Deps: `RolesService`, `ProjectsRepository`
- Side effects: none
- Rules: see `roles-and-authorization.md`
