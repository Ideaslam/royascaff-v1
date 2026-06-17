# Backend Setup Guide

## Short Summary

This document defines generic backend conventions for any project. It covers architecture, tooling, performance, security, and operational practices. AI should follow these rules when creating or modifying backend code unless the project’s own docs or implemented patterns explicitly override them.

## Purpose

The backend is the API and business-logic layer. It should:

- expose stable, validated HTTP (or RPC) endpoints
- enforce authentication and authorization
- own business rules and workflow orchestration
- persist and query data through a clear data-access layer
- integrate with external services through isolated adapters
- fail safely, log usefully, and remain testable

Adapt stack choices (framework, database, message broker, etc.) to the project, but keep the architectural principles below.

---

## Core Technology Principles

### 1. Use a structured API framework

Prefer a framework with clear module boundaries and dependency injection (e.g. NestJS, Fastify with plugins, Spring Boot, etc.).

Use framework conventions consistently:

- modules / feature packages
- controllers / route handlers
- services / use cases
- guards / middleware
- interceptors / filters
- pipes / validators
- DTOs / request schemas

Avoid flat, handler-only structures where business logic, transport, and persistence are mixed in one file.

### 2. Use a dedicated data layer

Choose a primary database appropriate to the domain (relational, document, key-value, etc.).

Important rule:

- all persistence logic goes through repositories or data-access services — not directly inside controllers or route handlers

If the project defines a data model reference, treat it as the source of truth for entities, relationships, and naming.

### 3. Use TypeScript or an equivalent typed language

When the stack supports it, use static typing end-to-end for:

- request/response contracts
- domain models
- repository interfaces
- configuration objects

---

## Architecture

### 1. Layered architecture

Follow this dependency direction:

```text
controller / handler -> service / use case -> repository -> data model
```

Responsibilities:

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP transport only: parse input, call services, map responses |
| Service | Business logic, validation across entities, workflow orchestration |
| Repository | Queries, transactions, persistence details |
| Model / Schema | Structure, constraints, indexes |

Controllers may use multiple services. Services may use multiple repositories. Controllers must not contain business rules or direct database access.

### 2. Interfaces and contracts

Define explicit contracts where they improve clarity and testability:

- repository interfaces
- integration provider interfaces
- domain service interfaces for complex workflows

The goal is to isolate storage and third-party concerns from business logic.

### 3. Feature modules

Each business capability should own its API surface and logic.

Recommended module pattern:

```text
src/modules/<feature>/
  controllers/
  dto/
  schemas/          # or entities/ for SQL
  repositories/
  services/
  interfaces/
  mappers/
  <feature>.module.ts
```

### 4. Shared infrastructure

Cross-cutting code belongs in shared layers, not duplicated per feature.

```text
src/
  common/
    interceptors/
    filters/
    guards/
    decorators/
    pipes/
    utils/
    constants/
  config/
  database/
  integrations/
  modules/
```

### 5. Separation of concerns

- **Transport** — routing, status codes, serialization
- **Domain** — rules, invariants, workflows
- **Persistence** — queries, indexes, transactions
- **Integration** — external APIs, queues, storage, email, AI providers

Never let one layer leak responsibilities into another.

---

## Suggested Project Structure

Adapt folder names to the repo, but keep the same layering idea:

```text
src/
  main.ts
  app.module.ts
  config/
    config.ts
    env.validation.ts
  database/
    database.module.ts
    base.repository.ts
  common/
    interceptors/
    filters/
    guards/
    decorators/
    dto/
    utils/
  integrations/
    storage/
    mail/
    messaging/
    ai/
  modules/
    auth/
    users/
    <feature-a>/
    <feature-b>/
```

---

## Controller Rules

### 1. Transport-only

Controllers should:

- receive requests
- parse params, query, and body
- call services
- return mapped response DTOs

Controllers should not:

- implement business rules
- build database queries
- call third-party SDKs directly

### 2. DTOs for every input

Use DTOs or schema objects for:

- create body
- update body (prefer partial/update DTOs)
- list query filters
- route params when validation adds value

Validate at the boundary. Reject invalid input before it reaches services.

### 3. Stable response shapes

Use consistent response conventions across the API.

Paginated list example:

```ts
{
  items: [],
  page: 1,
  limit: 20,
  total: 100
}
```

For selector/dropdown endpoints, return minimal projections (id, label, and only fields needed by the client).

### 4. RESTful defaults with workflow exceptions

Default CRUD pattern:

- `GET /resources` — paginated list with filters and sorting
- `GET /resources/lite` — minimal list for selectors
- `GET /resources/:id` — full details
- `POST /resources` — create
- `PUT /resources/:id` or `PATCH /resources/:id` — update
- `DELETE /resources/:id` — delete

When CRUD is not enough, add explicit workflow endpoints:

- `POST /resources/:id/<action>`
- `POST /resources/:id/<sub-resource>`

Name actions by intent (`approve`, `publish`, `recalculate`, `upload`), not by internal implementation.

---

## Service Rules

### 1. Services own business logic

All domain rules live in services:

- entity lifecycle and state transitions
- cross-entity validation
- calculations and aggregations
- orchestration across repositories and integrations

The backend is the source of truth. Do not rely on frontend calculations for authoritative business results.

### 2. Services orchestrate, repositories persist

Services may coordinate multiple repositories and integration providers. They should not embed low-level query syntax or vendor SDK details.

### 3. Services must be testable

Design services with constructor injection so unit tests can mock repositories and integrations.

### 4. Idempotency for side effects

For operations that trigger external side effects (payments, emails, webhooks, file writes), design for safe retries where the domain requires it.

---

## Repository Rules

### 1. Repositories own data access

Repository responsibilities:

- create, read, update, delete
- filtered and paginated queries
- lite/minimal projections
- relation loading when required
- transaction boundaries when needed

### 2. Hide persistence details

Services should not depend on ORM-specific APIs (`find`, `populate`, `join`, raw SQL, aggregation pipelines). That logic stays in repositories.

### 3. Consistent query patterns

List methods should support, where appropriate:

- pagination (`page`, `limit`, or cursor)
- sorting
- filtering
- text search
- date ranges
- relation filters

### 4. Indexes match access patterns

Define indexes for frequent filters, sorts, and unique constraints. Review query plans for hot paths during performance work.

---

## Schema and Data Model Rules

### 1. One schema per aggregate/collection/table

Keep entity definitions close to the owning feature module unless the project uses a shared schema registry.

### 2. Timestamps

Enable `createdAt` / `updatedAt` (or equivalent) on persistent entities unless there is a strong reason not to.

### 3. Enums for controlled values

Use enums or constrained types for statuses, roles, categories, and other fixed vocabularies.

### 4. Snapshot historical values when needed

When referenced data can change over time (pricing, tax rates, product names), snapshot values on transactional records instead of relying only on live references.

### 5. Avoid document bloat

Do not store large binary payloads in primary business documents. Store metadata in the database and binaries in object storage unless the use case explicitly requires otherwise.

---

## Validation Rules

Validate consistently at the API boundary and again in services when cross-field or domain rules apply.

Validation should cover:

- required fields
- types and formats
- enum restrictions
- numeric ranges
- string length limits
- safe query parameters
- ID format before repository lookup

Return clear, field-level errors for client-facing validation failures.

---

## Security

### 1. Authentication

Support a standard auth flow appropriate to the project:

- login / token issuance
- registration (if applicable)
- password reset or magic-link flow
- token refresh when using short-lived access tokens

Use industry-standard mechanisms (JWT, session cookies with secure flags, OAuth/OIDC where required).

### 2. Authorization

Protect APIs by default. Public routes must be explicit and minimal.

Use role-based or permission-based checks for sensitive operations (admin settings, user management, destructive actions, billing, exports).

Apply authorization at the service or guard layer, not only in the frontend.

### 3. Secrets and credentials

- never hardcode secrets, API keys, or connection strings
- read configuration from environment variables or a secrets manager
- validate required secrets at startup
- rotate credentials without code changes where possible

### 4. Password and credential storage

- never store plain-text passwords
- use strong, adaptive hashing (e.g. bcrypt, argon2)
- never log passwords, tokens, or recovery codes

### 5. Input safety

- validate and sanitize all external input
- parameterize queries — no string-concatenated SQL/NoSQL
- enforce request size limits for uploads and payloads
- validate content types for file uploads

### 6. Output safety

- do not expose stack traces, internal paths, or provider errors to clients
- avoid over-fetching sensitive fields in list endpoints
- apply field-level redaction for PII where appropriate

### 7. Transport and headers

In production:

- use HTTPS only
- set secure cookie flags when using cookies
- configure CORS explicitly — never `*` with credentials
- apply security headers (helmet or equivalent)
- rate-limit auth and expensive endpoints

### 8. Dependency hygiene

Keep dependencies updated. Scan for known vulnerabilities as part of CI or release checks.

---

## Performance

### 1. Design for predictable latency

- paginate all list endpoints — never return unbounded result sets by default
- use projection/lite queries for selectors and dashboards
- avoid N+1 queries — use joins, populate, or batch loading in repositories
- cache read-heavy, slow-changing data when it materially helps (with explicit invalidation)

### 2. Database efficiency

- index fields used in filters, sorts, and unique constraints
- prefer cursor-based pagination for very large datasets
- use transactions only where consistency requires them
- offload heavy reporting to read replicas or async jobs when appropriate

### 3. Async and background work

Move slow or unreliable work off the request path when possible:

- email and notifications
- file processing and virus scanning
- report generation
- webhook delivery
- AI/ML inference for non-interactive flows

Use queues or job runners with retries, dead-letter handling, and idempotency keys.

### 4. External service resilience

For third-party calls:

- set timeouts
- use retries with backoff only where safe
- circuit-break or degrade gracefully when providers fail
- do not block the main request longer than the SLA allows

### 5. Payload and asset handling

- stream large downloads/uploads when supported
- compress responses where beneficial
- store large files in object storage, not in application memory or primary DB rows

### 6. Observability drives optimization

Measure before optimizing. Track latency, error rate, and throughput per endpoint and per integration.

---

## Third-Party Integration Rules

### 1. Adapter pattern

Split responsibilities:

- **provider service** — wraps the vendor SDK/API
- **domain service** — orchestrates business use of that provider

Example:

- `s3-storage.provider.ts`
- `document-upload.service.ts`

This keeps vendor logic reusable and swappable.

### 2. Integration folders

Group integrations by capability:

```text
integrations/
  storage/
  mail/
  messaging/
  payments/
  ai/
  webhooks/
```

### 3. No direct SDK calls from controllers

All external access goes through services or dedicated integration providers.

### 4. Configuration per environment

External service credentials and endpoints come from config — never from code constants.

---

## Configuration and Environment

### 1. Centralize configuration

Use a dedicated config module with typed access to settings.

Minimum:

- `config.ts` — typed config object
- `env.validation.ts` — startup validation of required variables

### 2. Environment-specific values

Typical categories:

- database connection
- auth secrets
- app port and public URL
- object storage credentials
- email/messaging provider keys
- AI provider keys
- feature flags

### 3. Fail fast at startup

Do not allow the app to boot with missing critical configuration.

### 4. Feature flags

Use flags for incomplete or risky features rather than branching on hardcoded environment checks scattered through the codebase.

---

## Error Handling

### 1. Consistent HTTP semantics

| Status | Use for |
|--------|---------|
| `400` | Validation failures, malformed input |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (unique constraint, invalid state transition) |
| `422` | Semantically invalid but well-formed input (optional convention) |
| `429` | Rate limit exceeded |
| `500` | Unexpected server errors |

### 2. Global exception handling

Use framework-level exception filters or middleware instead of repetitive try/catch in every controller.

### 3. Structured error responses

Return a consistent error shape:

```ts
{
  statusCode: 400,
  message: "Validation failed",
  errors: [{ field: "email", message: "Invalid email" }]
}
```

### 4. Do not leak internals

Log full details server-side; return safe messages to clients.

---

## Logging and Observability

### 1. Structured logging

Log important events in a structured format (JSON or key-value) for search and alerting:

- authentication events (success/failure, without secrets)
- entity lifecycle changes
- integration failures
- background job outcomes
- slow requests beyond a threshold

### 2. Correlation IDs

Propagate a request/correlation ID through logs and downstream calls to simplify tracing.

### 3. Metrics and health checks

Expose:

- liveness/readiness endpoints
- basic dependency health (database, cache, queue) where applicable
- metrics for request latency, error rate, and queue depth

### 4. Privacy in logs

Never log:

- passwords or tokens
- full credit card or government ID data
- unnecessary PII

Mask or omit sensitive fields by default.

---

## Testing

### 1. Unit tests for services

Test business logic with mocked repositories and integrations. Focus on rules, edge cases, and state transitions.

### 2. Repository/integration tests

Test data access against a real or in-memory database when query correctness matters.

### 3. API / e2e tests

Cover critical contracts:

- auth flows
- main CRUD paths
- permission boundaries
- important workflow endpoints

### 4. Test naming and layout

Co-locate or mirror source structure. Name tests by behavior, not by method name alone.

---

## Naming and Consistency

- Use singular class names; plural route names where REST convention applies.
- DTOs: `Create<Entity>Dto`, `Update<Entity>Dto`, `List<Entity>QueryDto`.
- Repositories: `<Entity>Repository`.
- Services: `<Entity>Service`, `<Domain>Service` for cross-cutting domain logic.
- Keep module names aligned with business capabilities, not UI page names.

---

## Conventions AI Should Follow

- Use layered architecture: controller → service → repository → model.
- Keep business logic in services; persistence in repositories.
- Validate all external input with DTOs or schemas.
- Centralize config and validate environment at startup.
- Use consistent CRUD and lite endpoint patterns unless workflow endpoints are required.
- Wrap third-party SDKs in integration providers.
- Protect APIs with auth and authorization by default.
- Paginate lists; index hot queries; offload slow work asynchronously.
- Log structurally; handle errors globally; never expose internals.
- Write tests for services and critical API flows.

---

## What AI Should Not Do

- Do not put business logic in controllers.
- Do not access the database/ORM directly from controllers.
- Do not hardcode secrets, URLs, or environment-specific values.
- Do not couple domain services directly to vendor SDKs.
- Do not treat frontend calculations as the source of truth.
- Do not skip input validation.
- Do not create god-services that mix unrelated domains.
- Do not return unbounded lists or load unbounded relations by default.
- Do not log secrets or sensitive personal data.

---

## Final Guidance

Treat this document as the default backend convention for any project using this template. When the repository already has established patterns, follow the implemented code and project-specific docs (data model, endpoints, domain notes). When starting fresh, use this guide to keep the backend modular, secure, performant, testable, and maintainable.
