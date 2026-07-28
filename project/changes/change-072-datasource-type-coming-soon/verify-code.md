# Verification — Datasource Type Coming Soon + Visibility

## Plan Consistency (pre-build)
- [x] Endpoints exist in specs (EP-DATA-47, EP-DSTYPE-01..04; EP-DATA-09/51 reject notes)
- [x] Services exist in specs (SVC-DSTYPE.assertConnectable; create guards)
- [x] Data model updated (`comingSoon` on `datasource_type_meta`)
- [x] Routes match (admin `/app/data-source-types`; customer pickers on `/app/data` + `/app/data/connections`)
- [x] Auth declared (admin role write; JWT customer read; unchanged)
- [x] Recon findings reflected (admin page drift fixed via `data-source-types.md` + `_index.md`)

## Code Verification (post-build)
- [x] Endpoints implemented — PATCH accepts `comingSoon`; GET returns field; no new routes required
- [x] Services implemented — `assertConnectable` on create + OAuth authorize starts (skip reauth when `connectionId` present)
- [x] Pages at correct routes — admin Coming soon toggle; customer pickers badge + disabled
- [x] Layering: controller → service → repo (controllers call type meta service; creates call service)
- [x] No direct external URLs in frontend
- [x] Auth guards applied (unchanged admin/JWT)
- [x] Acceptance criteria:
  1. Admin Coming soon toggle persists via PATCH — met
  2. EP-DATA-47 includes active + comingSoon — met (schema field + activeOnly filter unchanged)
  3. Pickers show badge + non-selectable — met (data-sources + connections)
  4. Backend rejects create/OAuth-start for coming-soon/inactive — met
  5. Existing connections remain usable (reauth/sync not guarded) — met
  6. Inactive hidden regardless of comingSoon — met (`activeOnly` + picker filter by API map)
  7. Default `comingSoon: false` — met (schema default + seed)
- [x] Builds: API `tsc --noEmit` green; admin `ng build` green; customer portal `ng build` green
- [x] UI screenshots — skipped

## Overall: PASS
