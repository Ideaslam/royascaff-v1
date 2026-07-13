# Impact Analysis — Email Verification on Signup (change-056)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | partial | `roya-ai-dynamo-api/src/modules/auth/schemas/user.schema.ts` | No `emailVerified`, verification token/expiry/sentAt fields |
| Repository | partial | `roya-ai-dynamo-api/src/modules/auth/repositories/user.repository.ts` | No `findWithActiveVerificationTokens()` (mirror reset-token pattern) |
| Service(s) | partial | `roya-ai-dynamo-api/src/modules/auth/services/auth.service.ts` | Register sends inline welcome HTML; no verify/resend; oauthLogin doesn't set emailVerified |
| Endpoint(s) | partial | `roya-ai-dynamo-api/src/modules/auth/controllers/auth.controller.ts` | Missing verify-email + resend-verification; `GET /me` returns JWT payload only (no emailVerified) |
| Mail integration | partial | `roya-ai-dynamo-api/src/integrations/mail/` | No templates folder; inline HTML everywhere; no template renderer |
| Guard/enforcement | none | — | No email-verified check; subscription lock pattern exists in `subscription-limit.service.ts` |
| Page(s) | partial | `roya-ai-dynamo-frontend/src/app/pages/auth/` | Register, login, forgot/reset exist; no check-email or verify-email pages |
| App shell | complete | `roya-ai-dynamo-frontend/src/app/layouts/app-shell/app-shell.ts` | No verify banner |
| Frontend service | partial | `roya-ai-dynamo-frontend/src/app/core/services/auth.service.ts` | No verify/resend methods; UserProfile lacks emailVerified |
| i18n | partial | `roya-ai-dynamo-frontend/public/i18n/{en,ar}.json` | No verify-related keys |

**Feature state:** partial — registration + MailJet exist; verification flow entirely missing.

**Plan-vs-code drift:**
- `project/rules.md` RULE-NOTIF-001 lists email types + `src/integrations/mail/templates/` — **not implemented in code**
- `project/plan/modules.md` Auth feature 1 (User Registration) — no verification step documented
- `project/plan/data-model.md` users table — missing verification fields
- `project/actions/backend/endpoints/auth.md` — EP-AUTH-07/08 IDs used for logout/me; new endpoints need new IDs

## Affected Modules

### Auth (primary)
- User schema (verification fields; legacy users without field treated as verified in code)
- AuthService: register, oauthLogin, new verifyEmail/resendVerification/sendVerificationEmail/sendWelcomeEmail
- AuthController: 2 new endpoints; fix getMe to return full profile with emailVerified
- UserProfileDto + JWT strategy RequestUser: add emailVerified
- AuditAction: add USER_EMAIL_VERIFIED
- New EmailVerificationService (or methods on AuthService) with `assertEmailVerified(userId)` — mirrors SubscriptionLimitService pattern

### Email integration (S7)
- Create `src/integrations/mail/templates/` with branded HTML (verification + welcome, EN/AR)
- Create `MailTemplateService` to load/render templates with `{{var}}` interpolation
- Extend mail module exports

### Ripple — backend enforcement (service-layer assert)
| Service | Method | Action blocked |
|---------|--------|----------------|
| `ProjectsService` | `create()` | Create project |
| `DashboardsService` | `createDashboard()`, `createFromTemplate()` | Create dashboard |
| `DataService` | `uploadFile()`, `uploadSourceFile()`, `initiateUpload()` | CSV/data upload |
| `DataConnectionService` | `create()` | New data source connection |
| `DatasetService` | `create()`, `createFromEntities()` | New dataset/table |
| `SyncService` | `triggerSync()` | Data sync |
| `WorkspaceInvitationService` | `invite()` | Workspace invite |

**Not blocked (read-only / allowed):** login, onboarding, list/view projects/dashboards/data, profile, subscription, accept invitation.

### Customer Portal (frontend)
- New pages: `check-email`, `verify-email` (match auth card layout)
- Register redirect → `/auth/check-email` (preserve invitation flow)
- App shell banner with resend button
- AuthService + UserProfile model updates
- Routes: verify-email must be accessible when authenticated (outside guestGuard) — new auth sub-route or top-level route
- i18n EN/AR keys

### Not in scope
- Admin panel — no changes
- Landing site — no changes

## Plan Docs to Update

- [x] `project/plan/modules.md` — Auth feature 1 + S7 email templates
- [x] `project/plan/data-model.md` — users verification fields
- [x] `project/actions/backend/endpoints/auth.md` — new EP-AUTH-09/10, update EP-AUTH-01/08
- [x] `project/actions/backend/services/auth.md` — new methods + rules
- [x] `project/actions/backend/services/integration-providers.md` — MailTemplateService
- [x] `project/actions/customer-portal/pages/auth.md` — check-email + verify-email pages
- [x] `project/actions/customer-portal/pages/_index.md` — route entries
- [x] `project/rules.md` — add `email_verification` email type + EMAIL_NOT_VERIFIED rule
- [x] `project/description.md` — Auth feature capabilities (optional brief update)
- [x] `project/profile.md` — MailJet usage note (verification email)

## Code Files to Create

| File | Purpose |
|------|---------|
| `src/common/constants/email-verification.ts` | `EMAIL_NOT_VERIFIED` error code |
| `src/modules/auth/services/email-verification.service.ts` | assertEmailVerified, token gen, cooldown |
| `src/integrations/mail/mail-template.service.ts` | Load/render HTML templates |
| `src/integrations/mail/templates/email-verification.en.html` | Branded verification email EN |
| `src/integrations/mail/templates/email-verification.ar.html` | Branded verification email AR |
| `src/integrations/mail/templates/welcome.en.html` | Branded welcome email EN |
| `src/integrations/mail/templates/welcome.ar.html` | Branded welcome email AR |
| `frontend: pages/auth/check-email/*` | Post-register page |
| `frontend: pages/auth/verify-email/*` | Token handler page |

## Code Files to Modify

| File | Change |
|------|--------|
| `user.schema.ts` | Add 4 verification fields |
| `user.repository.ts` | Add findWithActiveVerificationTokens |
| `auth.service.ts` | Register/oauth/verify/resend/welcome flow |
| `auth.controller.ts` | New endpoints; getMe uses toProfileDto |
| `auth.dto.ts` | VerifyEmailDto, ResendDto; emailVerified on profile |
| `jwt.strategy.ts` | Include emailVerified in RequestUser |
| `audit-log.schema.ts` | USER_EMAIL_VERIFIED |
| `auth.module.ts` | Export EmailVerificationService |
| `mail.module.ts` | Register MailTemplateService |
| `projects.service.ts` | assertEmailVerified on create |
| `dashboards.service.ts` | assertEmailVerified on create |
| `data.service.ts` | assertEmailVerified on uploads |
| `data-connection.service.ts` | assertEmailVerified on create |
| `dataset.service.ts` | assertEmailVerified on create |
| `sync.service.ts` | assertEmailVerified on triggerSync |
| `workspace-invitation.service.ts` | assertEmailVerified on invite |
| `frontend: auth.service.ts` | verify/resend methods |
| `frontend: auth.models.ts` | emailVerified on UserProfile |
| `frontend: register.page.ts` | Redirect to check-email |
| `frontend: app.routes.ts` | New routes |
| `frontend: app-shell.ts` | Verify banner |
| `frontend: i18n/en.json, ar.json` | New strings |

## Reuse Opportunities

- Password reset token pattern (randomBytes → bcrypt hash → expiry scan)
- Subscription limit `ForbiddenException({ code })` pattern for EMAIL_NOT_VERIFIED
- Auth page layout (`auth-layout`, forgot-password success state)
- MailJet provider unchanged; only caller + templates new
- Existing `languagePreference` for email locale selection

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Complexity | Medium | Centralize assert in one service; inject into 7 services |
| Cross-module ripple | Yes | 7 backend services need one-line assert at create entry points |
| Migration | No | Legacy users: `assertEmailVerified` treats missing/`true` as verified; only explicit `false` blocks |
| getMe currently returns JWT payload | Low | Fix to load user + toProfileDto (needed for emailVerified anyway) |
| verify-email route auth | Low | Place as authenticated route OR public with token-only (public chosen per spec) |
| OAuth partial wiring | Low | Set emailVerified on oauthLogin path; Google OAuth controller may call oauthLogin separately — verify during implementation |

## Recommendation

- **Create:** EmailVerificationService, MailTemplateService, 4 HTML templates, 2 frontend pages, 2 auth endpoints
- **Complete:** Mail integration (templates folder per rules), User Registration flow
- **Modify:** AuthService register/oauth, 7 enforcing services, app shell, register redirect, plan docs

**Risk:** complexity M · cross-module Y · migration N
