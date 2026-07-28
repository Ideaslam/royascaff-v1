# Data Model — Templates (change-20260728-000037 after-state)

> Merge target: `project/plan/data-model.md` Templates entity + Proposal.`templateKey` notes.

## Delta

- Add template key `roya-presentation`
- Optional theme field: `theme.lockPalette` (boolean)
- `roya-presentation.sections` count **23** (21 shared + `team` + `risks`)
- No new collections or migrations (upsert seed)

## Templates collection (after-state notes)

| Field | Notes |
|-------|--------|
| `key` | … \| **`roya-presentation`** |
| `version` | `1` |
| `status` | `active` for the four canonical rows |
| `name` | roya: `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }` |
| `type` / `orientation` / `page` | `presentation`, landscape, 338×190mm (same as pitch) |
| `theme.tokens` | locked HAIA defaults (see below) |
| `theme.lockPalette` | **`true`** for `roya-presentation` only; omit/false elsewhere |
| `assets.basePath` | `templates/roya-presentation/v1` |
| `sections` | **23** defs (clone of shared 21 + `team` + `risks`) |
| `rules` | `requiredKeys`: cover / financial / about_workspace / footer; `maxSections` 28; cover first / footer last; researchCoverageRequired |

### Locked theme tokens (`roya-presentation`)

| token | value |
|-------|--------|
| `color.primary` | `#FF3B2F` |
| `color.secondary` | `#1A1533` |
| `color.accent` | `#C9A24B` |
| `color.surface` | `#EFEBFB` (lavender; CSS may also use `#E7E2F6`) |
| `color.text` | `#1A1533` |
| `font.heading` | Cairo / system stack via CSS |
| `font.body` | Cairo / Tajawal |

Canonical CSS roles used in `theme.css` (beyond the five CSS vars):

| Role | Hex | Use |
|------|-----|-----|
| deep canvas | `#1A1533` | Cover / dark panels |
| red accent | `#FF3B2F` | Primary CTA / bars |
| gold | `#C9A24B` | Stats / premium markers |
| purple | `#7B5CFF` | Secondary highlights |
| deep purple | `#4B2ECF` | Accents |
| teal | `#2FC2AE` | Positive markers |
| lavender | `#E7E2F6` | Light page bg |
| muted | `#6F6796` | Secondary copy |
| white | `#FFFFFF` | Text / cards |

### Section keys — `roya-presentation` v1

Shared 21 (order preserved from pitch):

cover, executive_summary, client_context, objectives_kpis, services, methodology, timeline, insights_divider, market_analysis, competitor_analysis, audience_insights, market_trends, benchmarks, case_studies, testimonial, social_audit, action_plan, financial, next_steps, about_workspace, footer

**Appended (template-local):**

| key | Insert relative to shared |
|-----|---------------------------|
| `team` | after `methodology` (catalog array; map orders dynamically) |
| `risks` | after `timeline` |

Catalog array order suggestion: … methodology, **team**, timeline, **risks**, insights_divider …

### Proposal.`templateKey`

Allowed examples include `roya-presentation`. No schema migration — string field already open.
