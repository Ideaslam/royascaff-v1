# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 8/8
- **depends-on**: change-010
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Settings / Config (flag default), Projects (backfill), Creative / AI Jobs (soft retire), Layout (nav), Pipeline Traces (unchanged)
- Feature(s): Phase 6 Cutover — backfill legacy proposals → projects; flip `pipelineV3Enabled`; make v3 the primary path; soft-retire v2 create UX
- Endpoint(s): no new product APIs required; optional ops script (CLI); keep `POST /ai-jobs` for in-flight / escape hatch unless hard-retire chosen
- Page(s)/View(s): web — Creative demoted/hidden when v3 on; Projects primary; Settings schema shows flag default true
- Service(s): backfill script; settings schema/seed; optional gate on new creative job creates when v3 enabled

## Description

Implement **Phase 6 — Cutover & migration** per `docs/refactor-proposal-generator.md` §15 and change-004 part map (8/8).

**Depends on** merged `change-010` (AI Requests UI).

**Recommended scope for this pack (soft cutover + migration tools):**

1. **Backfill script** — for each legacy proposal without `projectId`, create a wrapping `project` (client/name/services/financials best-effort from proposal) and set `proposal.projectId`; preserve existing `technicalHtmlUrl*` / HTML as read-only legacy artifacts (no re-render required).
2. **Flag flip** — default `pipelineV3Enabled` → **`true`** in settings schema + FE bootstrap default; ensure seed `settingsSchema` includes the field; document/ops path to patch workspaces still on false.
3. **Primary path** — when flag on: Projects is the primary create path; Creative nav demoted (hide or “Legacy” label) so new work goes through v3.
4. **Soft retire v2 create** — when `pipelineV3Enabled` is true, block **new** creative giant-prompt creates (`POST /ai-jobs` type creative) with a clear error pointing to Projects; keep poller + job read APIs so in-flight / historical `aiJobs` still complete and remain viewable.
5. **Docs / blueprint** — mark Creative Pipeline v2 as legacy/soft-retired; hard delete of `poll-batch-jobs` deferred until after a quiet period (follow-up pack).

**Out of scope (deferred):**
- Hard delete of `poll-batch-jobs` / creative-pipeline modules (doc: after ~2 quiet weeks)
- Structured section editor
- Admin cross-workspace traces
- Full data repair of incomplete legacy proposal fields beyond best-effort wrap
- REQ-R auth/permission packs

**Locked decisions (carry forward):**
- Per-workspace flag remains the kill switch (can set `pipelineV3Enabled: false` to re-open legacy create if needed during transition)
- Competitors ≤3; research market/competitor/audience; fail-closed DNA/map; Ready with gaps
- BullMQ + Mongo truth for v3; v2 batch path not deleted in this pack

## Acceptance Criteria

1. Runnable backfill script (dry-run + apply) wraps legacy proposals lacking `projectId` into projects and links them; re-run is idempotent.
2. New/default workspace settings treat `pipelineV3Enabled` as **true** (schema default + FE state default); seed schema includes the field.
3. With flag **on**: Creative is not the primary create entry (hidden or clearly Legacy); Projects create remains available for permitted users.
4. With flag **on**: new `POST /api/ai-jobs` creative creates are rejected with a clear message; existing jobs still poll/complete; admin/list job reads still work.
5. With flag **off**: legacy Creative path still works (escape hatch).
6. API + FE builds succeed; v3 pipeline paths unchanged in behavior aside from flag default.

## Notes

- Source: `docs/refactor-proposal-generator.md` §4.2 migration note, §15 Phase 6.
- Soft vs hard: this pack chooses **soft cutover** so production can flip back via settings; hard delete of poller is a later pack after quiet traffic.
- If product prefers **hard retire now** (delete poller + remove Creative routes), say so before implement — higher risk.
