# Endpoints — Projects

## Module: Projects

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-039 | GET | /projects | authenticated | `?page,limit,status,search` | `200 PaginatedProjects` | `ProjectsService.listForUser()` | done | — |
| EP-040 | POST | /projects | authenticated | `body: CreateProjectDto` | `201 ProjectDto` | `ProjectsService.create()` | done | — |
| EP-041 | GET | /projects/:id | authenticated | `param: id` | `200 ProjectDetailDto` | `ProjectsService.findOne()` | done | — |
| EP-042 | PATCH | /projects/:id | authenticated | `param: id, body: UpdateProjectDto` | `200 ProjectDto` | `ProjectsService.update()` | done | — |
| EP-043 | POST | /projects/:id/archive | authenticated | `param: id` | `200 ProjectDto` | `ProjectsService.archive()` | done | — |
| EP-044 | GET | /projects/:id/summary | authenticated | `param: id` | `200 ProjectSummaryDto` | `ProjectSummaryService.getSummary()` | done | — |
| EP-045 | POST | /projects/:id/collaborators | authenticated | `param: id, body: { userId }` | `200 ProjectDto` | `ProjectsService.addCollaborator()` | done | — |
| EP-046 | DELETE | /projects/:id/collaborators/:userId | authenticated | `param: id, userId` | `200 ProjectDto` | `ProjectsService.removeCollaborator()` | done | — |
| EP-047 | PATCH | /projects/:id/sales | role:admin | `param: id, body: SalesAssigneeDto` | `200 ProjectDto` | `ProjectsService.setSalesAssignee()` | done | — |
