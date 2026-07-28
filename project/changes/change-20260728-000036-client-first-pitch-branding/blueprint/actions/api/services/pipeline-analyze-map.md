# Services — Map: about_workspace required (pack delta)

### SVC-PIPE-AM-03 · MapOrchestrator [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `runMap(job)` — unchanged flow; validation after-state:
    1. cover first, footer last, financial present (**existing**)
    2. **`about_workspace` present** (new hard structural rule, same class as financial)
    3. If missing → inject before footer (reuse `injectSections` pattern) with default title/brief, then re-validate
    4. Prefer reading `requiredKeys` from the active template doc/catalog when practical; at minimum hardcode/check `about_workspace` alongside financial
- Default inject (when AI omits):
  - key: `about_workspace`
  - title: language-agnostic short label OK (`About us` / or bilingual later); brief ≥ 20 chars describing agency intro from workspace settings
- Rules:
  - cover first, footer last, financial + **about_workspace** present
  - inject before footer index
  - unknown keys still fail
  - research coverage gate unchanged

### SVC-PIPE-AM-05 · Prompt packs (optional)
- Status: planned (light touch)
- If `map.plan.v1.md` lists required sections, add `about_workspace` so the model includes it near the end before footer. Not a blocker if inject always repairs omission.

## Delta

- **Add** structural require + inject for `about_workspace` before footer
- **Optional** map prompt mention of `about_workspace`
