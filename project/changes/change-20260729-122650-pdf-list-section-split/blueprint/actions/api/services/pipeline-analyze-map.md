# Services — Pipeline Map (change-20260729-122650 after-state)

## Delta

- **Modify** `map.plan.v1.md` — PDF list-split rules + financial_part/full contract
- **Modify** MapOrchestrator — presentation gate, capacity hints, clamp, financial-path validation

---

### Presentation gate

```ts
const presentation = isPresentationTemplateKey(templateKey);
```

### User payload additions (presentation only)

```json
{
  "renderMode": "presentation",
  "listSplit": {
    "enabled": true,
    "keys": ["timeline", "action_plan", "services", "financial_part"],
    "softPreferMaxInstances": 3,
    "catalogCapacity": {
      "timeline.phases.maxItems": 5,
      "action_plan.phases.maxItems": 6,
      "services.items.maxItems": 6
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

Landing: `"renderMode": "landing", "listSplit": { "enabled": false }`.

### Prompt rules — when listSplit.enabled

- `timeline` / `action_plan` / `services`: multi-instance same key when overflow; N dynamic ≤ `pages.max`.
- **Pricing:** single `financial` when it fits; overflow → `financial_part`×(N−1) + exactly one `financial_full`. Never multi-instance `financial`. Do not mix paths.
- Require `financial` **or** `financial_full`.
- Landing: single `financial` only; no part/full.

### Enforce `pages.max`

Clamp / validate via `PDF_OVERFLOW_CLAMP_KEY_SET` (list-split keys + `financial_full`).

### Structural validation extras

- `financial_part` without `financial_full` → error
- `financial` together with part/full → error

### Status
- planned
