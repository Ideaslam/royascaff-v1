# Endpoints — Roles

## Module: Roles

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-034 | GET | /roles/assignments | role:admin | `?page,limit,userId,projectId` | `200 PaginatedAssignments` | `RolesService.listAssignments()` | done | — |
| EP-035 | POST | /roles/global | role:admin | `body: AssignGlobalRoleDto` | `201 UserRoleAssignmentDto` | `RolesService.assignGlobalRole()` | done | — |
| EP-036 | POST | /roles/project-manager | role:admin | `body: AssignProjectManagerDto` | `201 UserRoleAssignmentDto` | `RolesService.assignProjectManager()` | done | — |
| EP-037 | DELETE | /roles/assignments/:id | role:admin | `param: id` | `204` | `RolesService.revokeAssignment()` | done | — |
| EP-038 | GET | /roles/me | authenticated | — | `200 EffectiveRolesDto` | `RolesService.getEffectiveRoles()` | done | — |
