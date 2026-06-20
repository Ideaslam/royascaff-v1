# Codegen Lowering

> How the IR (L2 contract + L3 projection) is lowered into real code (L4). Codegen is agent-driven and annotation-anchored; the engine prepares tasks and verifies results, the agent writes the code.

## Pipeline

```
reconcile (desired vs actual) -> actions[]
  for each create/update action, in dependency order:
    buildCodeTask(node) -> CodeTask          # engine, deterministic
    agent.apply(task)   -> CodeResult        # swappable AI backend
    scan + validate + acceptance(node)       # engine verifies
    on success: mark node applied, annotation carries hash
```

## Dependency order

Tasks are emitted in the order the reconciler topologically sorts them so generated code compiles:

`DataEntity -> ExternalService -> InternalService -> Endpoint / Job -> Component -> Page`

## A CodeTask is self-contained

`buildCodeTask` (see `ai-control/src/compiler/agent.ts`) bundles everything the agent needs so it never has to guess:

- the full node spec (the contract — completeness gates guarantee it is filled),
- the resolved **neighborhood** (feature, module, services used, entities touched, external contracts, endpoints called),
- the pinned **rules** + **templates** for the node's target (from `.ai-control/targets/<target>/`),
- the exact `@ac` annotation the output must carry (including the node's spec hash).

## Idempotency + anchoring

- The emitted `@ac id=...` annotation is the anchor. On re-run, `scan` finds it; if the node's hash is unchanged the action is NO-OP, otherwise UPDATE regenerates in place.
- Deterministic post-processing (formatter + linter + acceptance run) normalizes output so repeated builds converge to the same spec-conformant code, not byte-identical text.

## Per-target lowering

Each target folder pins:

- `stack` (e.g. `nestjs`, `angular`) and `rootPath`,
- `ruleRefs` -> rule files the agent must follow,
- `templateRefs` -> scaffolding templates.

Examples of lowering by kind:

| Node | backend (nestjs) | web (angular) |
|---|---|---|
| Endpoint | controller method + DTOs + service call | — |
| InternalService | injectable service class | HTTP client service |
| DataEntity | Mongoose schema + repository | TS model interface |
| Page | — | standalone component + route + states |
| Job | BullMQ processor | — |

## Reproducibility

- Clean-room build = `reconcile --src <empty>` => all CREATE.
- Each complete node yields acceptance checks (`ai-control acceptance`).
- "Same app" ≡ passes the same acceptance suite + reconciled annotation hashes match `build.lock`.
