# Services — Templates (change-20260729-122650 after-state)

## Delta

- **Modify** presentation catalogs — list keys `repeatable` + `pages.max: 4`; add local `financial_part` / `financial_full`
- **Modify** website catalog — keep / reset list keys to single-instance; **no** financial split keys
- **Modify** TemplateRenderService — per-section financial context for financial-family keys (totals by key)
- **Modify** pitch + roya partials — `financial` / `financial_full` always show totals; `financial_part` has no totals block

---

### List-split keys (same-key multi)

```ts
const PDF_LIST_SPLIT_KEYS = ["timeline", "action_plan", "services", "financial_part"] as const;
```

### Financial family (presentation-local)

| Key | repeatable | pages.max | Totals |
|-----|:----------:|:---------:|:------:|
| `financial` | false | 1 | yes (single-slide path) |
| `financial_part` | true | 3 | no |
| `financial_full` | false | 1 | yes |

Inserted via `insertFinancialSplitSections` on pitch / formal / roya only (not website).

### Catalog flags

| Template | timeline / action_plan / services | financial_part/full |
|----------|-----------------------------------|---------------------|
| pitch / formal / roya | repeatable, max 4 | present |
| website | reset non-repeatable max 1 | absent |

### Render

```ts
const financialCtx = isFinancialSectionKey(section.key)
  ? financialContextForSection(section.content, input.financial, {
      includeTotals: financialSectionShowsTotals(section.key),
    })
  : input.financial;
```

Website `financial.hbs`: unchanged (always totals).

### Status
- planned
