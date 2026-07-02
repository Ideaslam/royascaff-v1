# Endpoints Template

Lists all backend API endpoints for one API app. Lives at `project/actions/<api-app>/endpoints.md`. Each endpoint has an EP- ID for cross-referencing.

> Verbose guidance → `references/endpoints-template-guide.md`

## Schema

```md
# Endpoints — {API App Name}

## Module: {ModuleName}

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-001 | GET | /resource | role:admin | `?page,limit,search` | `200 PaginatedDto` | `SvcName.list()` | done | paginated |
| EP-002 | POST | /resource | authenticated | `body: CreateDto` | `201 ResourceDto` | `SvcName.create()` | done | — |
| EP-003 | GET | /resource/:id | authenticated | `param: id` | `200 ResourceDto` | `SvcName.findOne()` | partial | shape TBD |
| EP-004 | PATCH | /resource/:id | role:admin | `param: id, body: UpdateDto` | `200 ResourceDto` | `SvcName.update()` | planned | — |
| EP-005 | DELETE | /resource/:id | role:admin | `param: id` | `204` | `SvcName.delete()` | deferred | soft-delete · deferred: post-MVP |
```

Auth values: `public`, `authenticated`, `role:{role}`, `owner`.
Status values: `planned` · `partial` · `done` · `deferred` (see `engine/conventions.md`). New endpoints default to `planned`; `deferred` states its reason in Notes.

## Example

```md
# Endpoints — Backend API

## Module: Users

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-001 | GET | /users | role:admin | `?page,limit,search,role,isActive` | `200 PaginatedUsersResponse` | `UsersService.listUsers()` | done | paginated |
| EP-002 | POST | /users | role:admin | `body: CreateUserDto` | `201 UserDto` | `UsersService.createUser()` | done | — |
| EP-003 | GET | /users/:id | role:admin | `param: id` | `200 UserDto` | `UsersService.findOne()` | done | — |
| EP-004 | PATCH | /users/:id | role:admin | `param: id, body: UpdateUserDto` | `200 UserDto` | `UsersService.updateUser()` | done | — |
| EP-005 | DELETE | /users/:id | role:admin | `param: id` | `204` | `UsersService.deleteUser()` | done | soft-delete |
| EP-006 | GET | /users/lite | authenticated | `?search` | `200 UserLiteDto[]` | `UsersService.listLite()` | planned | for dropdowns |
```
