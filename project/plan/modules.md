# Modules & Features

## 1. Auth
- Scope: BE `src/modules/auth` + FE auth pages + `core/services/auth*`
- Audience: public and authenticated
- Entities: `user`, `auth_tokens`, `workspaces`
- Depends on: Users, Integrations (Mailjet), Infrastructure

### Features
1. **Login / Refresh / Logout** [both] — JWT access + refresh in localStorage
2. **Registration & Email Verification** [both] — Mailjet verification
3. **Password Reset** [both] — tokenized reset email
4. **Profile & Avatar** [both] — self-service profile + S3 avatar
5. **Bootstrap Context** [both] — user + role permissions + workspace

## 2. Users
- Scope: BE `modules/data/user` + FE `/users` + admin user APIs
- Audience: admin / managers with user.* permissions
- Entities: `user`
- Depends on: Auth, Roles

### Features
1. **Team User Management** [both] — CRUD + lookup/lite
2. **Admin User Password Reset** [backend-only] — `user.resetPassword`

## 3. Clients
- Scope: BE `modules/data/clients` + FE `/clients`
- Audience: sales roles
- Entities: `clients`
- Depends on: Integrations (S3)

### Features
1. **Client CRM** [both] — CRUD, lite pickers
2. **Client Logo** [both] — upload/delete to R2

## 4. Services Catalog
- Scope: BE services + service-categories modules + FE pages
- Audience: internal sales ops
- Entities: `services`, `service-categories`
- Depends on: —

### Features
1. **Service Categories** [both] — bilingual categories with sortOrder
2. **Services Catalog** [both] — priced services with bilingual SOW fields

## 5. Proposals
- Scope: BE proposals modules + FE proposals/proposal/output
- Audience: sales + public viewers
- Entities: `proposals`
- Depends on: Clients, Services, AI Jobs, Integrations, Projects (v3 create-from-project)

### Features
1. **Proposal CRUD & Dashboard** [both] — list/search/status/dashboard charts; list summary includes `pipelineVersion` / `projectId` / `language`
2. **Technical/Financial Documents** [both] — HTML edit + S3 store by lang; shared shell for v2+v3; `document-html` technical falls back to `renderedByLang`; technical PUT syncs `renderedByLang.htmlUrl` for v3
3. **Proposal Delivery** [both] — email (+ WhatsApp capability)
4. **Public Proposal Links** [both] — unauthenticated client view
5. **Create from project (v3)** [backend-only] — link `projectId` + templateKey/language; enqueue analyze→map→sections (gated by `pipelineV3Enabled`); sibling via `fromStep`/`sourceProposalId` + `dnaVersion` pin
6. **Generation status (v3)** [backend-only] — poll `generation` through ready/partially_failed (`GET …/proposals/:id/status`)
7. **Section content + render artifacts (v3)** [backend-only] — `sections[]`, `renderedByLang`; retry failed sections
8. **Rendered download URLs (v3)** [backend-only] — `GET …/proposals/:id/rendered`
9. **Regenerate from step 2 (v3)** [backend-only] — archive `revisions[]`; remap→sections→assemble→export; optional `useLatestDna`
10. **Translate (v3)** [backend-only] — parallel section translate → assemble/export into `contentByLang` / `renderedByLang`
11. **Rerender (v3)** [backend-only] — assemble→export only (no AI)
12. **Revisions archive (v3)** [backend-only] — last 5 snapshots of sections/rendered/sectionMap
13. **Pipeline stepper UI (v3)** [frontend-only] — poll `GET …/status` 3–5s; Analyzing→…→Ready / Ready with gaps / Failed
14. **v3 proposal view** [frontend-only] — Technical/Financial doc tabs + pitch iframe + server PDF; lang tabs; Retry / Translate / New template / Regenerate; honors `?tab=financial`
15. **Archive edit parity (v2+v3)** [frontend-only] — editor loads HTML via URL maps / `document-html` (not empty inline seeds); services accept object `{ id }` line items

## 6. Creative / AI Generation
- Scope: BE `ai`, `ai-jobs`, `creative-pipeline`, `jobs`, `pipeline-v3` + FE creative/ai/ai-jobs
- Audience: sales users
- Entities: `proposals` (+ `generation`), `projects`, `project_dna_versions`, `pipelineTraces`; legacy `aiJobs` / `aiJobQueue` for chat + in-flight creative; v3 also uses Redis BullMQ + `templates`
- Depends on: Settings (Claude key + `pipelineV3Enabled`), Integrations (Claude, S3, Redis), Proposals, Projects
- Type: domain + integration

### Features
1. **Creative Pipeline v2 (unified)** [both] — section→final HTML; create via project+DNA+proposal (`pipelineVersion: "2"`, `jobId: null`); state on `proposal.generation`; traces on `pipelineTraces`; works with `pipelineV3Enabled` true
2. **Legacy Stream / aiJobs creative** [both] — `POST /ai-jobs` creative stays blocked when v3 on; dual poller still drains in-flight creative `aiJobs`
3. **AI Playground** [both] — Claude chat/test endpoints
4. **Job Monitoring** [both] — list/details progress (`/ai-jobs` kept for history/chat)
5. **Multi-provider AI** [backend-only] — OpenAI/Gemini stubs partial
6. **Pipeline v3 foundations** [backend-only] — BullMQ queues (`pipeline.analyze|map|section|assemble|export`), AJV contracts (`dna.v2`, `map.v1`, slots), prompt packs, model-by-request-type resolver
7. **Analyze worker (Step 1)** [backend-only] — 1a + 1d for all 8 research options (market/competitor/audience/trends/benchmarks/case-studies/social-analysis/action-plan); AJV `dna.v2` fail-closed; traces; vision 1b partial
8. **Map worker (Step 2)** [backend-only] — `map.v1` + research coverage gate (all 8 primaries; competitor ×N); require/inject `about_workspace` before footer; `maxSections` 28; store `proposal.sectionMap`
9. **Prompt packs (dna/research/map/section/translate)** [backend-only] — production packs under `pipeline-v3/prompts/` including full research set
10. **Section fan-out (Step 3)** [backend-only] — parallel `pipeline.section`; template-scoped contentSchema + `lengthBudgets` (aim 90%); clamp-first + soft max (+10%) AJV + richness; per-section fail/retry (length-only overshoots clamp, no retry)
11. **Assemble (Step 4)** [backend-only] — Handlebars + financial inject + branding + overflow guard + PDF (no AI); uses `generation.language`. `workspace_*` from Settings; `client_logo` = first DNA/project `purpose: client_logo` → else `clients.logoUrl`; **client-first** placement (cover/body client; workspace in `about_workspace` + footer)
12. **Export (Step 5)** [backend-only] — S3 HTML/PDF → `renderedByLang`; `ready` / `partially_failed`; standalone `financial.html` uses the **v2 commercial template** (API-ported `financial_template.html`); pitch-deck `financial.hbs` unchanged; totals code-computed
13. **Orchestration engine** [backend-only] — Mongo fan-in after sections; idempotent workers; reconciler ~60s; durable resume from Mongo checkpoints when Redis/app interrupted
14. **Workspace v3 feature flag** [both] — `settings.pipelineV3Enabled` default **true**; gates create-from-project + regen/translate/rerender + FE Projects create; soft-blocks new creative **aiJobs** (unified v2 create remains available)
15. **Translate section jobs** [backend-only] — fast model (`translate`); same template-scoped validate/clamp + lengthBudgets; glossary rules; fan-in → assemble/export
16. **Regen orchestrator** [backend-only] — ProposalRegenerateService wires map/section/assemble/export queues
17. **Primary paths (FE)** [frontend-only] — Projects = v3 templates; `/creative` = v2 final HTML (unified API); `/ai-jobs` for history/chat
18. **Legacy proposal backfill** [backend-only] — ops scripts: wrap missing `projectId` + DNA; set `pipelineVersion: "2"` for non-v3 shell (`backfill:v2-proposal-shell`)
19. **Durable resume** [both] — `PipelineResumeService` status machine (Mongo = checkpoint); reconciler + `POST …/resume`; FE Continue only when stuck (idle ≥60s, no BullMQ jobs for proposal); incomplete sections only, never wipe `ready`
20. **Dual batch poller** [backend-only] — Claude batch poll for legacy `aiJobs` + proposal-backed v2 (`generation.creativePipeline`)

## 7. Contracts
- Scope: BE `modules/data/contracts` + FE contracts pages
- Audience: sales
- Entities: `contracts`
- Depends on: Proposals, Clients, Integrations

### Features
1. **Contract Lifecycle** [both] — create from proposal, edit, status, send, signed upload
2. **Services line-item parity** [backend-only] — create-from-proposal accepts object `{ id, … }` or string ids; SOW/financial from snapshot+catalog; clean `serviceIds`

## 8. Roles & Permissions
- Scope: BE roles/permissions + FE roles-permissions
- Audience: admins (`roles.manage`)
- Entities: `roles`, `permissions`
- Depends on: Auth
- Type: infrastructure

### Features
1. **Permission Catalog** [both] — seeded keys including `projects.*` and `pipeline-traces.read`
2. **Role Management** [both] — assign permissionIds; batch upsert

## 9. Settings & Config
- Scope: BE settings/config + FE settings + ConfigService
- Audience: `settings.manage` for writes
- Entities: `settings`, `config`
- Depends on: Encryption, Integrations
- Type: infrastructure

### Features
1. **Workspace Settings** [both] — company/integration/financial/theme (schema-driven) + company logo upload/remove
2. **Global Config Bundle** [both] — designStyles, themes, aiProviders for FE
3. **Maintenance Mode** [both] — public status flag + FE guards
4. **Pipeline v3 feature flag** [both] — `pipelineV3Enabled` (default **true**); patch via settings; FE gates Projects create; false = legacy creative escape hatch
5. **Workspace Logo** [both] — upload/delete to R2; Settings Company preview; sidebar uses `logoUrl` with Safqa brand fallback

## 10. Admin
- Scope: BE `modules/admin` (+ data/admin reset)
- Audience: privileged users
- Entities: multiple
- Depends on: Users, Settings, AI Jobs
- Type: infrastructure

### Features
1. **Seed Config** [backend-only] — permissions/roles/config docs
2. **Admin AI Job Diagnostics** [both] — list via /admin/ai-jobs
3. **Workspace Data Reset** [backend-only] — destructive wipe
4. **S3 / Batch Debug** [backend-only] — ops probes

## 11. Integrations (cross-cutting)
- Scope: BE services (S3, Mailjet, WhatsApp, Redis, Claude)
- Audience: system
- Entities: N/A
- Type: integration

### Features
1. **Object Storage (R2)** [backend-only]
2. **Email (Mailjet)** [backend-only]
3. **WhatsApp (Meta)** [backend-only]
4. **Cache (Redis)** [backend-only]
5. **Claude (Anthropic)** [backend-only]
6. **BullMQ (Redis work queues)** [backend-only] — Pipeline v3 job queues; Redis also remains cache

## 12. Projects
- Scope: BE `modules/data/projects` + `ProjectsDataService` + `project_dna_versions` + `pipeline-v3` analyze inputs + FE `/projects*`
- Audience: sales roles with `projects.*`
- Entities: `projects`, `project_dna_versions`
- Depends on: Clients, Services Catalog, Integrations (S3), Pipeline v3 (analyze enqueue)

### Features
1. **Project shell CRUD** [both] — create/list/get/patch/archive; create also inserts first DNA version (inputs may mirror on project during transition); when Clients.`logoUrl` set and no `client_logo` image, seed `{ purpose: client_logo, url }` into project + DNA `images[]`
2. **DNA versions CRUD** [both] — list/create (blank\|copyFrom)/get/patch inputs/rename/hard-delete; title required; duplicates OK; no max; zero versions allowed
3. **DNA generate (per version)** [both] — enqueue analyze for that version’s inputs; confirmOverwrite if ready; 409 if regenerating; branding inject/force-reconcile; PUT content AJV `dna.v2`
4. **RFP / images (version-scoped)** [both] — multipart + purpose/notes on DNA version; legacy project-level routes remain as shim/mirror
5. **Sibling / create proposal** [both] — pick `dnaVersionId` (default latest ready); pin `dnaVersionId` + `dnaSnapshot`; map-only when ready DNA; services from version
6. **Project list / create / workspace / DNA form (FE)** [frontend-only] — `/projects`, `/projects/new`, `/projects/:id` (DNA versions table + proposal picker), `/projects/:id/dna/new`, `/projects/:id/dna/:vid` (form); `/edit` legacy; shared breadcrumbs; Branding + images cards; dialog selects `appendTo="body"`

## 13. Templates
- Scope: BE `src/pipeline-v3/templates/*` + disk `templates/pitch-landscape/v1/` + `templates/website-template/v1/` + `templates/roya-presentation/v1/` + `templates` collection + FE gallery
- Audience: system / gallery; ops smoke via fixture-render
- Entities: `templates`
- Depends on: PDF Export (PdfRenderService); Settings (workspace logo/name for pitch branding)

### Features
1. **Disk TemplateAssetResolver** [backend-only] — layout, CSS, partials from `assets.basePath`
2. **Handlebars render engine** [backend-only] — helpers `money`, `dir`, `t`, `resolveImage`, `pageNumber`; root branding vars `workspace_*` / `client_*`; theme CSS vars from `themeOverrides` (Assemble maps DNA `branding.colorRoles` → primary…text, unless `theme.lockPalette`); presentation vs landing render contracts; zero AI
3. **pitch-landscape design** [backend-only] — presentation landscape 16:9; primary-led DNA roles; RTL/LTR; **client-first**: cover + interior chrome use `client_*` (no per-page workspace brand-mark); workspace logo/name in `about_workspace` + footer only; website sticky header uses client branding; includes `testimonial.hbs` + `about_workspace.hbs`
4. **Section catalog (per template)** [backend-only] — shared base **21** keys (incl. `testimonial`, `about_workspace`); each template owns `contentSchema` / length budgets under `src/pipeline-v3/templates/<templateKey>/`; registry `getSectionDef(key, templateKey)`; seed via `buildAllTemplateDocs()`; `maxSections` 28; `roya-presentation` adds local `team` + `risks` (**23**)
5. **Fixture render API** [backend-only] — `POST /api/data/templates/pitch-landscape/fixture-render` (html|pdf) with optional `templateKey` (`pitch-landscape` \| `pitch-landscape-formal` \| `website-template` \| `roya-presentation`); fixtures include sample branding; roya fixtures include `team`/`risks`
6. **pitch-landscape-formal** [backend-only] — own catalog file; formal theme tokens; shares pitch-landscape disk assets; currently same lengths as pitch (may diverge)
7. **Active template list API** [backend-only] — `GET /api/data/templates` slim DTO for gallery
8. **Template gallery UI** [frontend-only] — pick template during project create / sibling
9. **website-template landing** [backend-only] — key `website-template`; `type: website`, `page.renderMode: landing`; continuous scrolling HTML from `05.smart-watch` style language; own disk `templates/website-template/v1/`; **own** section length schemas (tighter cards vs pitch); HTML primary delivery; optional A4 portrait PDF; assemble skips slide overflow guard
10. **roya-presentation** [backend-only] — key `roya-presentation`; name `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }`; presentation landscape 16:9; own disk `templates/roya-presentation/v1/` with HAIA-from-scratch compositions (not recolored pitch); `theme.lockPalette: true` (DNA / proposal color overrides skipped at assemble); local sections `team` + `risks`

### Canonical active templates
| key | basePath | mode | sections |
|-----|----------|------|----------|
| `pitch-landscape` | `templates/pitch-landscape/v1` | presentation 16:9 | 21 |
| `pitch-landscape-formal` | `templates/pitch-landscape/v1` | presentation 16:9 (token variant) | 21 |
| `website-template` | `templates/website-template/v1` | landing (fluid web) | 21 |
| `roya-presentation` | `templates/roya-presentation/v1` | presentation 16:9 (HAIA; locked palette) | 23 |

## 14. Pipeline Traces
- Scope: BE `PipelineTraceService` + `pipelineTraces` + GET APIs + FE `/ai-requests`
- Audience: `admin` + `sales_manager` (`pipeline-traces.read`)
- Entities: `pipelineTraces`
- Depends on: Projects, Proposals (ids optional until generation)

### Features
1. **AI call / action tracing** [backend-only] — full parsed I/O, tokens, cost
2. **Cost util** [backend-only] — `computeCost(model, usage)`
3. **Trace list/detail API** [backend-only] — workspace-scoped Mongo filters; list embeds filter `stats`; `callType` ai/non-ai
4. **Proposal trace summary** [backend-only] — Mongo aggregate totals (+ `totalTokens`)
5. **Workspace cost summary** [backend-only] — `$facet` by day / model / project (project rows include token totals)
6. **AI Requests page** [frontend-only] — projects overview with KPI cards + token/cost columns + project names; requests view with callType/step filters + filter stats; detail dialog
7. **Nav entry** [frontend-only] — `/ai-requests` when `pipeline-traces.read`

## 15. PDF Export
- Scope: BE `PdfRenderService` + Docker Chromium/Arabic fonts; consumes Handlebars HTML
- Audience: internal (assemble/export later) + fixture-render
- Entities: —
- Depends on: Templates

### Features
1. **HTML → PDF render** [backend-only] — Puppeteer; fixture path via templates; production proposal artifacts in later packs; presentation → landscape; landing (`website-template`) → A4 portrait
2. **Overflow / fixed-page CSS contract** [backend-only] — presentation: `@page` 338×190mm, `.page { overflow: hidden; break-after: page }`; landing: continuous web contract (no slide overflow shrink)
