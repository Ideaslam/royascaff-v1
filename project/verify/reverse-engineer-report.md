# Reverse-Engineer Report

## Generated: 2026-06-30
## Codebase: PayUp
## Overall Status: DRIFT DETECTED → **PARTIALLY REMEDIATED** (see `blueprint-review.md`)

---

## 1. Cross-Document Consistency

| Check | Status |
|-------|--------|
| Module Coverage | ✓ |
| Feature Coverage | ✓ |
| Service Coverage | ✓ |
| Endpoint-Service Linking | ✗ — transactions/dashboard use repos directly |
| Entity Consistency | ✓ |
| Endpoint-Page Linking | ✗ — placeholder pages, refund endpoint unverified |
| Auth Coverage | ✗ — no frontend admin guard |
| Custom Rules Compliance | ✗ — checkout calls gateway token APIs directly (RULE-002 documented) |
| UI State Coverage | ✗ — domains/reports placeholders lack states |
| Path and Naming Consistency | ✗ — frontend prod URLs vs `.env.prod` |
| Code Layering | ✗ — controllers → repos in transactions, notifications rules |
| Frontend Third-Party Isolation | ✗ — Moyasar/MyFatoorah from checkout |
| Self-Contained Blueprint | ✓ |

---

## 2. Documented & Implemented (✓)

| Category | Count | Notes |
|----------|-------|-------|
| Modules | 13 | incl. infrastructure + marketing |
| Features | 45+ | inline in modules.md |
| Entities | 28 | Mongoose models |
| Internal Services | ~35 | |
| External Services | ~15 | gateways, email, S3, OAuth, etc. |
| Endpoints | ~146 | active; 4 stub routers |
| Portal Pages | 30 | 2 placeholders |
| Checkout Pages | 3 | |
| Rules | 15 | RULE-001–015 |

---

## 3. Undocumented Code

| File / Path | Type | Description | Recommendation |
|-------------|------|-------------|----------------|
| `routes/public-api/v1/webhooks/*.controller.ts` | controller | Stripe/PayPal/Moyasar/MyFatoorah handlers | Add to plan when mounted; currently stub router |
| `routes/public-api/v1/payment-methods/` | router | Empty stub | Mark as TBD or remove |
| `routes/public-api/v1/checkout/ui/` | router | Empty stub | Mark as TBD |
| `routes/company-admin/admin.routes.ts` | router | Empty admin stub | Future admin panel |
| `middleware/api-key.ts` | middleware | apiKeyAuth not wired to routes | Investigate or remove |
| `models/VerificationOTP.ts` | schema | Legacy OTP model | Mark as legacy; Verification is primary |
| `client-sdk/` in API repo | shared | Legacy SDK build in API package | Document as superseded by payup-web-sdk |

---

## 4. Incomplete Features

| Feature | Module | What Exists | What's Missing | Recommendation |
|---------|--------|-------------|----------------|----------------|
| Reports page | Dashboard | Static dummy UI | API integration | Complete or remove nav item |
| Domains page | Tokens | Static dummy UI | API (logic in Tokens) | Remove page or wire to domain-verification |
| Gateway request edit | Gateways | Route `/edit/:id` | updateRequest not wired in form | Complete form edit flow |
| Delivery redeliver | Notifications | Endpoint stub | Implementation | Complete or remove button |
| Public payment webhooks | Payments | Service handlers | Routes not mounted | Mount or delete dead controllers |
| Admin panel | Infrastructure | Empty `/api/admin` | Full admin API + UI | Mark as TBD |
| Push notifications | Notifications | Channel stub | FCM/provider wiring | Mark as TBD |
| Google OAuth | Auth | Provider code | Empty env vars in dev | Configure or document disabled |
| Frontend prod URLs | Environments | `.env.prod` updated | Angular/SDK still legacy domains | Align environment files |

---

## 5. Architecture Violations

| Violation | File | Severity | Recommendation |
|-----------|------|---------|----------------|
| Controller → repository (no service) | `transactions/sessions.controller.ts` | MEDIUM | Extract TransactionsService |
| Controller → repository | `notifications.controller.ts` (rules/templates/deliveries) | MEDIUM | Extract NotificationRuleService etc. |
| Controller → repository | `dashboard.controller.ts` | LOW | Extract DashboardService |
| Frontend → third-party API | checkout Moyasar/MyFatoorah tokenization | HIGH (accepted) | Documented in RULE-002; PCI tradeoff |
| No frontend admin guard | `gateway-requests/admin` route | MEDIUM | Add AdminGuard matching API |
| CheckoutGuard bypassed | `checkout.guard.ts` | LOW | Re-enable or remove guard |
| Business logic in controller | Various merchant controllers | LOW | Refactor incrementally |

---

## 6. Stale/Dead Code

| File / Symbol | Type | Evidence | Recommendation |
|---------------|------|----------|----------------|
| `apiKeyAuth` middleware | unused export | Not imported in routes | Remove or wire to routes |
| Public webhook controllers | dead routes | Not in webhook.routes.ts | Mount or remove |
| `VerificationOTP` model | legacy | Superseded by Verification | Keep for migration; document legacy |
| `client-payup-example/public/sdk.js` | stale bundle | Old `/checkout/session` path | Rebuild from payup-web-sdk |
| README server/ paths | stale docs | References `server/routes/` | Update README to `src/routes/` |

---

## 7. Configuration Drift

| Issue | Details | Recommendation |
|-------|---------|----------------|
| Frontend prod API URL | portal: `payup-api.iilm.io`; checkout: `payup-api.e2community.org` | Update to `api.payupconnect.com` |
| Web SDK production URL | `api.payup.com` in config.ts | Update to `api.payupconnect.com` |
| `.env` committed | `.env.dev` identical to `.env` (local) | Ensure gitignore; no secrets in blueprint |
| Google OAuth | Empty CLIENT_ID in all env files | Configure or disable feature in UI |
| CORS vs frontend | prod CORS has control.payupconnect.com | Align portal deploy URL |

---

## 8. Reconciliation Summary

| Category | Count | Action Required |
|----------|-------|-----------------|
| Undocumented code items | 7 | 3 add to plan, 4 ignore/TBD |
| Incomplete features | 9 | 4 complete, 5 defer |
| Architecture violations | 7 | 0 critical fix-now, 7 refactor/defer |
| Stale/dead code items | 5 | 2 remove, 3 investigate |
| Configuration drift items | 5 | 5 fix before prod deploy |

---

## 9. Recommended Next Steps

1. **Align frontend prod environments** with `.env.prod` (`payupconnect.com` domains)
2. **Add AdminGuard** on `/gateway-requests/admin` or hide from non-admin menu
3. **Mount or remove** public webhook routes and dead middleware
4. **Extract service layer** for transactions and notification CRUD (Phase 5 change requests)
5. **Complete or remove** placeholder Domains and Reports pages
6. **Rebuild client-payup-example SDK** from current payup-web-sdk
7. **Proceed to Phase 5** (`change-mode.md`) for any new features using this blueprint

---

## Blueprint Artifacts Generated

| Document | Path |
|----------|------|
| Profile | `project/profile.md` |
| Description | `project/description.md` |
| Modules | `project/plan/modules.md` |
| Data model | `project/plan/data-model.md` |
| Roles & auth | `project/plan/roles-and-authorization.md` |
| Rules | `project/rules.md` |
| Backend services | `project/actions/backend/services/` |
| Backend endpoints | `project/actions/backend/endpoints/` |
| Portal pages | `project/actions/customer-portal/pages/` |
| Checkout pages | `project/actions/checkout/pages/` |
| This report | `project/verify/reverse-engineer-report.md` |

**Handoff:** Use Phase 5 (`engine/flows/change-mode.md`) for changes; Phase 6 for bugs.
