# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): S11 Pipelines (this phase); overarching: Data (module 4) + Dashboards (module 6) + Connectors (S10) + OLAP/Analytics Store (S9) + Filters (S12) + Sharing (7) + Export (8) + AI Processing (5)
- Feature(s): none removed/added — pure structural isolation
- Endpoint(s): none changed (all existing routes preserved byte-for-byte)
- Page(s)/View(s): none
- Service(s): SVC-PIPE-ENGINE, SVC-PIPE-STEP-REG, SVC-PIPE-TYPE-REG (relocated to `libs/engine-core` this phase)

## Description

Isolate the platform's two core capabilities — the **Data Source Engine** (connect → analyze →
clean → store → sync) and the **Dashboards & Reporting** engine (create dashboard, create/edit
widgets, future reporting) — into **self-contained, injectable, clean, extensible** engine domains
that can be reused anywhere in the system and, in a later change, exposed to other systems via REST
API and MCP.

**Problem.** Today both capabilities are smeared across many modules with circular dependencies and
boundary leaks:
- `PipelinesModule` hand-instantiates repositories from **both** `data` and `dashboards`, bypassing
  module boundaries and mixing ingest steps with dashboard/AI steps in one step graph.
- Circular deps: `ConnectorsModule` ↔ `DataModule`, `DashboardsModule` ↔ `SharingModule`.
- `DataSyncProcessor` is a god-class (pipeline + schema-drift + filters + notifications +
  subscription metering hardwired together).
- The `filters` module is a facade: its code physically lives in `dashboards/`, and the data sync
  processor reaches into dashboards to refresh filters — so **data depends on dashboards**.
- `@Global()` on `connectors` / `olap` / `background-jobs` hides the true dependency graph.
- Workspace context (`workspaceSlug`) is threaded manually through every method and baked into JWTs —
  no clean seam for a non-JWT (service / MCP) caller.

**Desired outcome.** A phased refactor to a **NestJS monorepo** with three libraries —
`libs/engine-core` (neutral kernel), `libs/data-source-engine`, `libs/reporting-engine` — where each
engine exposes a stable contract interface, depends only on contracts (never on the other engine's
internals), and is composed by a thin `apps/api`. External REST/MCP delivery adapters are designed
for but **deferred** to a later change.

**This change (Phase 1) is foundational and behavior-neutral:** extract the neutral pipeline/engine
kernel + a new `TenantContext` contract into an isolated library. No endpoint, page, queue, or
business logic changes. The full multi-phase blueprint is captured in `isolation-architecture.md`.

> **Placement decision (recon finding):** `Dockerfile.build` copies only `src/`, the build must emit
> `dist/main.js`, and this repo uses relative cross-module imports (no path aliases). A physical
> `libs/` + `@roya` monorepo now would break CI and require Docker/build-pipeline changes — contrary
> to the low-risk goal. Phase 1 therefore places the kernel at **`src/engine-core/`** (same isolated
> library boundary + contracts, relative imports per repo convention). The formal `libs/` relocation +
> `@roya/*` alias + monorepo/Docker wiring is moved to **Phase 4**.

**Who is affected.** Backend developers only. No user-facing behavior changes in any phase of the
isolation work (until the deferred external-API/MCP change).

**Out of scope (this change).** Moving the data/dashboards modules into libs (phases 2–3), REST M2M
API, MCP server, fixing the `templates`/`dashboard-from-template` plan-vs-code drift, and adding the
missing `pdf-export` / `cache-recalculation` workers.

## Acceptance Criteria
1. `src/engine-core/` is an isolated library exposing the neutral kernel via a barrel (`index.ts`),
   with **no imports from `modules/data` or `modules/dashboards`**.
2. `src/engine-core/` contains: `PipelineEngine`, `StepRegistry`, `PipelineTypeRegistry`,
   `PipelineContext`/`PipelineStepInterface` (generic), `TenantContext` contract, queue-registry seam,
   and a `PIPELINE_RUN_STORE` persistence seam (engine core stays persistence-agnostic).
3. All current importers of the pipeline engine/registries (`data`, `dashboards`, `ai-processing`)
   resolve them from `src/engine-core` (via the barrel); the step packs resolve them through thin
   shims that re-export the kernel.
4. The application boots and every existing route/pipeline behaves identically (no route, DTO, queue,
   or collection changes). `nest build` succeeds with zero new errors and `dist/main.js` + AI/prompt/
   widget-catalog assets are still emitted.
5. `isolation-architecture.md` documents the full multi-phase master plan and target architecture.
6. Planning docs (`profile.md`, `modules.md`, `rules.md`, `pipelines.md`, services `_index.md`)
   reflect the engine-isolation architecture and the phased layout.
7. The formal `libs/` monorepo + `@roya/*` alias + `Dockerfile.build`/build-pipeline changes are
   explicitly deferred to Phase 4 (recorded in `isolation-architecture.md`).

## Notes
- Concrete pipeline **step** implementations stay in their current modules this phase; they move with
  their owning engine in phases 2–3. Only the neutral engine core relocates now to de-risk the
  structural conversion first.
- `TenantContext` is introduced as a contract in Phase 1 but adopted incrementally; existing explicit
  `workspaceSlug` params remain valid until each engine migrates.
