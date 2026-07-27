# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: bug-fix
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: change-015
- **blocks**: —
- **pack-status**: merged
- **bug**: `bug-003-continue-after-assemble-fail.md`

## Scope
- Module(s): Proposal Pipeline v3 (resume + proposal view)
- Feature(s): Resume / Continue after terminal assemble or export failure (e.g. missing Chromium)
- Endpoint(s): widen EP-PROP-PIPE-01 `canResume` + EP-PROP-PIPE-08 resume status machine; optionally harden EP-PROP-PIPE-03 retry
- Page(s)/View(s): web proposal view — Continue (or equivalent) when assemble/export is recoverable
- Service(s): PipelineResumeService, ProjectsDataService status, SectionOrchestratorService retry

## Description
When assemble/PDF fails (Chromium missing), generation becomes terminal `failed`. Continue is gated on non-terminal `stuck` only; resume no-ops on `failed`; Retry failed sections only re-enqueues section rows with `status === failed` (often none). User cannot continue after fixing the environment without full regenerate.

**Desired outcome:** Recoverable terminal failures at assemble/export (sections ready, no/missing artifacts) expose Continue (or Retry that re-runs assemble→export) and resume re-enqueues assemble/export without wiping ready sections.

## Acceptance Criteria
1. After assemble fail with Chromium error and all (or enough) sections `ready`, status API sets `canResume`/`stuck` (or dedicated flag) so FE shows Continue.
2. `POST …/resume` from that state clears the terminal fail and enqueues assemble (then export), preserving ready sections.
3. Retry failed sections: if no failed sections but assembly/export failed / no artifacts → same assemble re-run path (no silent empty enqueue).
4. Successful path still ends `ready`/`partially_failed` with HTML/PDF when Chromium is available.

## Notes
- Fast-Track eligible once runtime confirms hypotheses (BE+FE, narrow resume gap).
