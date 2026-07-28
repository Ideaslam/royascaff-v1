# Data model — contracts services parity · change-20260728-000033

## Entity — proposals.services (consumer rule)

After-state for **all** create-from-proposal consumers:

| Shape | Accepted |
|-------|----------|
| `string` / number id | legacy v2 |
| `{ id, name?, nameEn?, price?, qty?, unit?, description?, … }` | unified v2 + v3 |

## Entity — contracts.serviceIds

| Field | After-state |
|-------|-------------|
| `serviceIds` | `string[]` of real service/catalog ids only (never `"[object Object]"`) |

No new collections. Historical bad ids left as-is (out of scope).

## Delta

- Document contracts create path: extract ids from string **or** object `.id`
- Line-item snapshots preferred for money/name when rendering SOW/financial
