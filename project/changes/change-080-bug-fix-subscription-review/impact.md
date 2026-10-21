# Impact Analysis — change-080 Subscription review bug-fix bundle (bugs 051–054, 056–059)

Recon source: four read-only module reviews (2026-10-21) + direct code reads. Paths relative to repo roots (`api` = roya-ai-dynamo-api/src, `web` = roya-ai-dynamo-frontend/src/app, `admin` = roya-ai-dynamo-frontend-admin/src/app).

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Payment attempt settle / expiry | partial | `api/modules/payments/services/payment-checkout.service.ts:67-127,316-374,477-506`; `repositories/billing-invoice.repository.ts:79-97` | EXPIRED→PAID impossible; no poller; new attempt per key; 11000 → 500; legacy confirm lacks amount check |
| Manual settlement | partial | `api/modules/payments/services/payments.service.ts:71-102` | attempt created before invoice validation; `reason` optional |
| Payment schema | complete | `api/modules/payments/schemas/payment.schema.ts` (`failureCode` string) | need `refund_required` / `duplicate_payment` codes (string values, no enum change) |
| Renew endpoint | none | `api/modules/subscriptions/controllers/subscriptions.controller.ts` | no `POST /subscriptions/renew` |
| Renewal invoice creation | partial | `api/modules/subscriptions/services/subscription-lifecycle.service.ts` `ensureRenewalInvoice`, `setAutoRenew`, boundary branch | only job-driven; no post-expiry renewal; no auto-renew-off expiry email |
| Customer subscriptions page | partial | `web/pages/subscriptions/subscriptions.page.ts:48-66,104-107,280-288,542-544`; `web/core/interceptors/auth.interceptor.ts:26-28`; `web/pages/data/setup/connect/csv-connect.component.ts:194-195` | no Renew/Pay CTA in banner, no member message, no processing banner, raw lock errors |
| Quota reservation / release | partial | `api/modules/subscriptions/services/subscription-limit.service.ts`; `repositories/subscription-usage-period.repository.ts` (`release` exists, no callers) | callers reserve before validation and never release |
| Callers | partial | `api/modules/data/services/sync.service.ts:69-108`; `data/services/scheduled-sync.service.ts:56`; `data/services/data.service.ts:66,150,234`; `dashboards/services/dashboards.service.ts:107,252,276-330,436`; `pipelines/steps/load.step.ts:171`; `pipelines/streaming/streaming-sync.coordinator.ts:72`; `data/processors/data-sync.processor.ts:265` | ordering, release, scheduled-sync quota, retry on limit |
| Retirement successor | partial | lifecycle `:609-672`; `subscription-catalog.service.ts:153-202`; `subscription.repository.ts:257-290` | `replacesPlanId` unused; cancel-retirement keeps unpublished; default-Free package archivable |
| Limit sentinel | complete (wrong semantics) | limit service `:80,245-252`; usage repo `consume`; `dto/subscription.dto.ts:72-94`; admin `pages/admin/packages/packages.page.ts` | `0` = unlimited |
| Admin activate/deactivate/update | partial | `api/modules/subscriptions/services/subscriptions.service.ts:335-447,567-634`; `dto/subscription.dto.ts:115-140`; admin `pages/admin/subscriptions/subscriptions.page.ts:251-259,340-364,936-945` | status not restored; legacy PUT path |
| Void/refund/chargeback | partial | `api/modules/payments/services/billing-invoice.service.ts:177-215`; `billing-invoice.repository.ts:19-35` | no entitlement effect; voided renewal returned forever |
| Extra-user invoice | partial | `api/modules/workspace/services/workspace-invitation.service.ts:224-230`; lifecycle `applyExtraUserInvoice` | revoke doesn't void; mail failure throws |
| Migrations | complete | `api/database/migrations/run.ts` (001–003 registered) | next id **005** (changelog references a `004-subscription-period-backfill` not present in this checkout — drift; 005 avoids a ledger id collision) |

Feature state: **partial** across all areas (modify / complete in place; one create: renew endpoint, payment poller job, migration 005).

## Affected Modules
- **Subscriptions** — renew endpoint + lifecycle (renew window, auto-renew re-enable, expiry email, successor renewal, PLAN_RETIRED source, void replacement, refund flag), limit sentinel + missing-usage code, release API, admin activate/deactivate/update DTOs, catalog guards.
- **Payments** — late settle, poller job, attempt reuse, duplicate flag, 409 on key reuse, manual settlement validation, legacy confirm check, refund/chargeback effect, INACTIVE pay block.
- **Data / Pipelines** — validate-then-reserve, release on failure, scheduled syncs excluded from daily count, chunk release, unrecoverable limit errors.
- **Dashboards** — reserve ordering, dashboard cap = existing count, duplicate/widget lock coverage.
- **Workspace** — revoke invite voids extra-user invoice.
- **customer-portal** — subscriptions page CTAs/banners, lock error mapping (EN/AR).
- **admin-panel** — Activate visibility, create/edit form fields, package "Unlimited" toggle, payments review list filter.

## Plan Docs to Update
- [ ] `plan/data-model.md` — limit sentinel (-1/0/>0); `UserSubscription.previousStatus`, `reviewRequired`/`reviewReason`; payment `failureCode` values; period source `PLAN_RETIRED`; usage period source unchanged.
- [ ] `plan/modules.md` — Subscriptions features: Renew now, successor renewal; Payments: pending re-verification.
- [ ] `actions/backend/endpoints/subscriptions.md` — `POST /subscriptions/renew`; activate/deactivate/update/create DTO changes; pay rejects INACTIVE.
- [ ] `actions/backend/endpoints/payments.md` — manual settlement `reason` required; refund/chargeback effects; 409 key reuse.
- [ ] `actions/backend/endpoints/dashboards.md`, `data.md` — ordering/lock notes on duplicate/widgets.
- [ ] `actions/backend/services/subscriptions.md`, `payments.md`, `data.md`, `dashboards.md`, `pipelines.md`, `background-jobs.md` — new/changed methods and the poller job.
- [ ] `actions/customer-portal/pages/subscriptions.md` — renew/pay CTA, banners, member message.
- [ ] `actions/admin-panel/pages/subscriptions.md`, `packages.md`, `payments.md` — Activate visibility, fields, Unlimited toggle, review list.
- [ ] `rules.md` — RULE-GLOBAL-007 (release on failure; scheduled syncs not counted daily; dashboards cap existing), Subscriptions "Upgrade, Downgrade, Renewal" (renew window, successor renewal, refund policy), Billing reliability (late settle, poller, duplicate).

## Risk
- Complexity **H** (8 bugs, 6 modules, 3 apps), cross-module **Y**, migration **Y** (limit sentinel 0 → -1, idempotent, via `schema_migrations` ledger).
- Highest-risk items: sentinel semantics (every limit read path must agree — limit service, usage repo `consume`, envelope, both frontends) and successor renewal pricing (customer-visible).

## Recommendation
- **Create**: `POST /subscriptions/renew` + `SubscriptionLifecycleService.renewNow`; `payment-attempt-reverify` repeatable job; migration `005-limit-unlimited-sentinel`; `SubscriptionLimitService.release`; i18n keys (EN/AR) for new UI strings.
- **Complete in place**: settle/expiry logic, reservation ordering + release in all callers, successor resolution (`replacesPlanId`/`familyKey`), admin activate/deactivate, void/refund handling, revoke-invite void.
- **Modify (ripple)**: customer subscriptions page, CSV connect + interceptor, admin subscriptions/packages/payments pages, DTOs, existing unit specs and `test/subscription-due-transitions.e2e-spec.ts` fixtures (limits now `-1` for unlimited).
