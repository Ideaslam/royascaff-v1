# Endpoints — Roles

## Module: Roles

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-034 | GET | /roles/assignments | role:admin | `?page,limit,userId,projectId` | `200 PaginatedAssignments` | `RolesService.listAssignments()` | paginated |
| EP-035 | POST | /roles/global | role:admin | `body: AssignGlobalRoleDto` | `201 UserRoleAssignmentDto` | `RolesService.assignGlobalRole()` | admin or sales |
| EP-036 | POST | /roles/project-manager | role:admin | `body: AssignProjectManagerDto` | `201 UserRoleAssignmentDto` | `RolesService.assignProjectManager()` | RULE-016 |
| EP-037 | DELETE | /roles/assignments/:id | role:admin | `param: id` | `204` | `RolesService.revokeAssignment()` | — |
| EP-038 | GET | /roles/me | authenticated | — | `200 EffectiveRolesDto` | `RolesService.getEffectiveRoles()` | for UI guards |
