# Code Back-Link Annotations

> The bridge between the plan graph and real code. Annotations let `ai-control scan` derive the **actual state** of a codebase (which nodes are implemented, by which symbols), which is the input the reconciler diffs against the desired plan. They are also how drift is detected and how regeneration stays idempotent.

## Why

The original `.ai-control` joined plan and code only by naming convention, so nothing could verify that code matched the plan (this is how the R2/CORS rule slipped through). An annotation is a machine-checkable claim: "this symbol implements this plan node, and uses these services."

## Syntax

A single-line comment beginning with `@ac`, language-agnostic (works in `//`, `#`, or `/* */` comments):

```
@ac id=<node-id> [feature=<id>] [parent=<id>] [uses=<id>[,<id>...]] [calls=<id>[,<id>...]] [emits=<id>[,<id>...]] [target=<id>]
```

- `id` (required) — the plan node this symbol implements (e.g. `endpoint:data.upload-file@backend`, or a `method:` id for method-level tracking).
- `feature` (optional) — the owning feature, for quick cross-reference.
- `parent` (optional) — for a `method:` node, the owning endpoint/service/job id.
- `uses` (optional) — internal services this symbol depends on.
- `calls` (optional) — external services this symbol calls (backend only).
- `emits` (optional) — domain events this symbol emits.
- `target` (optional) — overrides the target inferred from the node id.

## Placement

Put the annotation on the line directly above the symbol it describes (controller method, service method, Angular page class, job handler).

### Two granularities

`@ac` works at two levels, and both can coexist:

- **Node-level** — tag the class/handler with the `endpoint:`, `service:`, `page:`, or `job:` id. This is the minimum and is what proves a projection node is implemented.
- **Method-level** — tag each individual function with its `method:` id. This lets the reconciler detect drift at method granularity (which exact function changed), drive per-method build tasks, and render the method list in the portal. A `method:` annotation should also carry `parent=` so scan can attach it under the right node even if the file is reorganized.

### Backend examples

```ts
// @ac id=endpoint:data.upload-file@backend feature=data.upload-csv uses=service:data.data-service@backend
@Post('upload/file')
uploadFile(@UploadedFile() file: Express.Multer.File) { /* ... */ }
```

```ts
// @ac id=service:data.data-service@backend calls=ext:r2
export class DataService { /* ... */ }

  // @ac id=method:data.data-service.upload-file@backend parent=service:data.data-service@backend calls=ext:r2 emits=event:data.csv-uploaded
  async uploadFile(file: Express.Multer.File, userId: string) { /* ... */ }
```

### Web example

```ts
// @ac id=page:data.upload-wizard@web feature=data.upload-csv uses=service:data.data-client@web
export class UploadWizardPage { /* ... */ }
```

## How `scan` uses them

1. Walk the target source root, collect every `@ac` annotation.
2. Build the actual-state map: `nodeId -> [code locations]`.
3. Compare to the model:
   - node `applied` but no annotation -> **missing** (code not built / not tagged).
   - node `planned` but annotated -> **ahead** (built but model not updated).
   - annotation id not in model -> **orphan** (code references an unknown node).
   - external isolation: a non-backend symbol with `calls=ext:*` -> **violation**.

## Rules

- Every projection node marked `applied` must have at least one matching annotation.
- Annotation ids must be valid node ids that exist in the model (no orphans in a clean repo).
- A web/mobile annotation must not declare `calls=ext:*`; external access is backend-only.
- Generators (Stage 2) emit these annotations automatically; humans rarely write them by hand, but may add them when adopting `ai-control` on a legacy codebase to teach the reconciler what already exists.
