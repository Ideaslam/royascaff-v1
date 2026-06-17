# Endpoints File Template

## Short Summary

Use this template when creating `endpoints.md`.  
The `endpoints.md` file should be a list of all backend endpoints the AI will build, and every endpoint entry should use the same structure.

## Purpose

This template is not for controller code or DTO code.  
It is a documentation template for listing endpoints in one consistent format.

Each endpoint entry should describe:

- endpoint name
- HTTP method
- route
- purpose
- description
- auth/access
- input
- return
- notes or constraints

## File-Level Rules

- `endpoints.md` should contain a list of endpoint entries.
- Every endpoint must use the same section order.
- Keep descriptions implementation-oriented and clear.
- Use backend meaning, not only frontend button behavior.
- If an endpoint is async, say so explicitly.
- If an endpoint is paginated, say so explicitly.
- If an endpoint is a lite endpoint, say so explicitly.

## Recommended `endpoints.md` Structure

```md
# Endpoints

## Module: {Module Name}

### Endpoint 1
{entry}

### Endpoint 2
{entry}
```

## Single Endpoint Entry Template

```md
### Endpoint {Number}

- Name: `{Endpoint Name}`
- Method: `{GET | POST | PUT | PATCH | DELETE}`
- Route: `{route}`
- Summary: `{short summary}`

#### Description

{Clear explanation of what this endpoint does in backend terms.}

#### Purpose

- {Main use case 1}
- {Main use case 2}
- {Main use case 3}

#### Auth

- Access: `{public | authenticated | role-based}`
- Roles: `{admin, sales_manager, sales_rep, client}` or `N/A`

#### Input

- Params:
  - `{field}: {type} - {description}`
- Query:
  - `{field}: {type} - {description}`
- Body:
  - `{field}: {type} - {description}`

#### Return

- Status: `{200 | 201 | 202 | 204}`
- DTO / Shape: `{ReturnDtoName or response shape}`
- Data:
  - `{field}: {type} - {description}`

#### Business Rules

- {Rule 1}
- {Rule 2}
- {Rule 3}

#### Constraints / Notes

- {Constraint 1}
- {Constraint 2}
- {Async, pagination, snapshot, status, or security notes}
```

## Compact Endpoint Entry Template

Use this if you want a shorter style but still consistent.

```md
### Endpoint {Number}

- Name: `{Endpoint Name}`
- Method: `{HTTP Method}`
- Route: `{route}`
- Description: `{what it does}`
- Input:
  - Params: `{...}`
  - Query: `{...}`
  - Body: `{...}`
- Return:
  - Status: `{...}`
  - Shape: `{...}`
- Notes:
  - `{...}`
```

## Example

```md
### Endpoint 1

- Name: `Get Users List`
- Method: `GET`
- Route: `/users`
- Summary: `Returns a paginated list of active users for the admin panel.`

#### Description

Returns the backend-managed user records for the users management page.  
This endpoint is for admin usage and should not return password or secret fields.

#### Purpose

- Show users in the admin list page
- Support filtering by role and status
- Provide server-side pagination

#### Auth

- Access: `role-based`
- Roles: `admin`

#### Input

- Params:
  - `none`
- Query:
  - `page: number - page number`
  - `limit: number - page size`
  - `search: string - search by name or email`
  - `role: string - filter by role`
  - `isActive: boolean - filter active users`
- Body:
  - `none`

#### Return

- Status: `200`
- DTO / Shape: `PaginatedUsersResponse`
- Data:
  - `items: UserListItemDto[] - paginated user rows`
  - `page: number - current page`
  - `limit: number - page size`
  - `total: number - total matched records`

#### Business Rules

- Return active users by default unless explicitly filtered
- Do not return password hashes
- Support role filtering

#### Constraints / Notes

- This is a paginated endpoint
- Use `/users/lite` for dropdowns instead of this endpoint
```

## Suggested Field Meanings

- `Name`
  human-readable endpoint label for documentation
- `Method`
  HTTP verb
- `Route`
  exact API route
- `Summary`
  one-line explanation
- `Description`
  fuller backend meaning
- `Input`
  params, query, and body fields
- `Return`
  status + response DTO/shape
- `Business Rules`
  important logic rules
- `Constraints / Notes`
  auth, async behavior, pagination, side effects, or special rules

## Final Guidance

When AI creates `endpoints.md`, it should copy this endpoint entry format for every endpoint so the whole file stays consistent and easy to scan.
