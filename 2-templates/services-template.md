# Services File Template

## Short Summary

Use this template when creating `services.md`. The `services.md` file documents every **internal service** (a backend/web/mobile service class with a defined interface) and every **external service** (a third-party provider such as storage, AI, mail, payments, OAuth) that the system depends on.

This is a first-class planning document: endpoints declare which services they use, services declare which external providers they call, and the frontend is forbidden from calling external services directly (all such calls are proxied through the backend).

## Purpose

This template is not for service implementation code. It is a documentation template for listing services in one consistent format so that:

- every endpoint can reference the services it depends on,
- every internal service can reference the external providers it calls,
- the integration boundary (what may talk to a third party) is explicit and verifiable.

## File-Level Rules

- `services.md` is generated from the model (`InternalService` + `ExternalService` nodes).
- Internal services belong to a feature + target (a projection). External services are shared and target-agnostic.
- Only backend services may call external services. A web/mobile service that needs a third party must call a backend endpoint instead.
- Every external service must declare its provider, the interface it is accessed through, and the environment variables that hold its secrets.

## Recommended `services.md` Structure

```md
# Services

## Internal Services

### {Service Name} (`service:module.slug@target`)
{entry}

## External Services

### {Service Name} (`ext:slug`)
{entry}
```

## Internal Service Entry Template

```md
### {Service Name} (`service:{module}.{slug}@{target}`)

- Feature: `feature:{module}.{feature}`
- Target: `target:{backend|web|mobile}`
- Purpose: {what this service owns}

#### Interface

- `{method}({input}) -> {output}` — {description}
- `{method}({input}) -> {output}` — {description}

#### Uses Services

- `service:{...}` — {why}

#### Calls External

- `ext:{slug}` — {why} (backend only)

#### Notes

- {transaction, retry, idempotency, or isolation note}
```

## External Service Entry Template

```md
### {Service Name} (`ext:{slug}`)

- Provider: `{Cloudflare R2 | Anthropic Claude | MailJet | Stripe | Google OAuth}`
- Interface: `{IStorageProvider | IAIProvider | IMailProvider | IPaymentProvider | IOAuthProvider}`
- Secrets (env): `{ENV_VAR_1, ENV_VAR_2}`
- Contract: {what operations the interface exposes}

#### Notes

- Called only from the backend, exclusively through `src/integrations/{slug}/`.
- The frontend must never call this provider directly (no presigned PUT, no direct API calls).
```

## Example

```md
### Data Service (`service:data.data-service@backend`)

- Feature: `feature:data.upload-csv`
- Target: `target:backend`
- Purpose: Own the CSV file lifecycle — upload, row persistence, column metadata, deletion.

#### Interface

- `uploadFile(file, userId) -> { fileId, jobId, status }` — receive the file buffer and stream it to R2
- `listFiles(userId, filters) -> Paginated<CsvFile>` — list a user's files
- `deleteFile(fileId, userId) -> { deleted }` — delete file + rows + storage object

#### Uses Services

- `service:background-jobs.jobs-service@backend` — enqueue the analysis job

#### Calls External

- `ext:r2` — store the raw CSV object server-side

#### Notes

- The frontend uploads via `POST /data/upload/file`; it never PUTs to R2 directly.
```

## Final Guidance

When AI creates `services.md`, it should copy these entry formats for every service so the integration boundary stays explicit and the external-service isolation rule is enforceable. The filled project-specific service map should live in `3-plan/services.md`, not in this template file.
