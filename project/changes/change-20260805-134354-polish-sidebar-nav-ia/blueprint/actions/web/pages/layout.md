# Layout / Sidebar — polish notes

> Shell chrome. Routes + permissions unchanged.

## Delta

### Sections (order)
1. **Main** — Dashboard
2. **Sales** — Projects, Classic, Creative, Archive, Contracts
3. **Catalog** — Clients, Categories, Services
4. **AI** — Assistant, Usage
5. **Admin** — Users, Roles, Settings

### Label map (EN)
| Key | Before | After |
|-----|--------|-------|
| sections.proposals | Proposals | Sales |
| sections.data | Data | Catalog |
| sections.ai *(new)* | — | AI |
| sections.tools | Tools | Admin |
| newProposal | New Proposal | Classic |
| creativeProposal | Creative Proposal | Creative |
| proposalsArchive | Proposals Archive | Archive |
| serviceCategories | Service Categories | Categories |
| aiAssistant | AI Assistant | Assistant |
| aiRequests | AI Requests | Usage |
| rolesPermissions | Roles & Permissions | Roles |

### Icon
- Usage (`/ai-requests`): `fa-coins` → `fa-chart-line`

### Unchanged
- Routes, `*appHasPermission`, badges `v3` / `AI`, collapsed + RTL behavior
