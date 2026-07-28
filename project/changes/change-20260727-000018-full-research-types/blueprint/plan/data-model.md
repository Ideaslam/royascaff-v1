# Data Model — delta (change-20260727-000018)

## Project.info.researchOptions

**After-state:** `String[]` of UI keys:

`market` | `competitor` | `audience` | `trends` | `benchmarks` | `case-studies` | `social-analysis` | `action-plan`

(Already in DNA schema enum; docs that still say “launch subset” are drift to fix at merge.)

## DNA.research

**After-state:**
- `selectedOptions` — same enum as above
- `modules[<ui-key>]` — deep findings object per selected key (keys match UI option strings)
- `requiredSectionKeys` — derived primaries, including competitor × N

## templates (pitch-landscape / formal)

**After-state section keys (19):**

```
cover, executive_summary, client_context, objectives_kpis, services,
methodology, timeline, insights_divider, market_analysis, competitor_analysis,
audience_insights, market_trends, benchmarks, case_studies, social_audit,
action_plan, financial, next_steps, footer
```

- `constraints.maxSections`: **28**
- Each new section has abstract + `contentSchema` + disk partial named `{key}.hbs`

## Delta

- **Clarify** researchOptions: full 8 (not launch subset)
- **Add** five template section keys + bump maxSections
- **No** new collections or Mongo migrations (bootstrap upsert refreshes template doc)
