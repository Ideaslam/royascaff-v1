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
- Module(s): AI Requests / Pipeline Traces
- Feature(s): Trace detail dialog visual redesign
- Endpoint(s): —
- Page(s)/View(s): `web` · AI Requests · Trace Detail Dialog (`PG-AIREQ-02`)
- Service(s): —

## Description
Redesign the AI request / pipeline trace detail popup so metadata and JSON are readable and well spaced. Today the meta grid uses a tight `minmax(160px)` layout, so long IDs (projectId, proposalId, runId) collide and wrap poorly; JSON panels are short (`max-height: 320px`) and feel cramped.

### Problems today
1. Meta fields overlap / crowd when hex IDs are long.
2. No clear visual grouping between identity, metrics, and JSON payloads.
3. JSON viewer area is too short for comfortable inspection of nested objects.
4. Dialog width/height doesn’t prioritize reading large records.

### Proposed UI (visual only)
1. **Wider dialog** (e.g. `min(1100px, 96vw)`) with taller content area.
2. **Organized meta**: definition-style cards/rows — labels above values; long IDs wrap or truncate with full value via title/tooltip; no overlapping columns.
3. **Grouped sections**: Identity (project, ids, step, action, runId) · Metrics (status, tokens, cost, duration, model) · Error (if any) · JSON blocks.
4. **JSON panels**: more vertical space (e.g. `min(50vh, 480px)` or flex-grow), clearer panel chrome, improved tree spacing/typography so nested objects are easy to scan.
5. Keep existing fields, Copy buttons, and data binding — markup/CSS/`json-tree` styles only.

## Acceptance Criteria
1. Meta labels/values never overlap; long IDs remain readable (wrap or truncate cleanly).
2. Dialog feels organized: clear hierarchy between header, meta groups, and JSON sections.
3. JSON tree has comfortable reading space (taller scroll area, readable mono type, clear nesting).
4. Same data shown as today (no new/removed fields, no API changes).
5. Copy still works; modal dismissible; RTL/dark theme still usable.

## Notes (optional)
- Screenshot attached in chat (overlap on Project ID / Proposal ID row).
- Prefer Roya brand tokens (`--roya-blue-*`, surface vars) — no purple glow aesthetic.
