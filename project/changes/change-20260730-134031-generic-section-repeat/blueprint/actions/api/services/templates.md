# Services — Templates (change-20260730-134031 after-state)

## Delta

- **Modify** `pdf-list-split.ts` — add `deriveArrayCapacityHints(defs)` pure helper; static `PDF_LIST_SPLIT_KEYS` / `PDF_OVERFLOW_CLAMP_KEY_SET` / `PDF_LIST_SPLIT_CAPACITY` become unused by `map-orchestrator.service.ts` (kept only if any other file still imports them — recon found none outside the 3 files touched by this pack; remove if confirmed dead after implementation, otherwise leave as deprecated/unused to minimize risk).
- **Modify** `website-template.catalog.ts` — `landingLocked` switches from `PDF_LIST_SPLIT_KEY_SET.has(section.key)` (allowlist) to `section.repeatable === true` (attribute), so any key that becomes repeatable in the shared pitch catalog is automatically re-locked to single-instance for the continuous landing template.
- **Modify** `pitch-landscape.catalog.ts` — `social_audit`: `repeatable: false, pages: { min: 1, max: 1 }` → `repeatable: true, pages: { min: 1, max: 2 }`. Inherited automatically by `pitch-landscape-formal.catalog.ts` and `roya-presentation.catalog.ts` (both clone `PITCH_LANDSCAPE_SECTIONS`).
- **No change** to `TemplateRenderService`, `AssembleService`, financial partials, or any Handlebars partial — already generic (render/assemble loop by `order`, partial lookup by `key`, no allowlist).

---

### `deriveArrayCapacityHints` (new pure helper in `pdf-list-split.ts`)

```ts
/** Walk each repeatable section's contentSchema for array fields with maxItems. */
export function deriveArrayCapacityHints(
  defs: { key: string; contentSchema?: JsonSchema }[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const def of defs) {
    const props = def.contentSchema?.properties || {};
    for (const [field, schema] of Object.entries(props)) {
      if (schema?.type === "array" && typeof schema.maxItems === "number") {
        out[`${def.key}.${field}.maxItems`] = schema.maxItems;
      }
    }
  }
  return out;
}
```

Pure, no I/O; called once per `runMap()` from `MapOrchestratorService` against the already-loaded `catalogSections` (no new dependency).

### Website catalog lock — before / after

```ts
// before (allowlist)
const landingLocked = PDF_LIST_SPLIT_KEY_SET.has(section.key)
  ? { ...section, repeatable: false, pages: { min: 1, max: 1 } }
  : section;

// after (attribute-based)
const landingLocked = section.repeatable
  ? { ...section, repeatable: false, pages: { min: 1, max: 1 } }
  : section;
```

Behavior for existing keys (`timeline`, `action_plan`, `services`, financial-family) is unchanged — they were already `repeatable: true` in the base catalog, so the old allowlist and the new attribute check select the same set. `social_audit` is now included in that same lock for website automatically (no explicit mention needed).

### `social_audit` catalog flag (pitch-landscape base, shared)

| Field | Before | After |
|-------|--------|-------|
| `repeatable` | `false` | `true` |
| `pages.min` | `1` | `1` |
| `pages.max` | `1` | `2` |

`contentSchema` unchanged (`channels` array still `minItems: 1, maxItems: 6` per instance — this is the per-instance cap; the Map AI decides how to split total channel data across up to 2 instances via distinct briefs, same pattern as `timeline`/`action_plan`).

### Catalog flags after this pack

| Template | timeline / action_plan / services | social_audit | financial_part/full |
|----------|-----------------------------------|--------------|----------------------|
| pitch / formal / roya | repeatable, max 4 | **repeatable, max 2 (new)** | present |
| website | reset non-repeatable max 1 (generic lock) | reset non-repeatable max 1 (generic lock) | absent |

### Status
- planned
