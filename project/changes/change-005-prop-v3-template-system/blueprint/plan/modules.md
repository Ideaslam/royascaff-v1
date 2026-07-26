# Modules & Features — Delta (REQ-PROP-V3 Phase 1)

## Delta

- **Complete** Templates: design-first disk assets + Handlebars render + section catalog subset
- **Complete** PDF Export: fixture HTML from templates → existing PdfRenderService (AR/EN)
- **Extend** Pipeline v3 module wiring (no AI steps)

---

## 13. Templates _(after-state)_
- Scope: BE `src/pipeline-v3/templates/*` + repo root `templates/pitch-landscape/v1/`
- Audience: system / later gallery
- Entities: `templates` (active `pitch-landscape` v1 with full section defs)

### Features
1. **Disk TemplateAssetResolver** [backend-only] — load layout, CSS, partials, fonts from `assets.basePath`
2. **Handlebars render engine** [backend-only] — assemble fixed-page HTML; helpers `money`, `dir`, `t`, `resolveImage`, `pageNumber`
3. **pitch-landscape design** [backend-only] — presentation landscape 16:9; Roya tokens; RTL/LTR; editing disk files changes render
4. **Section catalog subset** [backend-only] — abstract + `contentSchema` per key; partials registered 1:1

## 15. PDF Export _(after-state)_
### Features
1. **HTML → PDF smoke** [backend-only] — unchanged PdfRenderService; input is Handlebars output + page CSS contract
2. **Overflow guard** [backend-only] — `.page { overflow: hidden; break-after: page }` + capacity-aware partials

## Shippable section keys (`pitch-landscape`)

| Key | Role |
|-----|------|
| `cover` | required first |
| `executive_summary` | commercial |
| `client_context` | commercial |
| `objectives_kpis` | commercial |
| `services` | commercial |
| `methodology` | commercial |
| `timeline` | commercial |
| `insights_divider` | research chapter opener |
| `market_analysis` | research · market |
| `competitor_analysis` | research · competitor (repeatable) |
| `audience_insights` | research · audience |
| `financial` | required; money code-injected |
| `next_steps` | commercial |
| `footer` | required last |

**Deferred keys** (not in this template v1): toc, banner, banner_with_image, comparison, team_roles, case_studies, gallery, testimonial, risks_assumptions, rfp_compliance, remaining research keys (trends, benchmarks, social_audit, action_plan, swot, opportunities, channel_strategy, positioning).
