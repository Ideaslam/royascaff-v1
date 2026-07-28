# Modules & Features — Delta (REQ-PROP-V3 part 8 — Cutover)

## Delta

- **Modify** Settings: `pipelineV3Enabled` default **true**
- **Modify** Creative Pipeline v2: soft-retired when flag on (no new creates; poller kept)
- **Modify** Creative (web): demoted/Legacy when flag on; Projects primary
- **Create** Cutover backfill (ops script): wrap legacy proposals in projects

---

## 8. Creative / AI Jobs _(cutover)_

### Features
1. **Creative Pipeline v2** [both] — **soft-retired** when `pipelineV3Enabled`; new creative creates rejected; in-flight jobs + poller + reads remain; escape hatch = flag off
2. **Workspace v3 feature flag** [both] — default **true**; still patchable via settings

## 12. Projects _(cutover)_

### Features
1. **Legacy proposal backfill** [backend-only] — ops script creates wrapping project + sets `proposal.projectId` (idempotent)
2. **Primary create path (FE)** [frontend-only] — Projects is primary when flag on

## 14. Pipeline Traces — unchanged

## Layout

1. **Nav demotion** [frontend-only] — hide Creative or show Legacy badge when flag on; keep `/ai-jobs` for history
