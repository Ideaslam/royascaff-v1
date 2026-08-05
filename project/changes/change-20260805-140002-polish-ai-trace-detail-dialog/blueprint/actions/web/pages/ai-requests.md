# Pages — AI Requests (polish delta)

> Pack-only notes for Trace Detail Dialog. Main page: `project/actions/web/pages/ai-requests.md`.

## Delta — Trace Detail Dialog `PG-AIREQ-02`

### After-state UI
- Dialog: wider (`min(1100px, 96vw)`), content scrollable; prefers reading JSON.
- Meta: two groups — **Identity** (project name/id, proposalId, step, action, runId) and **Metrics** (status, model, in/out tokens, cost, duration).
- Each meta field is a small labeled cell; long mono IDs wrap (`word-break: break-all`) — no overlapping columns.
- Error message (if present) in a soft alert strip.
- JSON blocks (input / output / validation / full record): section header + Copy; panel taller (`min(48vh, 520px)`), mono tree with clearer nesting indent and row spacing.
- Brand: surface tokens + `--roya-blue-deep` accents; no new fields or API calls.

### Unchanged
- Data source EP-TRACES-02; same fields and Copy JSON strings.
- Open-on-row-click behavior; dismissable mask.
