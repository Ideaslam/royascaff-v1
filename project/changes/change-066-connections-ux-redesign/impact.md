# Impact — change-066 (Connections UX redesign)

## Feature state
**Complete (modify):** ConnectionsPage exists at `/app/data/connections` with table layout, side-drawer create/edit, and CRUD via existing APIs. ChooseConnectionStep exists in setup wizard with a separate list UI.

## Code reconnaissance

| Layer | File | Verdict |
|-------|------|---------|
| Page | `pages/data/connections/connections.page.{ts,html,scss}` | **Modify** — table → cards, detail drawer, type-picker create |
| Shared | `shared/components/connection-card/` | **Create** — reusable card for list + wizard |
| Wizard | `pages/data/setup/choose-connection-step.component.ts` | **Modify** — reuse connection card |
| i18n | `public/i18n/en.json`, `ar.json` | **Modify** — new detail/breadcrumb keys |
| Plan | `actions/customer-portal/pages/data.md` | **Modify** — Connections section |
| APIs | `DataService.listConnections`, `listDataSources({ connectionId })`, CRUD/test/reauth | **Reuse** — no backend change |

## Ripple map
- **DataSourcesPage** — no change (already links to `/app/data/connections`).
- **SourceDetailPage** — no change (connection name link stays).
- **ChooseConnectionStep** — visual alignment only; behavior unchanged.

## Risks
- Low — frontend-only; existing API contracts unchanged.
- Detail drawer loads linked sources client-side (may need pagination if many sources — use limit 50).

## Recommendations
- Extract connection card once; use in both Connections list and wizard.
- Copy type-picker markup/styles from DataSources connect drawer (exclude CSV).
