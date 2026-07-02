# Services Template

All backend services for one API app. Lives at `project/actions/<api-app>/services.md`. Created **before** endpoints — endpoints reference services.

> Verbose guidance → `references/services-template-guide.md`

## Schema

```md
# Services — {App}

## Module: {Name}

### SVC-001 · ClassName [category, type, Module]
- Status: planned | partial | done | deferred
- Methods:
  - `method(input): Return` — what it does
- Deps: `Repo`, `OtherService`, `Provider`
- Side effects: email | file | async | none
- Rules: business rule
```

Type: `internal` (business logic) or `external` (third-party adapter).
Status: `planned` · `partial` · `done` · `deferred` (see `engine/conventions.md`). New services default to `planned`; `deferred` states its reason (e.g. `deferred: waiting on provider`).

## Example

```md
## Module: Users

### SVC-001 · UsersService [domain, internal, Users]
- Status: done
- Methods:
  - `createUser(dto): User` — validate, hash password, persist
  - `listUsers(query): PaginatedResponse` — paginated admin list
  - `deleteUser(id): void` — soft-delete
- Deps: `UsersRepository`
- Side effects: none
- Rules: email unique; never return password hashes

## Module: Files

### SVC-002 · S3StorageProvider [integration, external, Files]
- Status: planned
- Methods:
  - `getPresignedUploadUrl(key, type): PresignedUrl` — PUT URL
  - `deleteObject(key): void` — remove from bucket
- Deps: `AWS SDK (from env config)`
- Side effects: file upload/delete on remote storage
- Rules: config-driven credentials; never called from controllers
```
