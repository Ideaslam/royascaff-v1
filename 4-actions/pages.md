# Pages

## Short Summary

This file lists the Angular pages required for the ZOYA pre-sales system. It is derived from:

- [angular-page-template.md](/D:/Home/projects/company/zoya/zoya-ai-sales/docs/templates/angular-page-template.md:1)
- [endpoints.md](/D:/Home/projects/company/zoya/zoya-ai-sales/docs/backend/endpoints.md:1)
- [features.md](/D:/Home/projects/company/zoya/zoya-ai-sales/docs/features/features.md:1)
- [specific-notes](/D:/Home/projects/company/zoya/zoya-ai-sales/docs/setup/specific-notes/README.md:1)

This is a planning file for frontend page generation. It is not Angular code.

## Module: Auth

### Page 1

- Name: `Login Page`
- Route: `/auth/login`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Authenticates a user and enters the main portal.`

#### Description

This page allows internal users to log into the system using persisted backend authentication instead of the prototype hardcoded login overlay.

#### Purpose

- authenticate the user
- initialize frontend auth state
- redirect into the app shell

#### Main Component

- Component Name: `LoginPage`
- Folder: `client/src/app/pages/auth/login`
- Files:
  - `login.page.ts`
  - `login.page.html`
  - `login.page.css`

#### Child Components

- `AuthCardComponent - wraps auth form content`
- `LanguageSwitcherComponent - optional language toggle`

#### Services

- `AuthService - performs login and stores auth state`

#### Models / DTOs

- `LoginRequest - email/password payload`
- `AuthLoginResponse - token and user payload`

#### Backend Endpoints Used

- `POST /auth/login - authenticate credentials`
- `GET /auth/me - hydrate current user after login if needed`

#### UI Sections

- Auth header/logo
- Login form
- Error message area
- Auth footer links

#### User Actions

- enter email and password
- submit login form
- navigate to register page
- navigate to reset password page

#### States

- Loading: `disable form and show submit loader while authenticating`
- Empty: `not applicable`
- Error: `show invalid credentials or generic auth error`
- Success: `store auth state and navigate to dashboard`

#### Rules / Notes

- This is a public page outside the app shell
- Must use reactive forms
- Must not hardcode credentials or call AI/provider APIs

### Page 2

- Name: `Register Page`
- Route: `/auth/register`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Creates a new account if registration is enabled for the system.`

#### Description

This page collects registration data and submits a controlled registration request to the backend.

#### Purpose

- onboard a new user when allowed
- validate registration fields
- move user into authenticated or verification flow

#### Main Component

- Component Name: `RegisterPage`
- Folder: `client/src/app/pages/auth/register`
- Files:
  - `register.page.ts`
  - `register.page.html`
  - `register.page.css`

#### Child Components

- `AuthCardComponent - wraps auth content`

#### Services

- `AuthService - performs registration`

#### Models / DTOs

- `RegisterRequest`
- `AuthRegisterResponse`

#### Backend Endpoints Used

- `POST /auth/register - create account`

#### UI Sections

- Auth header/logo
- Registration form
- Validation message area

#### User Actions

- enter registration data
- submit registration form
- navigate back to login

#### States

- Loading: `disable submit while request is in flight`
- Empty: `not applicable`
- Error: `show validation or uniqueness errors`
- Success: `show confirmation or redirect`

#### Rules / Notes

- This page may be hidden later if registration is disabled in production
- Keep field set aligned with backend auth policy

### Page 3

- Name: `Reset Password Page`
- Route: `/auth/reset-password`
- Type: `auth`
- Layout: `auth layout`
- Summary: `Supports password recovery flow.`

#### Description

This page supports the reset-password workflow, either as a request screen, confirmation screen, or combined route flow depending on final UX.

#### Purpose

- request password reset
- apply new password with reset token
- support secure account recovery

#### Main Component

- Component Name: `ResetPasswordPage`
- Folder: `client/src/app/pages/auth/reset-password`
- Files:
  - `reset-password.page.ts`
  - `reset-password.page.html`
  - `reset-password.page.css`

#### Child Components

- `AuthCardComponent - wraps reset content`

#### Services

- `AuthService - triggers forgot/reset password endpoints`

#### Models / DTOs

- `ForgotPasswordRequest`
- `ResetPasswordRequest`

#### Backend Endpoints Used

- `POST /auth/forgot-password - request reset`
- `POST /auth/reset-password - apply new password`

#### UI Sections

- Reset instructions
- Email request form
- New password form

#### User Actions

- request reset
- submit new password
- navigate back to login

#### States

- Loading: `show request loader`
- Empty: `not applicable`
- Error: `show token or validation error`
- Success: `show confirmation and redirect option`

#### Rules / Notes

- Final UX can be one page with mode switching or two pages if preferred
- Keep route and token handling explicit

## Module: App Shell

### Page 4

- Name: `App Shell`
- Route: `/app`
- Type: `dashboard`
- Layout: `app shell`
- Summary: `Provides the authenticated portal layout with header, sidebar, and router outlet.`

#### Description

This is the main authenticated layout container for all internal portal pages.

#### Purpose

- hold header and sidebar
- show current user info
- provide route outlet for feature pages

#### Main Component

- Component Name: `AppShellPage`
- Folder: `client/src/app/pages/shell/app-shell`
- Files:
  - `app-shell.page.ts`
  - `app-shell.page.html`
  - `app-shell.page.css`

#### Child Components

- `AppHeaderComponent - logo, language switcher, user menu, sidebar toggle`
- `AppSidebarComponent - grouped navigation`

#### Services

- `AuthService - current user and logout`
- `LayoutService - sidebar collapse state`
- `I18nService - language and direction handling`

#### Models / DTOs

- `CurrentUserDto`

#### Backend Endpoints Used

- `GET /auth/me - current user profile`

#### UI Sections

- Header
- Sidebar
- Routed content area

#### User Actions

- toggle sidebar
- switch language
- open account menu
- logout

#### States

- Loading: `show shell skeleton while current user is loading`
- Empty: `not applicable`
- Error: `redirect to login if auth state is invalid`
- Success: `render child routes`

#### Rules / Notes

- This is not a business page but a required layout page
- Must support RTL/LTR switching

## Module: Dashboard

### Page 5

- Name: `Dashboard Page`
- Route: `/app/dashboard`
- Type: `dashboard`
- Layout: `app shell`
- Summary: `Shows top-level metrics and quick access to the pre-sales workflow.`

#### Description

This page is the landing page after login and presents project counts, recent projects, and quick navigation.

#### Purpose

- show project metrics
- show recent project activity
- provide quick entry to create/open project flows

#### Main Component

- Component Name: `DashboardPage`
- Folder: `client/src/app/pages/dashboard/dashboard-home`
- Files:
  - `dashboard-home.page.ts`
  - `dashboard-home.page.html`
  - `dashboard-home.page.css`

#### Child Components

- `DashboardMetricsComponent - project summary cards`
- `RecentProjectsComponent - recent project list`
- `QuickActionsComponent - shortcuts for main actions`

#### Services

- `DashboardService - loads dashboard summary`

#### Models / DTOs

- `DashboardSummaryResponse`
- `ProjectListItemDto`

#### Backend Endpoints Used

- `GET /dashboard/summary - load dashboard metrics and recent projects`

#### UI Sections

- Metrics cards
- Recent projects list
- Quick actions

#### User Actions

- open project
- create new project
- navigate to projects list

#### States

- Loading: `show skeleton cards and list loaders`
- Empty: `show no-projects quick-start state`
- Error: `show dashboard error and retry`
- Success: `show live summary and recent items`

#### Rules / Notes

- Metrics must come from backend aggregation, not frontend counting

## Module: Projects

### Page 6

- Name: `Projects List Page`
- Route: `/app/projects`
- Type: `list`
- Layout: `app shell`
- Summary: `Displays the paginated list of projects with filters and actions.`

#### Description

This page is the main project browsing screen for staff users.

#### Purpose

- list projects
- filter by status or assignee
- navigate to create and workspace pages

#### Main Component

- Component Name: `ProjectsListPage`
- Folder: `client/src/app/pages/projects/projects-list`
- Files:
  - `projects-list.page.ts`
  - `projects-list.page.html`
  - `projects-list.page.css`

#### Child Components

- `ProjectsFilterBarComponent - handles search and status filters`
- `ProjectsTableComponent - renders paginated projects`

#### Services

- `ProjectsService - loads list, updates status, archives project`
- `UsersService - loads lite users for assignee filter if needed`

#### Models / DTOs

- `PaginatedProjectsResponse`
- `ProjectListItemDto`
- `ListProjectsQuery`

#### Backend Endpoints Used

- `GET /projects - load paginated list`
- `PATCH /projects/:id/status - change status from row actions`
- `PATCH /projects/:id/assign - assign owner if supported inline`
- `DELETE /projects/:id - archive or delete project`

#### UI Sections

- Page header
- Filters bar
- Projects table
- Row action area

#### User Actions

- search projects
- filter by status
- assign project
- archive project
- open project workspace
- create new project

#### States

- Loading: `show table loader`
- Empty: `show empty-state with create action`
- Error: `show list error and retry`
- Success: `show paginated projects table`

#### Rules / Notes

- Use server-side pagination
- This is the main list page, not a lite selector page

### Page 7

- Name: `Create Project Page`
- Route: `/app/projects/new`
- Type: `create`
- Layout: `app shell`
- Summary: `Creates a new pre-sales project with the initial setup fields.`

#### Description

This page collects the first required project inputs before the user enters the full project workspace.

#### Purpose

- create a project record
- capture client and event basics
- initialize theme and booth starter values

#### Main Component

- Component Name: `ProjectCreatePage`
- Folder: `client/src/app/pages/projects/project-create`
- Files:
  - `project-create.page.ts`
  - `project-create.page.html`
  - `project-create.page.css`

#### Child Components

- `ProjectFormComponent - reusable project create/edit form`

#### Services

- `ProjectsService - creates project`

#### Models / DTOs

- `CreateProjectRequest`
- `ProjectDetailsDto`

#### Backend Endpoints Used

- `POST /projects - create project`

#### UI Sections

- Page header
- Main project form
- Save/create actions

#### User Actions

- enter project setup data
- submit project creation
- cancel and return to list

#### States

- Loading: `not applicable except small init state`
- Empty: `not applicable`
- Error: `show create validation or server error`
- Success: `navigate to project workspace or details page`

#### Rules / Notes

- Use dedicated page, not modal, because the entity is larger than a trivial form
- Must support multilingual name fields where needed

### Page 8

- Name: `Project Workspace Page`
- Route: `/app/projects/:id`
- Type: `details`
- Layout: `app shell`
- Summary: `Acts as the main workspace for project setup, booth, services, and proposal-related flows.`

#### Description

This is the central project page. It should organize the project workflow into clear tabs or internal sections instead of splitting the entire workflow into too many disconnected routes.

#### Purpose

- view and edit full project data
- navigate project sub-workflows
- act as the anchor page for quotation and proposal operations

#### Main Component

- Component Name: `ProjectWorkspacePage`
- Folder: `client/src/app/pages/projects/project-workspace`
- Files:
  - `project-workspace.page.ts`
  - `project-workspace.page.html`
  - `project-workspace.page.css`

#### Child Components

- `ProjectSetupSectionComponent - client, event, and theme data`
- `BoothBuilderSectionComponent - booth size and area`
- `ProjectServicesSectionComponent - selected services and summary`
- `ProjectActionsPanelComponent - proposal and status actions`

#### Services

- `ProjectsService - loads and updates project`
- `ProjectQuotationService - service selection and recalculation`
- `ProjectDocumentsService - proposal/document listing`

#### Models / DTOs

- `ProjectDetailsDto`
- `ProjectPricingSnapshotDto`
- `ProjectDocumentDto`

#### Backend Endpoints Used

- `GET /projects/:id - load project details`
- `PUT /projects/:id - update project`
- `PATCH /projects/:id/status - update project status`
- `PATCH /projects/:id/assign - assign project`
- `GET /projects/:id/documents - list proposal/document versions`

#### UI Sections

- Project header
- Workflow tabs or sections
- Summary sidebar or action panel
- Document/version list

#### User Actions

- edit project data
- update status
- assign owner
- navigate to technical proposal and financial proposal screens

#### States

- Loading: `show page skeleton while project loads`
- Empty: `show project not found or no access`
- Error: `show details error and retry`
- Success: `show workspace sections with latest project state`

#### Rules / Notes

- Several prototype screens belong to this same broader project domain
- Keep it structured, not one giant unreadable page

### Page 9

- Name: `Project Services Page`
- Route: `/app/projects/:id/services`
- Type: `edit`
- Layout: `app shell`
- Summary: `Allows browsing the service catalog and attaching services to a project.`

#### Description

This page lets users select catalog services, change quantities, and review pricing summary for the current project.

#### Purpose

- browse service categories
- add or remove project services
- update quantities and summary

#### Main Component

- Component Name: `ProjectServicesPage`
- Folder: `client/src/app/pages/projects/project-services`
- Files:
  - `project-services.page.ts`
  - `project-services.page.html`
  - `project-services.page.css`

#### Child Components

- `ServiceCategoryTabsComponent - browse service categories`
- `ServiceCatalogListComponent - catalog items and add/remove actions`
- `ProjectQuoteSummaryComponent - subtotal, VAT, totals`

#### Services

- `ServiceCatalogService - loads categories and lite service items`
- `ProjectsService - loads project details`
- `ProjectQuotationService - saves selected services and recalculates totals`

#### Models / DTOs

- `ServiceCategoryLiteDto`
- `ServiceLiteItemDto`
- `ProjectSelectedServiceDto`
- `ProjectPricingSnapshotDto`

#### Backend Endpoints Used

- `GET /projects/:id - load current project`
- `GET /service-categories/lite - load category tabs`
- `GET /services/lite - load service picker data`
- `PUT /projects/:id/services - replace selected service lines`
- `POST /projects/:id/recalculate - refresh pricing`

#### UI Sections

- Page header
- Category navigation
- Catalog item list
- Selected services summary

#### User Actions

- switch service category
- add service
- remove service
- change quantity
- recalculate totals

#### States

- Loading: `show catalog and summary loaders`
- Empty: `show no-services or no-selection state`
- Error: `show load/save error`
- Success: `show updated summary and saved selections`

#### Rules / Notes

- Project service lines must reflect backend snapshots, not only temporary UI state
- This page is service-selection workflow, not admin catalog management

### Page 10

- Name: `Technical Proposal Builder Page`
- Route: `/app/projects/:id/technical-proposal`
- Type: `create-edit`
- Layout: `app shell`
- Summary: `Collects proposal inputs and starts technical proposal generation.`

#### Description

This page gathers project-related proposal inputs such as custom prompt, RFP, client website, and custom sections before starting AI generation.

#### Purpose

- manage proposal input data
- upload RFP and section images
- start AI generation

#### Main Component

- Component Name: `TechnicalProposalBuilderPage`
- Folder: `client/src/app/pages/proposals/technical-builder`
- Files:
  - `technical-builder.page.ts`
  - `technical-builder.page.html`
  - `technical-builder.page.css`

#### Child Components

- `ProposalInputFormComponent - custom prompt, website, depth, model`
- `CustomSectionsEditorComponent - custom proposal sections`
- `ProjectFilesUploadComponent - RFP and image uploads`

#### Services

- `ProjectsService - load project context`
- `ProjectFilesService - upload and list files`
- `TechnicalProposalsService - start generation and fetch status`
- `SettingsService - fetch AI capability status`

#### Models / DTOs

- `ProjectDetailsDto`
- `AiCapabilityStatusDto`
- `ProjectFileDto`
- `AsyncProposalAcceptedResponse`

#### Backend Endpoints Used

- `GET /projects/:id - load project details`
- `GET /settings/ai-status - check AI availability`
- `GET /projects/:id/files - list uploaded files`
- `POST /projects/:id/files - upload RFP or image`
- `POST /projects/:id/proposals/technical/generate - start generation`

#### UI Sections

- Proposal input form
- RFP upload section
- Custom sections area
- Generate action panel

#### User Actions

- enter proposal prompt inputs
- upload RFP
- add custom section
- upload section image
- start generation

#### States

- Loading: `show project/input loaders`
- Empty: `show missing-input hints`
- Error: `show upload or generation start errors`
- Success: `show generation accepted state and link to status page`

#### Rules / Notes

- AI requests must go through backend only
- Starting generation should return async state, not block the page

### Page 11

- Name: `Technical Proposal Status Page`
- Route: `/app/projects/:id/technical-proposal/status`
- Type: `details`
- Layout: `app shell`
- Summary: `Shows the generation progress and final result status of the technical proposal.`

#### Description

This page is used for polling and monitoring proposal generation. It should show queue/generation/failure/completion states and next actions.

#### Purpose

- monitor generation progress
- allow retry when failed
- navigate to preview or editor when ready

#### Main Component

- Component Name: `TechnicalProposalStatusPage`
- Folder: `client/src/app/pages/proposals/technical-status`
- Files:
  - `technical-status.page.ts`
  - `technical-status.page.html`
  - `technical-status.page.css`

#### Child Components

- `ProposalStatusCardComponent - status and step details`
- `ProposalOutputActionsComponent - preview, edit, retry actions`

#### Services

- `TechnicalProposalsService - fetch status and retry generation`

#### Models / DTOs

- `ProposalStatusDto`
- `AsyncProposalAcceptedResponse`

#### Backend Endpoints Used

- `GET /projects/:id/proposals/technical/status - poll generation status`
- `POST /projects/:id/proposals/technical/retry - retry failed generation`

#### UI Sections

- Status summary
- Progress step details
- Output actions area

#### User Actions

- refresh status
- retry generation
- open proposal details/editor when ready

#### States

- Loading: `show polling/loading state`
- Empty: `show no proposal started state`
- Error: `show status retrieval error`
- Success: `show current status or ready output state`

#### Rules / Notes

- Frontend should poll backend status, not infer completion locally

### Page 12

- Name: `Proposal Editor Page`
- Route: `/app/projects/:id/documents/:documentId/editor`
- Type: `edit`
- Layout: `app shell`
- Summary: `Allows editing generated proposal HTML and saving it as a document version.`

#### Description

This page hosts the visual editing workflow for proposal HTML and persists edited output through the backend.

#### Purpose

- edit generated proposal content
- save edited HTML
- preserve document version history

#### Main Component

- Component Name: `ProposalEditorPage`
- Folder: `client/src/app/pages/proposals/proposal-editor`
- Files:
  - `proposal-editor.page.ts`
  - `proposal-editor.page.html`
  - `proposal-editor.page.css`

#### Child Components

- `ProposalEditorToolbarComponent - editing actions`
- `ProposalHtmlCanvasComponent - editable proposal surface`
- `ProposalVersionInfoComponent - version metadata`

#### Services

- `ProjectDocumentsService - load document details and save HTML`

#### Models / DTOs

- `ProjectDocumentDetailsDto`
- `ProjectDocumentDto`

#### Backend Endpoints Used

- `GET /projects/:id/documents/:documentId - load proposal HTML`
- `POST /projects/:id/documents/:documentId/save-html - save edited HTML`

#### UI Sections

- Editor toolbar
- Editable document canvas
- Save/version metadata area

#### User Actions

- edit proposal HTML
- save changes
- create new version if supported
- return to details page

#### States

- Loading: `show document loader`
- Empty: `show document not found state`
- Error: `show load/save error`
- Success: `show saved confirmation and updated version info`

#### Rules / Notes

- Edited HTML must be saved as backend document state, not browser-only state

### Page 13

- Name: `Proposal Details Page`
- Route: `/app/projects/:id/documents/:documentId`
- Type: `details`
- Layout: `app shell`
- Summary: `Displays one proposal/document version with preview and export actions.`

#### Description

This page shows the selected proposal/document version and provides preview, download, edit, and related file actions.

#### Purpose

- inspect proposal version
- preview rendered output
- navigate to editor
- access exports/files

#### Main Component

- Component Name: `ProposalDetailsPage`
- Folder: `client/src/app/pages/proposals/proposal-details`
- Files:
  - `proposal-details.page.ts`
  - `proposal-details.page.html`
  - `proposal-details.page.css`

#### Child Components

- `ProposalPreviewComponent - renders preview`
- `ProposalActionsComponent - edit/download/export actions`
- `ProposalMetadataComponent - type, version, status, timestamps`

#### Services

- `ProjectDocumentsService - load document details`
- `ProjectFilesService - access file metadata`

#### Models / DTOs

- `ProjectDocumentDetailsDto`
- `ProjectFileDto`

#### Backend Endpoints Used

- `GET /projects/:id/documents/:documentId - load document details`
- `GET /projects/:id/files - load related file metadata`

#### UI Sections

- Proposal header
- Metadata summary
- Proposal preview
- Action buttons

#### User Actions

- preview proposal
- open editor
- open related files
- navigate between versions

#### States

- Loading: `show document skeleton`
- Empty: `show missing document state`
- Error: `show retrieval error`
- Success: `show document version and preview`

#### Rules / Notes

- Use persisted document versions, not only project-level generated output

### Page 14

- Name: `Financial Proposal Page`
- Route: `/app/projects/:id/financial-proposal`
- Type: `details`
- Layout: `app shell`
- Summary: `Shows the financial quotation output and payment plan for the project.`

#### Description

This page renders the commercial quotation view derived from the project pricing snapshot and selected service lines.

#### Purpose

- show financial quotation
- show totals and payment plan
- refresh or persist financial proposal output

#### Main Component

- Component Name: `FinancialProposalPage`
- Folder: `client/src/app/pages/proposals/financial-proposal`
- Files:
  - `financial-proposal.page.ts`
  - `financial-proposal.page.html`
  - `financial-proposal.page.css`

#### Child Components

- `FinancialQuoteTableComponent - service lines and totals`
- `PaymentPlanCardsComponent - payment split display`

#### Services

- `ProjectsService - load project details`
- `ProjectQuotationService - pricing snapshot`
- `FinancialProposalsService - generate or refresh financial proposal`

#### Models / DTOs

- `ProjectDetailsDto`
- `ProjectPricingSnapshotDto`
- `FinancialProposalResponse`

#### Backend Endpoints Used

- `GET /projects/:id - load project details`
- `POST /projects/:id/recalculate - refresh pricing if needed`
- `POST /projects/:id/proposals/financial/generate - create or refresh financial proposal`

#### UI Sections

- Proposal header
- Quotation lines table
- Totals summary
- Payment plan section

#### User Actions

- view financial quotation
- refresh proposal
- print or export later

#### States

- Loading: `show quotation skeleton`
- Empty: `show missing pricing/proposal state`
- Error: `show calculation or generation error`
- Success: `show financial proposal output`

#### Rules / Notes

- All financial values must come from backend-calculated snapshot data

## Module: Catalog Administration

### Page 15

- Name: `Service Categories Page`
- Route: `/app/admin/service-categories`
- Type: `list`
- Layout: `app shell`
- Summary: `Manages service category master data.`

#### Description

This page provides admin CRUD over service categories used by the catalog.

#### Purpose

- list categories
- create or edit categories
- activate/deactivate categories

#### Main Component

- Component Name: `ServiceCategoriesPage`
- Folder: `client/src/app/pages/admin/service-categories`
- Files:
  - `service-categories.page.ts`
  - `service-categories.page.html`
  - `service-categories.page.css`

#### Child Components

- `ServiceCategoriesTableComponent - category list`
- `ServiceCategoryFormComponent - create/edit form`

#### Services

- `ServiceCategoriesService - category CRUD`

#### Models / DTOs

- `ServiceCategoryDto`
- `ServiceCategoryLiteDto`

#### Backend Endpoints Used

- `GET /service-categories - list categories`
- `POST /service-categories - create category`
- `PUT /service-categories/:id - update category`
- `DELETE /service-categories/:id - delete or deactivate category`

#### UI Sections

- Page header
- Categories table
- Create/edit form area

#### User Actions

- create category
- edit category
- deactivate category

#### States

- Loading: `show admin table loader`
- Empty: `show no-categories state`
- Error: `show CRUD error state`
- Success: `show saved/deleted confirmation`

#### Rules / Notes

- Admin-only page
- Can be one list page with side form or separate form page depending final UX

### Page 16

- Name: `Services Catalog Admin Page`
- Route: `/app/admin/services`
- Type: `list`
- Layout: `app shell`
- Summary: `Manages service item master data used in quotation logic.`

#### Description

This page is for admin CRUD over service catalog items with category linkage, unit type, and price management.

#### Purpose

- list service items
- filter by category
- create and update catalog items

#### Main Component

- Component Name: `ServicesCatalogAdminPage`
- Folder: `client/src/app/pages/admin/services-catalog`
- Files:
  - `services-catalog.page.ts`
  - `services-catalog.page.html`
  - `services-catalog.page.css`

#### Child Components

- `ServicesCatalogFiltersComponent - search and category filter`
- `ServicesCatalogTableComponent - service rows`
- `ServiceItemFormComponent - create/edit form`

#### Services

- `ServicesCatalogService - service CRUD`
- `ServiceCategoriesService - category selector data`

#### Models / DTOs

- `PaginatedServicesResponse`
- `ServiceDetailsDto`
- `ServiceCategoryLiteDto`

#### Backend Endpoints Used

- `GET /services - list services`
- `GET /service-categories/lite - load category selector`
- `POST /services - create service`
- `PUT /services/:id - update service`
- `DELETE /services/:id - delete or deactivate service`

#### UI Sections

- Filters bar
- Services table
- Create/edit panel or navigation

#### User Actions

- search services
- filter by category
- create service
- edit service
- deactivate service

#### States

- Loading: `show table loader`
- Empty: `show no-services state`
- Error: `show CRUD error`
- Success: `show confirmation messages`

#### Rules / Notes

- Admin-only page
- Catalog admin is separate from project service selection

## Module: Users Administration

### Page 17

- Name: `Users List Page`
- Route: `/app/admin/users`
- Type: `list`
- Layout: `app shell`
- Summary: `Displays the paginated user list for admin management.`

#### Description

This page allows admin users to manage system users with search, role filter, create, edit, and deactivate actions.

#### Purpose

- list users
- filter by role and active state
- navigate to create/edit user pages

#### Main Component

- Component Name: `UsersListPage`
- Folder: `client/src/app/pages/admin/users-list`
- Files:
  - `users-list.page.ts`
  - `users-list.page.html`
  - `users-list.page.css`

#### Child Components

- `UsersFilterBarComponent - search and role filters`
- `UsersTableComponent - renders rows and actions`

#### Services

- `UsersService - loads users and handles delete/deactivate`

#### Models / DTOs

- `PaginatedUsersResponse`
- `UserListItemDto`

#### Backend Endpoints Used

- `GET /users - list users`
- `DELETE /users/:id - deactivate or remove user`

#### UI Sections

- Page header
- Filters bar
- Users table

#### User Actions

- search users
- filter by role
- navigate to create user
- navigate to edit user
- deactivate user

#### States

- Loading: `show admin table loader`
- Empty: `show no-users state`
- Error: `show users list error`
- Success: `show confirmation after actions`

#### Rules / Notes

- Admin-only page
- Must not expose password values in UI

### Page 18

- Name: `User Create/Edit Page`
- Route: `/app/admin/users/:id/edit`
- Type: `create-edit`
- Layout: `app shell`
- Summary: `Creates or updates a user account from the admin area.`

#### Description

This page handles non-trivial user account forms, so it should be implemented as a dedicated page rather than a modal.

#### Purpose

- create a user
- edit a user
- manage role and active state

#### Main Component

- Component Name: `UserFormPage`
- Folder: `client/src/app/pages/admin/user-form`
- Files:
  - `user-form.page.ts`
  - `user-form.page.html`
  - `user-form.page.css`

#### Child Components

- `UserFormComponent - reusable form fields`

#### Services

- `UsersService - get, create, and update user`

#### Models / DTOs

- `UserDetailsDto`
- `CreateUserRequest`
- `UpdateUserRequest`

#### Backend Endpoints Used

- `GET /users/:id - load user for edit`
- `POST /users - create user`
- `PUT /users/:id - update user`

#### UI Sections

- Page header
- User form
- Form actions

#### User Actions

- fill user data
- assign role
- save changes
- cancel and return

#### States

- Loading: `show form skeleton for edit mode`
- Empty: `show user not found state`
- Error: `show validation or save error`
- Success: `show success toast and navigate back`

#### Rules / Notes

- Use one page that supports create and edit mode through route context
- This should not be a modal because the form is more than trivial

## Module: Settings

### Page 19

- Name: `Business Settings Page`
- Route: `/app/settings`
- Type: `settings`
- Layout: `app shell`
- Summary: `Manages business settings such as VAT, installation percentage, currency, and AI capability status.`

#### Description

This page is the main operational settings screen for editable business configuration.

#### Purpose

- view business settings
- update pricing defaults
- see AI capability status without exposing secrets

#### Main Component

- Component Name: `BusinessSettingsPage`
- Folder: `client/src/app/pages/settings/business-settings`
- Files:
  - `business-settings.page.ts`
  - `business-settings.page.html`
  - `business-settings.page.css`

#### Child Components

- `PricingSettingsFormComponent - VAT, installation, currency, payment plan`
- `AiCapabilityStatusComponent - safe AI status display`

#### Services

- `SettingsService - get and update settings`

#### Models / DTOs

- `BusinessSettingsDto`
- `AiCapabilityStatusDto`

#### Backend Endpoints Used

- `GET /settings - load business settings`
- `PUT /settings - update business settings`
- `GET /settings/ai-status - load safe AI capability status`

#### UI Sections

- Settings header
- Pricing/business settings form
- AI capability status panel

#### User Actions

- edit settings
- save settings
- review AI status

#### States

- Loading: `show settings form skeleton`
- Empty: `not applicable`
- Error: `show settings retrieval/save error`
- Success: `show saved confirmation`

#### Rules / Notes

- Admin-only page
- Do not expose raw secret fields in the frontend
