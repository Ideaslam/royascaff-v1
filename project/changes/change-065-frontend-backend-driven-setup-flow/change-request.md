# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor
- **target-app**: customer-portal (+ minimal backend flow signal)
- **affected-repos**: frontend, backend
- **priority**: medium

## Scope
- Module(s): `pages/data/setup` (customer-portal wizard); `engine-core` + `modules/data` (setup-flow signal)
- Feature(s): data-source setup wizard — make it fully backend-driven
- Endpoint(s): none (setup-flow endpoint output gains one optional field)
- Service(s): `DataSourcePipelineService.getSetupFlow` (attach schedule trait)

## Description

Follow-up to change-064 (backend pipeline registration seam). The backend now owns the per-source
setup flow (`getSetupFlow`), but the **customer-portal setup wizard still re-derives parts of that flow
and hardcodes `csv`**, so the frontend can drift from the backend and isn't cleanly extensible.

### Problem (frontend, `dataset-setup-wizard.page.ts`)
1. `applyFlowSteps()` **re-injects** the `choose-connection` step for non-CSV and special-cases
   `isCsv = type === 'csv'` — duplicating backend flow logic (backend already emits `choose-connection`
   for every non-CSV source since change-064).
2. `allowPolicy = sourceType() !== 'csv'` hardcodes CSV to decide schedule-vs-one-shot — the backend
   already knows this (`oneShot` trait → "Confirm & Sync").
3. `ngAfterViewInit` mounts the connect component using a `sourceType() === 'csv'` check instead of the
   resolved flow.
4. The `getSetupFlow` error path fabricates a hardcoded flow (with `select-entities` for everyone),
   which is wrong for CSV/DB and re-duplicates backend knowledge.

Net effect: adding/adjusting a source's flow can require editing the frontend even though the backend
is the source of truth.

### Desired behavior (after)
- The wizard **renders exactly the backend flow** — no source-type names, no re-injection. Which steps
  appear (choose-connection, connect, select-entities, schema-review, schedule) and their order come
  only from `getSetupFlow`.
- **One-shot vs scheduled** is driven by a backend signal on the schedule step, not a CSV check.
- The connect component mounts based on the **resolved flow** (first step is `connect`) or an explicit
  `connectionId` (OAuth resume) — not a CSV check.
- On `getSetupFlow` failure the wizard shows an error + **Retry** (no fabricated flow), since the
  backend is the single source of truth.
- Frontend `addingTables` mode logic (filtering connect/choose-connection when adding tables to an
  existing source) stays — it's genuine frontend UX state, not source-type knowledge.

### Minimal backend signal (to enable #2 cleanly)
`WizardStepMeta` gains an optional generic `config?: Record<string, unknown>`; `getSetupFlow` sets
`config: { allowPolicy: !oneShot }` on the `schedule` step. Kernel stays neutral (generic UI hint bag).

### Who is affected
Customer portal setup wizard + the `GET /data/sources/setup-flow/:type` payload (one optional field
added; existing consumers unaffected). No admin, no data model, no new endpoints. Behavior-neutral for
all 7 sources.

### Out of scope
- De-duplicating `SOURCE_DEFINITIONS` vs backend `datasource_type_meta` (label/icon) — the connect
  loader must stay in the frontend; deferred.
- Admin panel. Reporting/widget registry (already clean).
- Making a new wizard **step kind** registry-driven (UI components can't be fully data-driven).

## Acceptance Criteria
1. `dataset-setup-wizard.page.ts` contains **no `sourceType() === 'csv'` / `!== 'csv'`** flow logic;
   `applyFlowSteps` no longer injects `choose-connection`; `allowPolicy` derives from the backend
   schedule step's `config.allowPolicy` (default true).
2. The connect component mounts from the resolved flow (`currentKind === 'connect'`) or `connectionId`
   (OAuth resume), not a CSV check.
3. `getSetupFlow` error path shows an error + Retry (no fabricated/hardcoded flow).
4. Backend: `WizardStepMeta.config?` exists; `getSetupFlow` sets `allowPolicy` on the schedule step;
   kernel stays neutral (0 boundary violations). Frontend `WizardStepMeta` mirrors `config?`.
5. Behavior-neutral for all 7 sources: setup flows render identically (CSV: connect → schema-review →
   Confirm & Sync; sheets/db: choose-connection → connect → schema-review → Schedule & Sync;
   e-commerce: choose-connection → connect → select-entities → schema-review → Schedule & Sync).
6. `nest build` + frontend `ng build` succeed; docs updated in place; `verify-code.md` = PASS;
   `change-log.md` row appended.

## Notes
- Reporting engine on the frontend (dashboards/filter/export services + widget registry) reviewed and
  already isolated/extensible — no change needed.
- `addingTables` filtering and the OAuth-resume immediate mount are retained (frontend UX state).
