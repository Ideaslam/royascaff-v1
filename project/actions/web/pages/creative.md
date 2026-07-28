# Pages — Safqa Web · Creative

> Unified v2 path (REQ-PROP-UNIFY part 2): generate works with `pipelineV3Enabled` true via EP-CREATIVE-V2-01.

### Creative Generator `PG-CREATIVE-01`
- Route: `/creative`
- Status: done
- Components: creative form; optional note that Projects (v3 templates) vs Creative (final HTML) are both valid
- Service: CreativeProposalGenerationService → **EP-CREATIVE-V2-01** (not `POST /ai-jobs`)
- Guard: layout
- Notes:
  - On success → proposal view/edit with `proposalId`
  - Progress: poll `GET /api/data/proposals/:id` for `generation` / `generationStatus`
  - Nav re-enabled for unified path

### Creative Output `PG-CREATIVE-02`
- Route: `/creative/output`
- Status: done
- Components: output / preview shell
- Service: proposal-centric when available
- Guard: layout
