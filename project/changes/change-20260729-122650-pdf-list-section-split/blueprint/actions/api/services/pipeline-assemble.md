# Services — Assemble (change-20260729-122650 after-state)

## Delta

- **Modify** AssembleService financial inject — chunk rows across financial-family instances; totals only when section key is `financial` or `financial_full` (never `financial_part`)
- Root `RenderProposalInput.financial` may remain full totals for layout/meta; **per-section content** drives table slice
- No `showTotals` flag — HBS partials differ by key (`financial_part` omits totals block)

---

### Helper

```ts
function partitionRows<T>(rows: T[], n: number): T[][]
```

- `n = max(1, financialFamilyInstanceCount)`
- Split into `n` contiguous chunks as evenly as possible (earlier chunks ≥ later)

### Inject algorithm

1. `const full = buildFinancial(proposal, project)` (unchanged builder)
2. Collect ready sections with `isFinancialSectionKey(key)` sorted by proposal order
3. `chunks = partitionRows(full.rows, financialSections.length)`
4. For each financial-family section index `i`:
   - Merge into content: `rows: chunks[i]`, `currency`
   - If `financialSectionShowsTotals(key)` (`financial` | `financial_full`): also `subtotal` / `tax` / `grandTotal`
   - If `financial_part`: omit totals fields

### Paths

| Map path | Keys | Totals |
|----------|------|--------|
| Single | `financial` | yes |
| Split | `financial_part`×(N−1) + `financial_full` | only on `financial_full` |

### Tests

- 1× `financial`, 5 rows → one chunk + totals
- `financial_part` + `financial_full`, 5 rows → 3+2; totals only on full
- Key-based `financialSectionShowsTotals`

### Status
- planned
