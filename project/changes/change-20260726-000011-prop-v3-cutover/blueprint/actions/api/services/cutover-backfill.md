# Services — Safqa API · Cutover Backfill

## Delta

- **Create** SVC-CUTOVER-01 — CLI/ops script (not a Nest HTTP service)

---

### SVC-CUTOVER-01 · Backfill legacy proposals → projects [ops, PipelineV3]
- Status: done
- Methods: script entry `scripts/backfill-legacy-proposals-to-projects.js`
  - `--dry-run` (default): log counts + sample IDs
  - `--apply`: create projects + patch `proposal.projectId`
  - Optional `--workspaceId=<id>` filter
- Deps: Mongo connection (same env as API); `projects` + `proposals` collections
- Side effects: inserts projects; updates proposals
- Rules:
  - Select proposals where `projectId` missing/null/empty
  - Idempotent: skip if `projectId` already set
  - Preserve all HTML URL fields; do not enqueue pipeline
  - Best-effort map: `clientId`, `clientName`, `services`, `total`/`tax`/`grandTotal`, `createdBy`, `workspaceId`, name from proposal title/name
  - Log summary: scanned / created / linked / skipped / errors
