# Merge Report — change-20260805-144725-contract-template-pdf-system

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: `verify-code.md` Overall PASS (including post-verify PDF design fix round, user-confirmed live)

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: `contracts` +`templateId`/`notes`; new `## 10a. contract_templates` section (global catalog + token catalog); `+contract_templates` row in Repository/collection map |
| `project/plan/modules.md` | in-place: Contracts module (§7) +features 3 "Contract Templates" and 4 "Contract PDF export" |
| `project/plan/roles-and-authorization.md` | in-place: `+contract-template.manage` permission (category `contracts`); +2 endpoint-access rows (GET open / mutate gated) |
| `project/actions/api/endpoints/contracts.md` | merged EP-CONTRACTS-04/05 after-state notes (`templateId`/`notes`); +EP-CONTRACTS-10 (`POST :id/pdf`) |
| `project/actions/api/endpoints/contract-templates.md` | **new file** — EP-CONTRACT-TEMPLATES-01..06 |
| `project/actions/api/endpoints/_index.md` | Contracts → 10/10; +Contract Templates row 6/6 |
| `project/actions/api/services/contracts.md` | merged SVC-CONTRACTS-01 after-state (new deps/notes); +SVC-CONTRACTS-02 `ContractPdfService` (as-built: text-only repeating header, base64 logo inlining, `@page`-margin-conflict fix — reflects the post-verify fix round, not the original plan) |
| `project/actions/api/services/contract-templates.md` | **new file** — SVC-CONTRACT-TEMPLATES-01 |
| `project/actions/api/services/_index.md` | Contracts → 2/2; +Contract Templates row 1/1 |
| `project/actions/api/services/pipeline-v3-foundations.md` | merged SVC-PIPEV3-07 (`PdfRenderService`) after-state — new `displayHeaderFooter`/`headerTemplate`/`footerTemplate`/`margin` options, backward compatible |
| `project/actions/web/pages/contracts.md` | merged PG-CONTRACTS-01 (create dialog Template/Notes) and PG-CONTRACTS-02 (Notes field, Download PDF button) after-state |
| `project/actions/web/pages/contract-templates.md` | **new file** — PG-CONTRACT-TEMPLATES-01/02 + `AppDataService`/`app.models.ts`/i18n deltas |
| `project/actions/web/pages/_index.md` | Contracts row purpose note; +Contract Templates row 2/2 |
| `project/status.md` | Snapshot: api services 86/88→88/90, endpoints 136/137→143/144; web pages 34/34→36/36; By-Module: Contracts 1/1→2/2 services, 9/9→10/10 endpoints; +Contract Templates row 1/1 · 6/6 · 2/2 |

## Skipped (unchanged)

- `project/rules.md`, `project/description.md`, `project/profile.md` — no changes needed (no new app/repo, no new rule/constraint introduced beyond what's already covered by existing "flexible schema" / "guards" conventions)
- `project/actions/web/pages/settings.md` — Contract Templates is its own top-level nav entry (`/contract-templates`), not nested under `/settings`, per the actual shipped routes; no delta needed here

## Post-merge checks

- [x] Main `_index.md` Done/Total updated for touched modules (endpoints, services, pages)
- [x] No leftover `change-*` sections appended to main files — all deltas merged in-place as after-state
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + `change-request.md` metadata set to `merged`

## Known pre-existing drift (not part of this merge)

`project/status.md`'s By-Module table sums don't reconcile exactly to the Snapshot row for `api` services/endpoints (off by ~9/~1 respectively, present before this pack too) — historical drift unrelated to this change, left as-is to avoid scope creep; flagged here for a future audit/cleanup pack.
