# Pages Template (Web Apps)

Lists all pages for one web app. Lives at `project/actions/<app-key>/pages.md`. For mobile apps, use `views-template.md` instead.

> Verbose guidance → `references/pages-template-guide.md`

## Schema

```md
# Pages — {App Name}

## Module: {ModuleName}

### PageName

- Route: `/app/resource`
- Status: planned | partial | done | deferred
- Components: `FilterBar`, `DataTable`, `CreateDialog`
- Service: `ResourceService` → EP-001 (GET /resource), EP-002 (POST /resource)
- Guard: `authGuard` | `adminGuard` | `none`
- Notes: paginated list, create via modal dialog
```

Status: `planned` · `partial` · `done` · `deferred` (see `engine/conventions.md`). New pages default to `planned`; `deferred` states its reason in Notes.

## Example

```md
# Pages — Customer Portal

## Module: Users

### Users List Page

- Route: `/app/users`
- Status: done
- Components: `UsersFilterBar`, `UsersTable`, `CreateUserDialog`
- Service: `UsersService` → EP-001 (GET /users), EP-005 (DELETE /users/:id)
- Guard: `adminGuard`
- Notes: paginated table with search/role filters; delete via confirmation dialog

### User Edit Page

- Route: `/app/users/:id/edit`
- Status: partial
- Components: `UserForm`, `RoleSelector`
- Service: `UsersService` → EP-003 (GET /users/:id), EP-004 (PATCH /users/:id)
- Guard: `adminGuard`
- Notes: combined create/edit form; role changes require admin — role selector not yet wired
```
