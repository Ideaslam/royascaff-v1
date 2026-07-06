# Pages — Marketing Landing Site

## Module: Marketing

### Landing Page

- **Route:** `/` (static site root — `index.html`)
- **Files:** `index.html`, `css/styles.css`, `js/config.js`, `js/main.js`
- **Assets:** `assets/logo.webp`, favicon
- **Backend Endpoints Used:** none
- **External Navigation:** `config.registerUrl` → Customer Portal `/auth/register`
- **Guard:** none (fully public)

**Sections:**
1. **Navbar** — logo, nav anchors (Features, How it Works, Pricing), Register + Get Started CTAs
2. **Hero** — headline, subheadline, primary CTA (Register), secondary CTA (scroll to pricing)
3. **Features** — AI dashboards, multi-source data, share & export, no-code setup
4. **How it Works** — Connect data → AI generates → Share insights
5. **Pricing** — Free, Growth, Scale tiers with limits and Get Started buttons
6. **Final CTA** — register prompt
7. **Footer** — copyright, Privacy Policy + Terms of Service links, register/login links

**Visual approach:**
- Tailwind utility classes + custom CSS variables for Roya brand tokens
- Gradient hero background (purple → coral)
- Outfit font via Google Fonts
- Mobile-first responsive layout
