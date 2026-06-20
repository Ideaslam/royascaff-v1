# AI-Agent Compiler Backend

> The component that actually writes code from a `CodeTask`. It is intentionally swappable so the same engine can drive a local LLM CLI, Cursor, or the Cursor SDK.

## Contract

Defined in `ai-control/src/compiler/agent.ts`:

```ts
interface CompilerAgent {
  apply(task: CodeTask): Promise<CodeResult>;
}
```

- Input: a fully-resolved `CodeTask` (node spec + neighborhood + pinned rules/templates + required `@ac` annotation).
- Output: a `CodeResult` listing touched files and whether it succeeded.

The engine owns orchestration; the agent only transforms one task into code.

## Orchestration loop (engine side)

1. `reconcile` produces ordered actions.
2. For each `create`/`update`: `buildCodeTask` → `agent.apply(task)`.
3. Re-run `scan` (did the `@ac` annotation appear?), `validate`, and the node's acceptance check.
4. On success, mark the projection node `applied`; on failure, leave it `planned`/`drifted` and report. Never mark applied without passing verification.

## Backends

- **DryRunAgent** (shipped): records tasks, writes nothing — used for previews and tests.
- **Local CLI / SDK agent** (future): formats the task as a prompt with the spec, neighborhood, rules, and templates, invokes the model, and writes the returned files. The mandatory `@ac` annotation makes the result verifiable and re-runnable.

## Why this is safe

- Completeness gates mean the task is never under-specified.
- Pinned rules/templates constrain style and architecture (e.g. the external-isolation rule prevents the frontend-calls-R2 bug).
- Acceptance + scan verification gate the "applied" transition, so unverified code never counts as built.
