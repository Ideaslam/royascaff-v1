# Services Template — Detailed Guide

> This is the verbose reference for `../services-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- `services.md` lives at `project/actions/<api-app>/services.md` alongside `endpoints.md`.
- Create `services.md` **before** `endpoints.md`. Endpoints call services; client pages call endpoints.
- Every service must have a unique SVC- ID (sequential per file).
- Group services by module using the same module names from `project/plan/modules.md`.
- If a service is async, say so explicitly.
- If a service triggers side effects (email, webhooks, file upload), say so explicitly.
- Do not duplicate endpoint transport details (HTTP method, route) here.

## Service Types

| Type | Meaning | Examples |
|------|---------|----------|
| `internal` | Domain or application service. Owns business logic. | `UsersService`, `OrdersService` |
| `external` | Integration provider. Wraps a third-party SDK/API. | `S3StorageProvider`, `SendGridEmailProvider` |

## Layering Rules

- Controllers/endpoints must **not** call repositories or external APIs directly — they call **internal** services.
- **Internal** services may call repositories, other internal services, and **external** providers.
- **External** services must stay isolated per `backend-rule.md` (config-driven credentials, no vendor SDK in controllers).

## SVC- ID Header Format

```
### SVC-{NNN} · {ClassName} [{category}, {type}, {ModuleName}]
```

- **NNN**: Sequential number within the file
- **ClassName**: PascalCase service or provider class name
- **category**: `domain` (core business logic), `application` (orchestration), or `integration` (third-party)
- **type**: `internal` or `external`
- **ModuleName**: Owning backend module from `modules.md`

## Extended Entry Format

When a service needs detailed documentation beyond the compact format:

```md
### SVC-NNN · ServiceName [category, type, Module]

#### Description
{Clear explanation of what this service does in backend terms.}

#### Methods
- `methodName(inputShape): ReturnType` — what it does

#### Dependencies
- Repositories: `RepoName` — why
- Internal Services: `ServiceName` — why
- External Providers: `ProviderName` — why

#### Entities / DTOs
- `EntityOrDtoName` — purpose

#### Business Rules
- rule 1
- rule 2

#### Constraints / Notes
- async, retry, idempotency, side effects, security, or isolation notes
```

## Suggested Field Meanings

- **Status** — build state: `planned`, `partial`, `done`, `deferred` (see `engine/conventions.md`). Defaults to `planned` when specced before code; `deferred` states its reason.
- **Methods** — public methods endpoints or other services will call
- **Deps** — repositories, internal services, and external providers used
- **Side effects** — email, file operations, webhooks, async jobs, audit logs
- **Rules** — important business logic owned by this service
