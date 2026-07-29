# Bug 20260729-125821 — Workspace data still shows Roya brand

## Status
**DONE** — Pack merged 2026-07-29

## Reported
- **Date**: 2026-07-29
- **Severity**: high
- **Affected area**: Pipeline v3 templates (`roya-presentation` about/chrome), proposal email templates, section AI about copy

## Description
Proposal template content, email templates, and related surfaces still show Roya name/data (e.g. “About Roya”, Roya Marketing Solution, `media.roya.marketing` logo). Roya was one workspace; every workspace account should use its own Settings company profile instead.

## Expected Behavior
- Template chrome / about section / footer use the current workspace Settings (`companyName`, `logoUrl`, email, phone, address).
- Proposal delivery emails brand as the selling workspace, not Roya Marketing Solution.
- AI-generated `about_workspace` copy is grounded in workspace Settings, not product/Roya defaults.
- No user-facing “Roya” agency fallback when Settings fields are present (or empty → omit, never invent Roya).

## Steps to Reproduce (if applicable)
1. Open a non-Roya workspace with Settings company name/logo set.
2. Generate a proposal (esp. `roya-presentation`) and open about / chrome / footer.
3. Send proposal email to client.
4. Observe Roya name, logo, or about copy instead of workspace Settings.

## Root Cause
Plan already forbids hardcoded Safqa/Roya on pitch disks and wires Assemble `workspace_*` from Settings, but:
1. `roya-presentation` HBS still hardcodes “About Roya” and `{{else}}Roya` chrome fallbacks.
2. Proposal email templates + send path never inject Settings (static Roya agency HTML).
3. Section AI / DNA prompts are not fed workspace Settings for `about_workspace` grounding.

## Fix Applied
- Removed `Roya` HBS chrome fallbacks; about chrome → workspace Settings name; interior → client-first.
- Section AI payload includes Settings seller `workspace`; DNA/section prompts neutralized.
- Proposal emails parameterized from Settings (logo/name/signature/footer); send path loads public Settings.
- Fixtures use Example Agency sample identity.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (`tsc --noEmit` PASS)
- [x] User confirmed fix resolves the issue

## Related Files
- Change pack: `project/changes/change-20260729-125821-bug-fix-workspace-branding/` (merged 2026-07-29)
- `templates/roya-presentation/v1/partials/*` (esp. `about_workspace.hbs`)
- `src/pipeline-v3/section/section-orchestrator.service.ts`
- `src/pipeline-v3/prompts/dna.core.v1.md`, `section.generic.v1.md`
- `src/templates/emails/proposals.template.{en,ar}.md`
- `src/services/mailjet.service.ts`, `proposal-sending.service.ts`
- `src/pipeline-v3/templates/fixtures/fixture-content.ts`

## Notes
- Escalated Path A (touches templates + emails + pipeline section context; may tighten blueprint rules).
- Out of product-name surfaces (e.g. “Roya Sales AI” verification) unless pack expands scope.
