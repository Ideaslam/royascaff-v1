# Stage 2 — Reconciler + Compiler + Reproducibility + Git-for-Plans

> Builds on the Stage 1 IR + CLI. This stage turns the model into something that *builds code*: one declarative reconciler that unifies new/existing and create/update, a codegen pipeline that lowers the IR per target, a clean-room reproducibility proof, and plan-level version control.

## Goal

1. **One smart reconciler**: `reconcile(desired, actual) -> actions` where new project = reconcile against empty (build-from-scratch) and existing = reconcile against scanned annotations.
2. **Codegen lowering**: turn each buildable node into a per-target code task, idempotent and annotation-anchored.
3. **Reproducibility**: a clean-room build + IR-derived acceptance checks define "same app."
4. **Git-for-plans**: plan commits + diffs + per-app/target rollout.

## Deliverables

- `ai-control reconcile --src <dir> [--app <id>] [--target <id>]` — plan vs actual diff.
- `ai-control plan` subcommands: `commit`, `log`, `diff` — version the model.
- A codegen lowering spec (`.ai-control/upgrade/codegen.md`) + acceptance generator.
- The agent compiler backend contract (`.ai-control/upgrade/agent.md`).
- A Change phase added to `start.md` + `change-request-template.md`.

---

## 1. The reconciler

Input:

- **Desired** = the resolved graph (optionally filtered to one app and/or target).
- **Actual** = `scan` output (annotations) — empty for a new project.

Algorithm:

```
for each buildable projection node N in desired (filtered by app/target):
  a = actual.implemented[N.id]
  if !a                      -> CREATE   (emit new code)
  else if hash(N) != a.hash  -> UPDATE   (regenerate, reconcile in place)
  else                       -> NO-OP
for each annotation A in actual with no matching desired node:
  -> DRIFT (code exists with no plan; report, optionally prune)
```

Properties:

- **Idempotent**: running twice with no model change yields all NO-OP.
- **Filtered rollout**: `--app admin-portal --target web` only reconciles that deliverable ("apply admin portal/web now").
- **Order**: actions are topologically sorted by dependency (entities → services → endpoints → pages) so generated code compiles.

The node hash comes from `build.lock` (Stage 1), so "did this node change?" is a cheap hash compare. Annotations will carry the spec hash they were generated from, enabling UPDATE detection.

## 2. Codegen lowering (spec)

Each target declares lowering rules + templates (`.ai-control/targets/<target>/`). A code task for a node bundles:

- the node spec (full contract),
- the resolved neighborhood (services it uses, entities it touches, external contracts),
- the pinned target rules + templates,
- the required output annotation (`@ac id=...`).

Lowering is performed by the **agent compiler backend** (section 4) — the engine prepares the task and verifies the result; the agent writes the code. Deterministic post-processing (formatter + lint + acceptance run) normalizes output so two builds converge to the same spec-conformant result.

## 3. Reproducibility = clean-room + acceptance

- `reconcile` against an empty `--src` yields an all-CREATE plan — the build-from-scratch.
- For each complete node, the acceptance generator emits a check into `.ai-control/acceptance/` (endpoint contract test, page presence/states, external-isolation static check).
- "Same app" is defined as **passes the same acceptance suite** + matches the `build.lock` node hashes via reconciled annotations.
- The clean-room build is the literal "copy the folder, run, get the app" proof.

## 4. Agent compiler backend (contract)

The engine never writes app code itself; it delegates to an agent through a small interface so the backend is swappable (local CLI, Cursor, SDK):

```
interface CompilerAgent {
  apply(task: CodeTask): Promise<CodeResult>   // writes/edits files, returns touched paths
}
interface CodeTask {
  action: 'create' | 'update'
  node: AnyNode
  neighborhood: AnyNode[]
  rules: string[]        // pinned rule file contents
  templates: string[]
  mustAnnotate: string   // the @ac line to emit
}
```

After `apply`, the engine re-runs `scan` + `validate` + the node's acceptance check; on failure it reports and does not mark the node applied.

## 5. Git-for-plans

- `ai-control plan commit -m "..."` snapshots the model into `.ai-control/history/<timestamp>-<hash>.json` with a message + parent.
- `ai-control plan log` lists commits; `ai-control plan diff <a> <b>` shows node/edge adds, removes, and field-level changes.
- A change-request (`change-request-template.md`) is authored, applied to the model (add/move/remove nodes+edges), committed, then reconciled into code — closing the loop "plan change → code change."
- Per-app/target rollout is recorded as apply-state transitions on projection nodes, themselves part of plan commits.

## 6. Change phase in start.md

Add a unified phase: author/adjust the model (or a change request) → `validate` → `plan commit` → `reconcile --app --target` → agent applies → verify. The same phase covers both "build new" and "change existing"; only the actual-state differs.

## Done-when

- `ai-control reconcile` produces a correct all-CREATE plan against an empty src and a correct mixed plan against the real backend.
- `ai-control plan commit/log/diff` round-trips on the roya model.
- codegen + agent contracts are specified; acceptance generation produces checks for complete nodes.
- `start.md` documents the unified Change/Build phase.

## Checkpoint

Review the reconciler output and plan-diff on the real model before building the portal (Stage 3).
