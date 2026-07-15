# Impact — change-071

## Fast-Track criteria

| Criterion | Met |
|-----------|-----|
| ≤ 1 module | Yes (data UI pages) |
| No new entities/fields | Yes |
| No new services/endpoints | Yes |
| Frontend-only | Yes |
| Clear description | Yes |

## Feature state

Source detail and dataset detail pages exist and work. Buttons use default PrimeNG outlined styling without the shared `action-btn` hierarchy used on the dashboard viewer.

## Files to change

| File | Change |
|------|--------|
| `source-detail.page.html` | Rearrange header/row actions; apply action-btn classes |
| `source-detail.page.scss` | Layout polish (header, table, actions) |
| `dataset-detail.page.html` | Rearrange header/schema actions; apply action-btn classes |
| `dataset-detail.page.scss` | Layout polish |
| `sync-settings-panel.component.ts` | Save button styleClass + card polish |
| `styles.css` | Shared `row-action` chip styles (extend existing action system) |

## Ripple

None — presentation only. Same handlers, same dialogs, same API calls.
