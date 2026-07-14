# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor (tooling / guardrails)
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: medium

## Scope
- Module(s): build tooling (`eslint.config.mjs`) + one inline exception in `modules/data`
- Feature(s): none — adds static import-boundary enforcement
- Endpoint(s): none
- Service(s): none (no runtime code paths changed)

## Description

**Phase 4 of the engine-isolation program**, re-scoped after recon. The blueprint's Phase 4 was a
*physical* `libs/` + `@roya/*` monorepo move. Recon (`impact.md`) shows that move is **pure build/infra
churn** for mostly organizational benefit, and is risky given the current setup:

- `tsconfig` uses `module: nodenext` with **no path aliases** (all imports relative).
- `nest build` = plain **`tsc`**, which does **not** rewrite `@roya/*` aliases → relative `require()`s,
  so a naive `libs/` move yields a `dist/main.js` that crashes at runtime.
- `Dockerfile.build` copies only `src/`, runs `nest build`, and expects `dist/main.js` + asset paths
  under `dist/integrations/ai/...`; deploy is Elastic Beanstalk (Node 22). No `.github` CI — the
  Dockerfile *is* the pipeline.

The **logical isolation** that delivers the program's engineering value is already complete
(changes 060–062): neutral `engine-core` kernel, one-way dependency graphs, contract-based cross-engine
access (connector SPI, `IDataSourceResolver`, sync lifecycle hooks, share-token port), no circular
deps, de-globalized modules.

**This change locks that in** with static ESLint import-boundary rules so the decoupling cannot silently
regress — **zero runtime/Docker/CI risk**. The physical `libs/` relocation is **deferred** (optional,
whenever independent packaging is actually needed) and, per decision, will use the lighter mechanism:
**keep `tsc`, add `paths` aliases + `tsconfig-paths/register` at runtime** (a smaller Docker change than
a NestJS webpack monorepo).

### Enforced boundaries (import guardrails)
- **engine-core is neutral:** `src/engine-core/**` may not import from `**/modules/**` or
  `**/integrations/**`.
- **connectors are pure SPI:** `src/integrations/connectors/**` may not import from `**/modules/**`
  (only the connector `contract/` + other integrations).
- **data engine does not depend on reporting:** `src/modules/data/**` may not import from
  `**/dashboards/**`, `**/sharing/**`, `**/export/**`. *(One documented inline exception:
  `dataset.service.ts` filter-value-meta cleanup on delete — deferred, tracked below.)*
- **reporting depends on the data contract only:** `src/modules/dashboards/**` may not import from
  `**/data/repositories/**` or `**/data/schemas/**` (the `data/contract/**` is allowed).
- **no reporting cycle:** `src/modules/dashboards/**` may not import from `**/sharing/**`.

## Acceptance Criteria
1. `eslint.config.mjs` contains per-directory `no-restricted-imports` rules encoding the five boundaries
   above, each with a clear message.
2. `npx eslint` on the guarded directories reports **no `no-restricted-imports` violations** on the
   current (already-decoupled) codebase, except the single documented `dataset.service.ts` exception,
   which is silenced with an inline `eslint-disable-next-line` + comment referencing the deferral.
3. A deliberate violation (e.g. importing a data repo into dashboards) is flagged by ESLint (spot-check).
4. `nest build` still exit 0; `dist/main.js` unchanged in shape (no runtime code changed).
5. `change-log` row + `verify-code.md` recorded; `isolation-architecture.md` Phase 4 updated to reflect
   the re-scope + deferral.

## Notes
- ESLint is **not** part of the Docker build (`nest build` = tsc), so these rules are dev/IDE + optional
  `npm run lint` guardrails, not build-blocking. That is acceptable and intentional for this step.
- Deferred (future, optional): physical `libs/` + `apps/api` relocation via `tsc` + `paths` +
  `tsconfig-paths/register`; dropping `DashboardsModule`'s `DataModule` module-import; moving
  dashboard pipeline steps + filters to their physical reporting home; the `dataset.service` →
  reporting delete-cleanup hook.
- Next: **Phase 5 (change-064)** — delivery adapters (REST M2M API + MCP over the engine contracts),
  which delivers the original "usable by external systems" goal.
