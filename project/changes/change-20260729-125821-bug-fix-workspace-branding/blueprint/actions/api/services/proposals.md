# Services — Proposals (workspace-branded delivery email) — pack delta

### SVC-PROPOSALS-03 · ProposalSendingService [domain, internal, Proposals]
- Status: planned
- Deps (after-state): MailjetService, MetaWhatsAppService, ProposalsRepository, **SettingsDataService** (via proposal `workspaceId`)
- Methods: `sendProposalDelivery` unchanged signature
- Rules (after-state):
  - When sending email, load `getPublicSettings(proposal.workspaceId)`
  - Pass workspace brand into Mailjet `templateData` (in addition to client + URLs):
    | Template var | Source |
    |--------------|--------|
    | `workspace_name` | settings.companyName |
    | `workspace_logo` | settings.logoUrl |
    | `workspace_email` | settings.email |
    | `workspace_phone` | settings.phone |
    | `workspace_address` | settings.address |
  - Missing fields → empty string (template `{{#if}}` / omit blocks)
  - Never hardcode Roya agency name/logo in the send path
  - WhatsApp path unchanged this pack (template may still be Meta-side)

## Delta

- **Modify** ProposalSendingService — inject Settings into proposal email templateData
