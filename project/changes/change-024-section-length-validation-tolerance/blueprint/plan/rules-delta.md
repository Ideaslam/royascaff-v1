# Rules delta — section length budgets

## After-state

1. Catalog `minLength` / `maxLength` are the **writer targets** (prompt + `lengthBudgets`).
2. Validation soft-accepts string fields up to `ceil(maxLength * 1.15)`; no truncation.
3. Depth/substance prompts must not override maxLength — prefer concise substance within budget.
4. Repair retries remain for hard failures (beyond soft max, minLength, shape errors).

## Delta
- Add: soft maxLength ratio `0.15` for pipeline-v3 section content validation.
- Add: length-budget first-class instructions in section prompts.
- Change: depth-contracts reconciled with maxLength.
