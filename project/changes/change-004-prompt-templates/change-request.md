# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): `integrations/ai` (prompts submodule)
- Feature(s): file-based editable prompt templates
- Endpoint(s): none now (admin editing is future)
- Service(s): `PromptTemplateService` (loader + renderer)

## Description
Move **all AI prompt templates out of code and into editable `.md` files** (A8), so prompts can be edited without code changes now, and edited from an admin panel later.

Desired behavior:
- A `prompts/` directory of `.md` files, one per prompt (e.g. `dashboard-generate.md`, `column-mapping.md`, `clean-data.md`, `add-widget.md`, `edit-widget.md`).
- Each template supports **variable interpolation** (e.g. `{{columns}}`, `{{purpose}}`) and optional metadata front-matter (name, version, description, default provider/model).
- `PromptTemplateService` loads a template by key, renders it with variables, and returns the final prompt string.
- The loader is behind an interface with a **swappable source**: `file` now, `db`/admin later — callers only reference a prompt **key**, never inline strings.
- Migrate existing hardcoded prompts (dashboard generation, column description, etc.) into `.md` files.

### OLAP dialect handling (from the ClickHouse/BigQuery strategy, change-001)

Because a workspace can run **ClickHouse or BigQuery**, any AI output that becomes a query is dialect-sensitive. Strategy:
- **Primary path — dialect-neutral:** query-generating prompts (`dashboard-generate`, `add-widget`, `edit-widget`, filter selection) instruct the AI to emit the **structured query spec** (compiled to SQL per engine by change-001's `QueryCompiler`), **not** raw SQL. These prompts stay engine-agnostic → one template, no per-dialect duplication.
- **Free-form SQL path (only where unavoidable, e.g. advanced `clean-data`):** the prompt receives an injected `{{dialect}}` variable plus a per-engine **SQL capabilities partial** (`prompts/partials/dialect-clickhouse.md`, `prompts/partials/dialect-bigquery.md`) describing function names/quirks. The renderer selects the partial by the workspace's active engine.
- The `PromptTemplateService.render` signature accepts an optional `dialect`/engine context so callers pass the workspace engine; templates that don't need it ignore it.

Out of scope: the admin-panel UI to edit prompts (future change); provider selection (change-003).

## Acceptance Criteria
1. All prompts used by current AI features exist as `.md` files under `prompts/` (no inline prompt strings remain in services).
2. `PromptTemplateService.render(key, vars, ctx?)` returns the interpolated prompt; missing variables are reported clearly.
3. Templates support metadata front-matter (name, version, description) that the loader parses.
4. The prompt source is behind an interface so a future `db`/admin source can replace the file source without changing callers.
5. Editing a `.md` prompt file changes model behavior on next run with no code change/redeploy of logic.
6. Existing dashboard generation produces equivalent output using the file-based prompt.
7. Query-generating prompts emit the neutral query spec (engine-agnostic); free-form SQL prompts receive `{{dialect}}` + the correct per-engine SQL-capabilities partial for the workspace's active OLAP engine.

## Notes (optional)
- Depends on: none (independent). Consumed by: 006, 007 (pipeline/AI steps reference prompt keys).
- Extensibility (A11): a new/updated prompt = edit/add a `.md` file, no code change.
- Reference: `Phases.md` A8, B19, Extensibility Contract.
