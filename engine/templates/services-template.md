# Services Template

All backend services for one API app. Lives at `project/actions/<api-app>/services.md`. Created **before** endpoints — endpoints reference services.

> Verbose guidance → `references/services-template-guide.md`

## Schema

```md
# Services — {App}

## Module: {Name}

### SVC-001 · ClassName [category, type, Module]
- Methods:
  - `method(input): Return` — what it does
- Deps: `Repo`, `OtherService`, `Provider`
- Side effects: email | file | async | none
- Rules: business rule
```

Type: `internal` (business logic) or `external` (third-party adapter).

## Example

```md
## Module: Users

### SVC-001 · UsersService [domain, internal, Users]
- Methods:
  - `createUser(dto): User` — validate, hash password, persist
  - `listUsers(query): PaginatedResponse` — paginated admin list
  - `deleteUser(id): void` — soft-delete
- Deps: `UsersRepository`
- Side effects: none
- Rules: email unique; never return password hashes

## Module: Files

### SVC-002 · S3StorageProvider [integration, external, Files]
- Methods:
  - `getPresignedUploadUrl(key, type): PresignedUrl` — PUT URL
  - `deleteObject(key): void` — remove from bucket
- Deps: `AWS SDK (from env config)`
- Side effects: file upload/delete on remote storage
- Rules: config-driven credentials; never called from controllers
```
