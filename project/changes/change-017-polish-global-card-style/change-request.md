# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: polish
- **target-app**: web
- **affected-repos**: frontend
- **priority**: medium
- **request-id**: —
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Shared UI / global styles (PrimeNG `p-card`)
- Feature(s): Unify card chrome across Safqa Web to match Create Project form cards
- Endpoint(s): —
- Page(s)/View(s): `web` · all pages using `p-card` (Projects, Proposals, Dashboard, Clients, Services, Creative, AI Requests, Contracts, etc.)
- Service(s): —

## Description
Create Project (`ProjectCreateComponent`) already uses a Shopify-like card look via local `.form-card` styles: hairline border (`#e3e5e8` / token), 12px radius, no shadow, generous padding, deep-blue title. Other pages still use default PrimeNG card chrome (shadow / denser borders).

Promote that look to a **global** card style so every `p-card` inherits it, then remove redundant local `.form-card` overrides on Create Project. Keep intentional exceptions (e.g. proposal slide cards with zero padding, interactive option/template tiles that are not `p-card`).

No API, data-model, auth, or business-rule changes.

## Acceptance Criteria
1. Global styles define the Create Project card look for default `.p-card` (border, radius, shadow none, padding, title/subtitle typography using brand tokens).
2. Pages that currently use bare `p-card` (projects list/detail, proposals, clients, services, dashboard, creative, ai-requests, etc.) visually match Create Project cards without per-page styleClass for the base chrome.
3. Create Project no longer needs duplicate `:host ::ng-deep .form-card` card-chrome rules (can drop `styleClass="form-card"` or keep as alias that inherits global).
4. Special cases still work: `proposal-view-card` (zero content padding), chart/stat layouts, and non-`p-card` tiles (`.template-card`, `.option-card`) are unchanged in behavior.
5. Light + dark theme tokens remain coherent (border/background use CSS variables).

## Notes
- Reference implementation: `project-create.component.ts` styles for `.form-card` (~lines 443–469).
- Preferred approach: add rules to `src/styles.css` (and `--form-card-border` on `:root` / `.app-dark` if missing); avoid editing every template unless a `styleClass` is obsolete.
- Out of scope: redesigning option/template selection tiles; layout/grid changes; copy changes.
