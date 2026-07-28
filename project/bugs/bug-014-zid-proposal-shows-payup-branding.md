# Bug #014 — Zid proposal shows PayUp name/logo on cover

## Status
**ESCALATED** — Template redesign + client logo wiring → change pack (Path A)

## Escalation
Product direction: client-first pitch design (workspace intro section + footer only for agency), plus ensure `client_logo` / DNA images actually render.  
Change pack: [`change-036-client-first-pitch-branding/`](../changes/change-036-client-first-pitch-branding/) (`pack-status: drafted`).

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: Pipeline v3 Assemble / pitch branding (`AssembleService`, `pitch-landscape` cover)

## Description
Creating a proposal for project **Zid Test Ecommerce** (client Zid) shows **PayUp** logo + name on the technical proposal cover. User expects client/DNA logo (Zid), not PayUp.

## Expected Behavior
- Cover **agency brand-mark** may show workspace company from Settings (selling company).
- Cover **client row** must show the proposal client name + logo from DNA/project `purpose: client_logo`, falling back to the Clients record `logoUrl` when no DNA/project logo image exists.
- PayUp client CRM data must not replace Zid on a Zid proposal.

## Steps to Reproduce (if applicable)
1. Workspace Settings → Company name/logo set to PayUp (demo/agency).
2. Create project for client Zid (optionally with Clients.logoUrl, without uploading a DNA `client_logo` image).
3. Generate technical proposal → open preview (Technical / Arabic).
4. Cover top brand-mark shows PayUp logo + “PayUp”.

## Root Cause
PayUp is **not** leaking from another client’s proposal. It is the **workspace Settings** company (`companyName` / `logoUrl`) injected as `workspace_name` / `workspace_logo` on every pitch page (change-021). In Arabic RTL the brand-mark sits top-right, which reads as “the client.”

Amplifying gap: `client_logo` is resolved only from DNA/project images with `purpose === "client_logo"`. **`clients.logoUrl` is never used** at assemble, and project/DNA create seeds `images: []`, so Zid’s client logo often never appears — only the PayUp workspace mark is visible.

## Fix Applied
_(pending Step 6.4)_

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts`
- `roya-sales-ai-api-v2/src/services/data/projects.data.service.ts` (optional seed)
- `roya-sales-ai-api-v2/src/services/data/clients.data.service.ts` / clients repository

## Triage
- **Path B** — isolated assemble (+ optional project-create seed); no migration; no multi-app plan rewrite required.
- Plan note: main blueprint still says `client_logo` from purpose image only; fix extends with Clients.logoUrl fallback without editing main plan (Path B rule). Escalate to Path A only if product wants to remove/hide workspace branding entirely.
