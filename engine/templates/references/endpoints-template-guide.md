# Endpoints Template — Detailed Guide

> This is the verbose reference for `../endpoints-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- `endpoints.md` lives at `project/actions/<api-app>/endpoints.md` alongside `services.md`.
- `<api-app>` is the API app's key from the Applications table in `project/profile.md`.
- Every endpoint must have a unique EP- ID (sequential per file).
- Keep descriptions implementation-oriented and clear.
- Use backend meaning, not only frontend button behavior.
- If an endpoint is async, say so explicitly in the Notes column.
- If an endpoint is paginated, say so explicitly in the Notes column.
- If an endpoint is a lite endpoint (for dropdowns), say so explicitly.
- Endpoints call services — not repositories or external providers directly.

## Column Reference

| Column | Meaning |
|--------|---------|
| `ID` | Unique endpoint identifier `EP-NNN`, sequential within the file |
| `Method` | HTTP verb: GET, POST, PUT, PATCH, DELETE |
| `Route` | Exact API route path |
| `Auth` | Access level: `public`, `authenticated`, `role:{role}`, `owner` |
| `Input` | Params, query, and body fields (compact) |
| `Return` | HTTP status + DTO/shape name |
| `Service` | `ServiceName.methodName()` — must exist in the same app's `services.md` |
| `Status` | Build state: `planned`, `partial`, `done`, `deferred` (see `engine/conventions.md`). Defaults to `planned` when the endpoint is specced before code. |
| `Notes` | Pagination, async, soft-delete, snapshot; **for `deferred`, the reason** (e.g. `deferred: post-MVP`) |

## Auth Values

| Value | Meaning |
|-------|---------|
| `public` | No authentication required |
| `authenticated` | Any logged-in user |
| `role:{role}` | Requires specific role (e.g., `role:admin`) |
| `owner` | Only the resource owner (+ admin override) |

## Extended Entry Format (when table is too compact)

When an endpoint needs detailed input/output documentation, expand it below the table:

```md
### EP-007 · POST /resource/bulk-action

- Auth: role:admin
- Input:
  - Body: `{ ids: string[], action: 'approve' | 'reject' }`
- Return: `200 { processed: number, failed: { id: string, reason: string }[] }`
- Service: `ResourceService.bulkAction()`
- Business Rules:
  - Only pending items can be processed
  - Partial success is allowed — failed items are reported individually
- Notes: async for batches > 50 items
```

## Ordering

- Group endpoints by module using `## Module: {ModuleName}` headers.
- Within each module, order: list → create → read-one → update → delete → special actions.
- Use the same module names from `project/plan/modules.md`.
