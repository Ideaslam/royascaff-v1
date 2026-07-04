# Impact Analysis — Prompt Templates

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Prompt `.md` files | none | — | All prompts are inline strings inside `anthropic.provider.ts` |
| `PromptTemplateLoader` interface | none | — | No abstraction; hard-coded in provider |
| `FilePromptTemplateLoader` | none | — | No file-based loader |
| `PromptTemplateService` | none | — | No service facade |
| Variable interpolation | none | — | Template rendering done ad-hoc (string concatenation) |
| Dialect partial injection | none | — | No per-engine SQL-capabilities partial concept |
| Front-matter parsing | none | — | No YAML/TOML front-matter in any prompt |
| `ai.promptsDir` config key | none | `config.ts` | Missing; prompts directory not configurable |
| Prompt keys used | ad-hoc | `anthropic.provider.ts` lines 159–231 | Dashboard generate and column analysis built inline |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `anthropic.provider.ts` — `analyzeColumns()` | Inline prompt string; must delegate to `PromptTemplateService.renderText('column-analysis', …)` |
| `anthropic.provider.ts` — `generateDashboard()` | Inline prompt; must delegate to `PromptTemplateService.renderText('dashboard-generate', …)` |
| `ai.module.ts` | Must provide/export `FilePromptTemplateLoader` + `PromptTemplateService` |

Feature state: **greenfield template system; migration of existing prompts**

---

## Affected Modules

- **`src/integrations/ai/prompt-template/`** (new) — `PromptTemplateLoader` interface, `FilePromptTemplateLoader`, `PromptTemplateService`, `PROMPT_TEMPLATE_LOADER` token
- **`src/integrations/ai/prompts/`** (new) — all `.md` prompt files + `partials/` dialect files
- **`src/integrations/ai/anthropic.provider.ts`** (modify) — replace inline strings with `PromptTemplateService.renderText()`
- **`src/integrations/ai/ai.module.ts`** (modify) — register loader + service
- **`src/config/config.ts`** (modify) — add `ai.promptsDir`

---

## Plan Docs to Update

- [x] `project/actions/backend/services/` — add `PromptTemplateService` spec

---

## Files Created

```
src/integrations/ai/prompt-template/prompt-template.interface.ts
src/integrations/ai/prompt-template/file-prompt-template.loader.ts
src/integrations/ai/prompt-template/prompt-template.service.ts
src/integrations/ai/prompts/column-analysis.md
src/integrations/ai/prompts/dashboard-generate.md
src/integrations/ai/prompts/column-mapping.md
src/integrations/ai/prompts/add-widget.md
src/integrations/ai/prompts/edit-widget.md
src/integrations/ai/prompts/filter-selection.md
src/integrations/ai/prompts/clean-data.md
src/integrations/ai/prompts/partials/dialect-clickhouse.md
src/integrations/ai/prompts/partials/dialect-bigquery.md
```

## Files Modified

```
src/integrations/ai/anthropic.provider.ts    # analyzeColumns + generateDashboard → renderText()
src/integrations/ai/ai.module.ts             # +FilePromptTemplateLoader + PromptTemplateService
src/config/config.ts                         # +ai.promptsDir
```

---

## Risk

- **Complexity: M** — file-based loader with front-matter parsing and partial injection is new code; the actual prompt text migration is mechanical.
- **Cross-module: N** — only `integrations/ai/` touched.
- **Migration: N** — existing prompt logic replicated in `.md` files; behavior verified by running existing generation flow.
- **Regression risk: M** — prompt text changes between inline string and file must be identical or intentionally improved; must test dashboard generation output.

---

## Recommendation

### Implementation order within this CR
1. Define `PromptTemplateLoader` interface + `PROMPT_TEMPLATE_LOADER` token.
2. Implement `FilePromptTemplateLoader` (read `.md`, parse front-matter, interpolate `{{var}}`, inject `{{> partial}}`).
3. Implement `PromptTemplateService` (thin facade).
4. Create all `.md` prompt files and dialect partials.
5. Update `anthropic.provider.ts` to use `PromptTemplateService.renderText()`.
6. Register in `ai.module.ts`; add config key.
