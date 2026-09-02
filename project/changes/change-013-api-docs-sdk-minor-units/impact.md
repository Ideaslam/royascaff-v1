# Impact Analysis — OpenAPI Specs + Web SDK to Minor Units

Change: `change-013-api-docs-sdk-minor-units` · Repos: `api-docs`, `payup-web-sdk` · Depends on: change-011 ✓, change-012 ✓

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Public spec | **complete** | `api-docs/openapi/payup-public.yml` (1,079 lines) | 11 money properties typed `number`; no `Money` schema; flat `CurrencyConversion` |
| Merchant spec | **complete** | `api-docs/openapi/payup-merchant.yml` (5,440 lines) | 26 money properties typed `number`; `exchangeRateToUSD` in 3 currency schemas; 3 money responses untyped |
| Admin spec | **none** | — | Does not exist; admin excluded by policy (`scripts/route-checklist.md:30`) |
| `Money` schema | **none** | — | Must be created in both files |
| Example pinning | **complete** | `api-docs/scripts/pin-request-examples.py` (53 KB) | 13 hardcoded money/rate values; rewrites specs in place; not run by build |
| Spec validation | **none** | `api-docs/package.json` | No Redocly/Spectral/swagger-cli; no CI workflow in repo. Nothing caught the drift |
| Docs pages | **complete** | `api-docs/docs/intro.md`, `docs/web/overview.md` | No numeric money values — no change needed |
| SDK request payload | **complete** | `payup-web-sdk/src/services/PaymentSessionManager.ts:35–39` | Sends `storeCode` + `quantity` only — **no money** |
| SDK response types | **complete** | `payup-web-sdk/src/types.ts:26–31` | `SessionResult` has no money fields |
| SDK dead validators | **complete** | `payup-web-sdk/src/utils.ts:20–28` | `validateAmount`, `validateCurrency`, `VALID_CURRENCIES` — **zero call sites** |
| SDK tests | **none** | — | No `*.test.*` / `*.spec.*` files in the repo |

**Feature state**: `complete` — both specs fully describe the pre-012 contract. This is a modification, not a build-out. The exception is spec validation, which is `none` and is being created.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **Payments** | Session create/detail money → `Money`; refund `amount` → `amountMinor`; session stats `totalRevenue` → `Money` |
| **Core — Products** | 10 `*Input` price fields → `*Minor` integers; 4 response fields → `Money`; `currency` becomes required |
| **Core — Currencies** | `exchangeRateToUSD` → `rateFromUsd` + 4 new provenance fields; convert request → `amountMinor`; convert response newly typed |
| **Core — Customers** | `payments[].amount` newly typed as `Money` |
| **Apps** | `AppPaymentSettings` min/max → `*Minor` integers |
| **Gateways** | `GatewayRuleTestInput.context.amount` example → `amountMinor` |
| **Reports** | `DashboardReport` schema created from scratch |
| **Web SDK** | Dead-code removal + version bump only |

---

## Plan Docs to Update

- [ ] None required.

Change-012 already brought `actions/backend/endpoints/*.md` and `actions/backend/services/*.md` in line with the implemented backend. This change makes the **published spec** match those docs. Criteria 25–27 treat the action docs as the source of truth and the spec as the thing being corrected — if a mismatch surfaces, the fix goes in the spec.

`api-docs` and `web-sdk` have no `project/actions/<app-key>/` folder (`profile.md`: "web-sdk has no actions folder — SDK surface documented under consuming apps"), so there is no page/view spec to update either.

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `openapi/payup-public.yml` → `components.schemas.Money` | Shared money object (new schema, existing file) |
| `openapi/payup-merchant.yml` → `components.schemas.Money` | Same, duplicated — no cross-file `$ref` mechanism exists |
| `openapi/payup-merchant.yml` → `DashboardReport` | Types the `GET /reports/dashboard` response (was `additionalProperties: true`) |
| `openapi/payup-merchant.yml` → `ConvertCurrencyResponse` | Types the convert response (was `additionalProperties: true`) |
| `openapi/payup-merchant.yml` → `CustomerPaymentListItem` | Types `payments[]` (was `additionalProperties: true`) |
| `api-docs/redocly.yaml` | Lint config for the new `validate` script |

### Modify — `api-docs` (4 files)

| File | Scope |
|------|-------|
| `openapi/payup-public.yml` | 11 money properties, `CurrencyConversion`, 3 examples, 1 new KWD example |
| `openapi/payup-merchant.yml` | 26 money properties, `CurrencyConversion`, 3 currency schemas, 9 examples, 3 new response schemas |
| `scripts/pin-request-examples.py` | 13 hardcoded values at lines 604, 867, 1000–1011, 1018–1024, 1419, 1431, 1435, 1488–1489, 1501, 1510–1511, 1514 |
| `package.json` | Add `validate` script; make `build` depend on it |
| `scripts/route-checklist.md` | Append change-013 verification row |

### Modify — `payup-web-sdk` (3 files)

| File | Scope |
|------|-------|
| `src/utils.ts` | Delete `validateAmount`, `validateCurrency`, `VALID_CURRENCIES` (lines 20–28 + constant) |
| `src/models/PaymentModel.ts` | Comment on `toJSON()` recording the deliberate money-free boundary |
| `package.json` + `src/config.ts` | Version `3.0.0` → `3.0.1` in both — they must not drift |

**Total: ~6 created (5 schemas + 1 config), ~8 modified.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| Spec money properties change | `pin-request-examples.py` | Must be edited in the **same commit**; criterion 17 asserts a zero diff on re-run |
| `Money` schema added to `components` | Redoc rendering of ~20 endpoints | Verified by criterion 20 — samples must expand the object, not show `{}` |
| `CurrencyConversion` restructured | 3 `$ref` sites (public 821–825, 920–924; merchant 4908–4912) | `$ref` targets are unchanged; only the schema body changes — no call-site edits |
| `exchangeRateToUSD` removed | 8 spec locations + 6 script locations | Full sweep; criterion 10 is a repo-wide grep |
| `validate` added to `build` | Netlify deploy (`netlify.toml`: `npm run build`) | An invalid spec now fails the deploy — intended, but it is a new failure mode |
| SDK version bump | `payup-stack/package.json` `sdk:build` scripts, `dist/{local,dev,prod}` bundles | Rebuild all three; no consumer pins the version |
| SDK dead code removed | Nothing | Confirmed zero call sites |

**Not a ripple**: `payup-frontend-checkout` does not import the SDK (grep: zero references). The portal and admin `copy:sdk` scripts pull from `payup-api-typescript/dist/sdk/`, not from this repo.

---

## Reuse Opportunities

- **Naming conventions are already established** — `*Input` for create bodies, `*UpdateInput` for updates, PascalCase nouns for responses. `Money`, `DashboardReport`, and `ConvertCurrencyResponse` all fit without inventing a pattern.
- **`CurrencyConversion` already exists in both files** with identical bodies. Restructuring it is a single edit applied twice, and it establishes the `Money`-composition pattern that the rest of the conversion follows.
- **`pin-request-examples.py` already has a `SCHEMA_EXAMPLES` dict** (lines 1470–1517) that centralizes most injected examples. Updating that dict covers 6 of the 13 hardcoded values in one place.
- **`scripts/route-checklist.md` already tracks per-route verification** from change-008. Extending it is cheaper than inventing a verification artifact.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| 3 money-bearing responses are `additionalProperties: true` — invisible to the spec | Type them now; change-015 consumes all three |
| No spec validation anywhere in the repo or CI | Add Redocly `validate`, wire into `build` |
| `pin-request-examples.py` is an undeclared second source of truth | Updated in lockstep; criterion 17 pins the two together |
| SDK carries validators for a money surface it does not have | Deleted |
| `info.version` is `1.0.0` on both specs and has never moved | Left alone — versioning the specs is a separate decision, noted not fixed |
| `api-docs` `package.json` version is `0.0.0` | Left alone, same reason |

---

## Risk

**Complexity: MEDIUM · Cross-module: YES (documentation-wide) · Migration: NO**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| Script reverts the specs on a later run | High | Criterion 17 — zero diff on re-run is the acceptance test |
| A nested or inline money property is missed | Medium | Criterion 2 is a negative assertion over both files, not a count; the 7 properties added over the original estimate were all nested or inline |
| `exchangeRate` gets converted to `Money` by a well-meaning sweep | Medium | Criterion 4 asserts it stays a float; RULE-023 cited in the description |
| Redocly lint rejects the existing specs on first run for unrelated pre-existing issues | Medium | Configure `redocly.yaml` to the ruleset the current specs already satisfy, then tighten later — do not let unrelated lint debt block the migration |
| New `build`-time validation breaks the Netlify deploy | Low | Intended behaviour; verified locally before merge |
| SDK bundle rebuild breaks a merchant storefront | Low | No behavioural change — only dead code removed |
| Version drift between `package.json` and `Config.VERSION` | Low | Criterion 24 checks both |

**No runtime risk.** Nothing in production imports these specs, and the SDK change is dead-code removal. This is the safest change in the train, which is why it goes first.

---

## Recommendation

- **Create** — `Money` schema ×2, `DashboardReport`, `ConvertCurrencyResponse`, `CustomerPaymentListItem`, `redocly.yaml`
- **Complete** — spec validation (currently absent entirely); the three `additionalProperties: true` money responses
- **Modify** — 37 money properties across 2 specs, 12 examples, 3 currency schemas, `pin-request-examples.py` (13 values), `package.json` ×2, `route-checklist.md`, SDK `utils.ts` / `PaymentModel.ts` / `config.ts`
- **Ripple** — Redoc rendering, Netlify build, SDK bundles

**Sequence within the change**: `Money` schema first → response `$ref`s → request `*Minor` renames → `CurrencyConversion` → change-011 currency fields → the three new response schemas → examples → `pin-request-examples.py` → run the script and confirm zero diff → add validation → SDK cleanup.

**Line-number caveat**: every citation was captured on the current `feat/minor` working tree. The two specs are edited heavily by this change, so later anchors shift as work proceeds. Re-locate by schema name, not by line.
