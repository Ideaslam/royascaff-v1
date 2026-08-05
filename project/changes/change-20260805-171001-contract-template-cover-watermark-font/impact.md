# Impact Analysis — Contract Font + Cover + Watermark + Restyle

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Settings schema (font option) | partial | `src/lib/settings-schema.ts`, `scripts/config-seed-data.js` | `defaultFont` select exists (Cairo/Tajawal) but no `Amiri` option; FE settings page/model already generic (no FE code change needed) |
| Workspace brand colors | complete | `src/lib/settings-branding.ts`, `SettingsDataService.getPublicSettings()` | Already returns `colorRoles` (`primary/secondary/accent/surface/text`) + `colorPalette` + `defaultColor` (color-palette pack merged) — just unused by contracts today |
| Contract token rendering | partial | `src/services/data/contracts.data.service.ts` (`renderContractHtml`, `createContractFromProposal`) | `workspaceBranding` only carries logo/company/email/phone/address; no font/color tokens; no cover/watermark/at-a-glance tokens |
| Contract PDF export | partial | `src/services/data/contract-pdf.data.service.ts` | Header/footer text-only + page numbers already work; footer not styled as a "watermark"; no brand-color awareness |
| Default template content | none (for these 4 asks) | `scripts/contract-templates/roya-default.html` | No cover page, no watermark CSS, no Google Font link, no clause badges/callouts/at-a-glance strip; hardcoded `Tahoma/Arial` font-family |
| Template seed script | complete (mechanism) | `scripts/seed-contract-templates.js` | Upserts by `key`; already re-applies edited HTML — just needs new HTML content, no script logic change |
| Admin template editor token palette | partial | `roya-sales-ai-frontend/.../contract-template-edit.component.ts` | `TOKEN_GROUPS` list must gain new tokens (font/brand-color/total) so admins editing a *custom* template can still use them |
| Puppeteer PDF engine | complete | `src/pipeline-v3/pdf/pdf-render.service.ts` | Already does `waitUntil: 'load'` + `document.fonts.ready` — safe for Google Fonts `<link>`; no change needed |

Feature state: **partial** (mechanism/infrastructure exists end-to-end from the prior pack; this pack is template-content + token-plumbing work, no new architecture)

## Affected Modules
- **Settings** (Data) — add one enum option (`Amiri`) to the existing `defaultFont` schema field in both the TS fallback and the DB seed data file. No new stored field, no endpoint change.
- **Contracts** (Data) — extend `renderContractHtml`'s token vocabulary (new tokens: `document_font`, `document_font_link`, `brand_primary`, `brand_secondary`, `brand_accent`, `brand_surface`, `brand_text`, `contract_total`) and pass `defaultFont`/`colorRoles` through `workspaceBranding` from `createContractFromProposal`.
- **Contract PDF export** — `ContractPdfService.renderContractPdf` reads `colorRoles.primary` (already fetches `getPublicSettings`) to tint the footer's page-number badge; no other service change (watermark itself lives in template CSS, not the Puppeteer service).
- **Contract Templates** (default seed content) — full-bleed cover page, `position: fixed` diagonal watermark, at-a-glance strip, numbered clause badges/callouts, refined spacing — all inside `roya-default.html`; re-seed via existing upsert script.
- **Contract Templates editor (web)** — token palette gains a new "Design / Branding" group so custom templates can also use the new tokens.

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/contracts.md` — delta: `renderContractHtml` new token vocabulary + `workspaceBranding` shape; `createContractFromProposal` passes `defaultFont`/`colorRoles`
- [ ] `blueprint/actions/api/services/contract-templates.md` — delta: default template content description (cover/watermark/at-a-glance/badges) + new token catalog note
- [ ] `blueprint/plan/data-model-delta.md` — delta: `settings.defaultFont` enum gains `Amiri` (no shape/field change, documented for traceability)
- [ ] `blueprint/actions/web/pages/contract-templates.md` — delta: token palette additions
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity Medium, cross-module Yes (Settings + Contracts + web editor), migration No

- **Medium complexity** mainly in the default template HTML/CSS rewrite (cover + watermark + restyle), not in the plumbing (which is a small, additive extension of an existing token map).
- **Cross-module but low-risk**: Settings change is purely additive (new select option); Contracts change is additive (new optional tokens, existing tokens/behavior untouched); no schema migration, no endpoint contract changes, no permission changes.
- **Regression risk**: must keep prior pack's acceptance criteria intact (logo inlining, margin handling, admin permission, PDF endpoint) — verified by re-running the existing contract PDF flow after changes.
- **External dependency**: Google Fonts must be reachable from the server/Chromium at render time (already true for other templates in this codebase using Google Fonts links, e.g. `financial_template.html`, so this is an established, accepted pattern — not a new risk class).

## Recommendation
- **Create**: cover page, watermark CSS, at-a-glance strip, clause badges/callouts, `Amiri` font option, new tokens (`document_font*`, `brand_*`, `contract_total`).
- **Complete in place**: `renderContractHtml` token map, `ContractPdfService` footer styling, template editor token palette.
- **Modify (ripple)**: `roya-default.html` (rewritten sections only — legal article text/order untouched), `createContractFromProposal` (extra fields passed into existing `workspaceBranding` object).

## Status target (per artifact in the pack after implement)
- Settings schema `Amiri` option → planned → done
- `renderContractHtml` token vocabulary extension → planned → done
- `ContractPdfService` footer brand-color accent → planned → done
- `roya-default.html` cover/watermark/at-a-glance/badges/restyle → planned → done
- Contract Templates editor token palette additions → planned → done
- Re-seed default template → planned → done

## Dependencies
- depends-on: — (color-palette pack `change-20260805-165124` already `merged`; no blocking dependency)
