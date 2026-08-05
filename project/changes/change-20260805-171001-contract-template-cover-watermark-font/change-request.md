# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-CONTRACT-TEMPLATE
- **part**: 2/2
- **depends-on**: — (color-palette pack `change-20260805-165124` merged 2026-08-05; `colorRoles`/`colorPalette` are already in main blueprint + code)
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Data (Settings), Data (Contracts / Contract Templates)
- Feature(s): Workspace fonts list, Contract cover page, Contract watermark, Contract template layout/style
- Endpoint(s): none new — reuses `EP-SETTINGS` GET/PATCH, `EP-CONTRACTS-10` (POST /:id/pdf), `EP-CONTRACT-TEMPLATES-*`
- Page(s)/View(s): web: Settings → Theme & Branding tab (font list), Contract Templates editor (token palette additions)
- Service(s): `SettingsDataService`/settings-schema (font option), `ContractPdfService`, `ContractsDataService.renderContractHtml`, default template HTML (`roya-default.html`)

## Description

**Follow-up to** `change-20260805-144725-contract-template-pdf-system` (merged). That pack shipped the contract-templates catalog + Puppeteer PDF export. This pack polishes the generated contract's visual design with 4 enhancements, all scoped to the **existing** template/PDF pipeline (no new entities):

**1. Amiri Google Font, selectable from Workspace Settings**
- Workspace Settings → Theme already has a `defaultFont` select (`Cairo` | `Tajawal`), used app-wide.
- Add `Amiri` as a third option to that same select (both `settings-schema.ts` fallback and the DB-seeded copy in `config-seed-data.js`).
- Contract rendering (both the live HTML and the PDF) uses whichever font is currently selected in workspace settings — injecting a Google Fonts `<link>`/`@import` for the selected font family plus `font-family` CSS driven by a new `{{document_font}}` token, so switching the setting changes future contract PDFs without a template edit.
- Font loading confirmed compatible with Puppeteer's PDF path (`pdf-render.service.ts` already does `waitUntil: 'load'` + `document.fonts.ready`).

**2. Contract cover page**
- New full-bleed first page (`page-break-after: always`) inspired by the attached reference image's layout (dark hero block with title + tagline, then a lighter contact-details strip at the bottom split into two columns), but restyled with the **workspace's own brand colors** instead of a fixed dark photo:
  - Background: CSS radial/linear gradient built from `colorRoles.primary` → `colorRoles.secondary` (fallbacks: `accent`, then Roya defaults if the workspace has no palette), plus a subtle abstract SVG wave/swirl overlay (inline CSS, no external image asset).
  - Hero block: workspace logo (or name fallback), contract title, one-line description, all in a light/contrasting text color derived from `colorRoles.text`/`surface` for legibility over the gradient.
  - Bottom info strip (light background): **left column** — Contract Number, Client Name, Date Issued, Submitted By (workspace name); **right column** — workspace Phone, Email, Address. (No "Website" field — not tracked in settings today; out of scope to add one.)
- This cover is in addition to the existing in-body letterhead block (kept on the article page, immediately after the cover) — the cover replaces the plain page 1 as the new page 1; article content starts on the page after.

**3. Watermark (workspace name + page number)**
- Puppeteer only injects live per-page values (`pageNumber`/`totalPages`) inside the small header/footer margin-box templates — it cannot inject a dynamic page number into arbitrary `position: fixed` content in the main page body.
- So the watermark is split accordingly:
  - **Workspace name**: a faint (`opacity` ~0.06–0.08), large, diagonally rotated (`-35deg`) text block using `position: fixed` in the contract's main content CSS — Chromium's print-to-PDF repeats `position: fixed` elements on every content page automatically, so the same static text (workspace name) appears once per page with no per-page JS needed. Uses `colorRoles.primary` (or dark gray fallback) at low opacity so it never interferes with legibility.
  - **Page number**: kept in the existing repeating footer template (already renders `pageNumber`/`totalPages` per page via Puppeteer), but restyled larger/more prominent (bigger, lighter "badge" numeral) so it reads as a deliberate watermark-style page marker rather than plain small footer text — no technical change to *how* it's produced, only to its visual weight.
  - Watermark does not render on the cover page (cover has its own distinct branded look).

**4. Rearranged / restyled content (heavier restructure)**
- Keep all existing legal article numbering/order/content (Arabic RTL text is unchanged) but improve the visual system:
  - Numbered clause "badges"/pills (e.g. small circular accent-colored numerals) replacing the current plain bold `المادة X` text headers, using `colorRoles.primary`/`accent`.
  - Boxed "callout" styling (already exists for `.contract-notes`; extend the same visual language) for a few naturally important clauses (financial terms table intro, termination) — purely CSS/wrapper markup, no content changes.
  - A short **styled index/overview strip right after the cover** (before article 1) — NOT a full table of contents with page numbers (Puppeteer can't inject cross-reference page numbers into body content either); instead a simple "at a glance" band listing Contract Number / Client / Duration / Total value with accent-colored labels, reusing already-available tokens.
  - Refined spacing scale (consistent vertical rhythm between sections, tighter clause paragraph spacing), refined table styling (softer borders, subtle header tint using `colorRoles.surface`/light-primary tint), tidier signature block spacing.
- All of this lives in the **default seeded template's HTML/CSS** (`roya-default.html`) — the underlying template mechanism (tokens, admin editor, per-contract override) is unchanged; any workspace that later creates a custom template can independently opt in/out of the new blocks since they're just template content.

**Not doing:**
- No new Settings UI fields beyond the one new `Amiri` select option (no dedicated font multi-select — reuses the existing single select).
- No new "Website" settings field.
- No true per-page-numbered table of contents.
- No changes to the underlying contract-templates CRUD, permissions, or PDF endpoint contracts.

## Acceptance Criteria
1. Workspace Settings → Theme → Default Font select includes `Amiri` alongside `Cairo`/`Tajawal`; selecting and saving it persists via existing PATCH settings flow (no schema/endpoint change beyond the new option).
2. The contract HTML/PDF loads the selected workspace font (Amiri/Cairo/Tajawal) via a Google Fonts `<link>` and applies it as the primary `font-family` for the whole document; changing the workspace's font setting changes newly rendered contracts without editing the template.
3. Generated contract PDF's first page is a full-bleed branded cover (gradient background from workspace `colorRoles`, workspace logo, contract title, tagline) with a two-column info strip (left: contract #/client/date issued/submitted-by; right: workspace phone/email/address); article content begins on page 2.
4. Every content page (excluding the cover) shows a faint diagonal workspace-name watermark across the page body, and a visually prominent page-number marker in the footer; the watermark does not obstruct text legibility (verified via visual review of the exported PDF).
5. Article sections retain identical legal wording/order but display with numbered accent-colored clause badges, refined spacing, an "at-a-glance" summary strip after the cover, and tidier table/signature styling.
6. Existing contract-templates CRUD, token palette, admin permission (`contract-template.manage`), and the `POST /api/data/contracts/:id/pdf` endpoint continue to work unchanged; no regression in previously-passing acceptance criteria from the prior pack.
7. `npm run build` (backend `tsc`) and `ng build --configuration production` (frontend) both pass with no new errors.

## Notes (optional)
- Reference image (cover style inspiration): dark hero + two-column bottom contact strip — reinterpreted with workspace brand colors instead of the fixed dark photo, per user decision.
- Technical constraint documented above: Puppeteer header/footer templates are the only place with live per-page `pageNumber`/`totalPages`; main-content watermarks must be static text via `position: fixed` (Chromium repeats these per printed page).
- `colorRoles` (`primary`/`secondary`/`accent`/`surface`/`text`) already available from `SettingsDataService.getPublicSettings()` (`hydrateThemeBranding`); the color-palette pack merged into the main blueprint during this pack's drafting.
- Discovery decisions locked in: (1) reuse existing Default Font select, (2) CSS-gradient cover (no raster image), (3) skip Website field, (4) split watermark approach (diagonal name + prominent footer page number), (5) heavier restructure (badges/callouts/at-a-glance strip).
- Post-drafting fast-track addendum (during live PDF review, before PASS): `{{contract_number}}` changed from the raw internal contract id to a short 8-character high-entropy-looking code (e.g. `AR23DSV2`), derived deterministically from the internal id (no new persisted field). See `verify-code.md` Post-verify fix round.
- Post-drafting fast-track addendum 2 (during live review, before PASS): cover background changed from the AC-3-described `colorRoles.primary → secondary` gradient (+ swirl overlay) to a **single solid `colorRoles.secondary` fill**, no gradient/pattern, at user request; cover title enlarged; true edge-to-edge bleed added via a `ContractPdfService` two-pass render (separate zero-margin cover PDF + normally-margined content PDF, merged with the new `pdf-lib` dependency) instead of the single full-content-box page originally implemented. See `verify-code.md` Post-verify fix round 3.
