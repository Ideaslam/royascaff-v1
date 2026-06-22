# Pages File Template

## Short Summary

Use this template when creating a **web app's** `pages.md`.  
The `pages.md` file should be a list of all pages (routed screens) the AI will build for **one** web application, and every page entry should use the same structure.

> **One app per file.** Each web app has its own pages file under `project/actions/<app-key>/pages.md`
> (e.g. `customer-portal/pages.md`, `admin-panel/pages.md`), where `<app-key>` is the app key from the
> Applications table in `project/profile.md`. For **mobile** apps, use `engine/templates/views-template.md`
> to create `project/actions/<app-key>/views.md` instead. API apps use `services.md` + `endpoints.md`.

## Purpose

This template is not for writing actual Angular code.  
It is a documentation template for listing planned frontend pages in one consistent format.

Each page entry should describe:

- page name
- route
- purpose
- description
- layout
- components used inside the page
- services the page depends on
- models/DTOs used by the page
- related backend endpoints
- notes about forms, tables, modal usage, RTL, and permissions

## File-Level Rules

- `pages.md` should contain a list of page entries.
- Every page should use the same section order.
- Document page behavior in frontend terms, but link it to backend services and endpoints.
- If the page has a form, say whether it is create, edit, or combined create/edit.
- If the page contains a table, say what endpoint feeds it.
- If the page is inside auth or app shell, say so explicitly.

## Recommended `pages.md` Structure

```md
# Pages

## Module: {Module Name}

### Page 1
{entry}

### Page 2
{entry}
```

## Single Page Entry Template

```md
### Page {Number}

- Name: `{Page Name}`
- Route: `{route path}`
- Type: `{list | details | create | edit | create-edit | dashboard | settings | auth}`
- Layout: `{app shell | auth layout | public layout}`
- Summary: `{short summary}`

#### Description

{Clear explanation of what this page does for the user.}

#### Purpose

- {Main use case 1}
- {Main use case 2}
- {Main use case 3}

#### Main Component

- Component Name: `{ComponentClassName}`
- Folder: `{client/src/app/pages/...}`
- Files:
  - `{page-name}.page.ts`
  - `{page-name}.page.html`
  - `{page-name}.page.css`

#### Child Components

- `{ComponentName} - {why it is used}`
- `{ComponentName} - {why it is used}`

#### Services

- `{ServiceName} - {purpose}`
- `{ServiceName} - {purpose}`

#### Models / DTOs

- `{ModelOrDtoName} - {purpose}`
- `{ModelOrDtoName} - {purpose}`

#### Backend Endpoints Used

- `{HTTP METHOD} {route} - {why it is used}`
- `{HTTP METHOD} {route} - {why it is used}`

#### UI Sections

- {Section 1}
- {Section 2}
- {Section 3}

#### User Actions

- {Action 1}
- {Action 2}
- {Action 3}

#### States

- Loading: `{behavior}`
- Empty: `{behavior}`
- Error: `{behavior}`
- Success: `{behavior}`

#### Rules / Notes

- {Validation or business note}
- {Permission note}
- {RTL/LTR note}
- {Modal vs page note}
```

## Compact Page Entry Template

Use this if you want a shorter style but still consistent.

```md
### Page {Number}

- Name: `{Page Name}`
- Route: `{route}`
- Type: `{page type}`
- Description: `{what the page does}`
- Components:
  - `{...}`
- Services:
  - `{...}`
- Models:
  - `{...}`
- Endpoints:
  - `{...}`
- Notes:
  - `{...}`
```

## Example

```md
### Page 1

- Name: `Users List Page`
- Route: `/app/users`
- Type: `list`
- Layout: `app shell`
- Summary: `Displays the paginated list of users for admin management.`

#### Description

This page shows users in a table with filters, pagination, and actions to create or edit users.

#### Purpose

- Manage system users
- Filter users by role and status
- Navigate to create and edit user screens

#### Main Component

- Component Name: `UsersListPage`
- Folder: `client/src/app/pages/users/users-list`
- Files:
  - `users-list.page.ts`
  - `users-list.page.html`
  - `users-list.page.css`

#### Child Components

- `UsersFilterBarComponent - handles search and role filters`
- `UsersTableComponent - renders table rows and actions`

#### Services

- `UsersService - loads paginated users and deletes users`

#### Models / DTOs

- `UserListItemDto - one row in the users table`
- `ListUsersQuery - filter and pagination query model`

#### Backend Endpoints Used

- `GET /users - load paginated users`
- `DELETE /users/:id - delete selected user`

#### UI Sections

- Page header
- Filters bar
- Users table
- Empty/error messages

#### User Actions

- Search users
- Filter by role
- Navigate to create user page
- Navigate to edit user page
- Delete user

#### States

- Loading: `show table loader or page loader`
- Empty: `show empty-state message when no users found`
- Error: `show error message and retry option`
- Success: `show toast after delete if applicable`

#### Rules / Notes

- Only admin users can access this page
- Use paginated API data, not local mock state
- Use the project's UI library (per `project/profile.md`) table and filter controls consistently
```

## Suggested Page Field Meanings

- `Name`
  human-readable page label for documentation
- `Route`
  frontend route path
- `Type`
  page type and expected behavior
- `Layout`
  which app layout contains the page
- `Main Component`
  the root Angular page component
- `Child Components`
  reusable or local sections under the page
- `Services`
  Angular services the page calls
- `Models / DTOs`
  frontend request/response or view models used
- `Backend Endpoints Used`
  API dependencies of the page
- `Rules / Notes`
  permissions, validation, UI constraints, RTL notes, or modal rules

## Final Guidance

When AI creates `pages.md`, it should use this page entry structure for every page so the whole file stays consistent and easy to understand before any Angular files are generated.
