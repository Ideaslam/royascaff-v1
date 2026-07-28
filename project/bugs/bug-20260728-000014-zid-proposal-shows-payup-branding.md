# Bug 20260728-000014 — Zid proposal shows PayUp name/logo on cover

## Status
**DONE** — Resolved via `change-20260728-000036-client-first-pitch-branding/` (merged 2026-07-28)

## Escalation
Path A → [`change-20260728-000036-client-first-pitch-branding/`](../changes/change-20260728-000036-client-first-pitch-branding/) (`merged`)

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: Pipeline v3 Assemble / pitch branding (`AssembleService`, `pitch-landscape` cover)

## Description
Creating a proposal for project **Zid Test Ecommerce** (client Zid) shows **PayUp** logo + name on the technical proposal cover. User expects client/DNA logo (Zid), not PayUp.

## Expected Behavior
- Cover and body focus on the **client** (name + logo).
- Workspace (agency) appears in `about_workspace` + footer only.
- Client logo from DNA/project `purpose: client_logo`, falling back to Clients.`logoUrl`.

## Steps to Reproduce (if applicable)
1. Workspace Settings → Company name/logo set to PayUp (demo/agency).
2. Create project for client Zid (optionally with Clients.logoUrl, without uploading a DNA `client_logo` image).
3. Generate technical proposal → open preview (Technical / Arabic).
4. Cover top brand-mark shows PayUp logo + “PayUp”.

## Root Cause
PayUp was **workspace Settings** branding injected on every pitch page brand-mark. Client logo often missing because assemble ignored `clients.logoUrl` and project/DNA create seeded `images: []`.

## Fix Applied
Client-first templates (cover/body); new `about_workspace` section; footer keeps workspace contacts; assemble `clients.logoUrl` fallback; project/DNA logo seed; map require/inject `about_workspace`.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed verify PASS / merge

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts`
- `roya-sales-ai-api-v2/src/services/data/projects.data.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/map/map-orchestrator.service.ts`
- `roya-sales-ai-api-v2/templates/pitch-landscape/v1/partials/*`
- `roya-sales-ai-api-v2/templates/website-template/v1/*`
- Catalogs + fixtures under `pipeline-v3/templates/`
