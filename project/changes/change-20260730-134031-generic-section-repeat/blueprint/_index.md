# Blueprint Index — change-20260730-134031-generic-section-repeat

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact. Isolation: do not edit main plan/actions until merge.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| service | `actions/api/services/pipeline-sections-engine.md` | MapOrchestrator listSplit/clamp/validate | done | 1/1 | catalog-attribute-driven repeat (any `repeatable` key) |
| service | `actions/api/services/templates.md` | `pdf-list-split.ts`, website lock, `social_audit` flag | done | 1/1 | derive capacity from catalog; generic landing lock; enable `social_audit` split |

**Pack Done/Total**: 2/2

### Implementation note (found during implementation, not in original blueprint)
`competitor_analysis` was already `repeatable: true` but for a structurally different reason (DNA competitor cardinality, not overflow) and was deliberately excluded from the old allowlist. A naive `repeatable === true` generalization would have wrongly clamped it to 1 and wrongly locked it on website. Fixed by:
- Adding `ENTITY_DRIVEN_REPEAT_KEY_SET` (currently just `competitor_analysis`) in `pdf-list-split.ts`, excluded from the generic overflow-repeat clamp/validate/website-lock everywhere.
- Correcting `competitor_analysis.pages.max` from `1` → `3` in `pitch-landscape.catalog.ts` to match its real ceiling (`Math.min(3, competitors.length)` in `research-coverage.gate.ts`) — a latent pre-existing inconsistency surfaced while generalizing this code, not a behavior change (it was never enforced/clamped either way).

## Out of pack

- Auto-numbering `(i/N)` titles in code (stays AI-authored)
- Automatic height/word-count overflow detection (stays AI judgment + capacity hints)
- Flipping `repeatable` on other research keys (`market_analysis`, `benchmarks`, `case_studies`, `market_trends`, `audience_insights`) — mechanism supports it after this pack, each is a separate 1-line follow-up decision
- Website/landing template split (stays excluded)
- Any FE change (none needed)
