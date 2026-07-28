# Modules & Features — Delta (REQ-PROP-V3 part 7 — AI Requests UI)

## Delta

- **Extend** Pipeline Traces: proposal summary + workspace cost-summary APIs
- **Create** AI Requests web page (list, detail, cost dashboard)
- **Extend** Layout: nav for `pipeline-traces.read`

---

## 14. Pipeline Traces _(extend)_

### Features
1. **Proposal trace summary** [backend-only] — totals for one proposal (calls, tokens, cost, duration)
2. **Workspace cost summary** [backend-only] — by day / model / project for date range
3. **AI Requests page** [frontend-only] — table + filters + detail dialog + summary card + cost charts
4. **Nav entry** [frontend-only] — `/ai-requests` when `pipeline-traces.read`
