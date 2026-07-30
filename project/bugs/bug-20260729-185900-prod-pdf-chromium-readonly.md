# Bug 20260729-185900 — Production PDF proposal fails (Chromium / read-only FS)

## Status
**PENDING** — Fix applied; awaiting production redeploy + user confirm

## Reported
- **Date**: 2026-07-29
- **Severity**: high
- **Affected area**: API Pipeline v3 assemble / `PdfRenderService` + production `k8s.deploy`

## Description
Creating a PDF-compatible proposal fails in **production** (k8s). The same flow works in **dev**, which runs the image from `Dockerfile.build` via plain `docker run` (writable container root).

## Expected Behavior
Assemble/export should render HTML → PDF via Chromium in production the same way as in dev.

## Steps to Reproduce (if applicable)
1. In production, generate a PDF-oriented proposal (presentation / PDF-compatible template).
2. Pipeline reaches assemble/PDF render.
3. Chromium launch or PDF write fails; proposal stuck/failed at assemble.

## Root Cause
Two layered causes (dev vs prod):

1. **Image**: PDF needs Chromium in the runtime image (`Dockerfile.build` now installs `chromium` + fonts and sets `PUPPETEER_EXECUTABLE_PATH`). Dev already runs that image. Production must be rebuilt/redeployed with the same Dockerfile; older prod images had no browser.

2. **K8s hardening (even with Chromium present)**: `roya-sales-ai-api-v2/k8s.deploy` sets `readOnlyRootFilesystem: true` and only mounts writable `emptyDir` at `/tmp`. Puppeteer/Chromium defaults write under `$HOME` / config/cache (e.g. `/home/node/...`), which is **not writable** on a read-only root. Dev `docker run` has a normal writable root, so Chromium works there.

   Note: `roya-sales-ai-frontend/k8s.deploy` is unrelated — PDF rendering is server-side in the API.

## Fix Applied
- `PdfRenderService`: launch Chromium with `userDataDir` + crash dumps under `os.tmpdir()` (`/tmp` in prod).
- API `k8s.deploy`: set `HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` to `/tmp` for RO root pods.
- Still required: rebuild/redeploy production API with current `Dockerfile.build` (Chromium + fonts).

## Verification
- [x] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/pdf/pdf-render.service.ts`
- `roya-sales-ai-api-v2/k8s.deploy`
- `roya-sales-ai-api-v2/Dockerfile.build` (Chromium already present — redeploy prod)
