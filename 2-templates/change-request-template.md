# Change Request Template

## Short Summary

Use this template to describe a change to an existing system — a new feature, a refactor, a move (service between features, feature between modules, module in/out of an app), or a contract change. A change request is applied to the **model graph**, committed (git-for-plans), then reconciled into code. The same flow covers "build new" and "change existing"; only the actual-state differs.

## Change Request Structure

```md
# Change Request: {short title}

## Intent
{1-2 sentences: what should be true after this change, and why}

## Scope
- Apps affected: {app:customer-portal, app:admin-portal, ...}
- Targets affected: {target:backend, target:web, target:mobile}

## Graph Operations
List the exact node/edge changes (this is what gets applied to `.ai-control/model/`).

### Add nodes
- `{type:slug[@target]}` — {name} — {key spec fields}

### Update nodes
- `{node-id}` — {fields changed and to what}

### Move
- move `{node-id}` from `{old parent}` to `{new parent}` (rewrite edges + annotations)

### Remove nodes
- `{node-id}` — {why; what depends on it}

### Edges
- add `{from} -{type}-> {to}`
- remove `{from} -{type}-> {to}`

## Acceptance
- {new/changed acceptance assertions implied by this change}

## Rollout
- Apply to: {which app + target now}; defer: {which later}
```

## How It's Processed

1. Apply the Graph Operations to `.ai-control/model/` (YAML nodes + `edges.yaml`).
2. `ai-control validate` — must pass (schema, integrity, isolation, completeness).
3. `ai-control plan commit -m "{title}"` — version the change.
4. `ai-control reconcile --src <code> --app <id> --target <id>` — see create/update/no-op/drift.
5. Agent applies the create/update actions; engine re-scans, re-validates, runs acceptance.
6. `ai-control plan diff` confirms the model delta; `scan` confirms code converged.

## Notes

- A move must rewrite both edges and the `@ac` annotations in code so the reconciler does not see the old location as drift.
- Removing a node must check inbound edges first (what uses it) to avoid dangling references.
- Renames are moves: never reuse an old id for a different node.
