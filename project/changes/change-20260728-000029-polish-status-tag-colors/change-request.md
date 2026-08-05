# Change Request

## Metadata
- **date**: 2026-07-28
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
- Module(s): Project detail (proposals table status tags); AI Requests (status labels)
- Feature(s): Semantic status colors; display rename `retrying` → `inprogress`
- Endpoint(s): —
- Page(s)/View(s): `web` · Project Detail proposals list; AI Requests list/filter
- Service(s): —

## Description
On Project Detail, proposal generation status tags (`mapping`, `ready`, `partially_failed`, etc.) all render default blue because `<p-tag>` has no severity. Wire semantic PrimeNG severities by meaning (success / info / warn / danger).

On AI Requests, show status `retrying` as **`inprogress`** in the table and filter dropdown label. Keep API filter value as `retrying` (no backend/data-model change).

## Acceptance Criteria
1. Project Detail proposals Status column: tags use meaning-based colors (e.g. `ready` = success/green, in-progress stages like `mapping`/`analyzing`/`generating_sections` = info/blue, `partially_failed` = warn/amber, `failed` = danger/red).
2. AI Requests table and status filter show **inprogress** instead of **retrying** as the human-facing label; filtering still works against backend `retrying`.
3. No API, schema, or business-rule changes.

## Notes
- Screenshot: Project Detail proposals Status column — all badges same light blue.
- Reference severity mapping already exists in `pipeline-stepper.component.ts` for generation statuses.
- Out of scope: renaming backend enum `retrying` → `inprogress` (that would be change-mode).
