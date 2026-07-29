# Services — Integrations (Mailjet proposal email) — pack delta

### SVC-INT-02 · MailjetService [integration, external, Email]
- Status: planned
- Methods: `sendProposalEmailViaMailjet` (after-state template vars)
- Rules (after-state):
  - `ProposalTemplateData` includes workspace brand fields:
    - `client_name`, `technical_proposal_url?`, `financial_proposal_url` (existing)
    - `workspace_name?`, `workspace_logo?`, `workspace_email?`, `workspace_phone?`, `workspace_address?` (new)
  - Default subject fallback when client name missing: use `workspace_name` or generic “Your proposal documents” — **never** `'Roya'`
  - Mailjet **From** name/email remain env defaults this pack (`MAILJET_FROM_*`) — out of scope to per-workspace SMTP identity
  - Templates `src/templates/emails/proposals.template.{en,ar}.md` must use `{{workspace_*}}` placeholders:
    - Hero logo → `{{workspace_logo}}` (omit `<img>` when empty)
    - About heading → “About {{workspace_name}}” / Arabic equivalent when name set
    - About body → short generic agency line (no Roya-specific claims) **or** omit static long blurb when name empty
    - Signature → “The {{workspace_name}} Team” / role = `workspace_name`
    - Avatar initial → first letter of `workspace_name` when set
    - Footer © → `workspace_name`; footer link → omit hardcoded `roya.marketing` (use `workspace_email` mailto or hide link when no website field)
  - No hardcoded `media.roya.marketing/roya.png`, “Roya Marketing Solution”, “The Roya Team”, or `roya.marketing` as agency brand

## Delta

- **Modify** MailjetService ProposalTemplateData + subject fallback
- **Modify** proposals email templates EN/AR → workspace vars
