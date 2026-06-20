# Code Back-Link Annotations

> The bridge between the plan graph and real code. Annotations let `ai-control scan` derive the **actual state** of a codebase (which nodes are implemented, by which symbols), which is the input the reconciler diffs against the desired plan. They are also how drift is detected and how regeneration stays idempotent.

## Why

The original `.ai-control` joined plan and code only by naming convention, so nothing could verify that code matched the plan (this is how the R2/CORS rule slipped through). An annotation is a machine-checkable claim: "this symbol implements this plan node, and uses these services."

## Syntax

A single-line comment beginning with `@ac`, language-agnostic (works in `//`, `#`, or `/* */` comments):

```
@ac id=<node-id> [feature=<id>] [uses=<id>[,<id>...]] [calls=<id>[,<id>...]] [target=<id>]
```

- `id` (required) — the plan node this symbol implements (e.g. `endpoint:data.upload-file@backend`).
- `feature` (optional) — the owning feature, for quick cross-reference.
- `uses` (optional) — internal services this symbol depends on.
- `calls` (optional) — external services this symbol calls (backend only).
- `target` (optional) — overrides the target inferred from the node id.

## Placement

Put the annotation on the line directly above the symbol it describes (controller method, service method, Angular page class, job handler).

### Backend examples

```ts
// @ac id=endpoint:data.upload-file@backend feature=data.upload-csv uses=service:data.data-service@backend
@Post('upload/file')
uploadFile(@UploadedFile() file: Express.Multer.File) { /* ... */ }
```

```ts
// @ac id=service:data.data-service@backend calls=ext:r2
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
