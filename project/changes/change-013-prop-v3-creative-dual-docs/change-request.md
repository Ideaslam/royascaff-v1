# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Projects (create proposal), Proposals (list / view / send / public), Pipeline v3 export/assemble
- Feature(s): Creative-parity dual documents (technical + financial) per language for Pipeline v3 project proposals
- Endpoint(s): existing create-proposal / regenerate / translate / export (extend behavior; new routes only if required)
- Page(s)/View(s): `web` · proposals list, proposal view (v3), optional public/send paths
- Service(s): `ProjectsDataService.createProposalFromProject`, pipeline export/assemble, FE proposal URL helpers / list open flow

## Description
Pipeline v3 proposals created from a project must behave like **legacy creative** proposals for delivery UX:

1. **`type: 'creative'`** — not `project.type` (branding/campaign/…).
2. **Dual artifacts per language** — after generate / translate / regenerate+export:
   - **Technical** = pitch deck (current `renderedByLang[lang].htmlUrl` / pdf)
   - **Financial** = separate financial HTML (creative-style), not only the financial section inside the pitch
3. **Legacy URL maps populated** so list / send / public keep working:
   - `technicalUrlByLang` / `technicalHtmlUrl` ← technical deck
   - `financialUrlByLang` / `financialHtmlUrl` (+ `*HtmlUrlByLang` as used today) ← financial doc
4. **Language versions** — user can open **Technical** or **Financial** for each available language (`ar` / `en`) from the proposals list (same dialog pattern as creative). Translate **adds/updates** the target language without wiping the source. Regenerate rebuilds and overwrites artifacts for languages that are regenerated; remaining language keys stay until overwritten.

**Deferred (not this pack):** project edit/delete UI, dedicated DNA page, breadcrumbs — track as a follow-up pack.

## Acceptance Criteria
1. Project-created v3 proposals are stored with `type: 'creative'`.
2. After a successful export for language `L`, both technical and financial HTML URLs exist for `L` (legacy `*UrlByLang` and/or equivalent fields the list already reads).
3. Proposals list Technical / Financial actions open the correct document for the chosen language (not empty), for v3 creative proposals.
4. Translate to a second language produces technical + financial for the target language while keeping the source language docs.
5. After regenerate + export, user can still open technical and financial for each language that has rendered artifacts via the list (or view) language picker.
6. Send / readiness checks that require creative dual URLs treat v3 project proposals as ready when both maps are present.
7. Unified pitch deck (`renderedByLang`) remains available on `/proposals/:id/view` with language switcher.

## Notes
- Assumptions from confirmation: scope = dual docs + language reachability only; separate financial HTML (like creative); regenerate overwrites rebuilt langs; translate preserves source.
- Prefer server-side financial HTML generation at export (or assemble) using proposal/project services + totals — mirror creative `FinancialTemplateService` / existing financial template patterns where possible.
- `project.type` stays the project category; do not confuse with `proposal.type`.
- Optional later: backfill existing v3 rows missing `type: 'creative'` / URL maps — out of scope unless added in impact.
