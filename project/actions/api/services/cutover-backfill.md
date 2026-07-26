# Services — Safqa API · Cutover Backfill

> Ops CLI (not Nest HTTP). Soft cutover for REQ-PROP-V3 Phase 6.

### SVC-CUTOVER-01 · Backfill legacy proposals → projects [ops, PipelineV3]
- Status: done
- Methods: script `scripts/backfill-legacy-proposals-to-projects.js`
  - dry-run (default); `--apply`; optional `--workspaceId=`
- Deps: Mongo (`proposals`, `projects`); env `MONGODB_URI`
- Side effects: inserts projects; sets `proposal.projectId`
- Rules: skip when `projectId` set; preserve HTML URL fields; no pipeline enqueue; npm `backfill:legacy-projects`
