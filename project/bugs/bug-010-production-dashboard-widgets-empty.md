# Bug #010 — Production dashboard widgets show "No data available"

## Status
**DONE** — Confirmed by user 2026-06-28

## Reported
- **Date**: 2026-06-28
- **Severity**: high
- **Affected area**: customer-portal/dashboards, frontend/widgets

## Description
Dashboard viewer worked correctly in local development (widgets rendered charts, KPIs, tables) but in production every widget displayed "No data available". API endpoints returned successfully — dashboard metadata and per-widget data requests both returned HTTP 200 with valid payloads.

## Expected Behavior
Production build should render the same widget components as local dev (bar, line, kpi_card, table, etc.) using data from `/dashboards/:id/widgets/:widgetId/data`.

## Steps to Reproduce
1. Build frontend with production configuration (`ng build --configuration=production`)
2. Deploy or serve the production bundle
3. Open any dashboard with data widgets
4. Observe all widgets show empty-state message despite successful API responses

## Root Cause
Two related frontend issues in the widget registration system:

1. **Production tree-shaking**: Widget types were registered via side-effect calls (`registerWidget('bar', ...)`) at the bottom of each component file. The production bundler eliminated these side effects because nothing statically referenced them. Only `empty_state` survived (used as the explicit fallback in `WidgetRendererComponent`). `getWidgetComponent()` returned `null` for all real types → fallback to `EmptyStateWidgetComponent` → "No data available".

2. **Circular import on fix attempt**: Moving registration to an explicit map in `widget-registry.ts` that imports all widget components reintroduced a circular dependency: registry imports widget → widget calls `registerWidget()` → registry not yet initialized → `TypeError: Cannot set properties of undefined (setting 'bar')`.

API and caching were not at fault — debug logs confirmed widget data returned correctly in both environments.

## Fix Applied
- Replaced side-effect registration with an **explicit `WIDGET_REGISTRY` map** in `widget-registry.ts` that directly imports and maps all 19 widget component types
- Removed redundant `registerWidget()` calls and imports from all individual widget component files to break the circular dependency
- Removed temporary debug instrumentation from frontend and backend after verification

## Verification
- [x] Fix implemented in code
- [x] Production build contains full registry map (`bar`, `line`, `kpi_card`, etc.)
- [x] No console error (`Cannot set properties of undefined`)
- [x] Widgets render data in production build
- [x] User confirmed

## Related Files
- `roya-ai-dynamo-frontend/src/app/shared/widgets/widget-registry.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/widget-renderer/widget-renderer.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/*-widget/*.component.ts` (removed side-effect `registerWidget` calls from all 19 widget components)
