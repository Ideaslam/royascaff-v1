# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: medium
- **request-id**: REQ-MODEL-ROUTE
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): AI / Pipeline v3 Foundations; Settings & Config
- Feature(s): Model-by-request-type resolver → DB-config-driven routing
- Endpoint(s): — (no new endpoints)
- Page(s)/View(s): — (backend-only)
- Service(s): `model-resolver` / Claude traced callers; `config` seed + repository read; short cache loader

## Description

Pipeline v3 today resolves Claude models via a hardcoded strong/fast preference map; most request types (including map and section) use the strong/default workspace model, so research accuracy and cost are not independently tunable.

**Desired end state:** Each pipeline request type resolves to a concrete Claude model ID from a system `config` document (`pipelineModelRouting`), seeded via `seed-config` / `seedConfigBundle`. Research types use a stronger model for accuracy; DNA / map / section use a medium model; translate / repair use a fast model. Resolver reads config on each call with a short in-memory cache; if config is missing, falls back to hardcoded defaults. Unknown request types use the seeded **medium** default. Workspace `strongModel` / `fastModel` are **not** used for v3 routing (DB config only). Invalid model IDs fail at Claude API as today (no pre-validation against `aiProviders`). No frontend, no multi-provider, no per-project overrides, no creative v2 changes.

### Seed mapping (proposed defaults)

| Request type | Tier intent | Model ID |
|---|---|---|
| `research.*` (all research modules) | strong | `claude-opus-5` |
| `section.research` | strong | `claude-opus-5` |
| `dna.core` | medium | `claude-sonnet-5` |
| `map` | medium | `claude-sonnet-5` |
| `section` | medium | `claude-sonnet-5` |
| `vision` | medium | `claude-sonnet-5` |
| `translate` | fast | `claude-haiku-4-5-20251001` |
| `repair` | fast | `claude-haiku-4-5-20251001` |
| *(unknown / `defaultModel`)* | medium | `claude-sonnet-5` |

Config shape:

```js
{
  defaultModel: "claude-sonnet-5",
  byRequestType: { /* requestType → modelId */ }
}
```

Do **not** use Claude Fable models.

## Acceptance Criteria
1. System config document `pipelineModelRouting` is seeded by existing `seed-config` / `seedConfigBundle` (upsert).
2. All pipeline v3 Claude calls resolve model via config `byRequestType[requestType]`, else `defaultModel` (medium), else hardcoded defaults when config doc is absent.
3. Seed assigns Opus 5 to all `research.*` + `section.research`; Sonnet 5 to `dna.core`, `map`, `section`, `vision`; Haiku 4.5 to `translate` + `repair`.
4. Resolver uses a short TTL cache; config changes take effect without process restart after cache expiry.
5. Workspace `settings.model` / `strongModel` / `fastModel` do not override v3 request-type routing.
6. Traces continue to record the resolved model + cost as today; no new endpoints or FE changes.
7. Unknown `requestType` resolves to medium `defaultModel`.
8. Invalid model ID in config surfaces as Claude API failure (same as today).

## Notes (optional)
- Hardcoded fallbacks remain in code for boot/seed-not-run safety.
- Ensure `MODEL_PRICING` covers Opus 4.5 if missing (cost traces accuracy).
- Out of scope: OpenAI/Gemini routing, Settings UI, per-workspace model map, creative v2 pipeline.
