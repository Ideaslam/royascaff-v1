## Module: Canonical Templates *(change-049)*

### SVC-TPL · TemplateCatalogService [internal, application, Canonical Templates]
Owns the template catalog: industries, industry fields, and dashboard templates (global collections). Serves both admin CRUD and customer browse.

**Methods:**
- `listIndustries(activeOnly: boolean)` — industries sorted by `sortOrder`; `activeOnly = true` for customer portal
- `createIndustry(dto)` / `updateIndustry(id, dto)` / `toggleIndustryActive(id)` / `deleteIndustry(id)` — delete blocked while fields exist (409)
- `listFields(industryId, activeOnly)` / `createField(industryId, dto)` / `updateField(id, dto)` / `toggleFieldActive(id)` / `deleteField(id)` — delete blocked while templates exist (409)
- `listTemplates(fieldId, activeOnly)` — template summaries (no blueprint) for browse
- `getTemplate(id)` — full template incl. `requiredModels` + `widgetBlueprint`
- `createTemplate(fieldId, dto)` / `updateTemplate(id, dto)` — runs `validateBlueprint()` before persisting
- `toggleTemplateActive(id)` / `deleteTemplate(id)` — deleting a template never affects dashboards created from it
- `validateBlueprint(requiredModels, widgetBlueprint): BlueprintValidationError[]` — every `querySpec` field/aggregation/groupBy/filter/dateRange column must exist in the canonical dictionary for the declared models; `source` must be a `{{semanticFlag}}` placeholder of a declared model; widgetType must exist in the widget catalog

**Deps:** TemplateIndustryRepository · TemplateIndustryFieldRepository · DashboardTemplateRepository · WidgetDefinitionRepository · `canonical-fields.config` (dictionary)
**Side effects:** writes to `template_industries` / `template_industry_fields` / `dashboard_templates`
**Rules:** catalog is global (not workspace-scoped) · customer reads filter `isActive = true` at every level (inactive industry hides its whole subtree) · blueprint validation errors returned as structured `{ widgetIndex, field, message }[]` (400)

---

### SVC-TPL-SEED · TemplateCatalogSeed [script, Canonical Templates]
Manual idempotent seed (`npm run seed:template-catalog`), pattern of `datasource-type-meta.seed.ts`. Upserts by `key` (industry) / `industryId+key` (field) / `fieldId+key` (template).

**Seeded content:** Ecommerce → Purchases {Sales Overview: requires `orders`} · Marketing {MER: `orders`+`marketing_spend`; MMM (descriptive): `orders`+`marketing_spend`; RFM: `orders`+`customers`}. Every blueprint passes `validateBlueprint()` at seed time.
