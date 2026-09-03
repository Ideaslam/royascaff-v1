# Pre-Build Plan Verification — Change 018

Run because the change touches 9 planning docs (threshold is ≥ 3). Scope: internal consistency of the updated plan only — no code checked here.

| # | Check | Result | Evidence |
|---|-------|:------:|----------|
| 1 | Feature coverage — new features have endpoints (BE) and pages (FE) | PASS | `modules.md` Module 11 feature 1 "Dashboard Analytics" [both] → EP-DB03…EP-DB10 in `endpoints/gateways.md` and the Dashboard Page entry in `pages/dashboard.md` |
| 2 | Service coverage — endpoints reference services that exist in the plan | PASS | All 8 new endpoints name `DashboardAnalyticsService.*`; SVC-DB02 is declared in `services/core.md` with all 8 methods (`getSummary`, `getTimeseries`, `getFunnel`, `getBreakdown`, `getFailures`, `getTopProducts`, `getHealth`, `listRecentSessions`) — 1:1 match |
| 3 | Data model consistency — every entity referenced exists | PASS | `Payment` (§8), `App` (§3), `Product` (§6), `Token` (§5), `Gateway` (§9), `Currency` (§15), `DomainVerification` (§13). No new entity introduced; `Money` is a response shape, not a collection |
| 4 | Endpoint–page linking — routes match | PASS | Each of the 9 widgets in `pages/dashboard.md` cites its endpoint ID; every ID EP-DB03…EP-DB10 is consumed, and EP-DB06 is used twice (`facet=status`, `facet=gateway`). No orphan endpoint, no widget without a source |
| 5 | Auth declarations — new endpoints declare auth | PASS | `endpoints/gateways.md` Dashboard module states `authMiddleware` + `merchantContext` for all, no role gate, with merchant isolation via `merchantId`-first filters citing RULE-017 |
| 6 | Custom rules coverage — new behaviors covered by a rule | PASS | FX-normalized reporting introduced as **RULE-025** and cross-referenced from `data-model.md` §8, `services/core.md` SVC-DB02, `endpoints/gateways.md`, `modules.md` Module 11, and `description.md` §8 |

## Consistency notes

- **Index ↔ query alignment**: the three `Payment` indexes in `data-model.md` §8 lead with `merchantId`, matching the `merchantId`-first filter contract in RULE-025 and the endpoint spec. `{merchantId, status, completedAt}` serves the revenue/success pipelines (which filter `status: completed` and bucket on `completedAt`); `{merchantId, appId, createdAt}` serves app-scoped funnel and session queries.
- **Deprecation recorded consistently**: EP-DB01 (endpoints), SVC-DB01 (services), and Module 11 feature 2 (modules) all describe the legacy path as deprecated-but-retained, with the same reason (back-compat for `api-docs`).
- **Money contract**: RULE-025 is additive to RULE-022 (integer minor units canonical) and RULE-023 (rates stored, never fetched inline) — it constrains *aggregation*, and explicitly forbids fetching a rate in a reporting request path, so no rule contradicts another.
- **`reportingCurrency` default `USD`** preserves the existing `reportingMoney()` display currency, so the deprecated EP-DB01 and the new EP-DB03 agree on currency labelling even though only EP-DB03 converts correctly.

## Open items carried into Step 5.4

1. `api-docs` OpenAPI is **not** updated by this change (EP-DB01 stays valid; the 8 new endpoints are additive). Flagged as a follow-up change, not a blocker for this one.
2. Mongoose `autoIndex` behavior in production must be confirmed before deploy so the three index builds don't run in the foreground on a large `Payment` collection.

**Overall: PASS** — plan is internally consistent; proceed to the Step 5.4 code gate.
