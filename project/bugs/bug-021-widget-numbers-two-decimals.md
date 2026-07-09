# Bug #021 — Widget Numbers Not Rounded to 2 Decimals

## Status
**PENDING** — Fix applied, awaiting user confirmation

## Reported
- **Date**: 2026-07-09
- **Severity**: medium
- **Affected area**: customer-portal/frontend/widgets

## Description
Dashboard widgets display numeric values with inconsistent or excessive decimal precision (raw floats, 1 decimal, or unrounded Chart.js ticks/tooltips) instead of a consistent 2-decimal format.

## Expected Behavior
All numeric values shown in dashboard widgets should be rounded/formatted to 2 decimal places.

## Steps to Reproduce (if applicable)
1. Open a dashboard that contains KPI, chart, table, heatmap, gauge, sparkline, or funnel widgets.
2. Observe metric values, chart tooltips/axis ticks, and cell values.
3. Numbers appear with varying precision (e.g. `123.456789`, `1.2K`, or integers only).

## Root Cause
There is no shared number-formatting helper for widgets. Each widget renders numbers differently:

- **KPI card** — binds raw `normalizedData.value` with no decimal formatting.
- **Base chart widgets** (bar/line/area/pie/donut/radar) — Chart.js default ticks/tooltips show full float precision; no `callback` formatting.
- **Table / heatmap** — render raw cell values.
- **Gauge** — shows raw `currentValue` / `maxValue`.
- **Sparkline / funnel** — use ad-hoc `toFixed(1)` / unrounded `String(v)`, not 2 decimals.

## Fix Applied
1. Added shared helpers `formatWidgetNumber` / `formatWidgetCompact` in `format-widget-number.ts` (always 2 decimals; compact keeps K/M suffixes).
2. Wired formatting into:
   - KPI card value + change %
   - Base chart tooltip labels + Y/radar ticks (category X labels left unchanged)
   - Table numeric cells
   - Heatmap cells + legend
   - Gauge display value/max
   - Sparkline / funnel compact formatters

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (lints clean)
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/shared/widgets/format-widget-number.ts` (new)
- `roya-ai-dynamo-frontend/src/app/shared/widgets/base-chart-widget.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/kpi-card-widget/kpi-card-widget.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/kpi-card-widget/kpi-card-widget.component.html`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/table-widget/table-widget.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/table-widget/table-widget.component.html`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/heatmap-widget/heatmap-widget.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/heatmap-widget/heatmap-widget.component.html`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/gauge-widget/gauge-widget.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/gauge-widget/gauge-widget.component.html`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/sparkline-widget/sparkline-widget.component.ts`
- `roya-ai-dynamo-frontend/src/app/shared/widgets/funnel-widget/funnel-widget.component.ts`
