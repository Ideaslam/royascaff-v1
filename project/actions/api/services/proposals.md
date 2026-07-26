# Services — Safqa API · Proposals

### SVC-PROPOSALS-01 · ProposalsDataService [domain, internal, Proposals]
- Status: done
- Methods: list/search/lite/dashboard/get/create/patch/delete; dashboard aggregations
- Deps: ProposalsRepository, S3Service
- Side effects: file
- Rules: status enum pending|sent|endorsed|won|lost

### SVC-PROPOSALS-02 · ProposalsService [domain, internal, Proposals]
- Status: done
- Methods: patch info; put technical/financial HTML; fetch document HTML; store HTML to S3
- Deps: ProposalsRepository, S3Service
- Side effects: file

### SVC-PROPOSALS-03 · ProposalSendingService [domain, internal, Proposals]
- Status: done
- Methods: send proposal via email / WhatsApp where wired
- Deps: MailjetService, MetaWhatsAppService, ProposalsRepository
- Side effects: email, external API
