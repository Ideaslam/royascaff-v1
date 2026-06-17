# Custom Feature Rules File Template

## Short Summary

Use this template when creating `custom-feature-rules.md`.  
The `custom-feature-rules.md` file should capture **project-specific rules and notes for features** that go beyond the normal feature description.

## Purpose

This template is not for generic backend rules, frontend rules, or standard feature definitions.  
It is a documentation template for special implementation constraints tied to specific modules and features.

Use this file when a feature needs extra guidance such as:

- AI provider usage
- SMS, email, or WhatsApp integration
- payment gateway integration
- object storage or file delivery rules
- async/background job behavior
- webhook or third-party API requirements
- security, compliance, or secret-handling rules
- performance, caching, or rate-limit rules
- feature-specific business logic that must not be missed

Each rule entry should describe:

- which module and feature it applies to
- what special behavior is required
- which provider, service, or pattern to use
- what AI must do or must not do for that feature

## File-Level Rules

- `custom-feature-rules.md` is created after `features.md`.
- Use the **exact module and feature names** from `features.md`.
- Put rules here only when they are **feature-specific** or **project-specific**.
- Do not repeat generic rules already covered in `backend-rule.md` or `frontend-rule.md`.
- One feature may have zero, one, or many custom rules.
- If a rule applies to multiple features, document it once under the primary feature and reference the others.
- Prefer clear mandatory language: `must`, `must not`, `should`, `should not`.
- If a feature uses an external provider, name the provider type and expected integration layer.
- If a feature is async, say so explicitly and describe status tracking expectations.

## Recommended `custom-feature-rules.md` Structure

```md
# Custom Feature Rules

## Short Summary

{One paragraph: what project these custom rules apply to.}

Source inputs:

- `features.md`
- `modules.md`
- `{product notes, integrations, provider docs, or business constraints}`

This file adds special implementation rules for specific features.  
Generic coding conventions remain in `backend-rule.md` and `frontend-rule.md`.

## How To Use This File

When AI builds `endpoints.md`:

- apply these rules to the matching module and feature
- reflect async, integration, and security constraints in endpoint notes

When AI builds `pages.md`:

- apply frontend-related custom rules to the matching pages
- do not expose secrets or provider internals in the UI

When AI builds backend or frontend code:

- treat these rules as mandatory for the matching feature unless the user explicitly overrides them
- route third-party usage through integration/provider layers

## Rules By Module

## Module: {Module Name}

{module custom rules block}

## Module: {Module Name}

{module custom rules block}

## Global Feature Rules

Use this section only for rules that apply across multiple modules.

- {Global rule 1}
- {Global rule 2}

## Final Guidance

If a feature has no special rule, do not create an empty entry for it.
```

## Single Module Custom Rules Block Template

```md
## Module: {Module Name}

### Module Notes

- {Optional module-wide custom note}

### Feature: {Feature Name}

#### Rule Type

- `{AI | Integration | Async Job | Storage | Security | Business Logic | Performance | Other}`

#### Summary

{One-line explanation of the special rule.}

#### Required Behavior

- {What AI or the implementation must do}
- {What AI or the implementation must do}

#### Provider / Integration

- Provider: `{OpenAI | Claude | Twilio | SMS gateway | SMTP | S3 | R2 | WhatsApp API | none}`
- Integration layer: `{src/integrations/... | service abstraction | webhook handler}`
- Secrets: `{server-side only | env vars | secret manager}`

#### Constraints

- {Constraint 1}
- {Constraint 2}

#### Must Not

- {Forbidden behavior 1}
- {Forbidden behavior 2}

#### Notes

- {Extra implementation note}
```

## Compact Rule Entry Template

```md
### Feature: {Feature Name}

- Type: `{AI | Integration | Async Job | Storage | Security | Business Logic | Performance | Other}`
- Summary: `{short rule}`
- Must:
  - `{required behavior}`
- Provider:
  - `{provider or N/A}`
- Must not:
  - `{forbidden behavior}`
```

## Rule Type Templates

### AI Rule Template

```md
### Feature: {Feature Name}

#### Rule Type

- `AI`

#### Summary

{What AI should do in this feature.}

#### Required Behavior

- use backend-controlled AI workflow only
- accept input from `{fields, files, or user prompt}`
- return `{structured JSON | HTML | text | classification labels}`
- store AI output in `{collection / document / file location}`
- track generation status for async flows

#### Provider / Integration

- Provider: `{OpenAI | Claude | Azure OpenAI | other}`
- Integration layer: `src/integrations/ai/`
- Model selection: `{fixed model | configurable per request | settings-driven}`

#### Constraints

- frontend must not call the AI provider directly
- API keys must remain server-side only
- sanitize or safely store generated HTML before rendering

#### Must Not

- expose provider API keys to the client
- treat frontend-generated AI output as the source of truth
```

### Integration Rule Template

```md
### Feature: {Feature Name}

#### Rule Type

- `Integration`

#### Summary

{What external provider or service this feature must use.}

#### Required Behavior

- send `{email | SMS | WhatsApp | payment | webhook | push}` through backend integration
- use provider payload format `{describe if known}`
- log success/failure without exposing secrets

#### Provider / Integration

- Provider: `{Twilio | SMS gateway | SMTP | WhatsApp API | Stripe | other}`
- Integration layer: `src/integrations/{provider}/`
- Secrets: `env vars or secret manager only`

#### Constraints

- retries: `{yes/no and rule}`
- timeout: `{value or policy}`
- user-facing failure message must be generic

#### Must Not

- call provider SDK directly from controller or frontend
- store provider secrets in database or frontend state
```

### Async Job Rule Template

```md
### Feature: {Feature Name}

#### Rule Type

- `Async Job`

#### Summary

{Why this feature must run asynchronously.}

#### Required Behavior

- create background job when `{trigger action}`
- expose status endpoint or polling mechanism
- store statuses such as `{queued | processing | completed | failed}`
- persist failure reason for admin/debug visibility

#### Provider / Integration

- Provider: `{queue | jobs collection | worker | none}`
- Integration layer: `src/modules/{module}/` or `src/integrations/queue/`

#### Constraints

- job must be idempotent or safely retryable
- long-running work must not block the main HTTP request

#### Must Not

- fake async behavior in frontend only
- lose job state on server restart without persistence
```

## Example

```md
## Module: Projects

### Feature: AI Technical Proposal Generation

#### Rule Type

- `AI`
- `Async Job`

#### Summary

Generate technical proposal content and HTML through a backend-controlled AI workflow with persisted job status.

#### Required Behavior

- queue proposal generation from project data, selected services, booth info, and uploaded RFP
- process generation asynchronously
- store generated HTML in project documents and object storage
- expose polling/status endpoint for frontend progress tracking

#### Provider / Integration

- Provider: `Claude or project-selected AI provider`
- Integration layer: `src/integrations/ai/`
- Secrets: `server-side only`

#### Constraints

- generation may run in multiple steps or batches
- edited HTML must be versioned separately from generated output
- sanitize generated HTML before rendering

#### Must Not

- call AI provider from frontend
- overwrite issued proposal snapshots silently

### Feature: Proposal Delivery Notification

#### Rule Type

- `Integration`

#### Summary

Notify the user when proposal generation completes or fails.

#### Required Behavior

- send notification through backend integration after job completion
- support email first; SMS/WhatsApp only if enabled in settings

#### Provider / Integration

- Provider: `SMTP` and optional `SMS gateway`
- Integration layer: `src/integrations/mail/` and `src/integrations/sms/`

#### Constraints

- notification must not include provider secrets or internal stack traces

#### Must Not

- send notifications directly from frontend
```

## Suggested Field Meanings

- `Module Name`
  must match `modules.md` and `features.md`
- `Feature Name`
  must match the feature name in `features.md`
- `Rule Type`
  category of special behavior: AI, integration, async, storage, security, etc.
- `Summary`
  one-line explanation of the custom requirement
- `Required Behavior`
  mandatory actions for implementation
- `Provider / Integration`
  external service and expected code layer
- `Constraints`
  timeout, retry, persistence, auth, or data-handling limits
- `Must Not`
  forbidden implementation patterns
- `Global Feature Rules`
  rules that apply across multiple modules

## Final Guidance

When AI creates `custom-feature-rules.md`, it should:

1. read `features.md` first
2. add rules only where a feature needs special implementation guidance
3. keep every rule tied to a module and feature
4. use explicit provider and async language when applicable

The filled project-specific rules should live in `.ai-control/rules/custom-feature-rules.md`, not in this template file.
