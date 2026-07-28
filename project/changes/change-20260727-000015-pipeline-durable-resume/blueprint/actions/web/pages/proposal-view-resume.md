# Pages — Proposal view · Continue / resume

> Route: existing proposal view / pipeline stepper surface.

## Delta

### Proposal Continue `PG-PROP-RESUME-01`
- Status: planned
- Components: Continue button (alongside existing Retry / Regenerate)
- Visibility:
  - Show **only when stuck**: status API `canResume` / `stuck` is true
  - Stuck criteria (BE): v3 non-terminal + `updatedAt` idle ≥ 60s + no waiting/active/delayed BullMQ jobs for this `proposalId` (if Redis down → stuck after idle grace)
  - Do **not** show while generation is actively queued/running
  - Keep **Retry** for terminal `partially_failed|failed` (failed sections only)
  - Keep **Regenerate** as today
- Action: `POST /api/data/proposals/:id/resume` → toast → resume status polling
- i18n: `pipeline.continue` / `pipeline.continueQueued` (en + ar)
- Service: Projects/proposals FE API wrapper

## Notes

- Do not require terminal state to Continue (that was the UX gap).
- Busy/loading guard while request in flight.
