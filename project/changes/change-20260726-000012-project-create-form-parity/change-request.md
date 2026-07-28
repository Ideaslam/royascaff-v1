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
- Module(s): Projects (Pipeline v3 create flow), Creative (parity reference only)
- Feature(s): Create Project form — field parity with legacy Creative + DNA `info` mapping + UI redesign
- Endpoint(s): existing project create / upload (extend `info` + services payload shape as needed; no new routes unless required)
- Page(s)/View(s): `web` · `/projects/new` (`ProjectCreateComponent`)
- Service(s): FE `ProjectsService`, `AppDataService` (services catalog); BE `ProjectsDataService` + `dna-passthrough` / `buildDnaSkeleton`

## Description
Bring the Pipeline v3 **Create Project** wizard up to the richness and UX of the old **Creative** form so users can capture the same facts that feed DNA analysis.

Missing / broken today vs Creative:
1. **Digital presence** — website, Instagram, X, LinkedIn, TikTok, Snapchat → `info.digitalPresence` → DNA `digitalPresence`
2. **Competitors** — three separate URL fields (not a comma string); DNA expects `{ url }` (current create form sends `{ name }` only → competitors dropped in skeleton)
3. **Project details** — required **project description**, **KPIs**, **Budget** (`SelectModule` + `PROJECT_BUDGET_OPTIONS`), **Duration** (`SelectModule` + `PROJECT_DURATION_OPTIONS`)
4. **Services** — selectable from catalog API (category grid like Creative), with ability to **override** name/price/qty after select; tax/totals display
5. **UX redesign** — field arrangement like Creative cards; upload zones for RFP + images with **thumbnail snapshot previews**; **Create client** button beside client select (reuse `CreateClientDialogComponent`)

Keep existing step flow (info → services → files → template) unless a cleaner Creative-like card layout inside steps is clearer; prefer Creative visual patterns within steps.

## Acceptance Criteria
1. Create Project form exposes digital presence fields (6) and persists them on `project.info.digitalPresence`; DNA skeleton includes them.
2. Competitors are three separate URL inputs; payload is `[{ url }]` (max 3); DNA skeleton retains them (not filtered out).
3. Project description is required; KPIs, Budget (select), Duration (select) are on the form and stored on `project.info` (`summary` / `kpis` / `budget` / `duration` as appropriate for DNA passthrough).
4. Services step loads catalog from API (search + categories); user can select services and override name/price/qty; create payload includes selected/overridden line items + financial totals consistent with tax settings.
5. Client row includes searchable select + **Add client** button opening existing create-client dialog; new client appears selected.
6. RFP and images use styled upload zones with drag/drop; images show thumbnail previews with remove; RFP shows filename/size when attached.
7. Form layout/visual polish matches Creative quality (cards/sections, RTL-safe grid) using Safqa brand tokens — no purple/generic AI look.
8. Existing generate path (create project → optional uploads → create proposal) still works with `pitch-landscape`.

## Notes
- Reuse Creative constants: `PROJECT_BUDGET_OPTIONS`, `PROJECT_DURATION_OPTIONS`, `PROJECT_TYPE_OPTIONS`, research option patterns, `CreateClientDialogComponent`.
- BE: extend `buildDnaSkeleton` to map user KPIs string/list into seed if possible; ensure `summaryUser` from description; keep fail-closed URL/money rules.
- Out of scope: redesigning Creative itself; new permission keys; template catalog changes.
