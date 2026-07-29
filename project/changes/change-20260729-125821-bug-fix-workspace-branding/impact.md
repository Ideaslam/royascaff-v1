# Impact Analysis — Workspace Settings brand (not Roya)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Settings public fields | complete | `settings.model.ts`, `SettingsDataService.getPublicSettings` | No company-about field (out of scope); name/logo/email/phone/address exist |
| Assemble → `workspace_*` | complete | `assemble.service.ts` | Already injects Settings into render branding |
| `roya-presentation` HBS | partial | `templates/roya-presentation/v1/partials/*.hbs` | ~20 partials `{{else}}Roya`; `about_workspace.hbs` hardcodes “About Roya”; chrome uses workspace not client (drift vs client-first) |
| pitch/website disks | complete | `templates/pitch-landscape`, `website-template` | Already `client_*` chrome / `workspace_*` about+footer; no Roya fallback |
| Section AI context | partial | `section-orchestrator.service.ts`, `dna-slice.ts`, `section.generic.v1.md`, `dna.core.v1.md` | No Settings/seller block in payload; DNA role says “Roya / agency”; about copy ungrounded |
| Proposal email templates | none→partial | `src/templates/emails/proposals.template.{en,ar}.md` | Fully hardcoded Roya agency brand |
| Mailjet / send | partial | `mailjet.service.ts`, `proposal-sending.service.ts` | Only passes `client_name` + URLs; subject fallback `'Roya'`; no Settings load |
| Fixtures | partial | `fixture-content.ts` | Footer thanks “Roya Safqa team”; contacts `info@roya.marketing` |
| Contracts | partial | out of pack scope | Hardcoded رويا — deferred |
| FE | N/A | — | Out of scope |

Feature state: **partial** (Assemble wiring done; HBS/email/AI grounding incomplete)

## Affected Modules

- **Templates (`roya-presentation`)** — remove Roya fallbacks; about chrome → workspace name; interior “By …” → `client_name` (client-first parity with pitch)
- **Section engine / prompts** — inject workspace Settings into section user JSON (esp. `about_workspace`); neutralize Roya seller identity in DNA/section prompts
- **Proposals send + Mailjet** — load public Settings; parameterize email templates with `workspace_*`
- **Fixtures** — sample agency only

## Pack blueprint files to create

- [x] `blueprint/actions/api/services/templates.md` — HBS rules: no Roya fallback; about + chrome after-state
- [x] `blueprint/actions/api/services/pipeline-sections-engine.md` — section payload includes seller/workspace Settings; prompt grounding
- [x] `blueprint/actions/api/services/proposals.md` — ProposalSendingService passes Settings into email
- [x] `blueprint/actions/api/services/integrations.md` — MailjetService template vars after-state
- [x] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely to modify (implement step)

| Area | Files |
|------|--------|
| HBS | All `templates/roya-presentation/v1/partials/*.hbs` with `Roya` fallback; especially `about_workspace.hbs` |
| Prompts | `src/pipeline-v3/prompts/dna.core.v1.md`, `section.generic.v1.md` (+ optional about-specific note) |
| Section AI | `section-orchestrator.service.ts` (load/inject Settings); maybe thin helper |
| Email templates | `src/templates/emails/proposals.template.en.md`, `.ar.md` |
| Send path | `proposal-sending.service.ts`, `mailjet.service.ts` (`ProposalTemplateData`) |
| Fixtures | `fixture-content.ts` |

## Risk

- **Complexity**: M — many HBS files + email HTML + one AI context inject
- **Cross-module**: Y — templates + section AI + proposals/integrations
- **Migration**: N — no DB migration; regenerate/re-send for existing artifacts
- **Ripple**: Mailjet From name stays env default (out of scope); contracts deferred

## Recommendation

- **Modify**: roya-presentation chrome/about; section payload + prompts; email templates + send/Mailjet vars; fixtures
- **Create**: none (no new endpoints/entities)
- **Complete**: multi-tenant workspace brand on proposal HTML + email + about AI

## Status target (per artifact after implement)

| Artifact | Target |
|----------|--------|
| Templates HBS / fixtures rules | done |
| Section engine workspace inject | done |
| ProposalSendingService | done |
| MailjetService template vars | done |

## Dependencies

- depends-on: — (change-000036 / 000021 / 000037 already merged)
- bug: bug-20260729-125821
