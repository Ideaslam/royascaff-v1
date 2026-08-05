# Change Request

## Metadata
- **date**: 2026-08-05
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
- Module(s): Layout / Sidebar
- Feature(s): Nav information architecture — reorder + rename labels (en/ar)
- Endpoint(s): —
- Page(s)/View(s): `web` · sidebar chrome (all authenticated pages)
- Service(s): —

## Description
Reorder and rename sidebar nav items for clearer UX. No route, permission, or behavior changes — markup order + i18n copy (+ optional icon swap for AI Requests) only.

### Problems today
1. “Proposal” repeated in three labels under PROPOSALS.
2. TOOLS mixes AI features with admin (Users / Roles / Settings).
3. AI Requests uses a coins icon (reads as billing, not activity/usage).
4. Create flows sit as peer items without clear hierarchy vs Projects/Archive.

### Proposed IA

**MAIN**
- Dashboard

**SALES** *(was Proposals)*
- Projects *(v3 badge kept)*
- Classic *(was New Proposal)*
- Creative *(was Creative Proposal; AI badge kept)*
- Archive *(was Proposals Archive)*
- Contracts

**CATALOG** *(was Data)*
- Clients
- Categories *(was Service Categories)*
- Services

**AI** *(new section — split from Tools)*
- Assistant *(was AI Assistant)*
- Usage *(was AI Requests; icon → `fa-chart-line` or `fa-list-check`)*

**ADMIN** *(was Tools remainder)*
- Users
- Roles *(was Roles & Permissions)*
- Settings

Routes and `*appHasPermission` guards stay identical; only section grouping, label keys, and order within sections change.

## Acceptance Criteria
1. Sidebar sections follow: Main → Sales → Catalog → AI → Admin.
2. Labels match proposed EN names; AR translations updated to match meaning (not literal English).
3. Same routes, permissions, and badges (`v3`, `AI`) as today.
4. AI Requests item no longer uses coins icon.
5. Collapsed sidebar + RTL still work; no API/data/auth changes.

## Notes (optional)
- Confirm label choices (especially Classic / Creative / Usage) before implement.
- Badges (`v3`, `AI`) left as-is unless user asks to remove.
