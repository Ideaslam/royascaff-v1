# Plan Verification — change-006-workspace-onboarding

## Checks

### 1. Change-request ↔ recon.md consistency

| CR requirement | Recon finding | Status |
|---------------|---------------|--------|
| Workspace auto-create on register | `AuthService.register()` — no workspace creation exists | OK — change required |
| JWT carries workspace context | JWT payload `{ sub, email, role }` only | OK — change required |
| Dynamic workspace-prefixed collections | Static `csvfiles`, `dashboards`, etc. | OK — change required |
| Subscription billing per-workspace | `UserSubscription.userId` unique | OK — change required |
| Invitation email via Mailjet | `MAIL_PROVIDER` MailjetProvider exists | OK — reuse |
| Logo stored in R2 | `STORAGE_PROVIDER` R2StorageProvider exists | OK — reuse |
| Onboarding 4-step wizard at `/onboarding` | No `/onboarding` route exists | OK — create required |
| Admin workspace page | No workspace page in admin panel | OK — create required |
| Admin color templates page | No color templates in admin | OK — create required |
| No data migration | Confirmed by user | OK |

### 2. Planning doc completeness

| Document | Status |
|---------|--------|
| `change-request.md` | Written — scope, AC, 13 acceptance criteria |
| `recon.md` | Written — full inventory, impact map, risks |
| `modules.md` | Updated — modules 18 (Workspace), 19 (Onboarding), Admin 18–19 appended |
| `data-model.md` | Updated — 6 new entities, modified User/UserSubscription/Payment, dynamic collection pattern |
| `services.md` | Updated — WorkspaceService, WorkspaceMemberService, WorkspaceInvitationService, WorkspaceBrandingService, OnboardingService, ColorTemplateService; AuthService changes noted |
| `endpoints.md` | Updated — 20+ new endpoints for Workspace, Onboarding, ColorTemplates, Admin Workspace |
| `customer-portal/pages.md` | Updated — Onboarding wizard page, 3 settings pages, AppShell changes, new services |
| `admin-panel/pages.md` | Updated — Workspaces page, Color Templates page, AppShell nav, new services |

### 3. Architecture design verification

| Design decision | Verdict |
|----------------|---------|
| Dynamic Mongoose collection pattern (getModel per workspace slug) | Sound — `connection.models[name]` cache prevents duplication; tested pattern |
| Pass `workspaceSlug` as explicit method param (not request-scope DI) | Sound — avoids REQUEST-scope cascade; controllers extract from `@CurrentUser()` |
| JWT carries `workspaceSlug` | Sound — avoids DB lookup on every request just for slug; slug is validated during token issuance |
| `WorkspaceInvitation.accept` is public endpoint | Sound — invite accept must work without prior authentication |
| Subscription unique index: per-workspace (`workspaceId` unique) | Sound — one active subscription per workspace, not per user |
| Onboarding progress is DB-tracked (not session-based) | Sound — required for browser-close resume (CR requirement) |
| Color templates managed by admin, selected by workspace | Sound — separation of concerns (admin defines catalog, workspace applies) |
| Workspace deletion drops all `ws_{slug}_*` collections | Sound — clean isolation; no risk of leftover data |

### 4. Acceptance criteria coverage

| AC | Planning coverage |
|----|------------------|
| 1. Register → workspace + membership + onboarding created, redirectTo: '/onboarding' | AuthService.register() modifications in services.md |
| 2. onboardingGuard redirects to /onboarding if step 1 not complete | customer-portal/pages.md — guard section |
| 3. Slug auto-generated; slug-availability check; user-editable | WorkspaceService.checkSlugAvailability; endpoints.md |
| 4. JWT carries workspace context; switch re-issues tokens | JwtStrategy changes + POST /workspaces/switch endpoint |
| 5. Dynamic workspace-prefixed collections for data queries | data-model.md dynamic collection section |
| 6. workspaceId on subscriptions; only workspace-owner can subscribe | data-model.md UserSubscription modification |
| 7. Invitation email + accept link flow | WorkspaceInvitationService; GET /workspaces/invitation/accept public endpoint |
| 8. Multi-workspace; switcher UI; token re-issue on switch | WorkspaceService.switchWorkspace; AppShell switcher |
| 9. Workspace deletion with typed-name confirmation | WorkspaceService.deleteWorkspace; workspace settings page |
| 10. 4-step wizard with skip buttons; two-column layout | onboarding.page.ts spec in pages.md |
| 11. Color templates by admin; applied to chart renders | ColorTemplateService + admin page + branding section |
| 12. Admin /app/workspaces list | Admin Workspaces page spec |
| 13. Sample CSV seeded; step 4 uses it | OnboardingService + SampleCsvSeeder |

All 13 acceptance criteria are covered in planning documents.

### 5. Risk review

| Risk | Mitigation in plan |
|------|-------------------|
| Dynamic model caching collision | `connection.models[name]` check pattern in data-model.md |
| JWT size increase | Only 3 extra scalar fields — acceptable |
| All service method signatures change | Explicit parameter pattern — no request-scope cascade |
| Slug uniqueness during concurrent registrations | Unique DB index + retry in slug generator |
| Invitation to non-registered email | Accept endpoint handles: creates pending membership awaiting registration |

### 6. Verdict

**Plan is complete and internally consistent.** Ready to proceed to Step 5.4 implementation.
