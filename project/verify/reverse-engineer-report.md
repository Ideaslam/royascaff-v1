# Reverse-Engineer Report

## Generated: 2026-07-26
## Codebase: Roya Safqa (`roya-sales-ai-api-v2` + `roya-sales-ai-frontend`)
## Overall Status: DRIFT DETECTED

---

## 1. Cross-Document Consistency

### Module Coverage: ✓
### Feature Coverage: ✓
### Service Coverage: ✓
### Endpoint-Service Linking: ✓
### Entity Consistency: ✓
### Endpoint-Page Linking: ✓
### Auth Coverage: ✗
- Web MainLayout `authGuard` commented out (`app.routes.ts`) — pages rely on interceptor/401 only.
- Seeded permissions (`client.*`, `proposal.*`, `roles.manage`) enforced on FE via `*appHasPermission` but **not** mirrored with `PermissionGuard` on most data CRUD controllers (only user mutate + settings.manage + admin user paths).

### Custom Rules Compliance: ✗
- RULE: FE route protection must use authGuard — violated (documented in `rules.md`).
- RULE: permission keys should gate sensitive mutations server-side — partial violation.

### UI State Coverage: ✓
- Documented at page level; detailed empty/error matrices not exhaustively verified per component (acceptable for R pass).

### Path and Naming Consistency: ✗
- Minor: services endpoint registry previously claimed EP-SERVICES-01..07 with 6 endpoints (corrected in reconciliation).
- Dual field names on services (`scope_of_work` / `scopeOfWork`) reflected in data-model.

### Code Layering: ✓ (with notes)
- Controllers generally delegate to services; creative pipeline / jobs are domain-heavy but isolated under `creative-pipeline/` + `JobsService`.
- Mongo repositories are schema-less (`strict: false`) — intentional legacy pattern; flagged as tech debt, not layering break.

### Frontend Third-Party Isolation: ✓
- FE calls only `environment.apiBaseUrl` + `/api/*`. Claude/Mailjet/WhatsApp/S3 stay on API.

### Self-Contained Blueprint: ✓
- System facts live in `project/`; engine untouched.

### Build Status Coverage: ✓
- Artifacts carry `done`/`partial`; OpenAI stub is the only intentional `partial` service/endpoint.

---

## 2. Documented & Implemented (✓)

| Category | Count | Notes |
|----------|-------|-------|
| Modules | 11 | plan/modules.md |
| Features | ~30 | inline in modules |
| Entities / collections | 14 | data-model.md |
| Internal Services | ~30 | + 5 external integrations |
| External Services | 5 | Claude, S3/R2, Mailjet, WhatsApp, Redis |
| Endpoints | ~100 | under `/api` (not `/api/v1`) |
| Pages/Views | 24 | Safqa Web |
| Rules | 10+ | rules.md |

---

## 3. Undocumented Code

| File / Path | Type | Description | Recommendation |
|-------------|------|-------------|----------------|
| `src/creative-pipeline/**` internals | utility/pipeline | Fully covered at orchestrator level; individual prompt/manifest files not per-file in blueprint | Accept / tech debt — keep module-level docs |
| `src/common/**` filters/pipes/interceptors | middleware | Tenant interceptor, validation setup | Accept — referenced via auth/infra |
| `src/lib/**` helpers | utility | query helpers, dashboard period, entity-id | Accept |
| `jspdf` / `html2canvas` / `pdfjs-dist` in FE package.json | dependency | Little/no src usage | Investigate / Remove unused deps (optional pack later) |
| Admin `GET /api/admin` landing | endpoint | Documented EP-ADMIN-01 | Keep |

---

## 4. Incomplete Features

| Feature | Module | What Exists | What's Missing | Recommendation |
|---------|--------|-------------|----------------|----------------|
| OpenAI provider | AI | `POST /api/ai/openai` + `callOpenAI` | Always throws "not configured" | Mark deferred / remove or implement later |
| Gemini provider | AI | Seed `aiProviders.gemini` | No runtime path | Deferred |
| Web route auth | Auth | authGuard + interceptor | Guard not applied on MainLayout | **Fix in code** (REQ-R pack) |
| Server PDF | Proposals | FE `window.print` | Puppeteer/server PDF | Deferred to product refactor (`docs/refactor-proposal-generator.md`) — not REQ-R |
| Creative pipeline v3 | Creative | v2 batches working | DNA/templates/PDF goals in refactor doc | New feature program (Phase 5), not Phase R gap |

---

## 5. Architecture Violations

| Violation | File | Line(s) | Severity | Recommendation |
|-----------|------|---------|----------|----------------|
| MainLayout authGuard disabled | `roya-sales-ai-frontend/src/app/app.routes.ts` | ~42 | HIGH | Fix — enable `canActivate: [authGuard]` |
| Permission keys FE-only for clients/proposals/roles/services mutations | `modules/data/*.controller.ts` (clients, proposals, roles, permissions, services, contracts) | various | HIGH | Fix — add `PermissionGuard` parity with seed + FE |
| Schema-less Mongo persistence | `mongodb-generic.repository.ts` | flexibleSchema strict:false | MEDIUM | Accept as current architecture / tech debt |
| Hardcoded fallback defaults in `environment.ts` | `src/config/environment.ts` | various | MEDIUM | Fix — prefer fail-fast; add `.env.example` |
| Business rules in creative pipeline outside classic Nest module tree | `src/creative-pipeline/` | — | LOW | Accept — documented as module |

---

## 6. Stale/Dead Code

| File / Symbol | Type | Evidence | Recommendation |
|---------------|------|----------|----------------|
| `callOpenAI` | stub | always throws | Keep stub or remove endpoint — deferred |
| FE pdfjs/jspdf/html2canvas | unused deps | no src imports found in prior scan | Investigate / remove |
| `@nestjs/config` unused | unused dep | ConfigModule absent | Investigate |
| `@types/passport` without Passport | unused type | no Passport strategies | Investigate |

---

## 7. Configuration Drift

| Issue | Details | Recommendation |
|-------|---------|----------------|
| No `.env.example` | Env surface only in `environment.ts` + deploy secrets | Add `.env.example` (REQ-R pack) |
| Hardcoded fallback secrets/defaults | `environment.ts` bootstrap defaults for AWS/Mailjet | Remove defaults in prod paths; document required vars |
| Claude key not in env | By design — workspace settings encrypted | Keep; document in profile ✓ |
| `ENVIRONMENT` used in Docker/k8s | Not always in `environment.ts` | Document — accept |

---

## 8. Reconciliation Summary

| Category | Count | Action Required |
|----------|-------|-----------------|
| Undocumented code items | 5 | 0 add, 5 accept/investigate |
| Incomplete features | 5 | 1 fix now (auth guard), 1 API perms fix, 3 defer |
| Architecture violations | 5 | 2 high fix (REQ-R), 3 accept/medium |
| Stale/dead code items | 4 | investigate later |
| Configuration drift items | 4 | 1 pack (env example), rest document |

### Dispositions

| Item | Action |
|------|--------|
| Enable web authGuard | **Fix in code** → `change-20260726-000001-r-enable-web-auth-guard` |
| API PermissionGuard parity | **Fix in code** → `change-20260726-000002-r-api-permission-parity` |
| Add `.env.example` | **Fix in code** → `change-20260726-000003-r-env-example` |
| OpenAI/Gemini stubs | **Mark as tech debt / deferred** in status.md |
| Server PDF / pipeline v3 | **Out of REQ-R** — use Phase 5 against `docs/refactor-proposal-generator.md` |
| Schema-less Mongo | **Accept** (document) |
| Unused FE PDF deps | **Investigate** (optional later pack) |
| Endpoint count typo SERVICES | **Add to plan** — registry count fixed |

---

## 9. Recommended Next Steps

1. Implement **REQ-R** packs in order via `/change-mode` starting with `change-20260726-000001-r-enable-web-auth-guard`.
2. Harden API permission guards to match FE + seed keys.
3. Add API `.env.example` for onboarding.
4. Keep OpenAI/Gemini and server-PDF work out of emergency security packs — schedule as product changes.
5. Do not re-run Phase R unless onboarding a different codebase.
`)