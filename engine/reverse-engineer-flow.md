# AI-Control Engine — Reverse-Engineer Flow

## Overview

This flow **reverse-engineers an existing or legacy codebase** and auto-generates the full set of
`project/` blueprint documents. It is the onboarding counterpart to `flow.md`: where Phases 0–2 of
`flow.md` assume you are *describing* a new application, this flow *reads* the code that already exists
and produces the same artifacts.

**When to use this flow**:
- An existing codebase exists but no `project/` blueprint has been created yet.
- A legacy system is being onboarded into the AI-Control framework.
- A team inherits a codebase and needs full documentation before making changes.

**Relationship to `flow.md`**:
- This flow produces the same `project/` artifacts that Phases 0–2 of `flow.md` would produce:
  `profile.md`, `description.md`, `plan/modules.md`, `plan/features.md`, `plan/data-model.md`,
  `actions/<app-key>/services.md`, `actions/<app-key>/endpoints.md`,
  `actions/<app-key>/pages.md` or `views.md`, and `rules.md`.
- After completion, the team uses **Phase 5 (Change Mode)** or **Phase 6 (Bug Fix)** from `flow.md`
  for all future work — no need to re-run this flow.
- This flow does **not** generate code (Phase 3) or run the standard verification (Phase 4) — those
  phases apply to greenfield builds. Instead, Phase R.3 runs a **drift analysis** that validates
  the generated blueprint against the actual code.

**Two zones still apply**:
- **`engine/`** — this guide (`reverse-engineer-flow.md`), the generic templates (`engine/templates/`),
  and the generic backend/frontend rules (`engine/rules/`). Reusable across any product.
- **`project/`** — the living blueprint and single source of truth for the current system:
  `profile.md`, `description.md`, `plan/`, `actions/`, `rules.md`, `verify/`.

The engine never hardcodes a specific system's data. All concrete facts about *this* system —
applications, repositories, tech stack, brand tokens, environments, integrations — live in
**`project/profile.md`**. Wherever this guide says "the repo / app / stack / brand defined in
`project/profile.md`", resolve it against that file.

Follow each phase in order. Each step declares its **Input**, **Template** (optional), **Output**,
**Actions**, and **Done-when** criteria.

---

## Phase R.0 — Discovery & Workspace Mapping

### Goal
Scan the workspace, identify all applications and their technology stacks, and produce a confirmed
system profile in `project/profile.md` that the rest of the flow will reference.

### Step R.0.1 — Workspace Scan

- **Input**: Workspace root directory (all repositories/folders)
- **Template**: `engine/templates/profile-template.md`
- **Output**: `project/profile.md`
- **Actions**:
  1. Scan the workspace root for all repositories, monorepo packages, and standalone applications.
  2. Read configuration files to detect applications and their types:
     - `package.json` — name, scripts, dependencies, workspaces (monorepo detection)
     - `angular.json` / `nx.json` / `turbo.json` / `lerna.json` — monorepo workspace configs
     - `tsconfig.json` / `tsconfig.*.json` — TypeScript project references
     - `nest-cli.json` — NestJS monorepo projects
     - `Dockerfile` / `docker-compose.yml` — containerized services
     - `.env` / `.env.*` files — environment variables, database URLs, API keys
     - `Procfile` / `serverless.yml` / `vercel.json` / `netlify.toml` — deployment configs
  3. For each discovered application, classify its type:
     - **API** — backend service (NestJS, Express, Fastify, etc.)
     - **Web** — frontend web application (Angular, React, Vue, Next.js, etc.)
     - **Mobile** — mobile application (React Native, Flutter, Ionic, etc.)
     - **Worker** — background job processor, cron service
     - **Shared** — shared library or package (monorepo)
  4. For each application, extract:
     - **Framework**: detect from dependencies (e.g. `@nestjs/core` → NestJS, `react` → React)
     - **Language**: TypeScript, JavaScript, Python, etc.
     - **Database**: detect from dependencies and env vars (e.g. `mongoose` → MongoDB, `typeorm` → SQL, `@prisma/client` → Prisma)
     - **Auth strategy**: detect from dependencies and middleware (e.g. `passport`, `@nestjs/jwt`, `firebase-admin`)
     - **UI library**: detect from dependencies (e.g. `@angular/material`, `antd`, `@mui/material`, `primeng`)
     - **Build tool**: detect from config files and scripts (e.g. `webpack`, `vite`, `esbuild`, `nx`)
  5. Identify integrations from dependencies and env vars:
     - Payment: Stripe, PayPal, Tap, etc.
     - Email: SendGrid, Mailgun, Resend, etc.
     - Storage: AWS S3, Google Cloud Storage, Cloudinary, etc.
     - AI: OpenAI, Anthropic, Google AI, etc.
     - Messaging: Twilio, Firebase Cloud Messaging, etc.
     - Other: any third-party SDK detected
  6. Populate `project/profile.md` from `engine/templates/profile-template.md`:
     - Fill the **Applications** table — each row defines an app **Key** (this key becomes the
       `project/actions/<key>/` folder name), name, type, framework, and repo path.
     - Fill the **Repositories** table with paths and descriptions.
     - Fill the **Tech Stack** section with all detected technologies.
     - Fill the **Integrations** section with all detected third-party providers.
     - Fill the **Environments** section from discovered env files.
     - Fill the **Brand Tokens** section from any theme/style config found (colors, fonts, logos).
  7. Handle monorepo vs multi-repo:
     - **Monorepo**: list each package/app as a separate Application entry; set the Repository to the
       monorepo root with a `packages/<name>` or `apps/<name>` subpath.
     - **Multi-repo**: list each repository separately in the Repositories table.

- **Done when**:
  - `project/profile.md` exists and the template's **Completion Checklist** is satisfied
  - All applications are listed with correct types, frameworks, and repo paths
  - All integrations are documented
  - Database(s) and auth strategy are identified
  - The **Applications** table has stable **Key** values that will be used for `project/actions/<key>/` folders

### ⛔ Confirmation Gate — Profile Review (MANDATORY)

Before continuing to Phase R.1, the AI **must** stop and present the discovered profile to the user
for explicit approval.

**What to present**:
1. **Discovered applications** — the Applications table showing each app's key, type, framework, and path
2. **Tech stack summary** — languages, frameworks, databases, UI libraries, build tools
3. **Integrations** — all detected third-party providers
4. **Architecture type** — monorepo vs multi-repo, shared libraries
5. **Any unknowns** — items that could not be auto-detected and need user input

**How to present**:
- Format the summary as a concise, readable list (not prose).
- Highlight anything uncertain with a ❓ marker.
- End with a single clear question: **"Does this profile look correct? Please confirm or correct before I scan the codebase."**
- Wait for an explicit **"yes" / "confirmed" / "go ahead"** (or equivalent) before continuing.
- If the user requests corrections, update `project/profile.md` and re-present the summary.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

---

## Phase R.1 — Codebase Deep Scan

### Goal
Read the actual source code of every application discovered in Phase R.0 and extract schemas, services,
endpoints, and frontend pages/views into their respective blueprint documents.

**Important**: This phase reads code — it does not generate or modify code. All outputs are
documentation files in `project/`.

**Scan order**: Process each application in dependency order — API apps first (schemas → services →
endpoints), then frontend apps (pages/views). This ensures that when scanning frontend apps, the
backend endpoints are already documented and can be cross-referenced.

---

### Step R.1.1 — Schema/Model Extraction

- **Input**: Backend app source code (from repo paths in `project/profile.md`), database type
- **Template**: `engine/templates/data-model-template.md`
- **Output**: `project/plan/data-model.md`
- **Actions**:
  1. Identify the schema/model directory pattern from the project's folder structure (e.g.
     `src/modules/*/schemas/`, `src/entities/`, `src/models/`, `prisma/schema.prisma`).
  2. Scan every schema/model file and extract entities. Use the framework detection patterns
     (see **Framework Detection Patterns** appendix) to identify entity definitions:
     - **Mongoose**: `@Schema()` decorator, `SchemaFactory.createForClass()`, `new Schema({})`,
       `Schema.define()`, `model()` calls
     - **TypeORM**: `@Entity()` decorator, `@Column()`, `@PrimaryGeneratedColumn()`,
       `@ManyToOne()`, `@OneToMany()`, `@ManyToMany()`, `@JoinTable()`
     - **Prisma**: `model` blocks in `schema.prisma`, `enum` blocks
     - **Sequelize**: `Model.init()`, `define()`, `@Table` decorator
     - **Raw SQL migrations**: `CREATE TABLE` statements, `ALTER TABLE` for schema evolution
  3. For each entity, extract:
     - **Entity name** and collection/table name
     - **Fields**: name, type, required/optional flag, default value
     - **Relationships**: references (foreign keys, ObjectId refs), embedded documents, join tables
     - **Indexes**: single-field, compound, unique, text, geo
     - **Enums**: inline or referenced enum types
     - **Validators**: built-in validators (min, max, match, enum), custom validators
     - **Timestamps**: `createdAt`, `updatedAt`, soft-delete flags
     - **Discriminators / inheritance**: single-table inheritance, discriminator keys
  4. For DTOs (Data Transfer Objects), scan for:
     - Input DTOs: `Create*Dto`, `Update*Dto`, request body classes
     - Output DTOs: response classes, serialization groups
     - Validation decorators: `class-validator` decorators, Joi schemas, Zod schemas
  5. Populate `project/plan/data-model.md` using the template format:
     - One section per entity with schema shape, field table, index table
     - Enum definitions section
     - DTO definitions section (or note that DTOs derive from entities)
     - Relationship diagram (textual) showing entity connections

- **Done when**:
  - Every schema/model file in the codebase has a corresponding entity in `data-model.md`
  - Field types, required flags, and constraints are documented
  - Relationships (references vs embedded) are explicit
  - Index recommendations are provided
  - Enum types are declared
  - Validation rules are stated
  - No schema file was skipped

---

### Step R.1.2 — Service Discovery

- **Input**: Backend app source code, `project/plan/data-model.md`
- **Template**: `engine/templates/services-template.md`
- **Output**: `project/actions/<api-app>/services.md` (one per API app)
- **Actions**:
  1. Identify the service directory pattern (e.g. `src/modules/*/services/`,
     `src/services/`, `src/*/service.ts`).
  2. Scan every service file and extract service definitions. Use framework detection patterns:
     - **NestJS**: `@Injectable()` decorator, constructor injection, `@Inject()` token injection
     - **Express**: service classes/modules imported by controllers, middleware
     - **Plain modules**: exported classes or functions acting as business logic layer
  3. For each service, determine its **type**:
     - **Internal service**: contains business logic, uses repositories/models, orchestrates operations.
       Signals: injects a Model/Repository, contains CRUD or domain logic methods.
     - **External service** (integration wrapper): wraps a third-party API or SDK.
       Signals: injects an external SDK client, uses `HttpService`/`axios`/`fetch` to call external
       URLs, references env vars for API keys.
  4. For each service, extract:
     - **Class name** and module it belongs to
     - **Type**: `internal` or `external`
     - **Public methods**: name, parameters (with types), return type, brief purpose
     - **Dependencies**: injected services, repositories, models, config values
     - **Repositories used**: which entities/models this service reads/writes
     - **External APIs called**: for external services, which provider and endpoints
  5. Populate `project/actions/<api-app>/services.md` using the template format:
     - Services grouped by module
     - Each service entry: type, public methods table, dependencies list
     - Internal services first, then external services
     - Cross-reference entities from `data-model.md`

- **Done when**:
  - Every service file in the codebase has a corresponding entry in `services.md`
  - Services are correctly classified as internal or external
  - Public methods, dependencies, and repositories are documented
  - No service file was skipped
  - All referenced entities exist in `data-model.md`

---

### Step R.1.3 — Endpoint Extraction

- **Input**: Backend app source code, `project/actions/<api-app>/services.md`
- **Template**: `engine/templates/endpoints-template.md`
- **Output**: `project/actions/<api-app>/endpoints.md` (one per API app)
- **Actions**:
  1. Identify the controller/route directory pattern (e.g. `src/modules/*/controllers/`,
     `src/controllers/`, `src/routes/`).
  2. Scan every controller/route file and extract endpoint definitions. Use framework detection patterns:
     - **NestJS**: `@Controller('path')`, `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`,
       `@UseGuards()`, `@Body()`, `@Param()`, `@Query()`, `@Req()`, `@Res()`
     - **Express**: `router.get()`, `router.post()`, `router.put()`, `router.patch()`,
       `router.delete()`, `app.use()` middleware registration
     - **Fastify**: `fastify.get()`, `fastify.post()`, route schema definitions
  3. For each endpoint, extract:
     - **HTTP method**: GET, POST, PUT, PATCH, DELETE
     - **Route path**: full path including controller prefix and route params (e.g. `/api/v1/users/:id`)
     - **Auth requirements**: guards, decorators, middleware (e.g. `@UseGuards(JwtAuthGuard)`,
       `@Roles('admin')`, `passport.authenticate()`)
     - **Input**: body DTO, query params, route params, file uploads
     - **Output**: response DTO, status codes, response shape
     - **Services called**: which services from `services.md` this endpoint invokes
     - **Business rules**: validation, authorization checks, special logic noted in comments or code
     - **Middleware**: rate limiting, CORS, logging, caching
  4. Identify route groups and API versioning:
     - Global prefixes (e.g. `app.setGlobalPrefix('api/v1')`)
     - Controller-level prefixes
     - Versioning strategy (URL path, header, query param)
  5. Populate `project/actions/<api-app>/endpoints.md` using the template format:
     - Endpoints grouped by module
     - Each endpoint entry: method, route, auth, input DTO, output DTO, services called,
       business rules
     - Cross-reference services from `services.md`

- **Done when**:
  - Every controller/route file in the codebase has corresponding endpoint entries in `endpoints.md`
  - HTTP methods and route paths are accurate
  - Auth requirements are documented for every endpoint
  - Input/output DTOs are specified
  - Every endpoint declares which services it calls
  - Services referenced exist in `services.md`
  - No controller/route file was skipped

---

### Step R.1.4 — Frontend Page Discovery (per web/mobile app)

Repeat this step for **each frontend application** discovered in Phase R.0. Web apps produce
`pages.md`; mobile apps produce `views.md`.

- **Input**: Frontend app source code, `project/actions/<api-app>/endpoints.md`
- **Template**: `engine/templates/pages-template.md` (web) or `engine/templates/views-template.md` (mobile)
- **Output**: `project/actions/<web-app>/pages.md` or `project/actions/<mobile-app>/views.md` — one per app
- **Actions**:
  1. Identify the routing and page/component structure. Use framework detection patterns:
     - **Angular**: `RouterModule.forRoot()` / `forChild()`, route definitions in `*-routing.module.ts`,
       `@Component()` decorator, `@NgModule()`, lazy-loaded modules (`loadChildren`),
       standalone components with `routes` array
     - **React**: `react-router-dom` route definitions, `<Route>` components, `pages/` or `app/`
       directory (Next.js), `createBrowserRouter()`, file-based routing
     - **Vue**: `vue-router` route definitions, `router.js` / `router/index.ts`, `.vue` files,
       `pages/` directory (Nuxt.js), Vuex/Pinia stores
     - **React Native**: `react-navigation` navigators, `Stack.Screen`, `Tab.Screen`,
       `Drawer.Screen`, screen components
  2. For each page/view, extract:
     - **Route path** (web) or **navigation target** (mobile)
     - **Components used**: child components rendered on this page
     - **Frontend services**: Angular services, React hooks/context, Vue composables that this
       page injects or calls
     - **API calls made**: which backend endpoints this page calls (match against `endpoints.md`)
     - **UI states**: loading, empty, error, success — look for conditional rendering, spinners,
       error boundaries, empty state components
     - **Auth guard**: route guards, protected route wrappers, auth checks
     - **Forms**: form fields, validation rules, submit handlers
  3. Identify shared/layout components:
     - Navigation bars, sidebars, headers, footers
     - Layout wrappers (authenticated layout, public layout)
     - Shared UI components (modals, tables, forms)
  4. Identify frontend state management:
     - Angular: services with `BehaviorSubject`, NgRx store
     - React: Context, Redux, Zustand, Recoil
     - Vue: Vuex, Pinia
  5. Populate `project/actions/<app-key>/pages.md` or `views.md` using the template format:
     - Pages/views grouped by module (matching backend module grouping where applicable)
     - Each page entry: route, components, frontend services, models, backend endpoints used,
       UI states
     - Cross-reference endpoints from `endpoints.md`

- **Done when**:
  - Every page/view in the frontend app has a corresponding entry in `pages.md` or `views.md`
  - Route paths match the actual routing configuration
  - Components, services, and API calls are documented
  - UI states (loading/empty/error/success) are captured
  - Auth guards are documented
  - All referenced endpoints exist in the API app's `endpoints.md`
  - No page/view was skipped
  - Step is repeated for every frontend app in the Applications table

---

## Phase R.2 — Plan Synthesis

### Goal
Synthesize the raw extraction results from Phase R.1 into higher-level planning documents: modules,
features, rules, and a product description. These documents complete the `project/` blueprint to the
same standard as Phases 0–2 of `flow.md`.

---

### Step R.2.1 — Module Grouping

- **Input**: `project/plan/data-model.md`, `project/actions/<api-app>/services.md`,
  `project/actions/<api-app>/endpoints.md`, `project/actions/<web-app>/pages.md` (all apps)
- **Template**: `engine/templates/modules-template.md`
- **Output**: `project/plan/modules.md`
- **Actions**:
  1. Use the **folder structure** as the primary signal for module boundaries:
     - Backend: each folder under `src/modules/` (NestJS) or `src/` top-level grouping (Express)
       is typically one module.
     - Frontend: each feature module, lazy-loaded route, or `pages/` subdirectory is typically
       one module.
  2. Cross-reference with service dependencies:
     - Services that share a module folder belong to the same module.
     - Services with heavy cross-module dependencies may indicate a module boundary issue
       (note this for the drift report).
  3. For each module, document:
     - **Module name**: derived from the folder name, normalized to a consistent casing
     - **Purpose**: inferred from the entities, services, and endpoints it contains
     - **Backend scope**: does it have schemas, services, endpoints?
     - **Frontend scope**: does it have pages/views in any frontend app?
     - **Dependencies**: which other modules does it depend on? (inferred from service imports)
  4. Handle special modules:
     - **Auth / Core / Shared**: modules that provide cross-cutting concerns (auth guards,
       interceptors, base classes, shared utilities). Mark these as `infrastructure` modules.
     - **Integration modules**: modules that wrap external providers (payments, email, etc.).
       Mark these as `integration` modules.
  5. Populate `project/plan/modules.md` using the template format.

- **Done when**:
  - All business capabilities are grouped into named modules
  - Each module declares backend/frontend scope
  - Module dependencies are documented
  - No orphaned services, endpoints, or pages exist outside a defined module
  - Infrastructure and integration modules are identified separately

---

### Step R.2.2 — Feature Mapping

- **Input**: `project/plan/modules.md`, `project/actions/<api-app>/endpoints.md`,
  `project/actions/<web-app>/pages.md` (all apps), `project/actions/<api-app>/services.md`
- **Template**: `engine/templates/features-template.md`
- **Output**: `project/plan/features.md`
- **Actions**:
  1. For each module, group its endpoints and pages into logical **features**:
     - A feature is a user-facing capability (e.g. "User Registration", "Invoice Generation",
       "Dashboard Analytics").
     - Use endpoint groupings (CRUD sets on the same entity, related business operations) as
       the primary signal.
     - Cross-reference with frontend pages that call those endpoints.
  2. For each feature, determine:
     - **Feature name**: a stable, descriptive name
     - **Visibility**: `frontend` (has pages), `backend-only` (API only, no UI), or `both`
     - **Subfeatures**: break down complex features into subfeatures if the code reveals distinct
       sub-capabilities (e.g. "Payments" → "Charge Card", "Refund", "Payment History")
     - **Endpoints involved**: list from `endpoints.md`
     - **Pages involved**: list from `pages.md` / `views.md`
     - **Services involved**: list from `services.md`
  3. Identify features that span multiple modules (cross-cutting features) and document them
     under the primary module with cross-references.
  4. Populate `project/plan/features.md` using the template format:
     - Features grouped by module
     - Each feature: name, visibility, subfeatures, related endpoints/pages/services

- **Done when**:
  - Every module from `modules.md` has a corresponding section in `features.md`
  - All product features are listed under the correct module
  - Each feature declares visibility (frontend/backend-only/both)
  - Feature names are stable and reusable
  - No orphaned endpoints or pages exist outside a defined feature

---

### Step R.2.3 — Rules Detection

- **Input**: All source code, `project/profile.md`, `project/plan/modules.md`,
  `project/plan/features.md`
- **Template**: `engine/templates/custom-feature-rules-template.md`
- **Output**: `project/rules.md`
- **Actions**:
  1. **Detect integration providers** — scan for third-party SDK usage and API calls:
     - Payment gateways: Stripe, PayPal, Tap, etc. (SDK imports, webhook handlers)
     - Email/SMS providers: SendGrid, Twilio, Mailgun, etc.
     - Object storage: S3, GCS, Cloudinary, etc.
     - AI/ML: OpenAI, Anthropic, Google AI, etc.
     - Push notifications: FCM, APNs, OneSignal, etc.
     - For each: document the provider, which module/service uses it, and the isolation pattern
  2. **Detect auth patterns**:
     - Auth strategy: JWT, session, OAuth2, API keys
     - Auth guards/middleware: which endpoints are protected, role-based access
     - Token management: refresh tokens, token expiry, blacklisting
     - Multi-tenancy: tenant isolation, tenant-scoped queries
  3. **Detect async jobs, cron, queues**:
     - Bull/BullMQ queues, Redis pub/sub, RabbitMQ
     - Cron jobs: `@Cron()` decorators, `node-cron`, `agenda`
     - Webhooks: incoming webhook endpoints, outgoing webhook dispatchers
     - Event emitters: `EventEmitter2`, domain events
  4. **Detect security patterns**:
     - Rate limiting: `@nestjs/throttler`, `express-rate-limit`
     - CORS configuration: allowed origins, methods, headers
     - Input validation: `class-validator`, Joi, Zod, express-validator
     - Helmet / security headers
     - CSRF protection
     - File upload restrictions (size limits, allowed types)
  5. **Detect logging and observability**:
     - Logging framework: Winston, Pino, Morgan
     - Monitoring: Sentry, DataDog, New Relic
     - Health checks: `/health`, `/readiness` endpoints
  6. **Detect caching**:
     - Redis cache, in-memory cache, `@nestjs/cache-manager`
     - Cache invalidation patterns
  7. Populate `project/rules.md` using the template format:
     - Rules grouped by category: integrations, auth, async, security, observability
     - Each rule: rule ID, module/feature reference, constraint, rationale
     - Generic rules remain in `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` only

- **Done when**:
  - All integration providers are documented with their module/feature references
  - Auth patterns and guard requirements are explicit
  - Async jobs, queues, and webhooks are captured
  - Security patterns are documented
  - Each rule references a specific module and feature
  - Generic rules remain in `engine/rules/` only

---

### Step R.2.4 — Description Generation

- **Input**: `project/plan/modules.md`, `project/plan/features.md`, `project/plan/data-model.md`,
  `project/rules.md`, `project/profile.md`, README file(s) if available
- **Template**: `engine/templates/description-template.md`
- **Output**: `project/description.md`
- **Actions**:
  1. Read the project's `README.md` (or equivalent) as a starting point. Extract:
     - Product name and purpose
     - Target audience / users
     - High-level feature list
     - Architecture overview (if described)
  2. Synthesize the discovered modules, features, entities, and integrations into a cohesive
     product description:
     - **Product Summary**: one-paragraph description of what the system does
     - **Primary Users**: who uses the system (extracted from auth roles, frontend apps)
     - **Core Workflow**: the main user journey (inferred from page flow and endpoint chains)
     - **Core Features**: organized by module, derived from `features.md`
     - **Key Entities**: derived from `data-model.md`
     - **Integrations**: derived from `rules.md` and `profile.md`
     - **Constraints and Requirements**: derived from `rules.md` (security, performance, compliance)
  3. If no README exists or it is minimal, construct the description entirely from the code analysis.
  4. Populate `project/description.md` using the template format.
  5. Mark any sections where the code provided insufficient context with `[INFERRED]` — these
     should be reviewed by the team.

- **Done when**:
  - `project/description.md` exists and covers all template sections
  - Product purpose is clear
  - Primary users and workflow are described
  - Core features are listed and match `features.md`
  - Key entities match `data-model.md`
  - Integrations and constraints are documented
  - Any inferred or uncertain sections are clearly marked

---

### ⛔ Confirmation Gate — Full Blueprint Review (MANDATORY)

Before continuing to Phase R.3, the AI **must** stop and present the full synthesized blueprint to the
user for review.

**What to present**:
1. **Product summary** — the generated description overview
2. **Modules discovered** — list of modules with their scope (backend/frontend)
3. **Features per module** — feature names and visibility
4. **Data model** — entity count, key entities and their relationships
5. **Services** — count of internal vs external services per API app
6. **Endpoints** — count of endpoints per module per API app
7. **Pages/views** — count of pages per frontend app
8. **Rules** — integration providers, auth patterns, async jobs detected
9. **Gaps and uncertainties** — anything marked `[INFERRED]` or uncertain

**How to present**:
- Format as a concise summary table or list (not the full document contents).
- Highlight any items that seem incomplete or uncertain with a ❓ marker.
- End with: **"This is the synthesized blueprint from your codebase. Please review and confirm before I run the drift analysis, or tell me what to correct."**
- Wait for an explicit **"yes" / "confirmed" / "go ahead"** (or equivalent).
- If the user requests corrections, update the relevant `project/` documents and re-present.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

---

## Phase R.3 — Drift Analysis & Reconciliation

### Goal
Validate that the generated blueprint accurately reflects the codebase, identify discrepancies, and
produce a reconciliation report with actionable recommendations.

---

### Step R.3.1 — Cross-Document Consistency

- **Input**: All generated `project/` documents
- **Output**: Internal consistency findings (fed into the drift report)
- **Actions**:
  Run the same consistency checks as Phase 4 of `flow.md` (checks 1–14), adapted for a
  reverse-engineered codebase. The focus is: **does the generated plan accurately reflect the code?**

  1. **Module-to-Feature Coverage** — every module in `modules.md` has features in `features.md`;
     no features exist outside defined modules.
  2. **Feature-to-Service Coverage** — every backend-relevant feature is covered by at least one
     internal service in `services.md`; every integration has an external service.
  3. **Feature-to-Endpoint Coverage** — every backend-relevant feature has at least one endpoint
     in `endpoints.md`.
  4. **Endpoint-to-Service Linking** — every endpoint declares which services it calls; every
     service reference exists in `services.md`.
  5. **Feature-to-Page Coverage** — every frontend-visible feature has at least one page in
     the relevant app's `pages.md`.
  6. **Entity Consistency** — all entities referenced in services, endpoints, and pages are
     defined in `data-model.md`.
  7. **Endpoint-to-Page Linking** — every endpoint listed in a page's "Backend Endpoints Used"
     exists in `endpoints.md` with matching route and method.
  8. **Auth Coverage** — every protected endpoint declares auth requirements; every protected
     page declares route guard requirements.
  9. **Custom Rules Compliance** — constraints in `rules.md` are reflected in services/endpoints/pages.
  10. **UI State Coverage** — every data-driven page documents loading/empty/error/success states.
  11. **Path and Naming Consistency** — file/folder names match references in all documents;
      module/feature/entity/service names are consistent.
  12. **Code Layering Compliance** — backend follows controller → service → repository; frontend
      follows page → frontend service → endpoint.
  13. **Frontend Third-Party Isolation** — no direct external API calls from frontend code.
  14. **Self-Contained Blueprint** — `project/` docs reference only other `project/` docs and
      `engine/rules/`; no system-specific data in `engine/` files.

- **Done when**: All 14 checks are evaluated and findings are recorded.

---

### Step R.3.2 — Drift Report

- **Input**: Cross-document consistency findings (Step R.3.1), all source code, all `project/` documents
- **Output**: `project/verify/reverse-engineer-report.md`
- **Actions**:
  1. **Scan for undocumented code** — compare the actual source files against the generated
     blueprint. Look for:
     - Controllers/routes not captured in `endpoints.md`
     - Services not captured in `services.md`
     - Schemas/models not captured in `data-model.md`
     - Pages/views not captured in `pages.md` / `views.md`
     - Utility files, helpers, middleware, pipes, interceptors, guards not accounted for
  2. **Identify incomplete features** — code that is partially implemented:
     - Endpoints with `// TODO` or `throw new NotImplementedException()`
     - Empty service methods or placeholder logic
     - Frontend pages with commented-out sections or "coming soon" placeholders
     - Unused imports or dead code paths
  3. **Detect architecture violations** — patterns that break the expected layering:
     - Controllers calling repositories directly (bypassing services)
     - Frontend pages making direct HTTP calls (bypassing frontend services)
     - Frontend code calling external APIs directly (bypassing the backend)
     - Business logic in controllers, middleware, or components
     - Circular dependencies
  4. **Find stale/dead code**:
     - Exported functions/classes never imported elsewhere
     - Route definitions that point to non-existent handlers
     - Schema fields never read or written by any service
     - Commented-out code blocks
     - Deprecated API endpoints (marked or detected)
  5. **Check configuration drift**:
     - Environment variables referenced in code but missing from `.env` files
     - Environment variables in `.env` files but never referenced in code
     - Hardcoded values that should be env vars (API keys, URLs, secrets)
     - Configuration differences between `.env.development`, `.env.production`, etc.
  6. Produce the report using the **Drift Report Template** (inline below):

```markdown
# Reverse-Engineer Report

## Generated: <YYYY-MM-DD>
## Codebase: <project name from profile.md>
## Overall Status: [CLEAN | DRIFT DETECTED | SIGNIFICANT DRIFT]

---

## 1. Cross-Document Consistency

### Module Coverage: [✓ | ✗]
- [Details if issues found]

### Feature Coverage: [✓ | ✗]
- [Details if issues found]

### Service Coverage: [✓ | ✗]
- [Details if issues found]

### Endpoint-Service Linking: [✓ | ✗]
- [Details if issues found]

### Entity Consistency: [✓ | ✗]
- [Details if issues found]

### Endpoint-Page Linking: [✓ | ✗]
- [Details if issues found]

### Auth Coverage: [✓ | ✗]
- [Details if issues found]

### Custom Rules Compliance: [✓ | ✗]
- [Details if issues found]

### UI State Coverage: [✓ | ✗]
- [Details if issues found]

### Path Consistency: [✓ | ✗]
- [Details if issues found]

### Code Layering: [✓ | ✗]
- [Details if issues found]

### Frontend Third-Party Isolation: [✓ | ✗]
- [Details if issues found]

### Self-Contained Blueprint: [✓ | ✗]
- [Details if issues found]

---

## 2. Documented & Implemented (✓)

Summary of what was successfully captured:

| Category | Count | Notes |
|----------|-------|-------|
| Modules | <N> | |
| Features | <N> | |
| Entities | <N> | |
| Internal Services | <N> | |
| External Services | <N> | |
| Endpoints | <N> | |
| Pages/Views | <N> (per app) | |
| Rules | <N> | |

---

## 3. Undocumented Code

Code that exists in the codebase but was not captured in the blueprint:

| File / Path | Type | Description | Recommendation |
|-------------|------|-------------|----------------|
| <file> | <controller/service/schema/page/utility/middleware> | <what it does> | Add to plan / Ignore / Mark as tech debt |

---

## 4. Incomplete Features

Partially implemented features detected in the code:

| Feature | Module | What Exists | What's Missing | Recommendation |
|---------|--------|-------------|----------------|----------------|
| <name> | <module> | <implemented parts> | <missing parts> | Complete / Remove / Mark as TBD |

---

## 5. Architecture Violations

Patterns that break the expected layering or isolation rules:

| Violation | File | Line(s) | Severity | Recommendation |
|-----------|------|---------|----------|----------------|
| <description> | <file> | <lines> | CRITICAL / HIGH / MEDIUM / LOW | Fix in code / Refactor / Accept with justification |

---

## 6. Stale/Dead Code

Code that appears unused or outdated:

| File / Symbol | Type | Evidence | Recommendation |
|---------------|------|----------|----------------|
| <file or symbol> | <unused export/dead route/stale schema field/commented code> | <why it's considered dead> | Remove / Investigate / Keep |

---

## 7. Configuration Drift

Environment variable and configuration mismatches:

| Issue | Details | Recommendation |
|-------|---------|----------------|
| Referenced but missing | <var name> used in <file> but not in .env | Add to .env |
| Defined but unused | <var name> in .env but never referenced | Remove from .env |
| Hardcoded secret | <description> in <file> | Move to .env |
| Env mismatch | <var name> differs between .env.dev and .env.prod | Reconcile |

---

## 8. Reconciliation Summary

| Category | Count | Action Required |
|----------|-------|-----------------|
| Undocumented code items | <N> | <N> to add, <N> to ignore |
| Incomplete features | <N> | <N> to complete, <N> to defer |
| Architecture violations | <N> | <N> critical, <N> non-critical |
| Stale/dead code items | <N> | <N> to remove, <N> to investigate |
| Configuration drift items | <N> | <N> to fix |

## 9. Recommended Next Steps

1. <Prioritized list of actions>
2. ...
```

- **Done when**:
  - `project/verify/reverse-engineer-report.md` is complete
  - Every drift category is evaluated
  - Counts and summaries are accurate
  - Recommendations are actionable

---

### Step R.3.3 — Reconciliation Recommendations

- **Input**: `project/verify/reverse-engineer-report.md`
- **Output**: Updated `project/` documents (if user approves), finalized report
- **Actions**:
  1. For each drift item in the report, recommend one of these actions:
     - **Add to plan** — the code is valid and should be documented in the blueprint.
       Update the relevant `project/` document.
     - **Fix in code** — the code violates architectural rules and should be refactored.
       Create a change request (Phase 5) for the fix.
     - **Remove from code** — the code is dead/stale and should be cleaned up.
       Create a change request (Phase 5) for the removal.
     - **Mark as tech debt** — the issue is known but not urgent. Document it in the report
       and optionally create a backlog item.
  2. Present the reconciliation recommendations to the user.
  3. Apply "Add to plan" recommendations immediately (update `project/` docs).
  4. For "Fix in code" and "Remove from code", note these as future Phase 5 change requests.
  5. Update the drift report with the final disposition of each item.

- **Done when**:
  - Every drift item has a recommended action
  - "Add to plan" items are applied to `project/` documents
  - "Fix in code" and "Remove from code" items are noted as future work
  - The drift report reflects final dispositions

---

## Phase R.Done — Handoff

### Summary

When all phases complete, the reverse-engineer flow has produced:

| Document | Path | Source |
|----------|------|--------|
| System profile | `project/profile.md` | Phase R.0 — auto-detected from configs, packages, env files |
| Product description | `project/description.md` | Phase R.2.4 — synthesized from README + code analysis |
| Modules map | `project/plan/modules.md` | Phase R.2.1 — grouped from folder structure and dependencies |
| Features map | `project/plan/features.md` | Phase R.2.2 — mapped from endpoints, pages, services |
| Data model | `project/plan/data-model.md` | Phase R.1.1 — parsed from schema/model files |
| Services (per API app) | `project/actions/<api-app>/services.md` | Phase R.1.2 — read from service files |
| Endpoints (per API app) | `project/actions/<api-app>/endpoints.md` | Phase R.1.3 — read from controller/route files |
| Pages (per web app) | `project/actions/<web-app>/pages.md` | Phase R.1.4 — read from page/component files |
| Views (per mobile app) | `project/actions/<mobile-app>/views.md` | Phase R.1.4 — read from screen/component files |
| Custom rules | `project/rules.md` | Phase R.2.3 — detected from code patterns |
| Drift report | `project/verify/reverse-engineer-report.md` | Phase R.3 — code vs blueprint comparison |

### Handoff to `flow.md`

The `project/` blueprint is now complete and equivalent to what Phases 0–2 of `flow.md` would produce.
From this point forward:

- **To add a feature or make a change** → use **Phase 5 (Change Mode)** from `flow.md`
- **To fix a bug** → use **Phase 6 (Bug Fix)** from `flow.md`
- **To rebuild or regenerate code** → use **Phase 3 (Build)** from `flow.md` (if starting fresh)
- **To verify consistency** → use **Phase 4 (Verify)** from `flow.md`

### TBDs and Open Items

List any items that could not be fully resolved during the reverse-engineering process:

- Sections marked `[INFERRED]` in `description.md` that need team confirmation
- Drift items marked as "Investigate" in the report
- Undocumented code items where the recommendation is unclear
- Any missing documentation that the code alone could not reveal (business rules,
  product decisions, user personas, brand guidelines)

---

## Appendix A — Framework Detection Patterns

Use these patterns to identify frameworks, decorators, and conventions during the codebase scan.
These are detection heuristics — adapt to the specific codebase's conventions.

### Backend Frameworks

#### NestJS
```
Signals:
  - Dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-express
  - Config: nest-cli.json
  - Decorators: @Controller(), @Injectable(), @Module(), @Get(), @Post(),
    @Put(), @Patch(), @Delete(), @UseGuards(), @Body(), @Param(), @Query()
  - Schema: @Schema(), @Prop() (with @nestjs/mongoose)
  - Entity: @Entity(), @Column() (with @nestjs/typeorm)
  - Module pattern: @Module({ imports, controllers, providers, exports })
  - Guard pattern: @UseGuards(AuthGuard), implements CanActivate
  - Pipe pattern: @UsePipes(ValidationPipe), implements PipeTransform
  - Interceptor: @UseInterceptors(), implements NestInterceptor
  - DI: constructor(private readonly serviceA: ServiceA)
```

#### Express
```
Signals:
  - Dependencies: express
  - Pattern: const app = express(), const router = express.Router()
  - Routes: router.get('/path', handler), app.post('/path', handler)
  - Middleware: app.use(middleware), router.use(middleware)
  - Error handling: app.use((err, req, res, next) => ...)
```

#### Fastify
```
Signals:
  - Dependencies: fastify
  - Pattern: const app = fastify(), fastify.register()
  - Routes: fastify.get('/path', options, handler)
  - Schema: route schema definitions with JSON Schema
  - Plugins: fastify.register(plugin, options)
```

### Frontend Frameworks

#### Angular
```
Signals:
  - Dependencies: @angular/core, @angular/common, @angular/router
  - Config: angular.json
  - Decorators: @Component(), @NgModule(), @Injectable(), @Input(), @Output()
  - Routing: RouterModule.forRoot(routes), RouterModule.forChild(routes)
  - Services: @Injectable({ providedIn: 'root' })
  - Standalone: standalone: true, imports: [...], routes array
  - Lazy loading: loadChildren: () => import('./module').then(m => m.Module)
  - Forms: ReactiveFormsModule, FormsModule, FormGroup, FormControl
  - HTTP: HttpClient, HttpClientModule
```

#### React
```
Signals:
  - Dependencies: react, react-dom, react-router-dom
  - Config: next.config.js (Next.js), vite.config.ts (Vite)
  - Components: function Component() { return <JSX> }, const Component = () => <JSX>
  - Hooks: useState, useEffect, useContext, useReducer, custom hooks (use*)
  - Routing: <Route path="/..." element={<Component/>}>, createBrowserRouter
  - File-based routing: pages/ directory (Next.js), app/ directory (Next.js App Router)
  - State: Context, Redux (@reduxjs/toolkit), Zustand, Recoil
  - API: fetch(), axios, useSWR, useQuery (React Query / TanStack Query)
```

#### Vue
```
Signals:
  - Dependencies: vue, vue-router
  - Config: vue.config.js, vite.config.ts, nuxt.config.ts
  - Components: <template>, <script>, <style> in .vue files
  - Composition API: setup(), ref(), reactive(), computed(), watch()
  - Options API: data(), methods, computed, mounted, created
  - Routing: createRouter({ routes }), router.js / router/index.ts
  - State: Vuex (createStore), Pinia (defineStore)
  - File-based routing: pages/ directory (Nuxt.js)
```

### ORM / Database Frameworks

#### Mongoose (MongoDB)
```
Signals:
  - Dependencies: mongoose, @nestjs/mongoose
  - Schema: @Schema(), @Prop(), SchemaFactory.createForClass()
  - Legacy: new mongoose.Schema({}), mongoose.model('Name', schema)
  - Types: Schema.Types.ObjectId, Schema.Types.Mixed
  - Refs: { type: Schema.Types.ObjectId, ref: 'ModelName' }
  - Indexes: @Index(), schema.index({})
  - Virtuals: schema.virtual('name')
  - Middleware: schema.pre('save'), schema.post('save')
  - Plugins: schema.plugin()
```

#### TypeORM (SQL)
```
Signals:
  - Dependencies: typeorm, @nestjs/typeorm
  - Entity: @Entity(), @PrimaryGeneratedColumn(), @Column()
  - Relations: @ManyToOne(), @OneToMany(), @ManyToMany(), @JoinTable(), @JoinColumn()
  - Repository: @InjectRepository(), Repository<Entity>
  - Migrations: src/migrations/, migration files with up()/down()
  - Query: createQueryBuilder(), .find(), .findOne()
```

#### Prisma
```
Signals:
  - Dependencies: @prisma/client, prisma
  - Schema: prisma/schema.prisma
  - Model: model ModelName { ... }
  - Enum: enum EnumName { ... }
  - Relations: @relation(fields: [...], references: [...])
  - Client: const prisma = new PrismaClient()
  - Migrations: prisma/migrations/
```

#### Sequelize
```
Signals:
  - Dependencies: sequelize, sequelize-typescript
  - Model: Model.init(), sequelize.define()
  - Decorators: @Table, @Column, @HasMany, @BelongsTo
  - Migrations: src/migrations/, sequelize-cli
```

---

## Appendix B — Monorepo vs Multi-Repo Handling

### Monorepo Detection

A monorepo is detected when:
- `package.json` has a `workspaces` field (npm/yarn workspaces)
- `lerna.json` exists at the root
- `nx.json` exists (Nx workspace)
- `turbo.json` exists (Turborepo)
- `angular.json` has multiple `projects` entries
- `nest-cli.json` has a `projects` field with multiple entries
- `pnpm-workspace.yaml` exists

### Monorepo Handling

When a monorepo is detected:
1. **Scan each package/app separately** — treat each workspace package as a separate application
   entry in `project/profile.md`.
2. **Shared packages** — packages under `packages/` or `libs/` that are imported by multiple apps
   should be listed as `Shared` type applications. Their exports (services, utilities, types) should
   be documented in the consuming app's service/page entries.
3. **Dependency graph** — document which apps depend on which shared packages. This helps identify
   module boundaries and shared code.
4. **Single profile, multiple apps** — all apps share one `project/profile.md` with one row per app
   in the Applications table. Each app gets its own `project/actions/<app-key>/` folder.

### Multi-Repo Handling

When separate repositories are detected:
1. **Scan each repo independently** — each repository maps to one or more Application entries.
2. **Cross-repo dependencies** — document API contracts between repos (e.g. frontend repo calls
   backend repo's endpoints). These are captured in `endpoints.md` and `pages.md` cross-references.
3. **Shared types/contracts** — if repos share type definitions (e.g. shared DTO package, API
   contract files), document these as a shared library in `profile.md`.

---

## Appendix C — Low-Quality Code Guidance

Legacy and existing codebases often have inconsistencies, missing types, or mixed patterns.
Follow these guidelines when the code quality is low.

### Missing Types / Any Types
- If TypeScript files use `any` extensively or JavaScript has no JSDoc types:
  - Infer types from usage patterns (what fields are accessed, what methods are called).
  - Document inferred types in `data-model.md` with an `[INFERRED]` marker.
  - Note the lack of type safety in the drift report as a tech debt item.

### No Comments / Poor Naming
- If functions have non-descriptive names or no documentation:
  - Read the function body to understand purpose.
  - Use the calling context (who calls this function and with what arguments) to infer purpose.
  - Document the inferred purpose in the blueprint with an `[INFERRED]` marker.

### Mixed Patterns
- If the codebase mixes patterns (e.g. some controllers call services, others call repositories
  directly; some pages use services, others use raw HTTP calls):
  - Document **what the code actually does**, not what it should do.
  - Flag pattern violations in the drift report's "Architecture Violations" section.
  - Recommend a target pattern in the reconciliation recommendations.

### Scattered Business Logic
- If business logic is spread across controllers, middleware, and utilities instead of services:
  - Still document it under the closest service in `services.md`, noting where the logic
    actually lives.
  - Flag this as an architecture violation in the drift report.

### Undocumented Env Vars
- If env vars are used but not documented in `.env.example` or similar:
  - Scan all source files for `process.env.VARIABLE_NAME`, `ConfigService.get()`, or equivalent.
  - Document discovered env vars in `profile.md` environments section.
  - Flag missing `.env.example` in the drift report.

### Legacy Database Patterns
- If raw SQL queries or inline schema definitions are used instead of an ORM:
  - Extract entity shapes from the query patterns (SELECT columns, INSERT columns).
  - Document these as entities in `data-model.md` with a note about the access pattern.
  - Flag the lack of ORM usage in the drift report.

---

## Appendix D — `project/actions/` Folder Structure

The `project/actions/` folder has one subfolder per application, keyed by the **Key** column from the
Applications table in `project/profile.md`.

```
project/actions/
  <api-app-key>/
    services.md       # Internal + external service specifications
    endpoints.md      # API endpoint specifications
  <web-app-key>/
    pages.md          # Web page specifications
  <mobile-app-key>/
    views.md          # Mobile screen specifications
  <second-api-key>/   # (if multiple API apps exist)
    services.md
    endpoints.md
  README.md           # Explains the structure
```

**Rules**:
- The folder name **must** match the app key exactly (lowercase, kebab-case).
- API apps always get `services.md` + `endpoints.md`.
- Web apps always get `pages.md`.
- Mobile apps always get `views.md`.
- If an app is both API and web (e.g. a Next.js full-stack app), it gets all three files
  in the same folder, or split into separate app entries — use the pattern that best matches
  the codebase's actual structure.
- Shared libraries do **not** get an `actions/` folder — their exports are documented in the
  consuming app's files.

---

## Quick Reference — Phase Summary

| Phase | Steps | What it does | Key output |
|-------|-------|-------------|------------|
| **R.0** | R.0.1 | Scan workspace, detect apps, frameworks, integrations | `project/profile.md` |
| **R.1** | R.1.1 – R.1.4 | Deep-scan code: schemas, services, endpoints, pages | `data-model.md`, `services.md`, `endpoints.md`, `pages.md`/`views.md` |
| **R.2** | R.2.1 – R.2.4 | Synthesize modules, features, rules, description | `modules.md`, `features.md`, `rules.md`, `description.md` |
| **R.3** | R.3.1 – R.3.3 | Drift analysis, consistency checks, reconciliation | `reverse-engineer-report.md` |
| **R.Done** | — | Handoff summary, TBDs, link to flow.md Phase 5/6 | — |

---
