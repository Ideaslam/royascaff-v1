# Impact Analysis — AI Provider Interface

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `AiProviderInterface` (generic) | none | `integrations/ai/ai.interface.ts` | Only domain-specific `AiProvider` existed; no generic `generate/stream` contract |
| `AiProviderRegistry` | none | — | No registry; AI provider injected as a singleton token `AI_PROVIDER` |
| Provider self-registration | none | — | `AnthropicProvider` instantiated but not registered in a registry |
| `generate(request)` / `stream(request)` | none | — | Provider only exposed domain methods (`analyzeColumns`, `generateDashboard`) |
| Cost computation helper | partial | `anthropic.provider.ts` (inline) | Cost calc scattered inline in the provider |
| `AI_PROVIDER_REGISTRY` token | none | — | Not defined anywhere |
| Default provider config | none | `config.ts` | No `ai.defaultProvider` env/config key |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `ai.module.ts` | Must export registry + new token alongside existing `AI_PROVIDER` |
| `anthropic.provider.ts` | Must implement `AiProviderInterface` AND self-register in registry |
| All callers injecting `AI_PROVIDER` | Still works — `AI_PROVIDER` token remains, now `useExisting: AnthropicProvider` |

Feature state: **refactor of existing provider; registry is greenfield**

---

## Affected Modules

- **`src/integrations/ai/`** (modify) — extend `ai.interface.ts`, add `AiProviderRegistry`, refactor `AnthropicProvider`, update `ai.module.ts`
- **`src/config/config.ts`** (modify) — add `ai.defaultProvider`

---

## Plan Docs to Update

- [x] `project/actions/backend/services/` — add `AiProviderRegistry` service spec
- [x] `project/plan/modules.md` — update AI integration feature inventory

---

## Files Created

```
src/integrations/ai/ai-provider.registry.ts
```

## Files Modified

```
src/integrations/ai/ai.interface.ts        # +AiProviderInterface, AiGenerateRequest/Result, AI_PROVIDER_REGISTRY
src/integrations/ai/anthropic.provider.ts  # implements AiProviderInterface + OnModuleInit self-register
src/integrations/ai/ai.module.ts           # +AiProviderRegistry provider/export, +AI_PROVIDER_REGISTRY export
src/config/config.ts                       # +ai.defaultProvider
```

---

## Risk

- **Complexity: L** — pure refactor; interface wraps existing behavior with no logic changes.
- **Cross-module: N** — only `integrations/ai/` and config touched.
- **Migration: N** — backward-compatible; `AI_PROVIDER` token still resolves correctly.
- **Regression risk: L** — existing dashboard generation goes through the same `AnthropicProvider`; adding the interface is additive.

---

## Recommendation

### Implementation order within this CR
1. Define `AiProviderInterface`, `AiGenerateRequest`, `AiGenerateResult`, `AI_PROVIDER_REGISTRY` in `ai.interface.ts`.
2. Create `AiProviderRegistry` (resolve by id + fall back to default).
3. Refactor `AnthropicProvider` to implement `AiProviderInterface` + `OnModuleInit` self-register.
4. Update `ai.module.ts` to export registry.
5. Add `ai.defaultProvider` to `config.ts`.
