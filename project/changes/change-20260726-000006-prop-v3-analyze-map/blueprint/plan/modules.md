# Modules & Features — Delta (REQ-PROP-V3 Phase 2)

## Delta

- **Complete** Projects: HTTP + RFP/images + DNA storage
- **Extend** Creative / AI: Pipeline v3 Steps 1–2 (analyze + map workers)
- **Extend** Proposals: create-from-project + generation status (through map)

---

## 12. Projects _(after-state)_
- Scope: BE `modules/data/projects` + `pipeline-v3` analyze inputs
- Audience: `projects.*` permissions
- Entities: `projects`
- Depends on: Clients, Services, S3, Claude (for DNA)

### Features
1. **Project CRUD** [backend-only] — create/list/get/patch/archive; competitors ≤3; researchOptions ⊂ {market, competitor, audience, …} (launch validate subset)
2. **RFP upload + parse** [backend-only] — multipart → S3 + extracted text artifact
3. **Image upload** [backend-only] — multipart → S3 URLs on `images[]`
4. **DNA get / regenerate** [backend-only] — read `projects.dna`; enqueue analyze

## 6. Creative / AI Generation _(extend)_
### Features _(Phase 2)_
1. **Analyze worker** [backend-only] — 1a + 1d (market/competitor/audience); AJV dna.v2 fail-closed; traces
2. **Map worker** [backend-only] — map.v1 + research coverage gate; store `proposal.sectionMap`
3. **Prompt packs** [backend-only] — real dna.core / research.* / map.plan content

## 5. Proposals _(extend)_
### Features
1. **Create from project** [backend-only] — link projectId + templateKey + language; start pipeline
2. **Generation status** [backend-only] — poll analyze/map steps
