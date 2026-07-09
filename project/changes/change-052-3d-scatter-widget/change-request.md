# Change Request — change-052

## Metadata
- **Change number**: 052
- **Slug**: 3d-scatter-widget
- **Change type**: new-feature
- **Target app**: customer-portal + backend (seeder only)
- **Affected repos**: `roya-ai-dynamo-frontend`, `roya-ai-dynamo-api`
- **Priority**: medium
- **Date**: 2026-07-09

## Scope
- **Module**: 6 — Dashboards
- **Fast-track**: yes (≤1 module, no new endpoints/services/entities, endpoint already exists)

## Description
**Problem**: The platform supports only 2D Chart.js-based visualisations. There is no 3D chart capability.

**Desired behavior**: Introduce a new `scatter3d` widget type — a Three.js-rendered interactive 3D scatter plot. Users (and the AI generation pipeline) can now include a three-axis scatter chart in any dashboard. The widget:
- renders points in a 3D canvas that fills the gridster cell
- supports interactive orbit (rotate), zoom, and pan via mouse/touch
- auto-resizes when the gridster cell is resized
- reads `xField`, `yField`, `zField` from `queryDefinition` for axis mapping
- supports optional `labelField` for point tooltips
- uses brand color (`--roya-primary` #5922ea) as the default point colour

**Who is affected**: Dashboard editors and viewers (all workspaces).

**User story (happy path)**: Editor adds a new widget to a dashboard. In the widget-add dialog the AI receives the `scatter3d` catalog entry and generates the widget with the correct `xField`, `yField`, `zField` mapping. The viewer renders the 3D scatter plot immediately.

**Out of scope**: 3D bar chart, 3D surface, WebGL fallback warning UI (not in this change).

## Acceptance Criteria
1. `scatter3d` Angular component renders a Three.js 3D scatter plot inside the widget card.
2. Axes are labelled from `displayConfig.axisLabels` (x/y/z), with fallback to field names.
3. Points are coloured via `displayConfig.pointColor` (default `#5922ea`).
4. Canvas resizes responsively when the gridster cell changes size (ResizeObserver).
5. Orbit (rotate), zoom, and pan work via mouse drag.
6. Empty state shown when data is empty / fields are missing.
7. `scatter3d` is registered in `WIDGET_REGISTRY` and resolves correctly.
8. Backend seeder includes `scatter3d` definition with correct `requiredStructure` and `example`.
9. Arabic labels for `scatter3d` added to the i18n file.
10. Dashboard viewer `getWidgetIcon` returns `pi-chart-scatter` (or suitable fallback) for `scatter3d`.

## Notes
- Three.js will be installed as a regular dependency (`three` + `@types/three` as dev).
- Pattern B (custom renderer, no `BaseChartWidget`, no Chart.js) — same pattern as `heatmap-widget` and `map-widget`.
- The widget is designed for ≤ 2 000 points; larger datasets should be aggregated server-side.
