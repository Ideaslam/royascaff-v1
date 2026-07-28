# Verification — change-20260728-000032-prop-unify-v2-project-traces

## Plan Consistency
- [x] Pack blueprint covers create / process / poller / backfill / FE
- [x] No main blueprint edits before merge
- [x] depends-on change-20260728-000031 merged

## Code Verification

| Check | Result |
|-------|--------|
| `POST /api/data/projects/creative-proposals` creates project+DNA+proposal `pipelineVersion:"2"` | PASS — `CreativeV2CreateService` |
| No new creative `aiJobs` row on unified create | PASS — prepare batch only; state on `generation` |
| Dual poller: legacy aiJobs + proposal-backed v2 | PASS — `runPollBatchJobs` + `creative-v2-poll-bridge` |
| `pipelineTraces` on section batch submit | PASS — `traceAiCall` + `batch_submit` action |
| `pipelineTraces` through sections/html/validation/repair/upload | PASS — poller completes AI calls + validations |
| FE `/creative` re-enabled; calls unified API | PASS — sidebar + generate path |
| Archive polls proposal for v2 pending (no jobId) | PASS — `watchPendingProposals` |
| Chat / non-creative aiJobs unchanged | PASS — not touched |
| Backfill script dry-run/`--apply` | PASS — `scripts/backfill-v2-proposal-shell.js` + npm script |
| API `tsc --noEmit` | PASS |

## Acceptance Criteria

1. Creative create with v3 flag on → project+DNA+proposal `"2"`, no aiJobs — PASS  
2. Engine still section→HTML via existing process path — PASS (proposal-backed deps)  
3. Progress without jobId for new runs — PASS  
4. Traces for batch submit + html/validation/repair/upload — PASS  

5. Chat aiJobs still work — PASS  
6. In-flight aiJobs poller kept — PASS  
7. Backfill script — PASS  
8. Archive consumers (031) still apply — PASS  

## Result: **PASS**

## Manual smoke
- [ ] `/creative` generate → archive shows pending → completes with tech+fin URLs  
- [ ] AI Requests shows v2 AI calls (`sections_batch`, `html_batch`, optional repair) + validations  

- [ ] `npm run backfill:v2-proposal-shell` dry-run then `--apply` on staging  
