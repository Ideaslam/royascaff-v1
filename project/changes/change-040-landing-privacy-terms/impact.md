# Impact Analysis — Landing Privacy & Terms Pages

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Page(s) | partial | `roya-dynamo-landing/index.html` | No privacy/terms pages; footer lacks legal links |
| i18n | complete | `js/i18n.js` | No legal page strings |
| Styles | complete | `css/styles.css` | No legal/prose page styles |
| JS | complete | `js/main.js` | Reusable as-is (i18n, nav, config URLs) |

Feature state: **partial** — landing page exists; legal pages missing.

## Affected Modules

- **S13 Marketing** (`roya-dynamo-landing/`) — add two static pages + footer links + i18n content

## Plan Docs to Update

- [ ] `project/plan/modules.md` — add Privacy Page + Terms Page features under S13
- [ ] `project/actions/landing-site/pages/landing.md` — footer section + cross-links
- [ ] `project/actions/landing-site/pages/privacy.md` — new page spec
- [ ] `project/actions/landing-site/pages/terms.md` — new page spec

## Code Files to Create / Modify

| Action | File |
|--------|------|
| Create | `roya-dynamo-landing/privacy.html` |
| Create | `roya-dynamo-landing/terms.html` |
| Modify | `roya-dynamo-landing/index.html` — footer legal links |
| Modify | `roya-dynamo-landing/js/i18n.js` — legal page meta, nav, footer labels, full EN/AR content |
| Modify | `roya-dynamo-landing/css/styles.css` — legal page prose styles |

## Ripple Effects

- None outside `roya-dynamo-landing` (static site, no backend)

## Risk

- Complexity: **L**
- Cross-module: **N**
- Migration: **N**

## Recommendation

- **Create:** `privacy.html`, `terms.html`, page specs
- **Modify:** `index.html` footer, `i18n.js`, `styles.css`, `modules.md`
