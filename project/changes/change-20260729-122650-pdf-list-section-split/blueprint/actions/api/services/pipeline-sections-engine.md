# Services — Pipeline Sections (change-20260729-122650 after-state)

## Delta

- **Modify** section prompts — honor Map partition for list-split keys
- No orchestrator structural change required (one job per map instance already)

---

### Prompt (`section.generic.v1.md` + `section.research.v1.md` if action_plan uses research)

Add grounding rules:

- If `mapEntry` title/brief indicates a part `(i/N)` or describes a slice of a list, write **only that slice**.
- Do not repeat items belonging to other parts.
- Stay within `contentSchema` array `maxItems` for this instance.
- `financial` / `financial_part` / `financial_full`: narrative/labels only — never invent row prices or totals (code injects money).

### User payload (optional)

If cheap: pass `partHint: { index, of }` parsed from title `/\((\d+)\s*\/\s*(\d+)\)/` — nice-to-have, not required if brief is clear.

### Status
- planned
