# Data model — pipelineTraces (query / indexes) · change-20260728-000027

> After-state for indexes & query contract. Document shape unchanged.

## Entity — pipelineTraces (query surface)

Collection: `pipelineTraces` · Repo: `MongoPipelineTracesRepository`

**Unchanged fields** (relevant to filters/stats):
- `workspaceId`, `projectId`, `proposalId`, `step`, `action`, `status`
- `startedAt` / `createdAt` (ISO strings)
- `ai.output.usage.inputTokens` / `outputTokens` (normalized on write)
- `ai.cost.totalCost` / `inputCost` / `outputCost`
- `ai.model`, `ai.durationMs`

### Indexes (ensureIndexes)

| Index | Purpose |
|-------|---------|
| `{ workspaceId: 1, createdAt: -1 }` | default list sort/pagination |
| `{ workspaceId: 1, projectId: 1, createdAt: -1 }` | project drill-down |
| `{ workspaceId: 1, proposalId: 1, createdAt: -1 }` | proposal filter + summary |
| `{ workspaceId: 1, step: 1, createdAt: -1 }` | step Select |
| `{ workspaceId: 1, action: 1, createdAt: -1 }` | AI / non-AI callType |
| `{ workspaceId: 1, status: 1, createdAt: -1 }` | status filter |
| `{ proposalId: 1, seq: 1 }` | existing |
| `{ runId: 1, seq: 1 }` | existing |
| `{ workspaceId: 1, action: 1, status: 1 }` | existing (keep) |
| `{ "ai.model": 1, createdAt: -1 }` | existing (cost by model) |
| `{ proposalId: 1, step: 1, action: 1 }` | existing |

### Query rules

1. **Every** list / count / aggregate `$match` **must** include `workspaceId`.
2. Date range: prefer single field `createdAt` (fallback: also match `startedAt` only if needed — avoid `$or` when `createdAt` is always set on write).
3. `callType=ai` → `action: "ai_call"`; `callType=non-ai` → `action: { $ne: "ai_call" }`; omit for All.
4. List projection: omit heavy `ai.input` / `ai.output.content` / `ai.output.raw` / stacks; keep usage/cost/model/duration for list rows.
5. Stats / cost / proposal summary: Mongo `$group` on projected numeric paths — **no** loading full documents into Node for totals.

## Delta

- **Add** compound indexes under `workspaceId` for projectId, proposalId, step, action, status (+ createdAt).
- **Clarify** query contract: workspaceId required in Mongo filter; callType mapping; lean list projection; aggregation for totals.
- **No** new collections or document fields.
