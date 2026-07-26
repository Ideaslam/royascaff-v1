# Verify Code — change-008-prop-v3-regen-translate

- **date**: 2026-07-26
- **result**: PASS
- **request-id**: REQ-PROP-V3 (part 5/8)

## Checks

| Acceptance | Evidence | Status |
|------------|----------|--------|
| Regenerate archives revisions + map→… | `ProposalRegenerateService` + `archiveRevision` (cap 5); clears sections/rendered/sectionMap; enqueues map | PASS |
| Translate fills contentByLang + assemble/export | `TranslateOrchestratorService` + `section.translate.v1.md`; fan-in → assemble | PASS |
| Sibling / template switch (no overwrite) | `createProposalFromProject` + `templateKey` + `fromStep`/`sourceProposalId`; pins `dnaVersion` | PASS |
| DNA regen does not mutate proposals until explicit | `enqueueRegenerateDna` bumps project DNA version only; proposals unchanged until regenerate `{ useLatestDna }` | PASS |
| Traces + ModelResolver fast for translate | `callClaudeJsonTraced` + `requestType: "translate"` → fast | PASS |
| Feature flag gates mutations | regenerate/translate/rerender + create-from-project via `isPipelineV3Enabled` | PASS |
| Formal template (best-effort) | Catalog seed `pitch-landscape-formal` reuses disk assets + token variant | PASS (partial assets) |
| Rerender assemble→export | `POST …/rerender` | PASS |
| Export idempotency language-aware | `isStepAlreadyDone(export)` checks `renderedByLang[lang]` | PASS |
| Assemble uses generation.language | `AssembleService` prefers generation.language + contentByLang filter | PASS |
| Legacy v2 untouched when flag off | create/mutations gated; `/ai-jobs` unchanged | PASS |
| Build | `npm run build` exit 0 | PASS |

## Gaps / notes

- Live Claude/Redis/S3 e2e not run in this verify.
- `pitch-landscape-formal` shares `templates/pitch-landscape/v1` disk assets (theme tokens differ in catalog).
- HTTP returns JSON immediately (async queue); not strict HTTP 202 status code.

## Verdict

**PASS** — ready for merge gate (Step 5.6).
