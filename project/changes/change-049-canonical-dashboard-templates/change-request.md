# Change Request

## Metadata
- **date**: 2026-07-07
- **change-type**: new-module
- **target-app**: all-apps (backend + admin-panel + customer-portal)
- **affected-repos**: all (backend + frontend + admin)
- **priority**: high

## Scope
- Module(s): **NEW — Canonical Templates** (`src/modules/templates/`); touched: Data (canonical field dictionary), Dashboards (create-from-template), Pipelines (new `dashboard-from-template` pipeline type), AI Processing (worker reuse), Admin Panel (new CRUD pages), Customer Portal (template picker in create-dashboard flow)
- Feature(s): Industry / Industry Field / Dashboard Template management (admin), template seeding (Ecommerce: MER, MMM, RFM), create dashboard from template (customer), new marketing canonical model(s), architecture review of engine/pipeline/action separation
- Endpoint(s): new admin CRUD endpoints under `/admin/template-catalog/*` (industries, fields, templates); new customer read endpoints `/templates/industries`, `/templates` (browse active templates); modified `POST /dashboards` (accept `templateId`) or new `POST /dashboards/from-template`
- Page(s)/View(s): admin-panel: `pages/admin/template-catalog/` (industries + fields + templates management); customer-portal: create-dashboard dialog/page gains a "Start from template" path
- Service(s): new `IndustryService`, `TemplateService` (backend); modified `DashboardsService` (from-template creation); extended `canonical-fields.config.ts` (marketing model)

## Description

### Problem / Motivation
The platform now has a canonical-model layer (semantic flags `orders | products | customers` with canonical field mapping + OLAP canonical union views), which makes dashboards data-source-agnostic: a metric like `total_orders` can be computed across Zid + Shopify together instead of per-source duplicates (`total_orders_zid`, `total_orders_shopify`).

This change builds on that foundation with a **Canonical Templates module**: a catalog of industry-grouped, predefined dashboard templates that are defined **against canonical models** (not against any specific source). A user selects a template + their data sources, and the dashboard is produced immediately — the predefined widgets run deterministically against the canonical views, and AI adapts/fills gaps for the user's actual mapped data.

This is also the base for future per-datasource "action engines" (dashboard creation today; data cleaning and forecasting later). The change therefore includes an **architecture review** of the three layers — datasource engine (integrate/store/map/sync), pipeline engine (ordered steps), and processing actions (dashboard-generate, future clean/forecast) — with light refactors only where needed to cleanly host the new module.

### Data model (admin-managed, seeded)
4-level hierarchy, all bilingual (`nameEn`/`nameAr`, `descriptionEn`/`descriptionAr`), all with `isActive`:

1. **Industry** — e.g. *Ecommerce* (seeded), *Logistics* (structure ready).
2. **Industry Field** — a category inside an industry, e.g. Ecommerce → *Purchases*, *Marketing*, *(Logistics → Delivery, Inventory)*.
3. **Dashboard Template** — a predefined dashboard under a field, e.g. Marketing → **MER**, **MMM**, **RFM**. Stores: metadata (names, descriptions, icon/preview), **required canonical models** (semantic flags, e.g. RFM requires `orders` + `customers`), and a **widget blueprint**: an ordered list of predefined widget definitions (chart type, title, dialect-neutral `QuerySpec` built on canonical field names, layout hints).
4. **Template Canonical Models** — the per-template list of required/optional semantic flags with the canonical fields each widget uses (validated against the canonical field dictionary).

### New canonical model(s)
MER and MMM need marketing-spend data. Add to `canonical-fields.config.ts`:
- **`marketing_spend`** semantic flag — canonical fields: `spend_date` (datetime, required), `amount` (number, required), `channel` (string, required), `campaign_id` (string), `campaign_name` (string), `currency` (string), `impressions` (number), `clicks` (number), `conversions` (number).
Datasets can be flagged `marketing_spend` via the existing mapping flow (CSV/Sheets/DB sources); no new connector required.

### Seed data (Ecommerce)
Seed script (following the `seed:datasource-types` pattern):
- Industry: **Ecommerce**
- Fields: **Purchases**, **Marketing** (Logistics/Inventory left for admin to add)
- Templates under Marketing:
  - **MER** (Marketing Efficiency Ratio) — requires `orders` + `marketing_spend`; widgets: MER trend (revenue ÷ ad spend over time), total revenue vs total spend, MER by channel, monthly spend breakdown.
  - **MMM** (Marketing Mix Modeling — descriptive v1) — requires `orders` + `marketing_spend`; widgets: revenue vs spend by channel over time, channel contribution share, spend-efficiency comparison, conversion trends.
  - **RFM** (Recency / Frequency / Monetary) — requires `orders` + `customers`; widgets: recency distribution, frequency distribution, monetary distribution, top customers by value, RFM segment breakdown.
- Templates under Purchases: **Sales Overview** — requires `orders`; widgets: total orders, total revenue, orders over time, revenue by status/channel.

### Admin Panel (new pages)
`/app/template-catalog` section, standard admin CRUD pattern (like Color Templates / Data Source Types), admin-guarded:
- **Industries**: list / create / edit / toggle-active / delete.
- **Industry Fields**: managed within an industry (list per industry, CRUD, toggle-active).
- **Templates**: list per field, CRUD of metadata + required canonical models + widget blueprint (v1 blueprint editing via structured JSON editor with validation against the canonical dictionary; visual builder is out of scope).

### Customer Portal (create dashboard from template)
In the create-dashboard flow the user can choose **"Start from a template"** as an alternative to the existing free-form path:
1. Browse active industries → fields → templates (bilingual cards with description + required models).
2. Pick a template; the portal shows the required canonical models and lets the user select which of their confirmed datasets satisfy each required model (only datasets whose `semanticFlag` matches are offered). Missing required model ⇒ template is shown but marked "needs a dataset flagged X", cannot proceed.
3. Create: dashboard is created with the template's blueprint via a new **`dashboard-from-template` pipeline type** (hybrid): deterministic steps instantiate the blueprint widgets bound to the selected datasets' canonical views; an AI adaptation step adjusts/repairs widgets for the user's actual mapped columns (e.g. optional canonical fields missing) and can add complementary widgets; then existing `build-filters`, `save-widgets`, `invalidate-cache` steps run.
4. Status/progress reuses the existing generation-status polling; the dashboard opens in the normal viewer and is fully editable afterwards (no ongoing link to the template).

### Architecture review (with light refactor only)
Produce a short review report (in the change folder) assessing the separation of:
- **a. Datasource engine** — connectors + registry, sync queue, mapping, OLAP load (`src/integrations/connectors`, `src/modules/data`, `src/modules/analytics-store`).
- **b. Pipeline engine** — `PipelineEngine`, `StepRegistry`, `PipelineTypeRegistry` (`src/modules/pipelines`).
- **c. Processing actions** — pipeline types acting on stored data (`dashboard-generate`, widget CRUD; future: `data-clean`, `forecast`).
Verdict per layer: what's clean, what leaks, what light refactor (if any) is needed so a new action = one new pipeline type + steps, with no engine changes. Only refactors required to host this module cleanly are implemented in this change.

### Out of scope
- Data-clean and forecasting action engines (future changes; this change only proves the extension point).
- Visual drag-and-drop template blueprint builder in admin (JSON-based editing in v1).
- Predictive/statistical MMM modeling (v1 MMM is descriptive analytics).
- New connectors for ad platforms (Google/Meta Ads); `marketing_spend` data arrives through existing sources (CSV/Sheets/DB).
- Template versioning / per-workspace custom templates.

## Acceptance Criteria
1. New MongoDB collections exist for industries, industry fields, and dashboard templates (bilingual fields + `isActive`), registered in `data-model.md`.
2. `canonical-fields.config.ts` contains the new `marketing_spend` semantic flag; a dataset can be mapped and confirmed with this flag through the existing mapping UI without code changes elsewhere.
3. Seed script (`npm run seed:template-catalog`) populates Ecommerce → {Purchases, Marketing} → {Sales Overview, MER, MMM, RFM} with valid widget blueprints; blueprint QuerySpecs reference only canonical field names that exist in the dictionary.
4. Admin panel has `/app/template-catalog` pages: industries CRUD + toggle-active, fields CRUD per industry, templates CRUD per field including required-models and blueprint editing with validation errors surfaced; all admin-guarded.
5. Customer portal create-dashboard flow offers "Start from template": browse active industries/fields/templates, dataset-per-required-model selection restricted to matching `semanticFlag`, blocked with a clear message when no matching dataset exists.
6. `POST /dashboards/from-template` (or `templateId` on create) starts a `dashboard-from-template` pipeline run; resulting dashboard contains the blueprint widgets bound to the selected datasets, AI-adapted where mapped columns require it; generation status polling works unchanged.
7. Created-from-template dashboards render in the standard viewer with working chart data (canonical-view OLAP path) and are editable like any other dashboard.
8. Inactive industries/fields/templates never appear in the customer portal but remain visible in admin.
9. Architecture review report exists in the change folder with a verdict per layer (datasource engine / pipeline / actions) and lists the light refactors applied.
10. All planning docs updated: `modules.md` (new module), `data-model.md`, backend `services.md`/`endpoints.md`, admin + customer `pages.md`.

## Notes
- The `dashboard-from-template` pipeline type is registered in `PipelineTypeRegistry` and reuses existing dashboard steps (`gather-dataset-schemas`, `build-filters`, `save-widgets`, `invalidate-widget-cache`) + new steps (`instantiate-template-widgets`, `adapt-template-widgets-ai`) — demonstrating the "new action = new pipeline type" extension pattern for future clean/forecast engines.
- Follows existing conventions: bilingual `*En`/`*Ar` fields (change-037), admin master-table pattern (change-048 data-source-types), seed script pattern, workspace-agnostic global catalog collections (admin-owned, like `datasource_type_meta`).
