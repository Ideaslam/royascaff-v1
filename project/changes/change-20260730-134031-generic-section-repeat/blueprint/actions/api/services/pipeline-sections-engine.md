# Services — Pipeline Map (change-20260730-134031 after-state)

## Delta

- **Modify** `MapOrchestratorService` — `listSplit` payload, `clampListSplitInstances`, `validateMap` count-check switch from the static `PDF_OVERFLOW_CLAMP_KEY_SET` / `PDF_LIST_SPLIT_KEYS` / `PDF_LIST_SPLIT_CAPACITY` allowlist to catalog attributes (`repeatable`, `pages.max`, `contentSchema` array `maxItems`) already present per key in `catalogSections`/`abstractCatalog`.
- **Modify** `map.plan.v1.md` — PDF list-split rule reworded from named keys to a generic `abstractCatalog[].repeatable` rule. Financial part/full rule unchanged (stays a documented exception, not a repeated key).
- **No change** to `financial`/`financial_part`/`financial_full` structural validation (single-`financial`-vs-part+full check) — orthogonal to this generalization.

---

### Splittable-key + capacity derivation (replaces static import)

```ts
// derived once per runMap() call from the already-loaded catalogSections
const splittableDefs = catalogSections.filter((s) => s.repeatable === true);
const splittableKeys = splittableDefs.map((s) => s.key);

// capacity hints: primary array field(s) maxItems per key, read from each
// section's own contentSchema (no manually maintained map)
const catalogCapacity = deriveArrayCapacityHints(splittableDefs);
// -> { "timeline.phases.maxItems": 5, "action_plan.phases.maxItems": 6,
//      "services.items.maxItems": 6, "social_audit.channels.maxItems": 6, ... }
```

`deriveArrayCapacityHints` lives alongside the other catalog helpers (see `templates.md` delta) — pure function, no I/O, walks `contentSchema.properties` for `type: "array"` fields with `maxItems`.

### `listSplit` payload (presentation only) — generalized

```json
{
  "renderMode": "presentation",
  "listSplit": {
    "enabled": true,
    "keys": ["timeline", "action_plan", "services", "social_audit", "financial_part"],
    "softPreferMaxInstances": 3,
    "catalogCapacity": {
      "timeline.phases.maxItems": 5,
      "action_plan.phases.maxItems": 6,
      "services.items.maxItems": 6,
      "social_audit.channels.maxItems": 6
    },
    "servicesCount": 12,
    "financialSplit": {
      "singleKey": "financial",
      "partKey": "financial_part",
      "fullKey": "financial_full",
      "rule": "one financial OR financial_part*(N-1)+financial_full; never multi financial"
    }
  }
}
```

`listSplit.keys` / `catalogCapacity` are now a **function of the active template's catalog**, not a static constant — `social_audit` appears automatically once its catalog entry is `repeatable: true` (see `templates.md` delta), with zero further code change for future keys.

Landing (website): unchanged — `"renderMode": "landing", "listSplit": { "enabled": false }` (built from `isPresentationTemplateKey(templateKey)`, untouched).

### Prompt rule (`map.plan.v1.md`) — generalized wording

> Replace: "Keys `timeline`, `action_plan`, `services` may be emitted as multiple consecutive instances…"
> With: "Any key in `abstractCatalog` with `repeatable: true` may be emitted as multiple consecutive instances of the same key (own `pages.max` ceiling) when a single slide would overflow. Use `listSplit.keys`/`listSplit.catalogCapacity` as the current template's live list — do not assume specific key names. Each instance's brief must state which subset of the data it covers (e.g. which channels/phases/items); titles may use `(1/2)` style."

Financial pricing rule (single `financial` vs `financial_part`×(N−1)+`financial_full`) stays as its own paragraph, unchanged — it is a different-key-per-chunk pattern, not "same key repeated", and must not be folded into the generic rule.

### Enforce `pages.max` (generalized)

`clampListSplitInstances` and `validateMap`'s per-key count check both switch their membership test:

```ts
// before
if (!PDF_OVERFLOW_CLAMP_KEY_SET.has(key)) { ...skip... }

// after
const def = getSectionDef(key, templateKey);
if (!def?.repeatable) { ...skip... }
const max = Math.max(1, Number(def?.pages?.max) || 1);
```

`financial_full` keeps working identically — its catalog def already carries `repeatable: false, pages.max: 1`, which the generic check enforces the same as a hardcoded `max === 1` would (any accidental 2nd `financial_full` is still rejected).

### Structural validation extras
- Unchanged: `financial_part` without `financial_full` → error; `financial` together with part/full → error.
- Unchanged: research-coverage gate (`assertResearchCoverage`) — only requires ≥1 hit per selected research option, so a doubled `social_audit` still satisfies `social-analysis` coverage without any gate change.

### Status
- planned
