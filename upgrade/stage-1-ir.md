# Stage 1 — The Architecture IR (engine source + schema)

> Part of the AI-Control v5 upgrade. This stage builds the foundation everything else depends on: a code-independent, multi-app, multi-target plan graph with a typed contract IR, plus the CLI engine that validates it, renders human views, scans code for drift, and locks a reproducible build.

## Goal

Make the plan a **machine-readable, code-independent source of truth** that:

1. Describes one or more **Apps** (products/portals) composed of shared **Modules/Features**.
2. Projects each feature onto **Targets** (backend / web / mobile) with independent apply-state.
3. Is **complete enough** that an AI compiler can later regenerate the app from scratch (completeness gates + IR-derived acceptance checks).
4. Links back to real code through **annotations**, which double as the reconciler's actual-state source.

By the end of Stage 1 we have a working CLI: `validate`, `build`, `scan`, `lock`, and the real `roya-ai-dynamo` plan migrated into the model.

## Deliverables

- `ai-control/` — standalone TypeScript engine + CLI (npm package, reusable across repos).
- `.ai-control/model/` — the graph (YAML nodes + edges) — source of truth.
- `.ai-control/apps/` — app compositions.
- `.ai-control/targets/` — per-target stack pins + rules + templates.
- `.ai-control/views/` — generated markdown (read-only).
- `.ai-control/build.lock` — resolved + hashed snapshot.
- `2-templates/services-template.md` filled + `3-plan/services.md` generated.
- `.ai-control/upgrade/annotations.md` — the code back-link annotation spec.

---

## 1. The layered IR

| Layer | What it holds | Target-aware? |
|---|---|---|
| L1 Intent | apps, modules, features (what/why) | no |
| L2 Contract IR | entities, service interfaces, endpoint I/O schemas, page specs, external contracts, business rules, acceptance checks | partly |
| L3 Projection | per-target lowering rules + templates + stack pins | yes |
| L4 Code | emitted, annotated application code | yes |

The CLI operates on L1–L3 (the model). The compiler (Stage 2) lowers L2/L3 → L4. The reconciler keeps L4 converged with the model.

---

## 2. Node types

Every node is a YAML file under `.ai-control/model/<type>/<id>.yaml` with a shared envelope:

```yaml
id: <type>:<slug>[@target]      # stable, unique
kind: <NodeType>
name: <human name>
status: planned | applied | drifted | disabled   # apply-state (projection nodes)
meta: { createdAt, updatedAt, owner }
spec: { ... }                    # type-specific contract fields
```

Logical (target-agnostic) nodes:

- **Project** — root metadata, default targets, brand.
- **App** — a product/portal composition. `spec.includes: [module ids]`, `spec.targets: [target ids]`, `spec.shell`, `spec.audience`.
- **Target** — `backend | web | mobile`. `spec.stack`, `spec.rootPath`, `spec.ruleRefs`, `spec.templateRefs`.
- **Module** — business capability. `spec.dependsOn: [module ids]`.
- **Feature** — capability inside a module. `spec.moduleId`, `spec.subfeatures`, `spec.visibility`.
- **DataEntity** — domain model. `spec.fields`, `spec.indexes`, `spec.relations`.
- **ExternalService** — R2 / Claude / MailJet / payment / OAuth. `spec.provider`, `spec.interface`, `spec.secretsEnv`, `spec.contract`.

Projection (target-specific) nodes — each ties to one `featureId` + one `targetId` and carries apply-state:

- **Endpoint** (`@backend`) — `spec.method, route, auth, input, output, errors, usesServices, touchesEntities`.
- **InternalService** (`@backend|@web|@mobile`) — `spec.interface (methods), usesServices, callsExternal`.
- **Page** / **Screen** (`@web|@mobile`) — `spec.route, layout, components, callsEndpoints, states`.
- **Component** (`@web|@mobile`) — reusable UI unit.
- **Job** (`@backend`) — async worker. `spec.queue, trigger, timeout`.

---

## 3. Edge types

Edges live in `.ai-control/model/edges.yaml` as typed triples `{ from, type, to }`:

- `app includesModule module`
- `app shipsOn target`
- `module hasFeature feature`
- `feature projectsOnto target`        (declares a projection exists)
- `projection contains implNode`       (endpoint/page/service/... belongs to a feature+target)
- `endpoint usesService internalService`
- `internalService callsExternal externalService`
- `page callsEndpoint endpoint`
- `endpoint touchesEntity dataEntity`
- `module dependsOn module`
- `codeSymbol implements implNode`      (back-link, produced by `scan`, not hand-authored)

The graph is validated for referential integrity (no dangling edges), acyclic module dependencies, and that every projection node's `featureId`/`targetId` matches an actual `projectsOnto` edge.

---

## 4. ID conventions

`type:module.slug[@target]`

- `app:customer-portal`, `app:admin-portal`
- `target:backend`, `target:web`, `target:mobile`
- `module:data`, `feature:data.upload-csv`, `entity:csv-file`, `ext:r2`
- `endpoint:data.upload-file@backend`
- `service:data.data-service@backend`
- `page:data.upload-wizard@web`

Rules: lowercase kebab slugs; module prefix on everything owned by a module; `@target` suffix only on projection nodes. IDs are immutable once referenced (renames go through a `move` that rewrites edges + annotations).

---

## 5. Completeness gates (the reproducibility foundation)

A node has a `completeness` status computed by `validate`:

- `incomplete` — missing required contract fields → **not buildable**.
- `complete` — all required fields present → buildable.

Required fields per type (examples):

- **Endpoint**: `method, route, auth, input schema, output schema, errors[], usesServices[], touchesEntities[]`.
- **DataEntity**: every field has `name, type, required`; at least one index for collections queried by list endpoints.
- **Page**: `route, layout, callsEndpoints[], states{loading,empty,error,success}`.
- **InternalService**: `interface` methods each with `input/output`; `callsExternal[]` resolved.
- **ExternalService**: `provider, interface, secretsEnv[]` (and a rule that no target other than backend may reference it — closes the R2/CORS class of bug).

The portal inspector (Stage 3) renders these required fields as forms, so a human cannot leave a node `incomplete` without seeing exactly what is missing. This is the mechanism that "minimizes the space where AI makes mistakes."

### Acceptance checks (IR-derived)

For each complete node, `build` can emit acceptance-check stubs into `.ai-control/acceptance/`:

- Endpoint → contract test (method/route exist, input rejected when invalid, output shape matches, auth enforced).
- Page → presence + states test.
- ExternalService isolation → a static check that only backend references it.

"Same app" is defined as **passes the same acceptance suite**, not byte-identical code.

---

## 6. The `build.lock`

`lock` resolves the graph and writes `.ai-control/build.lock`:

```json
{
  "graphHash": "sha256 of normalized graph.json",
  "rulesHash": "sha256 of all rule files",
  "targets": { "backend": "nestjs@x", "web": "angular@y", "mobile": "abstract" },
  "nodes": { "<id>": "sha256 of node spec" },
  "generatedAt": "iso"
}
```

Two folders with the same `build.lock` describe the same intended app. The reconciler (Stage 2) compares per-node hashes to decide create/update/no-op.

---

## 7. Services become first-class

- Fill `2-templates/services-template.md` (currently empty) with the InternalService + ExternalService entry format.
- Generate `3-plan/services.md` from the migrated model (internal services per module + the shared external services).
- Add `usesServices` to endpoint entries and `callsExternal` to service entries in the model; surface them in the generated views.

---

## 8. Code back-link annotations

Spec authored in `.ai-control/upgrade/annotations.md`. Summary form (language-agnostic, comment-based):

```ts
// @ac id=endpoint:data.upload-file@backend feature=data.upload-csv uses=service:data.data-service@backend
```

```ts
// @ac id=service:data.data-service@backend calls=ext:r2
```

`scan` walks the target source roots, parses these comments, and produces the **actual-state graph** (which nodes are implemented, by which symbols). Diffing actual-state vs the model = drift detection now, and the reconciler input in Stage 2.

---

## 9. Migration of roya-ai-dynamo

Source docs: `3-plan/modules.md`, `3-plan/features.md`, `3-plan/data-model.md`, `4-actions/endpoints.md`, `4-actions/pages.md`.

Mapping decisions:

- **Two Apps** sharing modules:
  - `app:customer-portal` (web + mobile) → includes Auth, Users(profile), Projects, Data, Dashboards, Sharing, Export, Notifications, Subscriptions(self-service).
  - `app:admin-portal` (web) → includes Auth, Users(admin), Subscriptions(admin), Audit Logs, System Settings.
  - Shared modules (Auth, Users) are defined once and referenced by both.
- Backend is **one shared API** across both apps (the `Admin —` frontend-only modules collapse into their backend owners: `Users`, `Subscriptions`, `Settings`).
- Infrastructure modules (Background Jobs, Caching, Storage, AI Provider, Email, Payment) become `InternalService`/`ExternalService` nodes, not Apps.
- Each business feature gets backend + web projections; mobile projections are created as `planned` placeholders (proving the apply-state model) but left without detailed specs until mobile is built.

Migration is scripted where possible and hand-verified; the result must pass `validate`.

---

## 10. CLI core

Package `ai-control` (Node + TypeScript). Commands:

- `ai-control validate` — schema (zod) + referential integrity + completeness; non-zero exit on errors.
- `ai-control build` — render per-app / per-target markdown views into `.ai-control/views/`; optionally emit acceptance stubs.
- `ai-control scan [--target backend|web|mobile]` — parse annotations → actual-state, report drift vs model.
- `ai-control lock` — write `build.lock`.
- `ai-control graph` — compile YAML nodes+edges into `.ai-control/model/graph.json` (used by the portal).

Internal architecture: `schema/` (zod + types) → `model/` (loader, graph, resolve) → `commands/` → `cli.ts`.

---

## Done-when

- `ai-control validate` passes on the migrated roya model with zero errors.
- `ai-control build` regenerates `modules`, `features`, `services`, `endpoints`, `pages` views per app/target.
- `ai-control scan` runs against the existing backend and reports which endpoints/services are implemented vs planned.
- `ai-control lock` writes a stable `build.lock` (re-running with no changes produces an identical hash).
- `services-template.md` is filled and `3-plan/services.md` exists.
- `annotations.md` spec exists.

## Checkpoint

After this stage: review the schema, the migrated model, and the CLI output before starting Stage 2 (the reconciler + compiler).
