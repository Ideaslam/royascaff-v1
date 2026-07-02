# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: refactor
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): `integrations/ai`
- Feature(s): pluggable AI-provider interface
- Endpoint(s): none (internal); existing AI-logs endpoints unchanged
- Service(s): `AiProviderInterface`, provider registry, `AnthropicProvider` (refactored)

## Description
Formalize a **pluggable AI-provider interface** so the AI provider can be swapped **per process/step** (A7). Today AI calls go through an Anthropic provider directly; this couples every AI-using feature to one vendor.

Desired behavior:
- Define `AiProviderInterface` with a stable contract: `generate(request)`, `stream(request)`, and cost/usage reporting (token counts, model, price) feeding the existing AI-log/pricing tables.
- A **provider registry** keyed by provider id (`anthropic`, future: `openai`, `gemini`, …). Providers self-register.
- Refactor the current Anthropic usage to implement the interface behind the registry — no behavior change for existing dashboard generation.
- A **default provider** is configurable; any caller (pipeline step, dashboard op) can **override** the provider per call.
- Preserve existing AI logging, pricing, and job-timeout behavior.

Out of scope: prompt storage (change-017), pipeline steps that consume the provider (change-019). Adding a second concrete provider is optional/future — only the abstraction + Anthropic refactor are required here.

## Acceptance Criteria
1. `AiProviderInterface` defines `generate`, `stream`, and usage/cost reporting.
2. A provider registry resolves providers by id; `AnthropicProvider` registers and implements the interface.
3. Existing dashboard generation works unchanged through the interface (no regression).
4. A default provider is config-driven and can be overridden per call.
5. AI usage logging and pricing continue to record model/token/cost as before.
6. Adding a new provider requires only implementing the interface + one registry entry (no changes to callers).

## Notes (optional)
- Depends on: none (independent). Consumed by: 019 (pipeline steps), 020 (dashboard pipelines).
- Extensibility (A11): callers select providers by id/string; no hard imports of concrete providers.
- Reference: `Phases.md` A7, B18.
