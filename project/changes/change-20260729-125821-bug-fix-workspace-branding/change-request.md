# Change Request

## Metadata
- **date**: 2026-07-29
- **change-type**: bug-fix
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged
- **bug**: bug-20260729-125821

## Scope
- Module(s): Pipeline v3 Templates (esp. `roya-presentation`); Assemble / TemplateRender; Section AI; Proposal email send (Mailjet)
- Feature(s): Multi-tenant workspace branding — Settings-backed company identity everywhere proposals/emails speak as the selling agency
- Endpoint(s): none new (reuse assemble + proposal send)
- Page(s)/View(s): none (Settings UI already holds company profile)
- Service(s): AssembleService; TemplateRenderService (HBS); SectionOrchestrator (or DNA/section prompt path); MailjetService; ProposalSendingService

## Description

**Problem (bug-20260729-125821):** Roya was one workspace. User-facing proposal HTML, about sections, and proposal emails still hardcode Roya agency name/logo/about copy. Other workspaces must use **their** Settings company profile.

**Desired outcome — workspace Settings as the selling brand:**

1. **Presentation templates (`roya-presentation` and any remaining hardcodes)**  
   - Replace chrome fallbacks `{{else}}Roya` with empty / `workspace_name` only (no product/agency name fallback).  
   - Replace static “About Roya” with Settings-backed label (e.g. “About {{workspace_name}}” or omit when empty).  
   - Keep Assemble injection of `workspace_name` / `workspace_logo` / contact fields from Settings.

2. **`about_workspace` content grounded in Settings**  
   - Pass workspace public settings (`companyName`, email, phone, address, logoUrl) into section generation context for `about_workspace` (and any prompt that invents agency facts).  
   - DNA/core prompts must not instruct “Roya / agency” as the seller identity.  
   - AI may write intro copy, but must use the workspace company name/contacts — never invent Roya.

3. **Proposal delivery emails**  
   - Parameterize `proposals.template.en.md` / `.ar.md` with workspace vars (name, logo, about/blurb or short company line, email, website/footer if available).  
   - `ProposalSendingService` / `MailjetService` load `getPublicSettings` and pass those vars.  
   - No hardcoded `media.roya.marketing/roya.png`, “Roya Marketing Solution”, or `roya.marketing` as the agency brand.

4. **Fixtures**  
   - Sample agency branding only (Example Agency / fixture contacts) — not Roya Safqa.

**Out of scope (unless you expand):**
- Product product-name surfaces: verification email “Roya Sales AI”, app package name, template **key** `roya-presentation` (catalog identity).
- Contract HTML / `roya_obligations` legal party rename (separate pack if needed).
- Changing Mailjet env defaults (`MAILJET_FROM_*`) or S3 public URL defaults (infra).
- New Settings fields (e.g. company about/bio/website) — use existing `companyName` / logo / email / phone / address only unless you request a new field.
- Frontend Settings UI redesign.
- Color source rename `roya_default` (internal theme fallback token; not user-facing copy).

**Locked decisions (proposed):**
- Selling brand = workspace Settings public fields only.
- Missing Settings value → omit from UI/email (empty), never fall back to “Roya”.
- Backend-only; regenerate / re-send required for existing proposals/emails to pick up changes.
- Aligns with existing blueprint rule: no hardcoded Safqa / Roya Safqa on pitch/website/roya disk — extend to email + section AI grounding.

## Acceptance Criteria

1. Assembled `roya-presentation` HTML has no user-visible “Roya” / “About Roya” chrome when Settings `companyName` is set (shows workspace name) or when empty (omits, does not show Roya).
2. `about_workspace` section chrome/title uses workspace name (or generic “About us”), not “About Roya”.
3. Section AI for `about_workspace` receives workspace Settings company fields and does not invent Roya as the selling company when Settings name differs.
4. Proposal email HTML uses workspace logo/name/signature/footer from Settings; no `media.roya.marketing/roya.png` or “Roya Marketing Solution” / “The Roya Team” as defaults.
5. Fixtures do not use Roya Safqa as sample agency identity.
6. Existing Assemble `workspace_*` wiring from Settings remains; client-first cover/body from change-000036 unchanged.
7. Verification / product “Roya Sales AI” emails unchanged (out of scope).

## Notes

- Escalated from Path A triage: multi-module (templates + emails + section prompts).
- Related prior packs: `change-20260728-000036-client-first-pitch-branding`, `change-20260727-000021-project-image-purpose-pitch-branding`, `change-20260728-000037-roya-presentation-template`.
- Confirm whether contracts should be a follow-up pack (recommended: yes, separate).
