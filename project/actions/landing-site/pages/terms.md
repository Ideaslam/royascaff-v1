# Pages — Marketing Landing Site

## Module: Marketing

### Terms of Service Page

- **Route:** `/terms.html`
- **Files:** `terms.html`, `css/styles.css`, `js/config.js`, `js/i18n.js`, `js/main.js`
- **Assets:** `assets/logo.webp`, favicon
- **Backend Endpoints Used:** none
- **External Navigation:** `config.registerUrl` → Customer Portal `/auth/register`; `config.loginUrl` → Customer Portal `/auth/login`
- **Guard:** none (fully public)

**Sections:**
1. **Navbar** — logo (links to `/`), language toggle (EN/AR), Sign in + Get Started CTAs
2. **Legal content** — Terms of Service title, last-updated date, structured sections (acceptance, accounts, subscriptions, acceptable use, IP, liability, termination, governing law)
3. **Footer** — copyright, Privacy + Terms links, register/login links

**Visual approach:**
- Same Tailwind + brand tokens as landing page
- Prose-style legal content (`.legal-page`, `.legal-content`)
- RTL support via existing i18n system
