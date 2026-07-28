# Services — Safqa API · Proposals

### SVC-PROPOSALS-01 · ProposalsDataService [domain, internal, Proposals]
- Status: done
- Methods: list/search/lite/dashboard/get/create/patch/delete; dashboard aggregations; `patchProposalDocument`
- Deps: ProposalsRepository, S3Service
- Side effects: file
- Rules:
  - status enum pending|sent|endorsed|won|lost
  - list `SUMMARY_PROJECTION` includes `pipelineVersion`, `projectId`, `language` (+ URL maps / money / status)
  - `patchProposalDocument(technical)` also merges `renderedByLang[lang].htmlUrl` when `pipelineVersion === "3"` or `renderedByLang` present (preserve `pdfUrl`)

### SVC-PROPOSALS-02 · ProposalsService [domain, internal, Proposals]
- Status: done
- Methods: patch info; put technical/financial HTML; fetch document HTML; store HTML to S3
- Deps: ProposalsRepository, S3Service, ProposalsDataService (`patchProposalDocument`)
- Side effects: file
- Rules:
  - `document-html` URL resolve: `*UrlByLang` → `*HtmlUrlByLang` → flat `*HtmlUrl`; technical also falls back to `renderedByLang[lang].htmlUrl`
  - financial has no deck fallback

### SVC-PROPOSALS-03 · ProposalSendingService [domain, internal, Proposals]
- Status: done
- Methods: send proposal via email / WhatsApp where wired
- Deps: MailjetService, MetaWhatsAppService, ProposalsRepository
- Side effects: email, external API

### SVC-PROPOSALS-04 · Proposal pipeline status (v3) [domain, internal, Proposals]
- Status: done
- Methods: `GET …/proposals/:id/status` — generation through ready/partially_failed + section counters + rendered summary
- Deps: ProjectsDataService / ProposalsRepository
- Side effects: none
- Rules: non-blocking poll; Redis not required for status read

### SVC-PROPOSALS-05 · Proposal section retry + rendered (v3) [domain, internal, Proposals]
- Status: done
- Methods: retry failed sections; get rendered HTML/PDF URLs
- Deps: SectionOrchestratorService, ProposalsRepository
- Side effects: async (retry enqueue)
- Rules: Ready with gaps → `partially_failed` after export

### SVC-PROPOSALS-06 · Proposal regen / translate / rerender facades (v3) [domain, internal, Proposals]
- Status: done
- Methods: `regenerateProposal`, `translateProposal`, `rerenderProposal` via ProjectsDataService → Pipeline v3 services
- Deps: ProposalRegenerateService, TranslateOrchestratorService
- Side effects: async
- Rules: require `pipelineV3Enabled`; see `pipeline-regen-translate.md`
