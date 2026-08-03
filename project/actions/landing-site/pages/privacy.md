# Pages — Marketing Landing Site

## Module: Marketing

### Privacy Policy Page

- **Route:** `/privacy.html`
- **Files:** `privacy.html`, `css/styles.css`, `js/config.js`, `js/i18n.js`, `js/main.js`
- **Assets:** `assets/logo.webp`, favicon
- **Backend Endpoints Used:** none
- **External Navigation:** `config.registerUrl` → Customer Portal `/auth/register`; `config.loginUrl` → Customer Portal `/auth/login`
- **Guard:** none (fully public)

**Sections:**
1. **Navbar** — logo (links to `/`), language toggle (EN/AR), Sign in + Get Started CTAs
2. **Legal content** — Privacy Policy (EN/AR via `privacy.body` in `i18n.js`):
   - Information collected (account, all connected sources, credentials, usage, payment, technical)
   - Purpose-limited use for workspace analytics
   - Connected data sources purpose limitation (all sources)
   - AI processing: schema/metadata only; not full rows for training
   - Explicit: no retain/use of any connected data (incl. Google Workspace APIs) to develop, improve, or train generalized AI/ML models
   - Google Workspace Limited Use + link to Google User Data Policy
   - Sharing, retention/disconnect, security, rights, transfers, children, changes, contact
3. **Footer** — copyright, Privacy + Terms links, register/login links

**Visual approach:**
- Same Tailwind + brand tokens as landing page
- Prose-style legal content (`.legal-page`, `.legal-content`)
- RTL support via existing i18n system
