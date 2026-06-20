# Stage 3 — The Web Portal (control plane)

> The visual control plane over the Stage 1 model + Stage 2 engine. A full web app where you see the architecture as a flow graph, edit node contracts through completeness forms, preview reconcile actions, watch drift, browse plan history, and trigger builds per app and target.

## Goal

Make the engine usable without the CLI: a portal that reads/writes the model, visualizes it as a type-colored, swimlaned graph, and drives reconcile / build / plan operations through buttons.

## Stack (decided)

- **Client**: React + Vite + `@xyflow/react` (React Flow) — the most mature flow-graph library; swimlanes, type-colored nodes, drag interactions.
- **Server**: a thin Node/Express API that imports the engine directly (`ai-control/src`) — no logic duplication; the portal is a UI over the same functions the CLI uses.
- Local-first (runs against a `.ai-control` folder on disk); packaged as a reusable tool.

## Architecture

```
ai-control-portal/
  server/   Express API wrapping the engine (graph, validate, reconcile, acceptance, plan log/diff, lock)
  web/      Vite + React + React Flow client
```

The server loads the model from a configurable `AI_CONTROL_MODEL` dir (defaults to `../.ai-control/model`) and exposes:

- `GET /api/graph` — nodes + edges (+ computed completeness per node).
- `GET /api/validate` — diagnostics.
- `GET /api/reconcile?src=&app=&target=` — reconcile actions.
- `GET /api/acceptance` — IR-derived checks.
- `GET /api/plan/log`, `GET /api/plan/diff?a=&b=` — git-for-plans.
- `POST /api/plan/commit` — snapshot.

## Portal surfaces

### Flow-graph editor (s3-portal-graph)
- App/target **swimlanes**; nodes colored by type (module / feature / endpoint / service / page / entity / external).
- Edges typed and styled (composition vs dependency vs back-link).
- **Inspector** panel: per-node completeness form showing exactly which required fields are missing (the "minimize AI mistakes" surface).
- Drag-to-rewire (move service between features, feature between modules, module in/out of apps) — emitted as graph operations (future write path; read + inspect first).

### Control surfaces (s3-portal-ops)
- **Reconcile preview**: run reconcile for a chosen app/target, show create/update/no-op/drift/blocked counts and the action list.
- **Apply-state + drift dashboard**: counts of planned/applied/drifted across the graph.
- **Plan history/diff viewer**: commit list + node/edge diff.
- **Agent run console**: stream the agent applying tasks (wraps the Stage 2 agent loop).
- **Build/apply controls** per app and target.

## Delivery order

1. `s3-portal-core` — server API over the engine + app shell.
2. `s3-portal-graph` — flow-graph editor + inspector.
3. `s3-portal-ops` — reconcile/drift/history/build control surfaces; package as a standalone tool with a documented portable model-folder spec.

## Done-when

- The portal loads the real roya graph, renders it swimlaned and type-colored, and the inspector shows node contracts + completeness.
- Reconcile preview, validate, drift, and plan history all work against the real model through the API.
- The tool can point at any repo's `.ai-control` folder.
