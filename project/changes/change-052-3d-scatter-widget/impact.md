# Impact Analysis — change-052-3d-scatter-widget

## Feature State
`none` — No `scatter3d` widget exists anywhere in the codebase. Full greenfield creation.

## Files to Create

| File | Action |
|------|--------|
| `roya-ai-dynamo-frontend/src/app/shared/widgets/scatter3d-widget/scatter3d-widget.component.ts` | CREATE |
| `roya-ai-dynamo-frontend/src/app/shared/widgets/scatter3d-widget/scatter3d-widget.component.html` | CREATE |
| `roya-ai-dynamo-frontend/src/app/shared/widgets/scatter3d-widget/scatter3d-widget.component.scss` | CREATE |

## Files to Modify

| File | Change |
|------|--------|
| `roya-ai-dynamo-frontend/src/app/shared/widgets/widget-registry.ts` | Add `scatter3d: Scatter3dWidgetComponent` |
| `roya-ai-dynamo-frontend/src/app/pages/dashboards/dashboard-viewer/dashboard-viewer.page.ts` | Add `scatter3d: 'pi-chart-scatter'` to `getWidgetIcon` map |
| `roya-ai-dynamo-api/src/modules/dashboards/seeders/widget-definition.seeder.ts` | Add `scatter3d` definition to `WIDGET_DEFINITIONS` array |
| `roya-ai-dynamo-api/src/modules/dashboards/seeders/widget-definition-i18n.ts` | Add Arabic labels for `scatter3d` |

## npm install
- `three` (runtime dependency, `roya-ai-dynamo-frontend`)
- `@types/three` (dev dependency, `roya-ai-dynamo-frontend`)

## Ripple Effects
- No new endpoints. EP-DASH-08 (`GET /dashboards/:id/widgets/:widgetId/data`) already serves chart data.
- No change to pipeline AI prompts in this change — the AI will pick `scatter3d` automatically once the seeder entry exists (same mechanism as all other widget types).
- No change to export, sharing, or filter modules.

## Plan-vs-code drift
None found in this module that affects this change.

## Risks
- Three.js bundle size (~580 KB gzipped ~170 KB). Acceptable for a dashboard SaaS; can be lazy-loaded in a future change.
- WebGL not available in some headless test runners — no unit test assertion on canvas rendering needed.
