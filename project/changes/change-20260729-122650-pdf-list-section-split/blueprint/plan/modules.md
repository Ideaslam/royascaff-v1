# Modules — PDF list section split (pack after-state)

> Pack slice only. Merge into main `project/plan/modules.md` at Step 5.6.

## Delta

- Creative **8** (Map): presentation-only list splits; dynamic N ≤ `pages.max`; financial via `financial` or `financial_part`+`financial_full`
- Creative **10** (Section): honor partition briefs + `(i/N)` titles; strip money on financial-family keys
- Creative **11** (Assemble): financial-family row chunks; totals by section key (no `showTotals`)
- Templates **4**: presentation list-split + local part/full; website single `financial`

---

## 6. Creative / AI (touched)

8. **Map worker (Step 2)** [backend-only] — for presentation templates: Map may emit 1…N consecutive instances of `timeline` / `action_plan` / `services` when list capacity would overflow a PDF slide; N chosen by AI with capacity hints; capped by catalog `pages.max` (4). Pricing: single `financial` when it fits; overflow → `financial_part`×(N−1) + one `financial_full`. Landing/website: single instance / single `financial` only. Require `financial` or `financial_full`.
10. **Section fan-out (Step 3)** [backend-only] — writers honor map partition briefs for split keys; do not expand the full list onto one instance.
11. **Assemble (Step 4)** [backend-only] — when multiple financial-family instances: partition code-owned `rows` across them in order; inject totals only for `financial` / `financial_full`; `financial_part` gets rows only.

---

## 13. Templates (touched)

4. **Section catalog (per template)** [backend-only] — presentation: `timeline` / `action_plan` / `services` → `repeatable: true`, `pages.max: 4`; insert presentation-local `financial_part` (max 3) + `financial_full` (max 1). Website: list keys remain single-instance; no financial split keys.
