# Modules & Features — Delta (REQ-PROP-V3 Phase 3)

## Delta

- **Extend** Creative / AI: Pipeline v3 Steps 3–5 + reconciler + workspace feature flag
- **Extend** Proposals: `sections[]`, `renderedByLang`, generation through ready/partially_failed, section retry
- **Extend** Settings: `pipelineV3Enabled` (workspace)
- **Ripple** Projects: gate create-from-project / v3 enqueue when flag off

---

## 6. Creative / AI Generation _(extend — Phase 3)_

### Features
1. **Section fan-out (Step 3)** [backend-only] — parallel `pipeline.section` jobs; AJV contentSchema + richness; per-section fail/repair
2. **Assemble (Step 4)** [backend-only] — Handlebars + financial inject + overflow guard + PDF (no AI)
3. **Export (Step 5)** [backend-only] — S3 HTML/PDF → `renderedByLang`; retryable independently
4. **Orchestration engine** [backend-only] — fan-in after sections; idempotent workers; reconciler ~60s; FlowProducer or equivalent
5. **Workspace v3 feature flag** [backend-only] — when off, legacy creative `/ai-jobs` remains default; v3 enqueue gated

## 5. Proposals _(extend)_

### Features
1. **Section content storage** [backend-only] — `proposal.sections[]` with per-lang content + status
2. **Render artifacts** [backend-only] — `renderedByLang[lang].{htmlUrl,pdfUrl}`
3. **Generation status (extended)** [backend-only] — steps.sections / assembly / export; statuses through ready/partially_failed
4. **Retry failed sections** [backend-only] — re-enqueue instanceIds only; may resume assemble/export

## 9. Settings _(extend)_

### Features
1. **pipelineV3Enabled** [backend-only] — boolean on workspace settings; whitelist patch key
