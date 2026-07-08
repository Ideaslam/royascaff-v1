# Impact Analysis — change-050-ecommerce-full-entity-list

## Feature State
**partial** — connectors already expose `listEntities()` and the `EntitySelectStepComponent` already
renders a dynamic checkbox list. Only the hardcoded entity dictionaries are too small.

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `roya-ai-dynamo-api/src/integrations/connectors/zid/zid.connector.ts` | Modify | Add 4 new entities to `ZID_ENTITIES`: `abandoned_carts`, `payments`, `inventory`, `reverse_orders`. Update `listEntities()` to mark only core 3 as `preselected:true`. Add flatten helpers for new entities. |
| `roya-ai-dynamo-api/src/integrations/connectors/salla/salla.connector.ts` | Modify | Add `resource` field to `SALLA_ENTITIES` type. Add 3 new entities: `abandoned_carts`, `coupons`, `categories`. Update `extract()` to use `resource` path. Update `listEntities()`. Add flatten helpers. |
| `roya-ai-dynamo-api/src/integrations/connectors/shopify/shopify.connector.ts` | Modify | Add `resource` and `responseKey` fields to `SHOPIFY_ENTITIES` type. Add 2 new entities: `abandoned_checkouts`, `custom_collections`. Update `extract()` to use `resource` + `responseKey`. Update `listEntities()`. Add flatten helpers. |

## Plan Doc Changes

| Doc | Action | Section |
|-----|--------|---------|
| `project/plan/modules.md` | Update in-place | Module 4 Feature 2 — change "list orders/products/customers" to reflect expanded entity list |

## Ripple Effects
- **Frontend** (`EntitySelectStepComponent`): no changes — already fully dynamic, renders whatever the backend returns.
- **Schema review step**: no changes — the `arbitrary` semantic flag already covers new non-canonical entities.
- **Sync pipeline**: no changes — extract/normalize/discoverSchema already delegate to the connector; new entities follow the same path.

## API Client Behavior
- **Zid**: `ZidApiClient.paginate(authToken, accessToken, resource, params)` — resource path from entity def (e.g. `managers/store/abandoned-carts`). ✅ already supports arbitrary paths.
- **Salla**: `SallaApiClient.paginate(accessToken, resource, params)` calls `/${resource}` on base URL. Need to add `resource` field to entity dict to decouple entity name from URL segment (e.g. entity `abandoned_carts` → resource path `abandoned-carts`).
- **Shopify**: `ShopifyApiClient.paginate(domain, token, resource, params)` calls `/${resource}.json` and reads `response.data[resource]`. Need to add `resource` + `responseKey` fields to handle cases where URL path differs from the JSON response key.

## New Entity Definitions

### Zid (preselected: false for new entities)
| Entity | API Resource | Columns |
|--------|-------------|---------|
| `abandoned_carts` | `managers/store/abandoned-carts` | id, customer_id, customer_name, customer_email, customer_mobile, items_count, total, currency, created_at, updated_at |
| `payments` | `managers/store/payments` | id, order_id, amount, currency, method, status, paid_at, created_at |
| `inventory` | `managers/store/inventory` | product_id, sku, quantity, reserved, available, updated_at |
| `reverse_orders` | `managers/store/reverse-orders` | id, order_id, reference_id, reason, status, refund_amount, currency, created_at, updated_at |

### Salla (preselected: false for new entities)
| Entity | Resource Path | Columns |
|--------|--------------|---------|
| `abandoned_carts` | `abandoned-carts` | id, customer_id, customer_name, customer_email, items_count, total, currency, created_at |
| `coupons` | `coupons` | id, code, type, value, minimum_order, usage_limit, used_count, status, expires_at, created_at |
| `categories` | `categories` | id, name, parent_id, is_active, products_count, sort_order, created_at |

### Shopify (preselected: false for new entities)
| Entity | Resource | Response Key | Columns |
|--------|----------|-------------|---------|
| `abandoned_checkouts` | `checkouts` | `checkouts` | id, email, created_at, updated_at, completed_at, total_price, subtotal_price, currency, customer_id, line_items_count |
| `custom_collections` | `custom_collections` | `custom_collections` | id, title, handle, sort_order, products_count, published_at, updated_at |
