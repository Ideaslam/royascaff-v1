# Verify — change-065 (Frontend backend-driven setup flow / cleanup)  ✅ PASS

Follow-up to change-064. Behavior-neutral cleanup: the customer-portal setup wizard now renders the
backend `SetupFlow` verbatim (no source-type branching), and the schedule one-shot/scheduled toggle
rides on a neutral backend UI-hint. Kernel stays neutral.

## What was implemented

### Backend (minimal neutral signal)
- `engine-core/pipeline.interface.ts` — `WizardStepMeta` gains optional generic
  `config?: Record<string, unknown>` (neutral UI-hint bag; no source-type knowledge).
- `modules/data/pipeline/data-source-pipeline.service.ts` — `getSetupFlow` sets
  `config: { allowPolicy: !oneShot }` on the `schedule` step.

### Frontend (`pages/data/setup/dataset-setup-wizard.page.*`)
- `core/models/data.models.ts` — mirrored `WizardStepMeta.config?`.
- `allowPolicy` now derives from the schedule step's `config.allowPolicy` (default `true`) instead of
  `sourceType() !== 'csv'`.
- `applyFlowSteps()` — removed the `choose-connection` re-injection and the `isCsv` special-case. Renders
  the backend flow verbatim; the only local edit remains dropping `choose-connection`/`connect` when
  adding tables (`dataSourceId`). Mounts the connect component when the resolved flow lands on `connect`
  (and no `connectionId`).
- `ngAfterViewInit()` — mounts connect immediately only for OAuth-resume (`connectionId`), no CSV check.
- `getSetupFlow` failure — extracted to `loadSetupFlow()` + `retrySetupFlow()`; on error sets a
  `flowLoadFailed` signal + error message (no fabricated fallback flow).
- `onConnected()` — dropped the redundant `!== 'csv'` guard (unreachable for one-shot sources).
- Template + scss — error banner shows a **Retry** button when `flowLoadFailed()`.

## Verification (scoped to changed areas)

- **AC #1 — no source-type flow logic:** grep for `csv` in `dataset-setup-wizard.page.ts` → only two
  explanatory comments remain, zero `=== 'csv'` / `!== 'csv'` branches. `applyFlowSteps` injects nothing;
  `allowPolicy` reads `config.allowPolicy`. ✅
- **AC #2 — flow-driven mount:** connect mounts from `currentKind() === 'connect'` (resolved flow) or
  `connectionId` (OAuth resume). ✅
- **AC #3 — retryable error:** flow-load failure surfaces error + Retry; no hardcoded steps fabricated. ✅
- **AC #4 — neutral backend signal:** `WizardStepMeta.config?` present BE+FE; `getSetupFlow` sets
  `allowPolicy` on schedule; kernel unchanged (generic bag only). ✅
- **AC #5 — behavior-neutral:** flow shape unchanged per source (backend already emits choose-connection
  for non-csv since change-064; csv omits it and is `oneShot` → `allowPolicy=false` → "Confirm & Sync").
  `addingTables` filtering + OAuth-resume mount retained. ✅
- **AC #6 — builds green:** BE `tsc -p tsconfig.build.json --noEmit` → exit 0; FE
  `tsc -p tsconfig.app.json --noEmit` → exit 0; FE `ng build --configuration development` → exit 0 (only
  pre-existing Sass `@import` deprecation warnings). Docs updated in place. ✅

## Notes / not in scope
- `SOURCE_DEFINITIONS` (frontend) vs `datasource_type_meta` (backend) label/icon duplication deferred —
  the connect-component loader must stay in the frontend.
- Reporting engine on the frontend (dashboards/filter/export services + widget registry) reviewed and
  already isolated/extensible — no change needed.
- No API/DTO/queue/collection/migration changes; existing setup-flow consumers unaffected (one optional
  field added).

## Status: **PASS** — setup wizard is fully backend-driven; single source of truth = backend flow;
kernel neutral; behavior identical for all 7 sources; BE+FE builds green.
