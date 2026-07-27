# Data Model — Templates (change-023 after-state)

> Merge target: `project/plan/data-model.md` Templates entity + Proposal.`templateKey` notes.

## Delta

- Add template key `website-template`
- Section defs count **20**; key list includes `testimonial`
- No new collections or migrations (upsert seed)

## Templates collection (after-state notes)

| Field | Notes |
|-------|--------|
| `key` | `pitch-landscape` \| `pitch-landscape-formal` \| **`website-template`** |
| `version` | `1` |
| `status` | `active` for the three canonical rows |
| `name` | website: `{ ar: "عرض تقديمي — موقع", en: "Pitch — Website" }` |
| `orientation` / `type` / `page` | same as pitch (presentation, landscape, 338×190mm) |
| `theme.tokens` | website defaults: primary `#000000`, secondary `#D6E3E1`, accent `#000000`, surface `#FFFFFF`, text `#2C2C2C`; fonts Mona Sans / Cairo+Tajawal documented in theme.css |
| `assets.basePath` | website → `templates/website-template/v1` |
| `sections` | **20** defs shared schema set |
| `rules` | unchanged: `requiredKeys` cover/financial/footer; `maxSections` 28; cover first / footer last; researchCoverageRequired |

### Section keys (v1 shared)

cover, executive_summary, client_context, objectives_kpis, services, methodology, timeline, insights_divider, market_analysis, competitor_analysis, audience_insights, market_trends, benchmarks, case_studies, **testimonial**, social_audit, action_plan, financial, next_steps, footer

Insert order for `testimonial`: after `case_studies`, before `social_audit` (catalog array order; map still orders dynamically).

### Proposal.`templateKey`

Allowed examples include `website-template`. No schema migration — string field already open.
