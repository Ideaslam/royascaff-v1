# Bug 20260809-122327 — Pipeline v3 maxTokens not env-configurable

## Status
**DONE** — Confirmed 2026-08-09

## Reported
- **Date**: 2026-08-09
- **Severity**: medium
- **Affected area**: `roya-sales-ai-api-v2` / pipeline-v3 AI call budgets

## Description
Pipeline v3 stage `maxTokens` values are hardcoded (DNA/analyze 10000, map 32000, section/translate 6000, default fallback 8192). Operators cannot tune them via `.env`, and current caps are too low for dense outputs.

## Expected Behavior
- Stage max tokens live in `.env` (and `.env.example`) so they can be changed without code edits.
- Current hardcoded values are doubled.
- Shared Claude fallback default (when a call omits `maxTokens`) is **16000**.

## Steps to Reproduce (if applicable)
1. Inspect hardcoded `maxTokens` in analyze / map / section / translate / `claude-traced.ts`.
2. Note no corresponding `PIPELINE_V3_*_MAX_TOKENS` in `.env`.

## Root Cause
Token budgets were baked into orchestrator call sites and the `callClaudeJsonTraced` default (`8192`), with only creative-v2 exposing `CREATIVE_SECTION_MAX_TOKENS` via `config`.

## Fix Applied
- Added `PIPELINE_V3_*_MAX_TOKENS` to `.env` / `.env.example` (2× prior values; default fallback 16000).
- Exposed them on `config.pipeline` in `environment.ts`.
- Wired analyze/DNA/research, map, section, translate, and `claude-traced` to read from config.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (literals removed; env-backed with same-or-higher defaults)
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/.env`
- `roya-sales-ai-api-v2/.env.example`
- `roya-sales-ai-api-v2/src/config/environment.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/analyze/claude-traced.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/analyze/analyze-orchestrator.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/analyze/research-module.runner.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/map/map-orchestrator.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/section/section-orchestrator.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/translate/translate-orchestrator.service.ts`
