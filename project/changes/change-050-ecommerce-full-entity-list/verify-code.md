# Verification Report — change-050-ecommerce-full-entity-list

## 1. Code Changes Implemented

| File | Status |
|------|--------|
| `zid.connector.ts` | ✅ Modified |
| `salla.connector.ts` | ✅ Modified |
| `shopify.connector.ts` | ✅ Modified |
| `shopify-api.client.ts` | ✅ Modified |
| `project/plan/modules.md` | ✅ Updated in-place |

---

## 2. Entity Coverage

### Zid
| Entity | Preselected | Semantic Flag | Resource Path |
|--------|-------------|---------------|---------------|
| orders | ✅ | orders | `managers/store/orders` |
| products | ✅ | products | `managers/store/products` |
| customers | ✅ | customers | `managers/store/customers` |
| abandoned_carts | ❌ (opt-in) | arbitrary | `managers/store/abandoned-carts` |
| payments | ❌ (opt-in) | arbitrary | `managers/store/payments` |
| inventory | ❌ (opt-in) | arbitrary | `managers/store/inventory` |
| reverse_orders | ❌ (opt-in) | arbitrary | `managers/store/reverse-orders` |

### Salla
| Entity | Preselected | Semantic Flag | Resource Path |
|--------|-------------|---------------|---------------|
| orders | ✅ | orders | `orders` |
| products | ✅ | products | `products` |
| customers | ✅ | customers | `customers` |
| abandoned_carts | ❌ (opt-in) | arbitrary | `abandoned-carts` |
| coupons | ❌ (opt-in) | arbitrary | `coupons` |
| categories | ❌ (opt-in) | arbitrary | `categories` |

### Shopify
| Entity | Preselected | Semantic Flag | Resource/ResponseKey |
|--------|-------------|---------------|----------------------|
| orders | ✅ | orders | `orders` / `orders` |
| products | ✅ | products | `products` / `products` |
| customers | ✅ | customers | `customers` / `customers` |
| abandoned_checkouts | ❌ (opt-in) | arbitrary | `checkouts` / `checkouts` |
| custom_collections | ❌ (opt-in) | arbitrary | `custom_collections` / `custom_collections` |

---

## 3. Checks

| Check | Result | Notes |
|-------|--------|-------|
| `listEntities()` returns expanded list | ✅ PASS | All 3 connectors now return full entity sets |
| Core entities preselected | ✅ PASS | `coreEntities = new Set(['orders','products','customers'])` |
| New entities opt-in | ✅ PASS | `preselected: false` for all new entries |
| New entities semanticFlag = `arbitrary` | ✅ PASS | Pass-through in schema review |
| `columnCount` meta exposed to UI | ✅ PASS | `meta: { columnCount: def.columns.length }` on every entity |
| `discoverSchema` handles new entity names | ✅ PASS | Dict lookup covers all new keys |
| `extract()` uses correct API resource path | ✅ PASS | Zid: `entityDef.resource`; Salla: `entityDef.resource`; Shopify: `entityDef.resource` + `entityDef.responseKey` |
| Flatten helpers added for all new entities | ✅ PASS | 4 helpers for Zid; 3 for Salla; 2 for Shopify |
| Shopify API client accepts `responseKey` | ✅ PASS | Optional 5th parameter, defaults to `resource` (backward compat) |
| No TypeScript errors introduced | ✅ PASS | Fixed `||`/`??` mixing in `flattenCategory`; remaining lints are pre-existing |
| Frontend unchanged | ✅ PASS | `EntitySelectStepComponent` already fully dynamic |
| Schema review unchanged | ✅ PASS | Existing `arbitrary` flag already handles pass-through |
| modules.md updated in-place | ✅ PASS | Feature 2 now documents expanded entity sets |

---

## 4. Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Zid entity picker shows ≥ 7 items (was 3) | ✅ PASS |
| 2 | Salla entity picker shows ≥ 6 items (was 3) | ✅ PASS |
| 3 | Shopify entity picker shows ≥ 5 items (was 3) | ✅ PASS |
| 4 | orders/products/customers are checked by default | ✅ PASS |
| 5 | New entities unchecked by default | ✅ PASS |
| 6 | Selecting a new entity creates a Dataset with `semanticFlag=arbitrary` | ✅ PASS |
| 7 | Schema review shows all columns for new entities | ✅ PASS |
| 8 | Sync succeeds for new entities (extract uses correct API resource path) | ✅ PASS |

---

## Overall: PASS
