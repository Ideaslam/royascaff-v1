# Blueprint Index — change-20260729-125821-bug-fix-workspace-branding

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact. Isolation: do not edit main plan/actions until merge.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| service | `actions/api/services/templates.md` | SVC-TPL-02 / SVC-TPL-05 | done | 1/1 | No Roya HBS fallbacks; about chrome; fixtures |
| service | `actions/api/services/pipeline-sections-engine.md` | SVC-PIPE-S3-01 + prompts | done | 1/1 | Settings `workspace` in section AI |
| service | `actions/api/services/proposals.md` | SVC-PROPOSALS-03 | done | 1/1 | Send path passes Settings |
| service | `actions/api/services/integrations.md` | SVC-INT-02 | done | 1/1 | Mailjet + email templates |

**Pack Done/Total**: 4/4

## Out of pack

- Contracts HTML / `roya_obligations`
- Verification “Roya Sales AI” product emails
- Mailjet From env defaults / per-workspace SMTP
- New Settings about/bio/website fields
- Template key rename `roya-presentation`
- Internal color source token `roya_default`
