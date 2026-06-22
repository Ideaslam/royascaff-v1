# Services File Template

## Short Summary

Use this template when creating `services.md`.  
The `services.md` file should be a list of all backend services the AI will build, and every service entry should use the same structure.

Create **`3-plan/services.md` before `4-actions/endpoints.md`**. Endpoints call services; pages call endpoints.

## Purpose

This template is not for writing actual service or provider code.  
It is a documentation template for listing planned backend services in one consistent format.

Each service entry should describe:

- service name
- type (`internal` or `external`)
- module
- purpose
- description
- public methods
- dependencies (repositories, other services, external APIs)
- entities/DTOs used
- business rules and constraints

## Service Types

| Type | Meaning | Examples |
|------|---------|----------|
| **internal** | Domain or application service. Owns business logic and orchestrates repositories and other services. | `UsersService`, `OrdersService`, `ReportsService` |
| **external** | Integration provider. Wraps a third-party SDK/API. No business rules beyond adapter concerns. | `S3StorageProvider`, `SendGridEmailProvider`, `OpenAiProvider` |

Rules:

- Controllers/endpoints must **not** call repositories or external APIs directly — they call **internal** services.
- **Internal** services may call repositories, other internal services, and **external** providers.
- **External** services must stay isolated per `backend-rule.md` (config-driven credentials, no vendor SDK in controllers).

## File-Level Rules

- `services.md` should contain a list of service entries grouped by module.
- Every service must use the same section order.
- Keep descriptions implementation-oriented and clear.
- If a service is async, say so explicitly.
- If a service triggers side effects (email, webhooks, file upload), say so explicitly.
- Do not duplicate endpoint transport details (HTTP method, route) here — endpoints reference services instead.

## Recommended `services.md` Structure

```md
# Services

## Module: {Module Name}

### Service 1
{entry}

### Service 2
{entry}
```

## Single Service Entry Template

```md
### Service {Number}

- Name: `{ServiceName}`
- Type: `{internal | external}`
- Module: `{Module Name}`
- Summary: `{short summary}`

#### Description

{Clear explanation of what this service does in backend terms.}

#### Purpose

- {Main use case 1}
- {Main use case 2}
- {Main use case 3}

#### Type Details

- Category: `{domain | application | integration}`
- Provider: `{vendor or N/A — e.g., AWS S3, SendGrid, OpenAI, N/A for internal}`
- Capability: `{storage | email | ai | payment | auth | search | N/A}`

#### Public Methods

- `{methodName}({inputShape}): {ReturnType} — {what it does}`
- `{methodName}({inputShape}): {ReturnType} — {what it does}`

#### Dependencies

- Repositories:
  - `{RepositoryName} — {why}`
- Internal Services:
  - `{ServiceName} — {why}`
- External Providers:
  - `{ProviderName} — {why}`

#### Entities / DTOs

- `{EntityOrDtoName} — {purpose}`
- `{EntityOrDtoName} — {purpose}`

#### Business Rules

- {Rule 1}
- {Rule 2}
- {Rule 3}

#### Constraints / Notes

- {Async, retry, idempotency, side effects, security, or isolation notes}
```

## Compact Service Entry Template

Use this if you want a shorter style but still consistent.

```md
### Service {Number}

- Name: `{ServiceName}`
- Type: `{internal | external}`
- Module: `{Module Name}`
- Description: `{what it does}`
- Methods:
  - `{methodName}(): {ReturnType} — {description}`
- Dependencies:
  - `{...}`
- Notes:
  - `{...}`
```

## Example — Internal Service

```md
### Service 1

- Name: `UsersService`
- Type: `internal`
- Module: `Users`
- Summary: `Manages user lifecycle, validation, and admin list queries.`

#### Description

Application service for user records. Handles create/update/delete logic, role assignment, and paginated admin queries. Controllers must not access `UsersRepository` directly.

#### Purpose

- Create and update users with validation
- Return paginated user lists for admin UI
- Soft-delete or deactivate users per business rules

#### Type Details

- Category: `domain`
- Provider: `N/A`
- Capability: `N/A`

#### Public Methods

- `createUser(dto: CreateUserDto): User — validates uniqueness, hashes password, persists user`
- `updateUser(id: string, dto: UpdateUserDto): User — updates allowed fields, enforces role rules`
- `listUsers(query: ListUsersQuery): PaginatedUsersResponse — paginated admin list with filters`
- `deleteUser(id: string): void — soft-deletes user if allowed`

#### Dependencies

- Repositories:
  - `UsersRepository — persistence for User entity`
- Internal Services:
  - `none`
- External Providers:
  - `none`

#### Entities / DTOs

- `User — persisted entity`
- `CreateUserDto — create input`
- `UpdateUserDto — update input`
- `ListUsersQuery — filter and pagination`
- `PaginatedUsersResponse — list output`

#### Business Rules

- Email must be unique
- Do not return password hashes from any method
- Only admin callers may list or delete users (enforced at endpoint/auth layer)

#### Constraints / Notes

- Pagination defaults: page=1, limit=20
- Use repository layer for all database access
```

## Example — External Service

```md
### Service 2

- Name: `S3StorageProvider`
- Type: `external`
- Module: `Files`
- Summary: `Wraps S3-compatible storage for upload URLs and object operations.`

#### Description

Integration provider for object storage. Encapsulates the vendor SDK and bucket configuration. Domain services call this provider; controllers never call it directly.

#### Purpose

- Generate presigned upload URLs
- Delete objects when records are removed
- Resolve public or signed download URLs

#### Type Details

- Category: `integration`
- Provider: `AWS S3 (or compatible)`
- Capability: `storage`

#### Public Methods

- `getPresignedUploadUrl(key: string, contentType: string): PresignedUrlResponse — short-lived PUT URL`
- `deleteObject(key: string): void — removes object from bucket`
- `getSignedDownloadUrl(key: string): string — short-lived GET URL`

#### Dependencies

- Repositories:
  - `none`
- Internal Services:
  - `none`
- External Providers:
  - `AWS SDK S3 client — configured from environment`

#### Entities / DTOs

- `PresignedUrlResponse — url and expiry metadata`

#### Business Rules

- Bucket and credentials come from config only
- Keys must be validated before signing

#### Constraints / Notes

- External provider — must not be called from frontend
- Retry transient SDK errors where safe
- Log failures without exposing credentials
```

## Suggested Field Meanings

- `Name`
  PascalCase service or provider class name
- `Type`
  `internal` (business logic) or `external` (third-party adapter)
- `Module`
  owning backend module from `modules.md`
- `Summary`
  one-line explanation
- `Public Methods`
  methods endpoints or other services will call
- `Dependencies`
  repositories, internal services, and external providers used
- `Entities / DTOs`
  shapes read or written by this service
- `Business Rules`
  important logic owned by this service
- `Constraints / Notes`
  async behavior, side effects, isolation, retries, security

## Final Guidance

When AI creates `services.md`, it should copy this service entry format for every service so the whole file stays consistent and easy to scan.  
After `services.md` is complete, create `endpoints.md` and reference the services each endpoint calls.