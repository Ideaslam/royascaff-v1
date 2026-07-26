# Pages — Safqa Web · Creative

### Creative Generator `PG-CREATIVE-01`
- Route: `/creative`
- Status: done
- Components: creative form (client, services, RFP, options)
- Service: CreativeProposalGenerationService → EP-AIJOBS-01/02, EP-CONFIG-01
- Guard: layout
- Notes: starts creative/stream jobs; polls job status

### Creative Output `PG-CREATIVE-02`
- Route: `/creative/output`
- Status: done
- Components: OutputComponent, VisualEditor, print helpers
- Service: job HTML + EP-PROPOSALS-13 store-s3
- Guard: layout
- Notes: PDF via window.print (no server PDF) — known gap
