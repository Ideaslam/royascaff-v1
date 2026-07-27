# Bug #009 — DNA generate only receives 3 of 8 research options

## Status
**DONE** — Confirmed 2026-07-28

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: API / projects create-update + pipeline-v3 DNA skeleton

## Description
User selects all 8 research modules on the DNA / project form, then generates. DNA `research.selectedOptions` only contains `market`, `competitor`, `audience`. `requiredSectionKeys` only covers those three (with competitor duplicated by count). The other five selections never reach analyze/research modules.

## Expected Behavior
All selected research option keys from the form are persisted on `project.info.researchOptions` and passed through to DNA `research.selectedOptions` / `requiredSectionKeys`, so all selected research module prompts run.

## Steps to Reproduce
1. Create or edit a project; select all 8 research modules
2. Save and generate DNA / proposal
3. Inspect DNA `research.selectedOptions` — only 3 keys present

## Root Cause
Frontend (bug #005) correctly sends all 8 keys. Backend still applies a temporary launch allowlist of only 3:

1. `projects.data.service.ts` — `LAUNCH_RESEARCH = {market, competitor, audience}` filters on create/update, so the other five never persist.
2. `dna-passthrough.ts` — `LAUNCH` set filters again when building the DNA skeleton.

Pipeline already supports all 8: coverage map, research-module runner, model resolver, template catalog, and all 8 prompt files under `pipeline-v3/prompts/research.*.v1.md`.

## Fix Applied
Replaced temporary 3-key launch allowlists with the full 8-key `VALID_RESEARCH_OPTIONS` set in project create/update and DNA skeleton build. Unknown keys are still filtered out. All 8 research prompts were already present and wired.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/services/data/projects.data.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/analyze/dna-passthrough.ts`
