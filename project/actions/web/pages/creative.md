# Pages — Safqa Web · Creative

> Soft-retired when `pipelineV3Enabled` (default true): nav hidden; page shows legacy banner + disabled generate. Escape hatch: flag false.

### Creative Generator `PG-CREATIVE-01`
- Route: `/creative`
- Status: done
- Components: creative form; legacy-disabled banner → Projects when flag on
- Service: CreativeProposalGenerationService → EP-AIJOBS-01/02, EP-CONFIG-01
- Guard: layout
- Notes: deep link kept; API also rejects creative creates when v3 on

### Creative Output `PG-CREATIVE-02`
- Route: `/creative/output`
- Status: done
- Components: OutputComponent, VisualEditor, print helpers
- Service: job HTML + EP-PROPOSALS-13 store-s3
- Guard: layout
- Notes: for historical / in-flight jobs; PDF via window.print (v2); v3 uses server PDF on proposal view
