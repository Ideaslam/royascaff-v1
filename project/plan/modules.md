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
1. **Proposal CRUD & Dashboard** [both] — list/search/status/dashboard charts
2. **Technical/Financial Documents** [both] — HTML edit + S3 store by lang
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
14. **v3 proposal view** [frontend-only] — HTML iframe + server PDF; lang tabs; Retry / Translate / New template / Regenerate

## 6. Creative / AI Generation
- Scope: BE `ai`, `ai-jobs`, `creative-pipeline`, `jobs`, `pipeline-v3` + FE creative/ai/ai-jobs
- Audience: sales users
- Entities: `aiJobs`, `aiJobQueue`, `proposals`; v3 also uses Redis BullMQ work + `projects` / `pipelineTraces` / `templates`
- Depends on: Settings (Claude key + `pipelineV3Enabled`), Integrations (Claude, S3, Redis), Proposals, Projects (v3)
- Type: domain + integration

### Features
1. **Creative Pipeline v2** [both] — **soft-retired** when `pipelineV3Enabled`; new creative creates rejected; poller + job reads remain; escape hatch = flag false
2. **Legacy Stream Generation** [both] — `POST /ai-jobs/stream` one-shot (creative blocked when v3 on)
3. **AI Playground** [both] — Claude chat/test endpoints
4. **Job Monitoring** [both] — list/details progress (`/ai-jobs` kept for history)
5. **Multi-provider AI** [backend-only] — OpenAI/Gemini stubs partial
6. **Pipeline v3 foundations** [backend-only] — BullMQ queues (`pipeline.analyze|map|section|assemble|export`), AJV contracts (`dna.v2`, `map.v1`, slots), prompt packs, model-by-request-type resolver
7. **Analyze worker (Step 1)** [backend-only] — 1a + 1d (market/competitor/audience); AJV `dna.v2` fail-closed; traces; vision 1b partial
8. **Map worker (Step 2)** [backend-only] — `map.v1` + research coverage gate; store `proposal.sectionMap`
9. **Prompt packs (dna/research/map/section/translate)** [backend-only] — production packs under `pipeline-v3/prompts/`
10. **Section fan-out (Step 3)** [backend-only] — parallel `pipeline.section`; AJV contentSchema + richness; per-section fail/retry
11. **Assemble (Step 4)** [backend-only] — Handlebars + financial inject + overflow guard + PDF (no AI); uses `generation.language`
12. **Export (Step 5)** [backend-only] — S3 HTML/PDF → `renderedByLang`; `ready` / `partially_failed`
13. **Orchestration engine** [backend-only] — Mongo fan-in after sections; idempotent workers; reconciler ~60s
14. **Workspace v3 feature flag** [both] — `settings.pipelineV3Enabled` default **true**; gates create-from-project + regen/translate/rerender + FE Projects create; soft-blocks new creative jobs
15. **Translate section jobs** [backend-only] — fast model (`translate`); schema-validated; glossary rules; fan-in → assemble/export
16. **Regen orchestrator** [backend-only] — ProposalRegenerateService wires map/section/assemble/export queues
17. **Primary path (FE)** [frontend-only] — Projects primary when flag on (default); Creative nav hidden; `/ai-jobs` for history; Creative deep link escape when flag off
18. **Legacy proposal backfill** [backend-only] — ops script wraps proposals missing `projectId` into projects

## 7. Contracts
- Scope: BE `modules/data/contracts` + FE contracts pages
- Audience: sales
- Entities: `contracts`
- Depends on: Proposals, Clients, Integrations

### Features
1. **Contract Lifecycle** [both] — create from proposal, edit, status, send, signed upload

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
1. **Workspace Settings** [both] — company/integration/financial/theme (schema-driven)
2. **Global Config Bundle** [both] — designStyles, themes, aiProviders for FE
3. **Maintenance Mode** [both] — public status flag + FE guards
4. **Pipeline v3 feature flag** [both] — `pipelineV3Enabled` (default **true**); patch via settings; FE gates Projects create; false = legacy creative escape hatch

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
- Scope: BE `modules/data/projects` + `ProjectsDataService` + `pipeline-v3` analyze inputs + FE `/projects*`
- Audience: sales roles with `projects.*`
- Entities: `projects`
- Depends on: Clients, Services Catalog, Integrations (S3), Pipeline v3 (analyze enqueue)

### Features
1. **Project CRUD** [both] — create/list/get/patch/archive; competitors ≤3; researchOptions launch subset; financials code-computed
2. **RFP upload + parse** [both] — multipart → S3 + extracted text (pdf-parse / mammoth / txt)
3. **Image upload** [both] — multipart → S3 URLs on `images[]`
4. **DNA get / regenerate** [both] — read `projects.dna`; bump `dna.version` + clear data + enqueue `pipeline.analyze` (does not auto-rebuild proposals)
5. **Sibling proposal / template switch** [both] — new proposal, same DNA, different `templateKey`; map-only when DNA present; pin `dnaVersion`
6. **Project list / create wizard / workspace (FE)** [frontend-only] — `/projects`, `/projects/new`, `/projects/:id`; template gallery → create proposal

## 13. Templates
- Scope: BE `src/pipeline-v3/templates/*` + disk `templates/pitch-landscape/v1/` + `templates` collection + FE gallery
- Audience: system / gallery; ops smoke via fixture-render
- Entities: `templates`
- Depends on: PDF Export (PdfRenderService)

### Features
1. **Disk TemplateAssetResolver** [backend-only] — layout, CSS, partials from `assets.basePath`
2. **Handlebars render engine** [backend-only] — helpers `money`, `dir`, `t`, `resolveImage`, `pageNumber`; zero AI
3. **pitch-landscape design** [backend-only] — presentation landscape 16:9; Roya tokens; RTL/LTR; design-first disk edits affect render
4. **Section catalog subset** [backend-only] — 14 keys (commercial + market/competitor/audience research); abstract + contentSchema; active v1 seed
5. **Fixture render API** [backend-only] — `POST /api/data/templates/pitch-landscape/fixture-render` (html|pdf)
6. **pitch-landscape-formal** [backend-only] — active catalog sibling; formal theme tokens; shares pitch-landscape disk assets (partial design)
7. **Active template list API** [backend-only] — `GET /api/data/templates` slim DTO for gallery
8. **Template gallery UI** [frontend-only] — pick template during project create / sibling

## 14. Pipeline Traces
- Scope: BE `PipelineTraceService` + `pipelineTraces` + GET APIs + FE `/ai-requests`
- Audience: `admin` + `sales_manager` (`pipeline-traces.read`)
- Entities: `pipelineTraces`
- Depends on: Projects, Proposals (ids optional until generation)

### Features
1. **AI call / action tracing** [backend-only] — full parsed I/O, tokens, cost
2. **Cost util** [backend-only] — `computeCost(model, usage)`
3. **Trace list/detail API** [backend-only] — workspace-scoped thin reads
4. **Proposal trace summary** [backend-only] — totals for one proposal (calls, tokens, cost, duration)
5. **Workspace cost summary** [backend-only] — by day / model / project for date range
6. **AI Requests page** [frontend-only] — table + filters + detail dialog + summary card + cost charts
7. **Nav entry** [frontend-only] — `/ai-requests` when `pipeline-traces.read`

## 15. PDF Export
- Scope: BE `PdfRenderService` + Docker Chromium/Arabic fonts; consumes Handlebars HTML
- Audience: internal (assemble/export later) + fixture-render
- Entities: —
- Depends on: Templates

### Features
1. **HTML → PDF render** [backend-only] — Puppeteer; fixture path via templates; production proposal artifacts in later packs
2. **Overflow / fixed-page CSS contract** [backend-only] — `@page` 338×190mm, `.page { overflow: hidden; break-after: page }`
